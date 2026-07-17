import { Badge, Icon } from "../common/index.jsx";
import { CATEGORY_META as CAT } from "./meta.js";
import styles from "./CategoryCard.module.scss";
import { toCssVariable } from "../../utils/toCssVariable.js";

function getAccessInfo(poi) {
  if (!poi) return { walk: 0, text: "0분", isWalkable: true, busMin: 0 };
  const isWalkable = poi.walk <= 10;
  const busMin = Math.max(3, Math.round((poi.walk * 67) / 350));
  return {
    walk: poi.walk,
    isWalkable,
    busMin,
    text: isWalkable ? `도보 ${poi.walk}분` : `차량/대중교통 ${busMin}분`,
  };
}

function getDynamicCategoryData(catKey, defaultData = {}, sortedPois = []) {
  let headline = defaultData?.headline || "주변 시설 탐색 중";
  let summaryText = "";
  let hashtag = "#입지분석";
  let icon = "sparkle";
  let grade = defaultData?.grade || "safe";
  let gradeLabel = defaultData?.gradeLabel || "정보";

  if (!sortedPois || sortedPois.length === 0) {
    const fallbackText = catKey === "transit" ? "3km 반경 내 대중교통 정보가 존재하지 않습니다." : "1.5km 반경 내 해당 시설 정보가 존재하지 않습니다.";
    return { headline: fallbackText, summaryText: fallbackText, hashtag: "#정보없음", icon: "info", grade: "danger", gradeLabel: "없음" };
  }

  const p1 = sortedPois[0];
  const p2 = sortedPois[1];

  if (p1 && p2) {
    headline = `${p1.name} 도보 ${p1.walk}분 · ${p2.name} 도보 ${p2.walk}분`;
  } else if (p1) {
    headline = `${p1.name} 도보 ${p1.walk}분 인접`;
  }

  if (catKey === "food") {
    hashtag = "#맛집탐방";
    if (p1) {
      const info = getAccessInfo(p1);
      icon = info.isWalkable ? "walk" : "car";
      summaryText = info.isWalkable
        ? `도보 ${p1.walk}분 내 ${p1.name} 등 맛집이 가까워 외식하기 편리해요!`
        : `차량/대중교통 ${info.busMin}분 거리(${p1.dist})에 ${p1.name} 등 음식점이 위치해 있어요!`;
    }
    const minWalk = p1 ? p1.walk : 10;
    if (minWalk <= 3) { grade = "safe"; gradeLabel = "우수"; }
    else if (minWalk <= 8) { grade = "warn"; gradeLabel = "보통"; }
    else { grade = "danger"; gradeLabel = "주의"; }

  } else if (catKey === "cafe") {
    hashtag = "#카페투어";
    if (p1) {
      const info = getAccessInfo(p1);
      icon = info.isWalkable ? "walk" : "car";
      summaryText = info.isWalkable
        ? `도보 ${p1.walk}분 거리에 ${p1.name} 등 카페가 있어 여유로운 티타임이 가능해요!`
        : `차량/대중교통 ${info.busMin}분 거리(${p1.dist})에 ${p1.name} 등 카페가 위치해 있어요!`;
    }
    const minWalk = p1 ? p1.walk : 10;
    if (minWalk <= 3) { grade = "safe"; gradeLabel = "우수"; }
    else if (minWalk <= 8) { grade = "warn"; gradeLabel = "보통"; }
    else { grade = "danger"; gradeLabel = "주의"; }

  } else if (catKey === "transit") {
    hashtag = "#뚜벅이";
    const subway = sortedPois.find(p => p.name.includes("역") || p.meta.includes("호선") || p.meta.includes("철도")) || sortedPois[0];
    if (subway && p2 && p2.id !== subway.id) {
      headline = `${subway.name} 도보 ${subway.walk}분 · ${p2.name} 도보 ${p2.walk}분`;
    } else if (subway) {
      headline = `${subway.name} 도보 ${subway.walk}분 인접`;
    }
    if (subway) {
      const info = getAccessInfo(subway);
      icon = info.isWalkable ? "walk" : "car";
      summaryText = info.isWalkable
        ? `도보 ${subway.walk}분 내 ${subway.name}이 있어 대중교통 이용이 매우 편리해요!`
        : `대중교통/차량 약 ${info.busMin}분 거리(${subway.dist})에 ${subway.name}이 위치해 있어요.`;
    }
    const minWalk = subway ? subway.walk : sortedPois[0].walk;
    if (minWalk <= 8) { grade = "safe"; gradeLabel = "우수"; }
    else if (minWalk <= 15) { grade = "warn"; gradeLabel = "보통"; }
    else { grade = "danger"; gradeLabel = "주의"; }

  } else if (catKey === "medical") {
    hashtag = "#안심케어";
    if (p1) {
      const info = getAccessInfo(p1);
      icon = info.isWalkable ? "walk" : "car";
      summaryText = info.isWalkable
        ? `도보 ${p1.walk}분 내 ${p1.name} 등 병원·약국이 인접해 갑자기 아플 때도 안심이에요!`
        : `차량/대중교통 ${info.busMin}분 거리(${p1.dist})에 ${p1.name} 등 의료시설이 위치해 있어요!`;
    }
    const minWalk = p1 ? p1.walk : 10;
    if (minWalk <= 5) { grade = "safe"; gradeLabel = "좋음"; }
    else if (minWalk <= 10) { grade = "warn"; gradeLabel = "보통"; }
    else { grade = "danger"; gradeLabel = "관심"; }

  } else if (catKey === "market") {
    hashtag = "#장보기";
    if (p1) {
      const info = getAccessInfo(p1);
      icon = info.isWalkable ? "walk" : "car";
      summaryText = info.isWalkable
        ? `도보 ${p1.walk}분 내 ${p1.name}이 있어 장보기와 일상 생필품 구매가 수월해요!`
        : `차량/대중교통 ${info.busMin}분 거리(${p1.dist})에 ${p1.name}이 위치해 있어요!`;
    }
    const minWalk = p1 ? p1.walk : 10;
    if (minWalk <= 3) { grade = "safe"; gradeLabel = "우수"; }
    else if (minWalk <= 7) { grade = "warn"; gradeLabel = "보통"; }
    else { grade = "danger"; gradeLabel = "주의"; }

  } else if (catKey === "pet") {
    hashtag = "#반려동물";
    if (p1) {
      const info = getAccessInfo(p1);
      icon = info.isWalkable ? "walk" : "car";
      summaryText = info.isWalkable
        ? `도보 ${p1.walk}분 내 ${p1.name} 등 반려동물 관련 시설이 갖춰져 있어요!`
        : `차량/대중교통 ${info.busMin}분 거리(${p1.dist})에 ${p1.name} 등 반려동물 시설이 위치해 있어요!`;
    }
    const minWalk = p1 ? p1.walk : 10;
    if (minWalk <= 6) { grade = "safe"; gradeLabel = "좋음"; }
    else if (minWalk <= 12) { grade = "warn"; gradeLabel = "보통"; }
    else { grade = "danger"; gradeLabel = "부족"; }

  } else {
    hashtag = `#${CAT[catKey]?.label || "입지분석"}`;
    if (p1) {
      const info = getAccessInfo(p1);
      icon = info.isWalkable ? "walk" : "car";
      summaryText = info.isWalkable
        ? `도보 ${p1.walk}분 내 ${p1.name}을 확인할 수 있어요.`
        : `차량/대중교통 ${info.busMin}분 거리(${p1.dist})에 ${p1.name}이 위치해 있어요.`;
    }
    const minWalk = p1 ? p1.walk : 10;
    if (minWalk <= 6) { grade = "safe"; gradeLabel = "좋음"; }
    else if (minWalk <= 12) { grade = "warn"; gradeLabel = "보통"; }
    else { grade = "danger"; gradeLabel = "관심"; }
  }

  return {
    headline,
    summaryText,
    hashtag,
    icon,
    grade,
    gradeLabel,
  };
}

export default function CategoryCard({ catKey, data, pois = [], active, onToggle, onHoverPoi }) {
  const c = CAT[catKey] || { label: catKey, icon: "info", color: "var(--primary)", soft: "var(--primary-soft)" };
  const sorted = pois.slice().sort((a, b) => a.walk - b.walk);
  const dynamicData = getDynamicCategoryData(catKey, data, sorted);

  return (
    <div onClick={onToggle}
      className={styles.statePanel01} style={{ "--state-panel01-border": toCssVariable(`1.5px solid ${active ? c.color : "var(--line)"}`), "--state-panel01-box-shadow": toCssVariable(active ? "var(--sh-md)" : "var(--sh-sm)") }}>
      <div className={styles.row01}>
        <span className={styles.stateRow01} style={{ "--state-row01-background": toCssVariable(c.soft) }}>
          <Icon name={c.icon} size={20} color={c.color} stroke={2} />
        </span>
        <div className={styles.div01}>
          <div className={styles.row02}>
            <span className={styles.text01}>{c.label}</span>
          </div>
          <div className={styles.div02}>{dynamicData.headline}</div>
        </div>
        <Badge tone={dynamicData.grade}>{dynamicData.gradeLabel}</Badge>
      </div>

      {/* personalized 1-line summary box (matching mockup design) */}
      {dynamicData.summaryText && (
        <div className={styles.row03}>
          <span className={styles.row04}>
            <Icon name={dynamicData.icon} size={13} color="var(--primary-700)" stroke={2.2} />
          </span>
          <div className={styles.div03}>
            <b className={styles.text02} style={{ marginRight: 6 }}>{dynamicData.hashtag}</b>
            {dynamicData.summaryText}
          </div>
        </div>
      )}

      {/* nearby POIs */}
      <div className={styles.column01}>
        {sorted.map(p => {
          const info = getAccessInfo(p);
          return (
            <div key={p.id} onMouseEnter={() => onHoverPoi(p.id)} onMouseLeave={() => onHoverPoi(null)}
              onClick={(e) => { e.stopPropagation(); onHoverPoi(p.id); }}
              className={styles.row05}>
              <span className={styles.stateText01} style={{ "--state-text01-background": toCssVariable(c.color) }} />
              <span className={styles.text03} style={{ "--hover-color": toCssVariable(c.color) }}>{p.name}</span>
              <span className={styles.text04}>{p.meta}</span>
              {p.far && <Badge tone="warn" size="sm">도보권 밖</Badge>}
              <span className={`tnum ${styles.stateText02}`} style={{ "--state-text02-color": toCssVariable(p.far ? "var(--warn-600)" : "var(--ink-2)") }}>
                <Icon name={info.isWalkable ? "walk" : "car"} size={13} color="var(--ink-4)" stroke={2.2} />{info.text} · {p.dist}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
