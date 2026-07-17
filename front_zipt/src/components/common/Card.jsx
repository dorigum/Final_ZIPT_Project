import styles from "./Card.module.scss";

export function Card({ children, className, pad = 22, style, hover, onClick }) {
  const combinedClassName = [
    styles.card,
    hover ? styles.hover : "",
    onClick ? styles.clickable : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={combinedClassName} onClick={onClick} style={{ "--card-padding": typeof pad === "number" ? `${pad}px` : pad, ...style }}>
      {children}
    </div>
  );
}
