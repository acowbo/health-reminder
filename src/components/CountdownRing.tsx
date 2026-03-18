import React from 'react';

interface CountdownRingProps {
  secondsRemaining: number;
  intervalMinutes: number;
  enabled: boolean;
  justFired: boolean;
}

/** Formats seconds into mm:ss display string. */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Circular SVG countdown ring.
 * The ring depletes clockwise as the reminder approaches.
 */
export const CountdownRing: React.FC<CountdownRingProps> = ({
  secondsRemaining,
  intervalMinutes,
  enabled,
  justFired,
}) => {
  const totalSeconds = intervalMinutes * 60;
  const progress     = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;

  const size         = 200;
  const strokeWidth  = 8;
  const radius       = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset   = circumference * (1 - progress);

  return (
    <div className={`countdown-ring ${justFired ? 'ring--fired' : ''} ${!enabled ? 'ring--paused' : ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="ring-track"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="ring-progress"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>

      <div className="ring-center">
        <span className="ring-time">{enabled ? formatTime(secondsRemaining) : '已暂停'}</span>
        <span className="ring-label">{enabled ? '距下次提醒' : '提醒已关闭'}</span>
      </div>
    </div>
  );
};
