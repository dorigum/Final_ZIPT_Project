import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Badge, Button, Card, Icon, Gauge, Bar, TrafficLight, RISK, PageLoading, Reveal } from '../../components/common/index.jsx';
import { useAnalysisHistory } from '../../hooks/useAnalysis';
import { useContractHistory } from '../../hooks/useContract';

const ReturningUserHome = lazy(() => import('./ReturningUserHome.jsx'));

function TimelineBanner() {
  const steps = [
    { label: "1. 매물 선택", type: "step" },
    { type: "arrow" },
    { label: "등기부등본 분석", sub: "가계약 전 필수", type: "zipt", color: "var(--primary)", bg: "var(--primary-soft)", pulseClass: "pulse-step-blue", emoji: "blue" },
    { type: "arrow" },
    { label: "2. 가계약금 송금", type: "step" },
    { type: "arrow" },
    { label: "계약서 초안 검토", sub: "최종 서명 전 필수", type: "zipt", color: "var(--danger-600)", bg: "var(--danger-soft)", pulseClass: "pulse-step-red", emoji: "red" },
    { type: "arrow" },
    { label: "3. 서명 및 날인 ✍️", type: "step" },
    { type: "arrow" },
    { label: "4. 잔금 및 입주 🏠", type: "step" },
  ];

  return (
    <section style={{ marginTop: 40, marginBottom: 20 }}>
      <div style={{
        background: "var(--surface-2)",
        borderRadius: "var(--r-2xl)",
        padding: "36px 40px",
        border: "2px solid rgba(42, 107, 230, 0.15)",
        boxShadow: "0 16px 36px rgba(42, 107, 230, 0.08)",
        transition: "all 0.3s ease"
      }}>
        {/* 헤더 영역 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <span className="pulse-light" style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--primary)",
            '--pulse-color': 'rgba(42, 107, 230, 0.5)'
          }} />
          <div style={{ fontSize: 13.5, fontWeight: 900, color: "var(--primary)", letterSpacing: ".08em", textTransform: "uppercase" }}>
            WHEN TO USE · 안전 계약 필수 분석 시점
          </div>
        </div>

        {/* 프로세스 맵 가로 흐름 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
          rowGap: 20,
          background: "var(--surface)",
          padding: "24px 30px",
          borderRadius: "var(--r-xl)",
          border: "1.5px solid var(--line)"
        }}>
          {steps.map((item, idx) => (
            item.type === "arrow"
              ? <div key={idx} style={{ color: "var(--ink-4)", fontSize: 24, fontWeight: 900, padding: "0 4px", flexShrink: 0, userSelect: "none" }}>›</div>
              : item.type === "zipt"
                ? <div key={idx} className={item.pulseClass} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    flexShrink: 0,
                    padding: "12px 24px",
                    background: item.bg,
                    border: "2.5px solid " + item.color,
                    borderRadius: "var(--r-xl)",
                    cursor: "pointer",
                    transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.06) translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                    <div style={{ color: item.color, fontSize: 16, fontWeight: 900, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 7 }}>
                      {item.emoji === "blue" && (
                        <span style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "radial-gradient(circle at 35% 35%, #8ab4f8 0%, #2a6be6 70%, #1a4da6 100%)",
                          boxShadow: "0 2px 4px rgba(42, 107, 230, 0.3)",
                          flexShrink: 0
                        }} />
                      )}
                      {item.emoji === "red" && (
                        <span style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "radial-gradient(circle at 35% 35%, #ff8a8a 0%, #e0484a 70%, #b82b2d 100%)",
                          boxShadow: "0 2px 4px rgba(224, 72, 74, 0.3)",
                          flexShrink: 0
                        }} />
                      )}
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: item.color, opacity: 0.9 }}>{item.sub}</div>
                  </div>
                : <div key={idx} style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: "var(--ink-2)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    padding: "10px 16px",
                    background: "var(--surface-2)",
                    borderRadius: "var(--r-lg)",
                    border: "1px solid var(--line)"
                  }}>
                    {item.label}
                  </div>
          ))}
        </div>

        {/* HUG 공식 권고 강조 배너 구역 */}
        <div style={{
          marginTop: 24,
          background: "rgba(42, 107, 230, 0.05)",
          borderLeft: "5px solid var(--primary)",
          borderRadius: "0 var(--r-xl) var(--r-xl) 0",
          padding: "18px 24px",
          display: "flex",
          alignItems: "flex-start",
          gap: 16
        }}>
          <span style={{ fontSize: 28, flexShrink: 0, marginTop: -2 }}>🏛️</span>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: "var(--primary-800)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span>주택도시보증공사(HUG) 공식 전세사기 예방 안내</span>
              <span style={{ fontSize: 10, background: "var(--primary)", color: "#fff", padding: "2px 8px", borderRadius: 4, fontWeight: 800 }}>중요 권고사항</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.65, fontWeight: 600 }}>
              "임대차계약은 특히나 큰돈과 당장의 생존이 걸려있는 만큼 더욱더 꼼꼼하게 살펴야 해요." <br />
              <span style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 500 }}>
                가계약금 송금 전에 반드시 <b>등기부등본</b>을, 서명 날인 전에는 <b>계약서 초안</b>을 검토하여 소중한 전세 보증금과 권리를 지키세요.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecTitle({ kicker, title, desc, light }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 28px" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: light ? "#7eb0ff" : "var(--primary)", letterSpacing: ".05em" }}>{kicker}</div>
      <h2 style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-.02em", margin: "9px 0 0", lineHeight: 1.3, color: light ? "#fff" : "var(--ink)" }}>{title}</h2>
      {desc && <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: "12px 0 0", color: light ? "#cdd9f0" : "var(--ink-2)" }}>{desc}</p>}
    </div>
  );
}

// 기능별 실제 리포트 화면을 재구성한 목업 — 텍스트 대신 그래프로 결과물을 보여줌
function FeatureMockup({ kind }) {
  if (kind === "deed") {
    return (
      <Card className="neon-card-glow guest-mockup-card" style={{ padding: "26px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Badge tone="primary" icon="file-text">등기부등본 분석 예시</Badge>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-4)" }}>서울시 관악구 봉천동</span>
        </div>
        <div className="guest-deed-body" style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
          <div className="guest-gauge-wrap" style={{ flexShrink: 0 }}>
            <Gauge value={62} size={140} label="주의 단계" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>
              이 집은 오피스텔이고, 을구에 1억 8,000만원의 근저당권이 잡혀 있어요. 보증금까지 더하면 집값의 <b style={{ color: "var(--warn-600)" }}>82%</b>로 다소 주의가 필요한 구간이에요.
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>
                <span>담보인정비율(LTV)</span><span style={{ color: "var(--warn-600)" }}>82%</span>
              </div>
              <div style={{ marginTop: 7 }}><Bar value={82} color="var(--warn)" /></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  if (kind === "lease") {
    return (
      <Card className="neon-card-glow danger-neon guest-mockup-card" style={{ padding: "26px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Badge tone="danger" icon="file-signature">임대차계약서 분석 예시</Badge>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-4)" }}>특약 12개 중 검토</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
          <TrafficLight active="danger" size={20} />
          <span style={{ fontSize: 15.5, fontWeight: 800, color: "var(--danger-700)" }}>종합 판정 · 위험</span>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}>
            <span>특약 12개 중 위험 조항 비중</span><span style={{ color: "var(--danger-700)" }}>1건</span>
          </div>
          <div style={{ marginTop: 6 }}><Bar value={8} color="var(--danger)" /></div>
        </div>
        <div style={{ marginTop: 14, background: "var(--surface-2)", borderRadius: 12, padding: "13px 15px", borderLeft: "3.5px solid var(--danger)" }}>
          <div style={{ fontSize: 11, color: "var(--danger-700)", fontWeight: 800 }}>⚠️ 독소 조항 감지</div>
          <div style={{ fontSize: 12.5, color: "var(--ink)", marginTop: 5, fontWeight: 600, lineHeight: 1.55 }}>
            "임차인은 입주 후 전입신고 및 확정일자를 3일 후에 받기로 한다."
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.55 }}>
            → 최우선변제권 순위가 밀려 보증금을 못 돌려받을 수 있어요.
          </div>
        </div>
      </Card>
    );
  }
  if (kind === "terms") {
    return (
      <Card className="neon-card-glow safe-neon guest-mockup-card" style={{ padding: "26px 24px" }}>
        <Badge tone="safe" icon="book">용어 정리ZIP 예시</Badge>
        <div style={{ marginTop: 16, border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>근저당권</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--danger-600)", background: "var(--danger-soft)", padding: "3px 9px", borderRadius: 999 }}>
              <Icon name="shield" size={11} stroke={2.2} /> 보증금 안전·위험 예방
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.6 }}>
            채무자가 빚을 갚지 못할 경우를 대비해 채권자가 부동산에 설정하는 담보 권리
          </div>
          <div style={{ marginTop: 10, background: "var(--warn-soft)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--warn-600)" }}>🚩 임차인 행동 지침</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.5 }}>
              이 금액 + 내 보증금이 집값의 70%를 넘으면 위험해요. 특약에 '잔금 시 대출 말소' 조건을 넣어보세요.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {["보증금 안전·위험 예방", "계약·계약서", "주거 형태·주택 구조", "면적·가격·정책"].map((t) => (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", background: "var(--surface-2)", padding: "5px 10px", borderRadius: 999 }}>{t}</span>
          ))}
        </div>
      </Card>
    );
  }
  if (kind === "guide") {
    return (
      <Card className="neon-card-glow guide-neon guest-mockup-card" style={{ padding: "26px 24px" }}>
        <Badge tone="guide" icon="flag">부동산 가이드 예시</Badge>
        <div style={{ marginTop: 16, border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px", background: "var(--surface-2)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: "#5b53c9", marginBottom: 6 }}>계약·절차</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", lineHeight: 1.35 }}>
            전세 계약 전 꼭 확인해야 할 체크리스트
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.6 }}>
            계약하려는 주택의 선순위 채권과 내 보증금 합이 시세의 70% 이하인지 꼭 등기부에서 확인하세요. 대리계약 시 위임장 확인은 필수입니다.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {["#전세계약", "#체크리스트", "#사회초년생", "#안전계약"].map((t) => (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--line)", padding: "5px 10px", borderRadius: 999 }}>{t}</span>
          ))}
        </div>
      </Card>
    );
  }
  // infra
  const places = [
    { icon: "utensils", label: "음식점", place: "어반", dist: "도보 1분" },
    { icon: "coffee", label: "카페", place: "메가MGC커피 오리역점", dist: "도보 1분" },
    { icon: "train", label: "대중교통", place: "수인분당선 오리역", dist: "도보 1분" },
  ];
  return (
    <Card className="neon-card-glow warn-neon guest-mockup-card" style={{ padding: "26px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Badge tone="warn" icon="map">인프라 브리핑 예시</Badge>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-4)" }}>경기 성남시 분당구 구미동</span>
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {places.map((row) => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={row.icon} size={16} color="var(--ink-3)" stroke={1.9} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.place}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{row.label} · {row.dist}</div>
            </div>
            <Badge tone="safe" size="sm">우수</Badge>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, background: "var(--primary-soft)", borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--primary-700)" }}>✨ ZIPT AI 실시간 동네 브리핑</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.55 }}>
          "도보 1분 거리에 지하철역이 있어 대중교통으로 출퇴근하는 사회초년생에게 좋은 입지예요."
        </div>
      </div>
    </Card>
  );
}

// 기능 상세 — 텍스트/목업 좌우 교차 배치 (crisp.chat 참고)
function FeatureRow({ feature, index, handleNav, toneC, toneBg }) {
  const reversed = index % 2 === 1;
  return (
    <Reveal delay={index * 0.1} animationType={reversed ? "slide-right" : "slide-left"}>
      <div className="guest-feature-row" style={{ display: "flex", flexDirection: reversed ? "row-reverse" : "row", alignItems: "center", gap: 44 }}>
        <div className={`guest-feature-copy ${!reversed ? "guest-feature-copy-right" : ""}`} style={{ flex: "0 0 320px" }}>
          <span className="guest-feature-icon" style={{ width: 46, height: 46, borderRadius: 13, background: toneBg[feature.tone], display: "flex",
            alignItems: "center", justifyContent: "center" }}>
            <Icon name={feature.icon} size={23} color={toneC[feature.tone]} stroke={1.9} />
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginTop: 16 }}>{feature.title}</div>
          {feature.timing && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
              background: feature.timingBg, color: feature.timingColor,
              fontSize: 11.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>
              ⏱ {feature.timing}
            </div>
          )}
          <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, marginTop: 10 }}>{feature.desc}</div>
          <div
            onClick={() => handleNav(feature.path, feature.protected)}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 18, color: toneC[feature.tone], fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            바로 써보기 <Icon name="chevron" size={16} />
          </div>
        </div>
        <div className="guest-feature-mockup" style={{ flex: 1, minWidth: 0 }}>
          <FeatureMockup kind={feature.mockup} />
        </div>
      </div>
    </Reveal>
  );
}

const STEPS = [
  { icon: "upload", title: "서류 업로드", desc: "등기부등본·계약서를 사진이나 PDF로 올리기만 하면 돼요." },
  { icon: "sparkle", title: "AI 자동 분석", desc: "갑구·을구 권리관계, 특약 조항, 주변 인프라까지 AI가 한 번에 스캔해요." },
  { icon: "check-circle", title: "신호등 리포트 확인", desc: "안전·주의·위험 신호등과 점수로 결과를 바로 확인해요." },
];
const SOURCES = [
  { icon: "🏛️", source: "대법원 인터넷등기소", usage: "등기부등본 갑구·을구 권리관계 분석" },
  { icon: "🏠", source: "HUG 주택도시보증공사", usage: "담보인정비율(LTV)·전세보증보험 가입 가능 여부 판정" },
  { icon: "🗺️", source: "국토교통부 실거래가", usage: "시세 대비 보증금 위험도(깡통전세 여부) 계산" },
  { icon: "⚖️", source: "법제처 국가법령정보", usage: "계약서 특약 위법성·독소조항 판단 근거" },
];
const PROBLEMS = [
  { icon: "doc", tone: "primary", title: "어려운 서류", desc: "등기부등본·계약서의 법률 용어는 사회초년생이 혼자 해석하기 너무 어려워요." },
  { icon: "alert", tone: "danger", title: "숨은 위험", desc: "근저당·신탁·깡통전세 같은 위험은 계약서 어디에도 친절히 적혀 있지 않아요." },
  { icon: "clock", tone: "warn", title: "촉박한 시간", desc: "계약은 보통 며칠 안에 결정해야 하는데, 전문가 검토를 받을 시간이 부족해요." },
];
const FEATURES = [
  { icon: "doc", tone: "primary", title: "등기부등본 위험 분석", timing: "가계약 전 필수", timingColor: "var(--primary-700)", timingBg: "var(--primary-soft)", desc: "갑구·을구 권리관계와 시세 대비 보증금을 읽어 깡통전세 위험을 점수와 신호등으로 보여줘요.", path: "/analysis", protected: true, mockup: "deed" },
  { icon: "file-signature", tone: "danger", title: "임대차계약서 분석", timing: "서명 직전 필수", timingColor: "var(--danger-600)", timingBg: "var(--danger-soft)", desc: "어려운 부동산 용어를 쉬운 말로, 계약서 특약 속 독소조항을 AI가 찾아 해독해 드려요.", path: "/contract", protected: true, mockup: "lease" },
  { icon: "flag", tone: "violet", title: "부동산 가이드", desc: "주택 임대차 관련 필수 법령과 전세 계약 실무 가이드를 알기 쉽게 해설해 드려요.", path: "/guide", mockup: "guide" },
  { icon: "book", tone: "safe", title: "용어 정리ZIP", desc: "계약 과정에서 많이 사용하지만, 한번에 이해하기 어려운 부동산 용어를 쉬운 문장으로 알려 드려요.", path: "/terms", mockup: "terms" },
  { icon: "map", tone: "warn", title: "인프라 브리핑", desc: "사용자의 라이프스타일에 맞춰 교통·병원·마트·반려동물 인프라를 동네별로 분석해요.", path: "/map", mockup: "infra" },
];
const toneC = { primary: "var(--primary)", navy: "var(--navy)", violet: "#5b53c9", safe: "var(--safe-600)", warn: "var(--warn-600)", danger: "var(--danger-600)", guide: "#0d9488" };
const toneBg = { primary: "var(--primary-soft)", navy: "#e6ecf8", violet: "#ecebfa", safe: "var(--safe-soft)", warn: "var(--warn-soft)", danger: "var(--danger-soft)", guide: "#f0fdfa" };

function GuestHomePage({ navigate }) {
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const handleNav = (path, isProtected = false) => {
    if (isProtected) {
      openAuthModal(path);
      return;
    }
    navigate(path);
  };

  return (
    <div style={{ overflow: 'visible', position: 'relative' }}>
    <div style={{ animation: "zipt-fade .3s ease", paddingBottom: 60, position: 'relative', overflow: 'visible' }}>
      {/* 몽환적인 3D 그라데이션 오라 파티클 백그라운드 주입 */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 10px var(--pulse-color); }
          50% { transform: scale(1.08); opacity: 1; box-shadow: 0 0 22px var(--pulse-color); }
        }
        @keyframes shine-text {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-blue {
          0%, 100% { box-shadow: 0 0 0 0px rgba(42, 107, 230, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(42, 107, 230, 0); }
        }
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 0 0px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
        .pulse-step-blue {
          animation: pulse-blue 2s infinite ease-in-out;
        }
        .pulse-step-red {
          animation: pulse-red 2s infinite ease-in-out;
        }
        .gradient-text-shiny {
          background: linear-gradient(135deg, var(--primary) 0%, #00e1ff 35%, #2a6be6 70%, var(--primary) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine-text 5s linear infinite;
        }
        .pulse-light {
          animation: pulse-glow 3s infinite ease-in-out;
        }
        .neon-card-glow {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .neon-card-glow:hover {
          transform: translateY(-9px) scale(1.025) !important;
          box-shadow: 0 22px 44px rgba(42, 107, 230, 0.16) !important;
          border-color: rgba(42, 107, 230, 0.4) !important;
        }
        .danger-neon:hover {
          border-color: rgba(239, 68, 68, 0.4) !important;
          box-shadow: 0 22px 44px rgba(239, 68, 68, 0.14) !important;
        }
        .warn-neon:hover {
          border-color: rgba(245, 158, 11, 0.4) !important;
          box-shadow: 0 22px 44px rgba(245, 158, 11, 0.14) !important;
        }
        .safe-neon:hover {
          border-color: rgba(16, 185, 129, 0.4) !important;
          box-shadow: 0 22px 44px rgba(16, 185, 129, 0.14) !important;
        }
        .guide-neon:hover {
          border-color: rgba(91, 83, 201, 0.4) !important;
          box-shadow: 0 22px 44px rgba(91, 83, 201, 0.14) !important;
        }
        .why-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .why-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.07) !important;
        }
        @keyframes scroll-loop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .slider-track {
          display: flex;
          width: 200%;
          animation: scroll-loop 25s linear infinite;
        }
        .slider-track:hover {
          animation-play-state: paused;
        }
        .logo-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 40px;
          font-weight: 700;
          color: var(--ink-3);
          font-size: 14px;
          white-space: nowrap;
        }
        .guest-feature-row,
        .guest-feature-copy,
        .guest-feature-mockup,
        .guest-mockup-card {
          min-width: 0;
        }
        .guest-feature-list {
          display: flex;
          flex-direction: column;
          gap: 70px;
          margin: -14px -22px;
          padding: 14px 22px;
          overflow: visible;
        }
        .guest-feature-row,
        .guest-feature-mockup {
          overflow: visible;
        }
        .guest-feature-copy-right {
          text-align: right;
        }
        .guest-feature-copy-right .guest-feature-icon {
          margin-left: auto;
        }
        .guest-feature-mockup {
          box-sizing: border-box;
          padding: 14px 18px;
        }
        .guest-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 34px;
          margin: -12px 0 -14px;
          padding: 12px 22px 16px;
          overflow: visible;
        }
        .guest-step-item {
          position: relative;
          display: flex;
          width: 100%;
          height: 100%;
          min-width: 0;
          overflow: visible;
        }
        .guest-step-card {
          width: 100%;
          min-height: 142px;
          box-sizing: border-box;
        }
        .guest-step-connector {
          position: absolute;
          top: 50%;
          right: -27px;
          transform: translateY(-50%);
          z-index: 2;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .guest-feature-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 18px !important;
          }
          .guest-feature-list {
            gap: 42px;
            margin: 0;
            padding: 0;
          }
          .guest-feature-copy {
            flex: 1 1 auto !important;
            width: 100% !important;
          }
          .guest-feature-copy-right {
            text-align: left;
          }
          .guest-feature-copy-right .guest-feature-icon {
            margin-left: 0;
          }
          .guest-feature-mockup {
            width: 100% !important;
            padding: 0;
          }
          .guest-mockup-card {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding: 20px 16px !important;
          }
          .guest-deed-body {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .guest-gauge-wrap {
            align-self: center !important;
          }
          .guest-steps-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .guest-step-card {
            min-height: 0;
          }
          .guest-step-connector {
            display: none;
          }
          .neon-card-glow:hover {
            transform: none !important;
          }
          .guest-problems-grid,
          .guest-trust-grid {
            grid-template-columns: 1fr !important;
          }
          .guest-source-row {
            flex-wrap: wrap !important;
          }
          .guest-source-label {
            flex: 1 1 auto !important;
          }
          .guest-source-arrow {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .guest-cta-buttons > button:nth-child(1),
          .guest-cta-buttons > button:nth-child(2) {
            flex: 1 1 calc(50% - 5px);
            padding: 9px 10px !important;
            gap: 5px !important;
            font-size: 12.5px !important;
            white-space: nowrap;
          }
          .guest-cta-buttons > button:nth-child(3) {
            flex: 1 1 100%;
          }
        }
      `}</style>

      {/* 히어로 — 시네마틱 줌인 & 스페셜 페이드업 */}
      <section style={{ textAlign: "center", padding: "50px 0 30px", position: "relative" }}>
        <div style={{ animation: "zipt-fade-up .8s cubic-bezier(.16,1,.3,1) both" }}>
          <Badge tone="primary" solid icon="sparkle" style={{ fontSize: 13, padding: "5px 12px" }}>ZIPT 소개</Badge>
        </div>
        <h1 style={{ 
          fontSize: 42, 
          fontWeight: 900, 
          letterSpacing: "-.035em", 
          lineHeight: 1.25, 
          margin: "20px 0 0", 
          color: "var(--ink)",
          animation: "zipt-fade-up 1s cubic-bezier(.16,1,.3,1) .15s both" 
        }}>
          부동산 계약 위험으로부터<br />
          <span className="gradient-text-shiny">사회초년생</span>을 지키는 가장 쉬운 방법
        </h1>
        <p style={{ 
          fontSize: 16.5, 
          color: "var(--ink-2)", 
          lineHeight: 1.7, 
          margin: "20px auto 0", 
          maxWidth: 680,
          wordBreak: "keep-all",
          animation: "zipt-fade-up 1s cubic-bezier(.16,1,.3,1) .3s both",
          fontWeight: 500
        }}>
          ZIPT는 어려운 부동산 서류를 AI로 분석해 누구나 쉽게, 직관적으로
          위험 요소들을 확인할 수 있도록 가이드하는 부동산 계약 안전 도우미예요.
        </p>
      </section>

      {/* 계약 타이밍 타임라인 배너 */}
      <Reveal animationType="fade-up" delay={0.2}>
        <TimelineBanner />
      </Reveal>

      {/* 어떻게 동작하는지 — 3단계 프로세스 */}
      <section style={{ marginTop: 40 }}>
        <Reveal animationType="3d-flip">
          <SecTitle kicker="HOW IT WORKS" title="3단계면 충분해요"
            desc="서류를 올리면 ZIPT AI가 이 순서로 분석해서 신호등 리포트를 만들어 드려요." />
        </Reveal>
        <div className="guest-steps-grid">
          {STEPS.map((step, idx, arr) => (
            <Reveal key={step.title} delay={idx * 0.12} animationType="scale-up" className="guest-step-item">
              <div className="guest-step-item">
                <Card className="neon-card-glow guest-step-card" style={{ padding: "22px 20px", textAlign: "left", height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="tnum" style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {idx + 1}
                    </span>
                    <Icon name={step.icon} size={19} color="var(--primary)" stroke={1.9} />
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)", marginTop: 12 }}>{step.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.55 }}>{step.desc}</div>
                </Card>
                {idx < arr.length - 1 && (
                  <Icon className="guest-step-connector" name="chevron" size={20} color="var(--ink-4)" stroke={2} />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 문제 정의 */}
      <section style={{ marginTop: 60 }}>
        <Reveal animationType="3d-flip">
          <SecTitle kicker="WHY ZIPT" title="첫 전세, 왜 이렇게 막막할까요?"
            desc="처음 집을 구하는 사람에게 전세 계약은 가장 큰 돈이 오가는, 가장 정보가 부족한 순간이에요." />
        </Reveal>
        <div className="guest-problems-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, overflow: 'visible' }}>
          {PROBLEMS.map((p, idx) => (
            <Reveal key={p.title} delay={idx * 0.15} animationType="scale-up" style={{ display: 'flex', flexDirection: 'column' }}>
              <Card className="why-card" style={{ height: '100%', padding: '24px 22px' }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, background: toneBg[p.tone], display: "flex",
                  alignItems: "center", justifyContent: "center", marginBottom: 15 }}>
                  <Icon name={p.icon} size={22} color={toneC[p.tone]} stroke={1.9} />
                </span>
                <div style={{ fontSize: 16.5, fontWeight: 800, color: "var(--ink)" }}>{p.title}</div>
                <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.6 }}>{p.desc}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 신호등 철학 */}
      <Reveal animationType="3d-flip" delay={0.1}>
        <section style={{ marginTop: 65, background: "linear-gradient(165deg, var(--navy), var(--navy-deep))",
          borderRadius: "var(--r-2xl)", padding: "46px 38px", color: "#fff", boxShadow: "0 18px 36px rgba(10, 25, 47, 0.22)" }}>
          <SecTitle light kicker="OUR PRINCIPLE" title="법률 용어 대신, 신호등 색으로"
            desc="ZIPT의 모든 분석은 안전·주의·위험 세 가지 색으로 요약돼요. 전문 지식이 없어도 색만 보면 판단할 수 있게요." />
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
            {["safe", "warn", "danger"].map((k, idx) => {
              const R = RISK[k];
              const label = { safe: "초록이면 안심하고 진행", warn: "노랑이면 한 번 더 확인", danger: "빨강이면 일단 멈춤" }[k];
              const neonColor = { safe: "#10b981", warn: "#f59e0b", danger: "#ef4444" }[k];
              const neonClass = { safe: "safe-neon", warn: "warn-neon", danger: "danger-neon" }[k];
              return (
                <Reveal key={k} delay={idx * 0.15} animationType="scale-up" style={{ flex: 1, minWidth: 180 }}>
                  <div className={`neon-card-glow ${neonClass}`} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: "var(--r-xl)", padding: "22px 20px", textAlign: "center", height: '100%' }}>
                    <div style={{ position: "relative", display: "inline-flex", width: 22, height: 22, marginBottom: 14, alignItems: "center", justifyContent: "center" }}>
                      <span style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: R.color,
                        animation: 'zipt-ping-strong 1.3s cubic-bezier(0, 0, 0.2, 1) infinite',
                      }} />
                      <span style={{
                        position: 'relative',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: R.color,
                        boxShadow: `0 0 12px ${R.color}`,
                        animation: 'zipt-glow-core 1.5s ease-in-out infinite',
                      }} />
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{R.label}</div>
                    <div style={{ fontSize: 13, color: "#cdd9f0", marginTop: 7, lineHeight: 1.55 }}>{label}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      </Reveal>

      {/* 기능 상세 — 텍스트와 실제 리포트 목업을 좌우 교차 배치 */}
      <section style={{ marginTop: 65 }}>
        <Reveal animationType="3d-flip">
          <SecTitle kicker="WHAT WE DO" title="계약의 모든 단계를 함께 지켜드려요"
            desc="말로 설명하는 대신, ZIPT가 실제로 만들어 드리는 화면을 그대로 보여 드릴게요." />
        </Reveal>
        <div className="guest-feature-list">
          {FEATURES.map((f, i) => (
            <FeatureRow key={f.title} feature={f} index={i} handleNav={handleNav} toneC={toneC} toneBg={toneBg} />
          ))}
        </div>
      </section>

      {/* 서류 분석만으로 끝나지 않아요 — 4개 기능 외 보너스: 층간소음 리포트 */}
      <Reveal animationType="zoom-in">
        <section style={{ marginTop: 65 }}>
          <SecTitle kicker="BONUS" title="서류 분석만으로 끝나지 않아요"
            desc="임대차계약서를 올리면 층간소음 민원 데이터까지 함께 확인할 수 있어요." />
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <Card className="neon-card-glow" style={{ padding: "26px 24px" }}>
              <Badge tone="warn" icon="alert-circle">층간소음 리포트 예시</Badge>
              <div style={{ marginTop: 14, background: "var(--warn-soft)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>층간소음 위험도 분석</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--warn-600)" }}>MEDIUM (주의)</div>
                  <div style={{ position: "relative", display: "inline-flex", width: 14, height: 14, flexShrink: 0 }}>
                    <span style={{
                      position: 'absolute',
                      display: 'inline-flex',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'var(--warn)',
                      animation: 'zipt-ping-strong 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
                    }} />
                    <span style={{
                      position: 'relative',
                      display: 'inline-flex',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: 'var(--warn)',
                      animation: 'zipt-glow-core 1.5s ease-in-out infinite',
                    }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14, textAlign: "center" }}>
                <div style={{ background: "var(--surface-2)", padding: "10px", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700 }}>신고건수</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>14건</div>
                </div>
                <div style={{ background: "var(--surface-2)", padding: "10px", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700 }}>소음수준</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>58점</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>주요 원인</div>
                {[{ label: "층간소음", pct: 62 }, { label: "반려동물 소음", pct: 21 }, { label: "나머지", pct: 17 }].map((s) => (
                  <div key={s.label} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--ink-2)", fontWeight: 700 }}>
                      <span>{s.label}</span><span>{s.pct}%</span>
                    </div>
                    <div style={{ marginTop: 4 }}><Bar value={s.pct} color="var(--primary)" /></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </Reveal>

      {/* 어떤 데이터를 근거로 분석하나요 — 공공데이터 출처를 실제 기능과 1:1로 매핑 */}
      <section style={{ marginTop: 65 }}>
        <Reveal animationType="3d-flip">
          <SecTitle 
            kicker="DATA WE USE" 
            title="어떤 데이터를 근거로 분석하나요?"
            desc={
              <>
                추측이 아니라, 공공기관이 제공하는 데이터를 근거로 판단해요.
                <br />
                HUG·법제처 등 신뢰할 수 있는 기관의 기준을 그대로 적용해요.
              </>
            } 
          />
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760, margin: "0 auto" }}>
          {SOURCES.map((row, idx) => (
            <Reveal key={row.source} delay={idx * 0.08} animationType="slide-left">
              <Card className="guest-source-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{row.icon}</span>
                <span className="guest-source-label" style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", flex: "0 0 200px" }}>{row.source}</span>
                <Icon className="guest-source-arrow" name="arrow" size={16} color="var(--ink-4)" stroke={2} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{row.usage}</span>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* 무한 롤링 공공기관 출처 슬라이더 */}
        <div style={{ marginTop: 32, background: "var(--surface)", borderTop: "1.5px solid var(--line)", borderBottom: "1.5px solid var(--line)", overflow: "hidden", padding: "16px 0" }}>
          <div className="slider-track">
            {[
              { icon: "🏛️", label: "대법원 인터넷등기소" },
              { icon: "🏠", label: "HUG 주택도시보증공사" },
              { icon: "🗺️", label: "국토교통부 실거래가" },
              { icon: "⚖️", label: "법제처 국가법령정보" },
              { icon: "💰", label: "국세청 홈택스" },
              { icon: "📈", label: "한국부동산원" }
            ].concat([
              { icon: "🏛️", label: "대법원 인터넷등기소" },
              { icon: "🏠", label: "HUG 주택도시보증공사" },
              { icon: "🗺️", label: "국토교통부 실거래가" },
              { icon: "⚖️", label: "법제처 국가법령정보" },
              { icon: "💰", label: "국세청 홈택스" },
              { icon: "📈", label: "한국부동산원" }
            ]).map((logo, idx) => (
              <div key={idx} className="logo-item">
                <span>{logo.icon}</span>
                <span>{logo.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 신뢰 / 보안 */}
      <section style={{ marginTop: 65 }}>
        <div className="guest-trust-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { icon: "lock", title: "안전한 보관", desc: "업로드한 서류는 암호화해 보관하고, 분석 외 목적으로 쓰지 않아요." },
            { icon: "sparkle", title: "쉬운 요약", desc: "복잡한 분석도 쉬운 한 문장과 신호등으로 먼저 보여줘요." },
            { icon: "info", title: "공공데이터 기반", desc: "표준 용어·정의는 공공 데이터를 출처와 함께 활용해요." },
          ].map((s, idx) => (
            <Reveal key={s.title} delay={idx * 0.15} animationType="fade-up">
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "5px 6px" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--primary-soft)", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={s.icon} size={20} color="var(--primary)" stroke={1.9} />
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 5, lineHeight: 1.55 }}>{s.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Reveal animationType="zoom-in" delay={0.1}>
        <section style={{ marginTop: 65, background: "linear-gradient(135deg, var(--primary), var(--navy))",
          borderRadius: "var(--r-2xl)", padding: "46px 38px", color: "#fff", textAlign: "center", boxShadow: "0 22px 44px rgba(42, 107, 230, 0.18)" }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1.3 }}>이제, 안전한 계약을 시작하세요</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.85)", margin: "12px 0 24px" }}>서류 한 장이면 ZIPT가 위험을 대신 찾아드려요.</p>
          <div className="guest-cta-buttons" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="soft" icon="upload" onClick={() => handleNav('/analysis', true)}>등기부 분석 시작</Button>
            <Button variant="soft" icon="upload" onClick={() => handleNav('/contract', true)}>임대차 분석 시작</Button>
            <button onClick={() => navigate('/signup')} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.3)",
              color: "#fff", borderRadius: "var(--r-md)", padding: "11px 18px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .16s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; }}
            >
              무료 회원가입
            </button>
          </div>
        </section>
      </Reveal>
    </div>
    </div>
  );
}

const normalizeList = (response, keys) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const normalizeAnalyses = (response) => normalizeList(response, ['content', 'analyses']);
const normalizeContracts = (response) => normalizeList(response, ['content', 'contracts']);

function NewUserHome({ navigate, name }) {
  const STEPS = [
    { n: 1, title: "서류 업로드", desc: "등기부등본·계약서를 사진이나 PDF로 올리기만 하면 돼요." },
    { n: 2, title: "AI 위험 분석", desc: "권리관계·담보인정비율·보증보험 가능 여부를 자동으로 판정해요." },
    { n: 3, title: "신호등 결과", desc: "안전·주의·위험 세 색으로 요약하고 쉬운 리포트를 드려요." },
  ];
  const FEATURES = [
    { icon: "doc", tone: "primary", title: "등기부등본 분석", timing: "가계약 전 필수", timingColor: "var(--primary-700)", timingBg: "var(--primary-soft)", desc: "깡통전세·근저당 위험을 점수로", path: "/analysis" },
    { icon: "file-signature", tone: "danger", title: "계약서 분석", timing: "서명 직전 필수", timingColor: "var(--danger-600)", timingBg: "var(--danger-soft)", desc: "특약 속 독소조항을 AI가 진단", path: "/contract" },
    { icon: "flag", tone: "violet", title: "부동산 가이드", desc: "계약 전 꼭 알아야 할 법령·실무 정보", path: "/guide" },
    { icon: "book", tone: "safe", title: "용어 정리ZIP", desc: "어려운 부동산 용어를 쉬운 말로", path: "/terms" },
    { icon: "map", tone: "warn", title: "인프라 브리핑", desc: "내 라이프스타일 맞춤 동네 분석", path: "/map" },
  ];
  const TRUST = [
    { icon: "lock", title: "안전한 보관", desc: "업로드한 서류는 암호화해 보관하고 분석 외 목적으로 쓰지 않아요." },
    { icon: "info", title: "공공데이터 기반", desc: "표준 용어·정의는 공공 데이터를 출처와 함께 활용해요." },
    { icon: "sparkle", title: "쉬운 요약", desc: "복잡한 분석도 쉬운 한 문장과 신호등으로 먼저 보여줘요." },
  ];
  const toneC = { primary: "var(--primary)", navy: "var(--navy)", violet: "#5b53c9", safe: "var(--safe-600)", warn: "var(--warn-600)", danger: "var(--danger-600)", guide: "#0d9488" };
  const toneBg = { primary: "var(--primary-soft)", navy: "#e6ecf8", violet: "#ecebfa", safe: "var(--safe-soft)", warn: "var(--warn-soft)", danger: "var(--danger-soft)", guide: "#f0fdfa" };

  return (
    <div style={{ animation: "zipt-fade .3s ease", paddingBottom: 40 }}>
      <style>{`
        @media (max-width: 768px) {
          .newuser-steps-grid,
          .newuser-trust-grid {
            grid-template-columns: 1fr !important;
          }
          .newuser-features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .newuser-features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <section style={{ background: "linear-gradient(150deg, var(--navy), var(--navy-deep))", borderRadius: "var(--r-2xl)", padding: "40px 36px", color: "#fff" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#7eb0ff" }}>환영해요{name ? `, ${name}님` : ""}</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.35, margin: "12px 0 0" }}>
          첫 서류를 올리면,<br />ZIPT가 전세 위험을 대신 찾아드려요
        </h1>
        <p style={{ fontSize: 14.5, color: "#cdd9f0", lineHeight: 1.65, margin: "14px 0 0", maxWidth: 560 }}>
          등기부등본이나 계약서 한 장이면 깡통전세·근저당·독소조항 위험을 점수와 신호등으로 확인할 수 있어요. 분석은 무료예요.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <Button size="lg" variant="soft" icon="upload" onClick={() => navigate('/analysis')}>등기부등본 분석 시작</Button>
          <button onClick={() => navigate('/contract')} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.3)",
            color: "#fff", borderRadius: "var(--r-md)", padding: "15px 22px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            계약서 분석하기
          </button>
        </div>
      </section>

      {/* 계약 타이밍 타임라인 배너 */}
      <Reveal>
        <TimelineBanner />
      </Reveal>

      <Reveal>
        <section style={{ marginTop: 40 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 14 }}>이렇게 분석해요</div>
          <div className="newuser-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {STEPS.map((step) => (
              <Card key={step.n}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 9, background: "var(--primary-soft)", color: "var(--primary-700)",
                    fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }} className="tnum">{step.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{step.title}</span>
                </div>
                <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6, marginTop: 11 }}>{step.desc}</div>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section style={{ marginTop: 40 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 14 }}>ZIPT로 할 수 있는 것</div>
          <div className="newuser-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
            {FEATURES.map((feature) => (
              <Card key={feature.title} hover onClick={() => navigate(feature.path)} style={{ cursor: "pointer", position: "relative" }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: toneBg[feature.tone], display: "flex",
                  alignItems: "center", justifyContent: "center" }}>
                  <Icon name={feature.icon} size={22} color={toneC[feature.tone]} stroke={1.9} />
                </span>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)", marginTop: 12 }}>{feature.title}</div>
                {feature.timing && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 6,
                    background: feature.timingBg, color: feature.timingColor,
                    fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999 }}>
                    ⏱ {feature.timing}
                  </div>
                )}
                <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.55 }}>{feature.desc}</div>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section style={{ marginTop: 40 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 14 }}>내 분석 내역</div>
          <Card style={{ textAlign: "center", padding: "46px 20px" }}>
            <span style={{ width: 56, height: 56, borderRadius: 16, background: "var(--surface-3)", display: "inline-flex",
              alignItems: "center", justifyContent: "center" }}>
              <Icon name="inbox" size={27} color="var(--ink-4)" stroke={1.7} />
            </span>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 14 }}>아직 분석한 서류가 없어요</div>
            <div style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 6, lineHeight: 1.6 }}>
              등기부등본이나 계약서를 올리면 분석 결과가 이곳에 차곡차곡 쌓여요.
            </div>
            <div style={{ marginTop: 18 }}>
              <Button icon="upload" onClick={() => navigate('/analysis')}>첫 서류 분석하기</Button>
            </div>
          </Card>

          <div className="newuser-trust-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 18 }}>
            {TRUST.map((item) => (
              <div key={item.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-soft)", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={item.icon} size={18} color="var(--primary)" stroke={1.9} />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>{item.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function MemberHome({ navigate }) {
  const member = useAuthStore((state) => state.member);
  const name = member?.name ?? member?.nickname ?? "";
  const { data: analysisResponse, isLoading: isAnalysisLoading } = useAnalysisHistory();
  const { data: contractResponse, isLoading: isContractLoading } = useContractHistory();

  if (isAnalysisLoading || isContractLoading) {
    return <PageLoading message="분석 이력을 불러오는 중이에요..." />;
  }

  const analyses = normalizeAnalyses(analysisResponse);
  const contracts = normalizeContracts(contractResponse);

  if (analyses.length + contracts.length === 0) {
    return <NewUserHome navigate={navigate} name={name} />;
  }

  return (
    <Suspense fallback={<PageLoading message="분석 이력을 불러오는 중이에요..." />}>
      <ReturningUserHome />
    </Suspense>
  );
}

// 비회원도 접근 가능 (App.jsx에서 permitAll)
export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <GuestHomePage navigate={navigate} />;
  }

  return <MemberHome navigate={navigate} />;
}
