import { useState, useEffect } from "react";
import { Icon } from "./Icon.jsx";

export function TopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="최상단으로 이동"
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        zIndex: 999,
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        backgroundColor: "var(--surface)",
        color: "var(--primary)",
        border: "1px solid var(--line-2)",
        boxShadow: "var(--sh-lg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.85)",
        pointerEvents: visible ? "auto" : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--primary)";
        e.currentTarget.style.color = "#ffffff";
        e.currentTarget.style.borderColor = "var(--primary)";
        e.currentTarget.style.transform = "translateY(-4px) scale(1.06)";
        e.currentTarget.style.boxShadow = "var(--sh-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--surface)";
        e.currentTarget.style.color = "var(--primary)";
        e.currentTarget.style.borderColor = "var(--line-2)";
        e.currentTarget.style.transform = visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.85)";
        e.currentTarget.style.boxShadow = "var(--sh-lg)";
      }}
    >
      <Icon name="arrow-up" size={20} stroke={2.4} />
    </button>
  );
}
