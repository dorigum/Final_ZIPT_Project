import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Icon } from "./Icon.jsx";
import { Button } from "./Button.jsx";

const REDIRECT_STORAGE_KEY = "zipt_post_login_redirect";

export function AuthModal() {
  const navigate = useNavigate();
  const isAuthModalOpen = useAuthStore((state) => state.isAuthModalOpen);
  const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
  const redirectUrl = useAuthStore((state) => state.redirectUrl);
  const setRedirectUrl = useAuthStore((state) => state.setRedirectUrl);

  if (!isAuthModalOpen) return null;

  const handleLoginClick = () => {
    const returnUrl = redirectUrl;
    closeAuthModal();
    if (returnUrl) {
      setRedirectUrl(returnUrl);
      sessionStorage.setItem(REDIRECT_STORAGE_KEY, returnUrl);
    }
    navigate("/login", { state: { from: returnUrl || "/" } });
  };

  return (
    <div
      onClick={closeAuthModal}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 20, 40, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "zipt-fade 0.18s ease",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--surface)",
          borderRadius: "var(--r-2xl)",
          padding: "32px 28px 28px",
          maxWidth: "380px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(15, 27, 51, 0.16)",
          animation: "zipt-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          textAlign: "center",
          border: "1px solid var(--line-2)",
        }}
      >
        <span
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "var(--primary-soft)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <Icon name="lock" size={26} color="var(--primary)" stroke={2} />
        </span>

        <div
          style={{
            fontSize: "19px",
            fontWeight: 800,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
          }}
        >
          로그인이 필요한 서비스입니다
        </div>

        <div
          style={{
            fontSize: "14px",
            color: "var(--ink-2)",
            marginTop: "9px",
            lineHeight: 1.6,
          }}
        >
          ZIPT의 서류 상세 분석 서비스를 이용하시려면<br />
          로그인이 필요해요.
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "26px",
          }}
        >
          <Button variant="ghost" full onClick={closeAuthModal}>
            취소
          </Button>
          <Button variant="primary" full icon="user" onClick={handleLoginClick}>
            로그인하기
          </Button>
        </div>
      </div>
    </div>
  );
}
