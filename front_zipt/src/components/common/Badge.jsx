import { Icon } from "./Icon.jsx";
import styles from "./Badge.module.scss";

export function Badge({ children, tone = "neutral", icon, size = "md", solid }) {
  const className = [styles.badge, styles[tone], styles[size], solid ? styles.solid : ""].filter(Boolean).join(" ");
  const iconSize = size === "sm" ? 12 : 13;

  return (
    <span className={className}>
      {icon && <Icon name={icon} size={iconSize} stroke={2.4} />}
      {children}
    </span>
  );
}
