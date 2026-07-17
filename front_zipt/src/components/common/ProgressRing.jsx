import styles from "./ProgressRing.module.scss";

export function ProgressRing({ value = 72, size = 132, thickness = 12, color = "var(--primary)", track = "var(--surface-3)", children }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className={styles.ring} style={{ "--ring-size": `${size}px` }}>
      <svg width={size} height={size} className={styles.svg}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={thickness} />
        <circle className={styles.progress} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={thickness}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
