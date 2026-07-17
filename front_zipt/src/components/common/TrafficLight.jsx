import { RISK } from "./risk.js";
import styles from "./TrafficLight.module.scss";

export function TrafficLight({ active = "safe", size = 13 }) {
  const order = ["danger", "warn", "safe"];

  return (
    <span className={styles.trafficLight}>
      {order.map((key) => {
        const isActive = active === key;
        return (
          <span
            key={key}
            className={`${styles.light} ${isActive ? styles.activeLight : ''}`}
            style={{
              "--light-size": `${size}px`,
              "--light-color": RISK[key].color,
              "--light-opacity": isActive ? 1 : 0.22,
              "--light-shadow": isActive ? `0 0 0 3px ${RISK[key].soft}` : "none",
            }}
          />
        );
      })}
    </span>
  );
}
