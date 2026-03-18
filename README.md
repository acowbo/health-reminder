# 健康提醒 🌿

一个专为久坐办公室人群设计的温情健康提醒工具。

## 功能特点

- **实时倒计时** — 菜单栏显示距下次提醒的剩余时间
- **温情提醒** — 3种风格（温柔/搞笑/严肃），到点弹出系统通知
- **丰富运动库** — 14个动作，覆盖椅上运动、站立运动、眼部放松、呼吸练习
- **灵活设置** — 自定义提醒间隔（1-120分钟）、免打扰时段
- **常驻后台** — 关闭窗口后继续在状态栏运行，不影响工作
- **跨平台** — 支持 macOS 和 Windows

## 下载安装

前往 [Releases](../../releases) 页面下载最新版本：
- **macOS**: 下载 `.dmg` 文件
- **Windows**: 下载 `.msi` 文件

## 本地开发

### 环境要求

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.70+
- [Tauri 前置依赖](https://tauri.app/start/prerequisites/)

### 启动开发模式

```bash
git clone https://github.com/YOUR_USERNAME/health-reminder.git
cd health-reminder
npm install
npm run tauri dev
```

### 打包发布

```bash
npm run tauri build
```

打包产物在 `src-tauri/target/release/bundle/` 目录下。

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **后端**: Rust + Tauri 2
- **通知**: 系统原生通知

## License

MIT
