//! Health Reminder — Tauri backend
//!
//! Responsibilities:
//!   - Persistent user settings (JSON on disk)
//!   - Background countdown timer (1-second tick)
//!   - System tray icon with menu
//!   - System notification dispatch
//!   - Tauri commands exposed to the frontend

use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use serde::{Deserialize, Serialize};

// ─── Data Structures ─────────────────────────────────────────────────────────

/// User-configurable settings, persisted to disk as JSON.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    /// Minutes between reminders (1–120)
    pub interval_minutes: u32,
    /// Whether reminders are active
    pub enabled: bool,
    /// Do-not-disturb window start, 0-23 (local hour)
    pub dnd_start: u32,
    /// Do-not-disturb window end, 0-23 (local hour)
    pub dnd_end: u32,
    /// Message style: "gentle" | "funny" | "strict"
    pub style: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            interval_minutes: 45,
            enabled: true,
            dnd_start: 22,
            dnd_end: 8,
            style: "gentle".to_string(),
        }
    }
}

/// Application state shared across commands and the timer loop.
#[derive(Default)]
pub struct AppState {
    pub settings: Mutex<Settings>,
    /// Seconds remaining until the next reminder fires.
    pub seconds_remaining: Mutex<u32>,
}

// ─── Settings Persistence ────────────────────────────────────────────────────

fn settings_path(app: &AppHandle) -> std::path::PathBuf {
    app.path()
        .app_data_dir()
        .expect("Failed to resolve app data directory")
        .join("settings.json")
}

/// Load settings from disk; fall back to defaults if absent or malformed.
fn load_settings(app: &AppHandle) -> Settings {
    let path = settings_path(app);
    std::fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

/// Write settings to disk as pretty-printed JSON.
fn persist_settings(app: &AppHandle, settings: &Settings) -> Result<(), String> {
    let path = settings_path(app);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())
}

// ─── DND Helper ──────────────────────────────────────────────────────────────

/// Returns `true` when the current local hour is inside the DND window.
/// Handles overnight ranges (e.g. 22 → 08).
fn is_dnd_active(start: u32, end: u32) -> bool {
    use chrono::Timelike;
    let now = chrono::Local::now().hour();
    if start <= end {
        now >= start && now < end
    } else {
        // Overnight: active from `start` through midnight and from midnight to `end`
        now >= start || now < end
    }
}

// ─── Notification Helper ─────────────────────────────────────────────────────

fn fire_notification(app: &AppHandle, title: &str, body: &str) {
    use tauri_plugin_notification::NotificationExt;
    let _ = app.notification().builder().title(title).body(body).show();
}

// ─── Reminder Message Bank ───────────────────────────────────────────────────

/// Returns a `(title, body)` pair chosen pseudo-randomly from the style bank.
fn pick_reminder(style: &str) -> (&'static str, &'static str) {
    use std::time::{SystemTime, UNIX_EPOCH};
    // Use subsecond nanos as a cheap pseudo-random index.
    let idx = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos() as usize;

    let gentle: &[(&str, &str)] = &[
        ("该动一动啦 🌿", "你已经坐了好一会儿了，腰椎君在偷偷抗议哦\n起来拉伸一下，两分钟就够～"),
        ("休息一下吧 ☁️", "工作间隙给自己两分钟\n深呼吸，感受肩膀的重量，然后甩甩它"),
        ("眼睛需要休息 👀", "盯着屏幕太久了\n抬头望向20米外，保持20秒，眼睛会感谢你"),
        ("活动一下颈椎 🌸", "低头、仰头、左看、右看\n每个方向停留15秒，颈椎会感谢你"),
        ("让血液流动起来 💫", "原地踏步一分钟\n或者站起来伸个大懒腰，全身都舒展开来"),
    ];

    let funny: &[(&str, &str)] = &[
        ("警告：检测到久坐生物 🤖", "系统检测到您已化身为椅子附属品\n请立即执行：站起来 → 伸懒腰 → 喝水"),
        ("腰椎发来紧急消息 📨", "主人，我受不了啦！\n就两分钟，让我们一起活动活动吧！"),
        ("薅羊毛时间到 🐑", "公司的空间是免费的\n站起来走几步，薅回来一点！"),
        ("小肚腩预警 🔔", "连续久坐是小肚腩的最爱\n现在做10个坐姿收腹，反击它！"),
        ("能量值不足 ⚡", "检测到你的能量条已空\n请起身补充氧气和阳光，充值生命力"),
    ];

    let strict: &[(&str, &str)] = &[
        ("运动提醒", "该运动了。\n颈部旋转 × 10次，肩部环绕 × 10次。"),
        ("起身", "久坐伤身。\n立即站起来，原地踏步60秒。"),
        ("眼部休息", "远眺20秒。\n20-20-20法则：每20分钟，看20英尺外，持续20秒。"),
        ("核心训练", "坐姿收腹：吸气收紧腹部，保持10秒，重复10次。"),
        ("拉伸提醒", "起立，双手举高，全身伸展，保持10秒，重复5次。"),
    ];

    let bank = match style {
        "funny"  => funny,
        "strict" => strict,
        _        => gentle,
    };

    bank[idx % bank.len()]
}

// ─── Tray Label ─────────────────────────────────────────────────────────────

/// Updates the tray icon tooltip and title every second.
fn update_tray_label(app: &AppHandle, seconds_remaining: u32) {
    let m = seconds_remaining / 60;
    let s = seconds_remaining % 60;
    let tooltip = format!("健康提醒 — 距下次提醒 {:02}:{:02}", m, s);
    let title   = format!("🌿 {:02}:{:02}", m, s);

    // Try named tray first, then fall back to any available tray.
    let tray = app.tray_by_id("main");
    if let Some(t) = tray {
        let _ = t.set_tooltip(Some(&tooltip));
        let _ = t.set_title(Some(&title));
    }
}

// ─── Background Timer ────────────────────────────────────────────────────────

/// Spawns an async task that ticks every second.
/// Emits `reminder-tick` (seconds_remaining) each tick.
/// Emits `reminder-fired` and shows a notification when the countdown reaches zero.
fn start_reminder_loop(app: AppHandle, state: Arc<AppState>) {
    tauri::async_runtime::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_secs(1)).await;

            let (should_fire, style, dnd_start, dnd_end) = {
                let settings = state.settings.lock().unwrap();
                let mut rem  = state.seconds_remaining.lock().unwrap();

                if !settings.enabled {
                    // Still emit tick so the UI countdown stays in sync.
                    let _ = app.emit("reminder-tick", *rem);
                    let rem_val = *rem;
                    drop(settings);
                    drop(rem);
                    update_tray_label(&app, rem_val);
                    continue;
                }

                if *rem > 0 {
                    *rem -= 1;
                }

                let fire = *rem == 0;
                if fire {
                    *rem = settings.interval_minutes * 60;
                }

                (fire, settings.style.clone(), settings.dnd_start, settings.dnd_end)
            };

            let remaining_now = *state.seconds_remaining.lock().unwrap();
            let _ = app.emit("reminder-tick", remaining_now);

            // Update tray tooltip every second, tray title every minute.
            update_tray_label(&app, remaining_now);

            if should_fire && !is_dnd_active(dnd_start, dnd_end) {
                let (title, body) = pick_reminder(&style);
                fire_notification(&app, title, body);
                let _ = app.emit("reminder-fired", ());
            }
        }
    });
}

// ─── Tauri Commands ──────────────────────────────────────────────────────────

/// Return the current settings to the frontend.
#[tauri::command]
fn get_settings(state: tauri::State<Arc<AppState>>) -> Settings {
    state.settings.lock().unwrap().clone()
}

/// Persist updated settings and reset the countdown.
#[tauri::command]
fn save_settings(
    app: AppHandle,
    state: tauri::State<Arc<AppState>>,
    settings: Settings,
) -> Result<(), String> {
    let new_interval_secs = settings.interval_minutes * 60;
    {
        let mut s = state.settings.lock().unwrap();
        *s = settings.clone();
    }
    {
        let mut rem = state.seconds_remaining.lock().unwrap();
        *rem = new_interval_secs;
    }
    persist_settings(&app, &settings)
}

/// Return remaining seconds (for UI restore after window re-open).
#[tauri::command]
fn get_seconds_remaining(state: tauri::State<Arc<AppState>>) -> u32 {
    *state.seconds_remaining.lock().unwrap()
}

/// Fire a test notification immediately (useful for settings preview).
#[tauri::command]
fn send_test_notification(app: AppHandle) -> Result<(), String> {
    fire_notification(&app, "温馨测试 🌿", "这是一条测试提醒，一切正常！\n现在起来活动一下吧～");
    Ok(())
}

/// Postpone the next reminder by 10 minutes.
#[tauri::command]
fn snooze(state: tauri::State<Arc<AppState>>) -> u32 {
    let mut rem = state.seconds_remaining.lock().unwrap();
    *rem = 10 * 60;
    *rem
}

// ─── App Entry Point ─────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // Restore persisted settings and initialise shared state.
            let settings  = load_settings(app.handle());
            let init_secs = settings.interval_minutes * 60;
            let state     = Arc::new(AppState {
                settings:          Mutex::new(settings),
                seconds_remaining: Mutex::new(init_secs),
            });
            app.manage(state.clone());

            // Build the system-tray menu.
            let show_item = MenuItem::with_id(app, "show", "显示主界面", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出",       true, None::<&str>)?;
            let menu      = Menu::with_items(app, &[&show_item, &quit_item])?;

            TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("健康提醒")
                .title("🌿 --:--")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            start_reminder_loop(app.handle().clone(), state);
            Ok(())
        })
        .on_window_event(|window, event| {
            // Intercept the close button: hide the window instead of quitting.
            // The app keeps running in the system tray; use "退出" from the tray menu to exit.
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_settings,
            get_seconds_remaining,
            send_test_notification,
            snooze,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
