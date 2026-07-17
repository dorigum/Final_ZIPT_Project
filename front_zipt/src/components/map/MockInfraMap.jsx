import { Icon } from "../common/index.jsx";
import { CATEGORY_META as CAT } from "./meta.js";
import styles from "./MockInfraMap.module.scss";
import { toCssVariable } from "../../utils/toCssVariable.js";

export default function MockInfraMap({ D, filter, subFilter = "all", hoverPoi, setHoverPoi, showRoute }) {
  const home = D.home;
  // route home → 봉천역 (hero transit), through one bend
  const hero = D.pois.find(p => p.id === "t1");
  const routePts = `${home.x},${home.y} 41,46 38,38 ${hero.x},${hero.y}`;
  const pathD = "M " + routePts.split(" ").map(pt => pt.replace(",", " ")).join(" L ");
  const show = (p) => {
    const categoryVisible = filter === "all" || filter === p.cat;
    const subVisible = filter === "all"
      || p.cat !== filter
      || subFilter === "all"
      || p.subCategory === subFilter
      || p.schoolLevel === subFilter;
    return categoryVisible && subVisible;
  };

  return (
    <div className={styles.panel01}>
      <style>{`
        @keyframes zipt-dash-flow {
          to {
            stroke-dashoffset: -9.2;
          }
        }
        .zipt-polyline-flow {
          animation: zipt-dash-flow 2.8s linear infinite !important;
        }
      `}</style>

      {/* ── base map: roads, parks, blocks (stretched svg) ── */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.svg01}>
        {/* land blocks */}
        <rect x="0" y="0" width="100" height="100" fill="#e8edf1" />
        <g fill="#eef2f6">
          <rect x="2" y="50" width="40" height="46" rx="2" />
          <rect x="62" y="2" width="36" height="38" rx="2" />
          <rect x="62" y="50" width="36" height="46" rx="2" />
        </g>
        {/* park */}
        <rect x="3" y="4" width="30" height="30" rx="3" fill="#dbe9d6" />
        <rect x="64" y="68" width="22" height="20" rx="3" fill="#dbe9d6" />
        {/* stream */}
        <path d="M-4 88 Q 30 78 52 90 T 104 84" fill="none" stroke="#cadcef" strokeWidth="5" strokeLinecap="round" />
        {/* road casings (grey) then fill (white) */}
        <g stroke="#dde4ec" strokeLinecap="round" fill="none">
          <path d="M-2 45 H102" strokeWidth="9" />
          <path d="M58 -2 V102" strokeWidth="9" />
          <path d="M-2 80 L102 18" strokeWidth="7" />
          <path d="M22 -2 V102" strokeWidth="5" />
          <path d="M-2 70 H102" strokeWidth="4.5" />
        </g>
        <g stroke="#ffffff" strokeLinecap="round" fill="none">
          <path d="M-2 45 H102" strokeWidth="6" />
          <path d="M58 -2 V102" strokeWidth="6" />
          <path d="M-2 80 L102 18" strokeWidth="4.6" />
          <path d="M22 -2 V102" strokeWidth="3.2" />
          <path d="M-2 70 H102" strokeWidth="2.8" />
        </g>

        {/* 생활권 (10분 도보권) soft circle */}
        <circle cx={home.x} cy={home.y} r="27" fill="rgba(42,107,230,.07)" stroke="rgba(42,107,230,.28)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />

        {/* walking route */}
        {showRoute && (filter === "all" || filter === "transit") && (
          <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="1.2"
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2.4 2.2"
            className={`zipt-polyline-flow ${styles.polyline01}`} />
        )}
      </svg>

      {/* ── POI markers ── */}
      {D.pois.map(p => {
        const c = CAT[p.cat];
        const visible = show(p);
        const hot = hoverPoi === p.id;
        const big = p.hero || p.pet || p.far;
        return (
          <div key={p.id} className={styles.stateDiv01} style={{ "--state-div01-left": toCssVariable(`${p.x}%`), "--state-div01-top": toCssVariable(`${p.y}%`), "--state-div01-z-index": hot ? 40 : big ? 20 : 10, "--state-div01-opacity": visible ? 1 : 0.22, "--state-div01-filter": toCssVariable(visible ? "none" : "grayscale(.6)"), "--state-div01-pointer-events": toCssVariable(visible ? "auto" : "none") }}
            onMouseEnter={() => setHoverPoi(p.id)} onMouseLeave={() => setHoverPoi(null)}>
            <div className={styles.stateRow01} style={{ "--state-row01-width": toCssVariable(hot ? 34 : 28), "--state-row01-height": toCssVariable(hot ? 34 : 28), "--state-row01-background": toCssVariable(c.color), "--state-row01-box-shadow": toCssVariable(hot ? "var(--sh-lg)" : "0 2px 5px rgba(15,27,51,.28)") }}>
              <Icon name={c.icon} size={hot ? 17 : 14} color="#fff" stroke={2.2} />
            </div>
            {/* persistent label for hero/filtered pins */}
            {(big || filter === p.cat) && !hot && (
              <div className={styles.statePanel01} style={{ "--state-panel01-color": toCssVariable(c.on) }}>
                {p.name} · {p.walk}분
              </div>
            )}
            {/* hover tooltip */}
            {hot && (
              <div className={styles.panel02}>
                <div className={styles.div01}>{p.name}</div>
                <div className={styles.row01}>
                  <span>{p.meta}</span>
                  <span className={styles.text01}>·</span>
                  <span className={styles.text02}><Icon name="walk" size={12} color="#9fc0ff" stroke={2.2} />도보 {p.walk}분 · {p.dist}</span>
                </div>
                <span className={styles.text03} />
              </div>
            )}
          </div>
        );
      })}

      {/* ── home marker ── */}
      <div className={styles.stateDiv02} style={{ "--state-div02-left": toCssVariable(`${home.x}%`), "--state-div02-top": toCssVariable(`${home.y}%`) }}>
        <span className={styles.text04} />
        <div className={styles.row02}>
          <Icon name="house" size={18} color="#fff" stroke={2.4} className={styles.component01} />
        </div>
        <div className={styles.panel03}>내 매물</div>
      </div>

      {/* ── top-left: map title chip ── */}
      <div className={styles.row03}>
        <Icon name="pin" size={15} color="var(--primary)" stroke={2.2} />
        <span className={styles.text05}>봉천동 인프라맵</span>
      </div>

      {/* ── zoom controls (decorative) ── */}
      <div className={styles.column01}>
        {["plus", "minus"].map((ic, i) => (
          <button key={ic} className={styles.stateButton01} style={{ "--state-button01-border-bottom": toCssVariable(i === 0 ? "1px solid var(--line)" : "none") }}>
            <Icon name={ic} size={16} color="var(--ink-2)" stroke={2.4} />
          </button>
        ))}
      </div>

      {/* ── legend ── */}
      <div className={styles.row04}>
        {Object.entries(CAT).map(([k, c]) => (
          <span key={k} className={styles.text06}>
            <span className={styles.stateText01} style={{ "--state-text01-background": toCssVariable(c.color) }} />{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
