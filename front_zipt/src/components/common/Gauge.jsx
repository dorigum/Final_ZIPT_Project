import { useEffect, useRef, useState } from "react";
import { riskFromScore } from "./risk.js";
import styles from "./Gauge.module.scss";

export function Gauge({ value = 72, size = 200, label, sub }) {
  const gaugeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const risk = riskFromScore(safeValue);
  const radius = size / 2 - 16;
  const centerY = size / 2;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - safeValue / 100);
  const gaugeStyle = { "--gauge-width": `${size}px`, "--gauge-height": `${size / 2 + 28}px` };
  const progressStyle = { "--gauge-length": circumference, "--gauge-offset": offset };

  useEffect(() => {
    const element = gaugeRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={gaugeRef} className={styles.gauge} style={gaugeStyle}>
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <path
          d={`M 16 ${centerY} A ${radius} ${radius} 0 0 1 ${size - 16} ${centerY}`}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          className={`${styles.progress} ${isVisible ? styles.isAnimated : ""}`}
          d={`M 16 ${centerY} A ${radius} ${radius} 0 0 1 ${size - 16} ${centerY}`}
          fill="none"
          stroke={risk.color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={progressStyle}
        />
      </svg>
      <div className={styles.content}>
        <div className={`tnum ${styles.value}`} style={{ "--score-size": `${size * 0.26}px`, "--score-color": risk.on }}>
          {safeValue}<span className={styles.unit} style={{ "--unit-size": `${size * 0.1}px` }}>{"\uC810"}</span>
        </div>
        {label && <div className={styles.label} style={{ "--label-color": risk.on }}>{label}</div>}
        {sub && <div className={styles.sub}>{sub}</div>}
      </div>
    </div>
  );
}
