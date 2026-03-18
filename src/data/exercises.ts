import type { Exercise } from '../types';

/** Full exercise library shown in the Exercises tab. */
export const EXERCISES: Exercise[] = [
  // ── Seated ──────────────────────────────────────────────────────────────
  {
    id: 'seated-abs',
    title: '坐姿收腹',
    description: '吸气同时收紧腹部，保持 10 秒后缓慢呼气放松，感受核心肌群的收缩。',
    duration: '10 秒 × 10 次',
    category: 'seated',
    icon: '🪑',
  },
  {
    id: 'seated-twist',
    title: '坐姿扭腰',
    description: '双手交叉放于胸前，上身向左扭转至极限，保持 3 秒，再向右。',
    duration: '左右各 10 次',
    category: 'seated',
    icon: '🔄',
  },
  {
    id: 'ankle-circles',
    title: '踮脚尖',
    description: '坐姿下双脚踮起脚尖，缓慢上下泵动，促进下肢血液循环。',
    duration: '30 次',
    category: 'seated',
    icon: '🦶',
  },
  {
    id: 'neck-stretch',
    title: '颈部拉伸',
    description: '缓慢低头、仰头、左侧、右侧，每个方向停留 15 秒，释放颈椎压力。',
    duration: '每方向 15 秒',
    category: 'seated',
    icon: '🌸',
  },
  {
    id: 'shoulder-roll',
    title: '肩部环绕',
    description: '双肩同时向前、向上、向后、向下做圆周运动，放松肩背肌肉。',
    duration: '前后各 10 次',
    category: 'seated',
    icon: '💆',
  },
  // ── Standing ─────────────────────────────────────────────────────────────
  {
    id: 'march-in-place',
    title: '原地踏步',
    description: '站立后原地抬腿踏步，手臂自然摆动，带动全身血液循环。',
    duration: '1 分钟',
    category: 'standing',
    icon: '🚶',
  },
  {
    id: 'wall-squat',
    title: '靠墙深蹲',
    description: '背靠墙壁，双脚与肩同宽，缓慢下蹲至大腿平行地面，保持姿势。',
    duration: '30 秒',
    category: 'standing',
    icon: '🏋️',
  },
  {
    id: 'lunge-stretch',
    title: '弓步拉伸',
    description: '一脚向前迈出成弓步，拉伸后腿髋屈肌，换腿重复，缓解久坐僵硬。',
    duration: '每腿 20 秒',
    category: 'standing',
    icon: '🧘',
  },
  {
    id: 'full-stretch',
    title: '全身伸展',
    description: '站立，双手高举过头，手指交叉翻转向上推，感受全身从手指到脚尖的延伸。',
    duration: '10 秒 × 5 次',
    category: 'standing',
    icon: '🙆',
  },
  // ── Eyes ─────────────────────────────────────────────────────────────────
  {
    id: 'twenty-twenty',
    title: '20-20-20 法则',
    description: '每用眼 20 分钟，凝视 20 英尺（约 6 米）外的物体，持续 20 秒，有效缓解眼疲劳。',
    duration: '20 秒',
    category: 'eyes',
    icon: '👀',
  },
  {
    id: 'eye-circles',
    title: '眼球转动',
    description: '闭眼，眼球缓慢顺时针转动 5 圈，再逆时针 5 圈，锻炼眼部肌肉。',
    duration: '顺逆各 5 圈',
    category: 'eyes',
    icon: '🌀',
  },
  {
    id: 'palming',
    title: '手掌敷眼',
    description: '双手搓热后轻轻覆盖在闭合的眼睛上，感受温热与黑暗，让眼睛完全放松。',
    duration: '30 秒',
    category: 'eyes',
    icon: '🤲',
  },
  // ── Breathing ────────────────────────────────────────────────────────────
  {
    id: 'deep-breath',
    title: '腹式深呼吸',
    description: '鼻腔缓慢吸气 4 秒使腹部隆起，屏息 2 秒，再用嘴缓慢呼出 6 秒。激活副交感神经。',
    duration: '5 个循环',
    category: 'breathing',
    icon: '🌬️',
  },
  {
    id: 'box-breath',
    title: '方块呼吸法',
    description: '吸气 4 秒 → 屏息 4 秒 → 呼气 4 秒 → 屏息 4 秒，循环往复，快速恢复专注。',
    duration: '4 个循环',
    category: 'breathing',
    icon: '⬜',
  },
];

export const CATEGORY_LABELS: Record<Exercise['category'], string> = {
  seated:    '椅上运动',
  standing:  '站立运动',
  eyes:      '眼部放松',
  breathing: '呼吸练习',
};
