import { useRevealOnScroll } from "../../hooks/useRevealOnScroll.js";

const PRESETS = {
  "fade-up": { initial: "translateY(40px) scale(0.96)", target: "translateY(0) scale(1) rotateX(0) rotateY(0)" },
  "fade-up-soft": { initial: "translateY(28px)", target: "translateY(0)" },
  "scale-up": { initial: "scale(0.88) translateY(20px)", target: "translateY(0) scale(1) rotateX(0) rotateY(0)" },
  "slide-left": { initial: "translateX(-60px) scale(0.97)", target: "translateX(0) scale(1)" },
  "slide-right": { initial: "translateX(60px) scale(0.97)", target: "translateX(0) scale(1)" },
  "3d-flip": { initial: "perspective(1000px) rotateX(-20deg) translateY(45px) scale(0.95)", target: "translateY(0) scale(1) rotateX(0) rotateY(0)" },
  "zoom-in": { initial: "scale(0.7) translateY(40px)", target: "translateY(0) scale(1) rotateX(0) rotateY(0)" },
};

/**
 * 스크롤 시 페이드/이동/3D 회전 애니메이션으로 등장하는 래퍼.
 * animationType으로 프리셋을 고르고, duration/blur로 페이지별 애니메이션 강도를 조절한다.
 */
export function Reveal({ children, delay = 0, style, className, animationType = "fade-up", duration = 0.95, blur = true }) {
  const [ref, visible] = useRevealOnScroll();
  const { initial, target } = PRESETS[animationType] || PRESETS["fade-up"];

  const transitionProps = ["opacity", "transform", ...(blur ? ["filter"] : [])]
    .map((prop) => `${prop} ${duration}s cubic-bezier(.16, 1, .3, 1) ${delay}s`)
    .join(", ");

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? target : initial,
        ...(blur ? { filter: visible ? "blur(0px)" : "blur(8px)" } : {}),
        transition: transitionProps,
        backfaceVisibility: "hidden",
        overflow: "visible",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
