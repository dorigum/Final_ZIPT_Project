import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import styles from "./SortMenu.module.scss";

export function SortMenu({ value, options, onChange, ariaLabel = "정렬 선택" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        <span>{selected?.label}</span>
        <Icon name="chevron-down" size={13} stroke={2.2} className={styles.chevron} />
      </button>

      {open ? (
        <div className={styles.panel} role="menu">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.option} ${active ? styles.active : ""}`}
                onClick={() => handleSelect(option.value)}
                role="menuitemradio"
                aria-checked={active}
              >
                <span>{option.label}</span>
                {active ? <Icon name="check" size={14} stroke={2.4} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
