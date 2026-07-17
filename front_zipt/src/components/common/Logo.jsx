import { Icon } from "./Icon.jsx";
import styles from "./Logo.module.scss";

export function Logo({ size = 26, light }) {
  return (
    <span className={styles.logo} style={{ "--logo-size": `${size}px`, "--logo-color": light ? "#fff" : "var(--navy)" }}>
      <span className={styles.mark}>
        <Icon name="shield-check" size={size * .62} color="#fff" stroke={2.2} />
      </span>
      <span className={styles.name}>ZIPT<span className={styles.dot}>.</span></span>
    </span>
  );
}
