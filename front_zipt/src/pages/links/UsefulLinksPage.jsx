// ─────────────────────────────────────────────────────────────
// 유용한 공공 사이트 모음 페이지
// 부동산 계약에 필요한 정부 및 공공기관 사이트를 카드 형태로 제공
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";

// ── 유용한 사이트 데이터 ──────────────────────────────────────
const CATEGORIES = [
  { key: "all",      label: "전체" },
  { key: "register", label: "등기·서류" },
  { key: "price",    label: "시세·거래" },
  { key: "tax",      label: "신고·세금" },
  { key: "agent",    label: "공인중개사" },
];

const SITES = [
  {
    key: "khug",
    category: "price",
    icon: "🏠",
    name: "안심전세포털",
    url: "https://www.khug.or.kr/jeonse",
    displayUrl: "www.khug.or.kr/jeonse",
    desc: "시세 확인 및 집주인 조회가 가능한 안심전세 앱 다운로드 링크를 제공합니다.",
    badge: "HUG 주택도시보증공사",
    badgeColor: "#2a6be6",
    badgeBg: "#e8f0fd",
  },
  {
    key: "iros",
    category: "register",
    icon: "📋",
    name: "대법원 인터넷등기소",
    url: "https://www.iros.go.kr",
    displayUrl: "www.iros.go.kr",
    desc: "등기부등본 온라인 열람 및 발급, 확정일자 부여 현황을 확인합니다.",
    badge: "대법원",
    badgeColor: "#5b53c9",
    badgeBg: "#ecebfa",
  },
  {
    key: "gov24",
    category: "tax",
    icon: "🏛️",
    name: "정부24",
    url: "https://www.gov.kr",
    displayUrl: "www.gov.kr",
    desc: "온라인 전입신고 및 토지·건축물대장 무료 발급이 가능합니다.",
    badge: "행정안전부",
    badgeColor: "#0f8a59",
    badgeBg: "#e2f6ee",
  },
  {
    key: "nsdi",
    category: "agent",
    icon: "🗺️",
    name: "국가공간정보포털",
    url: "https://www.nsdi.go.kr",
    displayUrl: "www.nsdi.go.kr",
    desc: "적법하게 등록된 개업 공인중개사인지 조회할 수 있습니다.",
    badge: "국토교통부",
    badgeColor: "#c87b1e",
    badgeBg: "#fbf1e1",
  },
  {
    key: "rtmolit",
    category: "price",
    icon: "📊",
    name: "국토교통부 실거래가 공개시스템",
    url: "https://rt.molit.go.kr",
    displayUrl: "rt.molit.go.kr",
    desc: "최근 거래된 실거래가 시세를 동네별·면적별로 검토할 수 있습니다.",
    badge: "국토교통부",
    badgeColor: "#c87b1e",
    badgeBg: "#fbf1e1",
  },
  {
    key: "hometax",
    category: "tax",
    icon: "💰",
    name: "홈택스",
    url: "https://www.hometax.go.kr",
    displayUrl: "www.hometax.go.kr",
    desc: "임대차 계약 후 확정일자 신청 및 월세 세액공제 신청이 가능합니다.",
    badge: "국세청",
    badgeColor: "#0f8a59",
    badgeBg: "#e2f6ee",
  },
  {
    key: "kreic",
    category: "price",
    icon: "📈",
    name: "한국부동산원",
    url: "https://www.reb.or.kr",
    displayUrl: "www.reb.or.kr",
    desc: "아파트·빌라·오피스텔 전월세 시세 및 부동산 통계를 제공합니다.",
    badge: "한국부동산원",
    badgeColor: "#2a6be6",
    badgeBg: "#e8f0fd",
  },
  {
    key: "moj",
    category: "register",
    icon: "⚖️",
    name: "법제처 국가법령정보센터",
    url: "https://www.law.go.kr",
    displayUrl: "www.law.go.kr",
    desc: "주택임대차보호법 등 계약과 관련된 법령 전문을 무료로 조회합니다.",
    badge: "법제처",
    badgeColor: "#5b53c9",
    badgeBg: "#ecebfa",
  },
];

// ── 스크롤 시 등장 훅 ─────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── 사이트 카드 컴포넌트 ──────────────────────────────────────
function SiteCard({ site, delay = 0 }) {
  const [ref, visible] = useReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
        transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}s, transform .7s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff",
          border: `1.5px solid ${hovered ? site.badgeColor + "55" : "var(--line)"}`,
          borderRadius: 18,
          padding: "26px 24px",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          cursor: "pointer",
          boxShadow: hovered
            ? `0 16px 36px ${site.badgeColor}1a`
            : "0 2px 8px rgba(15,27,51,.05)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
        }}
        onClick={() => window.open(site.url, "_blank", "noopener,noreferrer")}
      >
        {/* 아이콘 + 배지 */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{
            width: 52, height: 52, borderRadius: 14,
            background: site.badgeBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0,
          }}>
            {site.icon}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 800,
            color: site.badgeColor,
            background: site.badgeBg,
            borderRadius: 20, padding: "4px 10px",
            whiteSpace: "nowrap",
          }}>
            {site.badge}
          </span>
        </div>

        {/* 사이트명 */}
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", lineHeight: 1.35, marginBottom: 8 }}>
          {site.name}
        </div>

        {/* 설명 */}
        <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.7, flex: 1, marginBottom: 18 }}>
          {site.desc}
        </div>

        {/* URL + 바로가기 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: "auto",
        }}>
          <span style={{ fontSize: 12, color: "var(--ink-4)", fontWeight: 600 }}>
            🔗 {site.displayUrl}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 800,
            color: site.badgeColor,
            display: "flex", alignItems: "center", gap: 3,
            transition: "gap .2s",
          }}>
            바로가기 →
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function UsefulLinksPage() {
  const [activeCat, setActiveCat] = useState("all");
  const filtered = activeCat === "all" ? SITES : SITES.filter((s) => s.category === activeCat);

  return (
    <div style={{ paddingBottom: 80, animation: "zipt-fade .3s ease" }}>
      <style>{`
        @keyframes links-hero-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes links-shine {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .links-title-gradient {
          background: linear-gradient(135deg, var(--primary) 0%, #00c9ff 40%, #2a6be6 80%, var(--primary) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: links-shine 6s linear infinite;
        }
        .links-cat-btn {
          border: 1.5px solid var(--line);
          border-radius: 20px;
          padding: 7px 17px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all .22s ease;
          font-family: inherit;
          background: #fff;
          color: var(--ink-2);
        }
        .links-cat-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .links-cat-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }
      `}</style>

      {/* 히어로 헤더 */}
      <section style={{ textAlign: "center", padding: "52px 0 36px" }}>
        <div style={{ animation: "links-hero-up .7s cubic-bezier(.16,1,.3,1) both" }}>
          <span style={{
            display: "inline-block",
            fontSize: 12, fontWeight: 800,
            color: "var(--primary)", background: "var(--primary-soft)",
            borderRadius: 20, padding: "5px 14px", marginBottom: 20,
            letterSpacing: ".04em",
          }}>
            🔗 USEFUL LINKS
          </span>
        </div>
        <h1 style={{
          fontSize: 36, fontWeight: 900, letterSpacing: "-.03em",
          lineHeight: 1.3, margin: "0 0 16px",
          animation: "links-hero-up .75s cubic-bezier(.16,1,.3,1) .1s both",
        }}>
          <span className="links-title-gradient">안전한 계약</span>을 위한<br />필수 공공 사이트 모음
        </h1>
        <p style={{
          fontSize: 15.5, color: "var(--ink-2)", lineHeight: 1.75,
          maxWidth: 540, margin: "0 auto",
          animation: "links-hero-up .8s cubic-bezier(.16,1,.3,1) .2s both",
          fontWeight: 500,
        }}>
          등기부등본 발급부터 실거래가 조회, 전입신고까지<br />
          부동산 계약 전 꼭 확인해야 할 정부·공공기관 사이트를 한곳에 모았어요.
        </p>
      </section>

      {/* 카테고리 필터 */}
      <div style={{
        display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap",
        marginBottom: 36,
        animation: "links-hero-up .85s cubic-bezier(.16,1,.3,1) .3s both",
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`links-cat-btn${activeCat === cat.key ? " active" : ""}`}
            onClick={() => setActiveCat(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 카드 그리드 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
      }}>
        {filtered.map((site, idx) => (
          <SiteCard key={site.key} site={site} delay={idx * 0.07} />
        ))}
      </div>

      {/* 하단 안내 */}
      <div style={{
        marginTop: 52, padding: "20px 24px",
        background: "var(--surface-2)", borderRadius: 14,
        fontSize: 14.5, color: "var(--ink-2)", lineHeight: 1.7,
        textAlign: "center", fontWeight: 600, wordBreak: "keep-all"
      }}>
        💡 위 사이트들은 정부 및 공공기관의 공식 서비스입니다. 계약 전 반드시 직접 확인하시고, 최신 정보는 각 사이트에서 확인해 주세요.
      </div>
    </div>
  );
}
