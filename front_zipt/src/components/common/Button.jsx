import { Icon } from "./Icon.jsx";
import styles from "./Button.module.scss";

export function Button({ children, variant = "primary", size = "md", icon, iconRight, full, onClick, style, disabled }) {
  const className = [styles.button, styles[size], styles[variant], full ? styles.full : ""].filter(Boolean).join(" ");

  return (
    <button className={className} type="button" onClick={onClick} style={style} disabled={disabled}>
      {icon && <Icon name={icon} size={size === "lg" ? 19 : 17} stroke={2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 19 : 17} stroke={2} />}
    </button>
  );
}
