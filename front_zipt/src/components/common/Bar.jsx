import { useRevealOnScroll } from "../../hooks/useRevealOnScroll.js";
import styles from "./Bar.module.scss";

export function Bar({ value, color = "var(--primary)", track = "var(--surface-3)", h = 8 }) {
  const [ref, isVisible] = useRevealOnScroll({ threshold: 0.05 });

  return (
    <div ref={ref} className={styles.track} style={{ "--bar-track": track, "--bar-height": `${h}px` }}>
      <div className={styles.fill} style={{ "--bar-value": isVisible ? `${value}%` : "0%", "--bar-color": color }} />
    </div>
  );
}
