/** User-configurable reminder settings. Mirrors the Rust `Settings` struct. */
export interface Settings {
  /** Minutes between reminders (1–120) */
  intervalMinutes: number;
  /** Whether reminders are currently active */
  enabled: boolean;
  /** Do-not-disturb start hour, 0-23 */
  dndStart: number;
  /** Do-not-disturb end hour, 0-23 */
  dndEnd: number;
  /** Message personality: 'gentle' | 'funny' | 'strict' */
  style: ReminderStyle;
}

export type ReminderStyle = 'gentle' | 'funny' | 'strict';

/** A single exercise card shown in the exercise library. */
export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: ExerciseCategory;
  icon: string;
}

export type ExerciseCategory = 'seated' | 'standing' | 'eyes' | 'breathing';
