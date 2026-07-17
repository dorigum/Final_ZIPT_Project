import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./index.jsx";

const FOOTER_LINKS = [
  { key: "upload", label: "등기부등본 분석", path: "/analysis" },
  { key: "compare", label: "임대차계약서 분석", path: "/contract" },
  { key: "guide", label: "부동산 가이드", path: "/guide" },
  { key: "terms", label: "용어 정리ZIP", path: "/terms" },
  { key: "infra", label: "인프라 브리핑", path: "/map" },
  { key: "links", label: "유용한 사이트", path: "/links" },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="app-footer">
      <div className="app-footer-inner" style={{ flexDirection: "column", gap: "16px", alignItems: "flex-start", padding: "30px 38px" }}>
        
        {/* 상단: 로고 및 하단 링크 메뉴 */}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <Link to="/" className="footer-brand" aria-label="ZIPT 홈">
            <Logo size={22} />
          </Link>

          <nav className="footer-nav" aria-label="하단 메뉴" style={{ display: "flex", gap: "18px" }}>
            {FOOTER_LINKS.map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() => navigate(item.path)}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "var(--ink-3)",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 중단: 법적 유의사항 및 면책 조항 (팀원 보존 내용) */}
        <div style={{ borderTop: "1px solid var(--line)", width: "100%", paddingTop: "14px", marginTop: "4px" }}>
          <p style={{ fontSize: "12.5px", color: "var(--ink-4)", lineHeight: "1.75", margin: "0 0 7px 0" }}>
            <strong style={{ color: "var(--ink-3)" }}>유의사항</strong> | ZIPT 서비스 내 모든 분석 및 정보 제공 기능은 부동산 관계 법령 및 공공데이터를 기반으로 구축되었으나, 실시간 권리관계 변동 등으로 인해 실제 현황과 다를 수 있습니다.
          </p>
          <p style={{ fontSize: "12.5px", color: "var(--ink-4)", lineHeight: "1.75", margin: 0 }}>
            본 정보는 단순 참고용 지표이며, 어떠한 경우에도 거래 당사자 간 계약 결과에 대한 증빙 자료나 법적 책임의 근거로 활용될 수 없습니다. 최종적인 권리 분석과 계약에 대한 책임은 사용자 본인에게 있으며, 안전한 거래를 위해 최종 계약 전 법률 전문가나 공인중개사의 확인을 권장합니다.
          </p>
        </div>

        {/* 하단: 저작권 문구 */}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: "14px", fontSize: "11.5px", color: "var(--ink-4)" }}>
          <p className="footer-copy" style={{ margin: 0 }}>© {new Date().getFullYear()} ZIPT. 안전한 부동산 계약을 돕습니다.</p>
        </div>

      </div>
    </footer>
  );
}
