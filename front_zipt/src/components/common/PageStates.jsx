import { Icon } from "./Icon.jsx";
import { Button } from "./Button.jsx";
import styles from "./PageStates.module.scss";

/* ───────────────── 로딩 ───────────────── */
export function PageLoading({ message = "불러오는 중이에요…" }) {
  return (
    <div className={styles.center}>
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.sub}>{message}</p>
    </div>
  );
}

/* ───────────────── 오류 ───────────────── */
export function PageError({ message, onRetry }) {
  return (
    <div className={styles.center}>
      <span className={styles.icon}>
        <Icon name="x-circle" size={40} color="var(--danger)" stroke={1.8} />
      </span>
      <p className={styles.title}>오류가 발생했어요</p>
      <p className={styles.sub}>{message || "잠시 후 다시 시도해 주세요."}</p>
      {onRetry && (
        <Button icon="refresh" onClick={onRetry}>다시 시도</Button>
      )}
    </div>
  );
}

/* ───────────────── 빈 상태 ───────────────── */
export function PageEmpty({ title, description, action }) {
  return (
    <div className={styles.center}>
      <span className={styles.icon}>
        <Icon name="inbox" size={40} color="var(--ink-4)" stroke={1.7} />
      </span>
      {title && <p className={styles.title}>{title}</p>}
      {description && <p className={styles.sub}>{description}</p>}
      {action}
    </div>
  );
}
