import { Button } from "./Button.jsx";
import { Icon } from "./Icon.jsx";

const DEFAULT_REASONS = [
  "분석하려는 서류 형식과 다른 파일이에요.",
  "문서가 흐리거나 일부 페이지가 잘렸어요.",
  "PDF가 암호화되어 있거나 텍스트 추출이 어려워요.",
];

export function AnalysisFailedState({
  title = "서류를 분석할 수 없어요",
  message = "업로드한 파일에서 필요한 정보를 확인하지 못했어요.",
  reasons = DEFAULT_REASONS,
  primaryAction,
  secondaryAction,
}) {
  return (
    <div style={{ width: "100%", maxWidth: 760, margin: "54px auto", padding: "0 20px" }}>
      <section
        role="alert"
        style={{
          border: "1.5px solid #f3d28b",
          borderRadius: "var(--r-xl)",
          background: "linear-gradient(180deg, #fffbeb 0%, #fff 72%)",
          boxShadow: "var(--sh-md)",
          padding: "30px 28px",
        }}
      >
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "#fef3c7",
              color: "var(--warn-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="alert" size={26} stroke={2.2} />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 13,
                fontWeight: 800,
                color: "var(--warn-600)",
                letterSpacing: ".02em",
              }}
            >
              ANALYSIS FAILED
            </p>
            <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.35, color: "var(--ink)", fontWeight: 850 }}>
              {title}
            </h1>
            <p style={{ margin: "12px 0 0", fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-2)" }}>
              {message}
            </p>

            <div
              style={{
                marginTop: 22,
                padding: "16px 18px",
                borderRadius: "var(--r-md)",
                background: "#fff7ed",
                border: "1px solid #fed7aa",
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", marginBottom: 10 }}>
                이런 경우일 수 있어요
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink-2)", fontSize: 13.5, lineHeight: 1.75 }}>
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>

            {(primaryAction || secondaryAction) && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
                {primaryAction ? (
                  <Button icon={primaryAction.icon} onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
                    {primaryAction.label}
                  </Button>
                ) : null}
                {secondaryAction ? (
                  <Button
                    variant="ghost"
                    icon={secondaryAction.icon}
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                  >
                    {secondaryAction.label}
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
