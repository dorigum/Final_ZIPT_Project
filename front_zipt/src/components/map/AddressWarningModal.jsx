import { Icon } from "../common/Icon.jsx";
import { Button } from "../common/Button.jsx";

export function AddressWarningModal({ isOpen, onClose, searchedText }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
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
          maxWidth: "400px",
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
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <Icon name="pin" size={26} color="var(--danger-600)" stroke={2.2} />
        </span>

        <div
          style={{
            fontSize: "19px",
            fontWeight: 800,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
          }}
        >
          정확한 도로명 주소를 입력해 주세요
        </div>

        <div
          style={{
            fontSize: "14px",
            color: "var(--ink-2)",
            marginTop: "10px",
            lineHeight: 1.6,
          }}
        >
          {searchedText ? <b style={{ color: "var(--danger-600)" }}>'{searchedText}'</b> : "입력하신 검색어"}는 장소명(역/상호명)입니다.<br />
          ZIPT 동네 인프라 브리핑 분석을 위해<br />
          <b>지번 또는 도로명 주소</b>를 입력해 주세요.
        </div>

        <div
          style={{
            backgroundColor: "var(--surface-2)",
            borderRadius: "var(--r-md)",
            padding: "10px 12px",
            marginTop: "14px",
            fontSize: "12px",
            color: "var(--ink-3)",
            lineHeight: 1.5,
            border: "1px solid var(--line)",
          }}
        >
          💡 <b>올바른 입력 예시</b><br />
          • 서울 관악구 봉천동<br />
          • 경기 성남시 분당구 성남대로 45
        </div>

        <div
          style={{
            marginTop: "24px",
          }}
        >
          <Button variant="primary" full onClick={onClose}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
