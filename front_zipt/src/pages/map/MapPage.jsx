import React, { useState as useInfra, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LiveInfraMap from "../../components/map/InfraMap.jsx";
import CategoryCard from "../../components/map/CategoryCard.jsx";
import AiBriefingCard from "../../components/map/AiBriefingCard.jsx";
import MockInfraMap from "../../components/map/MockInfraMap.jsx";
import { AddressWarningModal } from "../../components/map/AddressWarningModal.jsx";
import { loadKakao } from "../../components/map/kakaoLoader.js";
import { CATEGORY_META as CAT, PERSONA_META as PERSONA } from "../../components/map/meta.js";
import { getMapBriefing } from "../../components/map/service.js";
import { Badge, Button, Icon } from "../../components/common/index.jsx";
import styles from "./MapPage.module.scss";
import { toCssVariable } from "../../utils/toCssVariable.js";

const SAMPLE_ADDRESS = "서울 관악구 관악로 1";
const MAIN_CATEGORY_KEYS = ["food", "cafe", "transit", "medical", "market", "school"];
const CATEGORY_SUB_FILTERS = {
  school: [
    { key: "all", label: "전체" },
    { key: "primary_secondary", label: "초·중·고" },
    { key: "university", label: "대학교" },
  ],
  safety: [
    { key: "all", label: "전체" },
    { key: "police", label: "경찰·파출소" },
    { key: "safe_facility", label: "안심시설" },
  ],
  laundry: [
    { key: "all", label: "전체" },
    { key: "coin_laundry", label: "코인세탁" },
    { key: "parcel", label: "무인택배" },
  ],
  exercise: [
    { key: "all", label: "전체" },
    { key: "gym", label: "헬스장" },
    { key: "pilates_yoga", label: "필라테스·요가" },
    { key: "sports", label: "체육시설" },
  ],
  noise: [
    { key: "all", label: "전체" },
    { key: "bar", label: "술집·유흥" },
    { key: "karaoke", label: "노래방" },
  ],
  culture: [
    { key: "all", label: "전체" },
    { key: "library", label: "도서관" },
    { key: "cinema", label: "영화·공연" },
    { key: "bookstore", label: "서점" },
  ],
};
const MORE_CATEGORY_GROUPS = [
  { title: "생활", keys: ["pet", "park", "laundry", "exercise"] },
  { title: "안전", keys: ["safety", "noise"] },
  { title: "편의", keys: ["bank", "public", "parking", "culture"] },
];

// ⚠️ 런타임 에러 추적을 위한 에러 바운더리 컴포넌트
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MapPage Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '30px',
          color: '#e0484a',
          background: '#fbe6e6',
          border: '1.5px solid #e0484a',
          borderRadius: '12px',
          margin: '20px auto',
          maxWidth: '800px',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>⚠️ 지도 페이지 렌더링 중 오류가 발생했습니다.</h2>
          <p style={{ fontSize: '14px', marginBottom: '15px', color: '#45526e' }}>아래 에러 스택 정보를 알려주시면 즉시 해결해 드리겠습니다.</p>
          <pre style={{
            fontSize: '12.5px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            background: '#fff',
            padding: '15px',
            borderRadius: '6px',
            border: '1px solid #dde4ec',
            overflowX: 'auto',
            color: '#0f1b33'
          }}>
            {this.state.error?.stack || this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// AppLayout OutletContext 환경 차이를 방지하기 위한 폴백 훅
function useAppOutletFallback() {
  const navigate = useNavigate();
  const t = {
    infraMode: "auto", // off | auto | focus
    infraRoute: true,
    mapSrc: "auto"     // auto(실시간 카카오맵) | mock(데모 고정)
  };
  const onGo = (key) => {
    const paths = {
      home: "/",
      upload: "/analysis", // front_zipt1의 등기부 분석 페이지 경로 매핑
      contract: "/contract", // front_zipt1의 임대차계약서 분석 페이지 경로 매핑
    };
    navigate(paths[key] || "/");
  };
  return { t, onGo };
}

function MapPage() {
  const { t, onGo } = useAppOutletFallback();
  const { infra: D, userTags } = getMapBriefing();
  const mode = t.infraMode || "auto"; // off | auto | focus
  const [focusTag, setFocusTag] = useInfra(userTags[0]);
  const [filter, setFilter] = useInfra("all");
  const [subFilters, setSubFilters] = useInfra({});
  const [hoverPoi, setHoverPoi] = useInfra(null);
  const [livePois, setLivePois] = useInfra(null);
  const [mapStatus, setMapStatus] = useInfra("loading");
  const [isMoreCategoriesOpen, setIsMoreCategoriesOpen] = useInfra(false);
  const [warningModalText, setWarningModalText] = useInfra("");
  const [isLocating, setIsLocating] = useInfra(false);
  const [isSearching, setIsSearching] = useInfra(false);
  const [locationError, setLocationError] = useInfra("");
  const [isMobile, setIsMobile] = useInfra(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 760px)");
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // 주소 검색 및 현위치 상태 관리
  const [currentAddress, setCurrentAddress] = useInfra(SAMPLE_ADDRESS);
  const [searchInput, setSearchInput] = useInfra(""); // 입력창 플레이스홀더 노출을 위해 빈 값으로 초기화
  const [searchedAddress, setSearchedAddress] = useInfra(""); // 최초 자동 AI 호출 방지
  const [hasSearched, setHasSearched] = useInfra(false); // 검색 또는 현위치 승인 여부

  const validateAddress = async (target) => {
    const kakao = await loadKakao();
    return new Promise((resolve) => {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(target, (results, status) => {
        resolve(status === kakao.maps.services.Status.OK && Boolean(results[0]));
      });
    });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchInput.trim() || isSearching) return;
    const target = searchInput.trim();

    setIsSearching(true);
    setLocationError("");

    try {
      const isValidAddress = await validateAddress(target);
      if (!isValidAddress) {
        setWarningModalText(target);
        return;
      }

      setLivePois(null); // 이전 검색 지역의 POI 데이터 즉시 초기화하여 교차 오작동 방지
      setCurrentAddress(target);
      setSearchedAddress(target);
      setHasSearched(true);
    } catch (error) {
      setLocationError("주소 확인 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
      console.error("Address validation failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("현재 브라우저에서는 위치 정보를 사용할 수 없어요.");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const kakao = await loadKakao();
          const geocoder = new kakao.maps.services.Geocoder();
          const { latitude, longitude } = pos.coords;

          geocoder.coord2Address(longitude, latitude, (result, status) => {
            setIsLocating(false);

            if (status === kakao.maps.services.Status.OK && result[0]) {
              const addr = result[0].road_address?.address_name || result[0].address?.address_name;
              if (addr) {
                setLivePois(null);
                setCurrentAddress(addr);
                setSearchedAddress(addr);
                setSearchInput(addr);
                setHasSearched(true);
                return;
              }
            }

            setLocationError("현재 위치의 주소를 찾지 못했어요. 주소를 직접 입력해 주세요.");
          });
        } catch (error) {
          setIsLocating(false);
          setLocationError("지도 서비스를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
          console.error("Current location lookup failed:", error);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "위치 권한이 거절되었어요. 주소 검색으로도 브리핑을 볼 수 있어요."
            : "현재 위치를 확인하지 못했어요. 주소를 직접 입력해 주세요."
        );
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
    );
  };

  const pois = livePois || D.pois;

  const activeTags = mode === "off" ? [] : mode === "focus" ? [focusTag] : userTags;

  // rank categories by tag-weighted relevance, tiebreak by objRank
  const score = (cat) => {
    if (activeTags.length === 0) return -cat.objRank * 0.001; // off → objRank order
    let w = 0; activeTags.forEach(tg => { w += cat.weight[tg] || 0; });
    return w - cat.objRank * 0.001;
  };
  const topTag = (cat) => {
    if (activeTags.length === 0) return "_off";
    return activeTags.slice().sort((a, b) => (cat.weight[b] || 0) - (cat.weight[a] || 0))[0];
  };
  const categoryKeys = Object.keys(CAT);
  const moreCategoryKeys = MORE_CATEGORY_GROUPS.flatMap((group) => group.keys);
  const visibleFilterKeys = filter === "all" ? categoryKeys : categoryKeys.filter(k => k === filter);
  const activeSubFilters = CATEGORY_SUB_FILTERS[filter];
  const activeSubFilter = subFilters[filter] || "all";
  const setActiveSubFilter = (nextValue) => {
    setSubFilters((current) => ({ ...current, [filter]: nextValue }));
  };
  const applySubFilter = (items) => {
    if (!activeSubFilters || activeSubFilter === "all") return items;
    return items.filter((item) => item.subCategory === activeSubFilter || item.schoolLevel === activeSubFilter);
  };

  return (
    <div className={styles.div01}>
      {/* header */}
      <div className={styles.div02}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", color: "var(--primary)", marginBottom: 4 }}>ZIPT INFRA</div>
        <div className={styles.row01}>
          <span className={styles.text02}>동네 인프라 브리핑</span>
          <Badge tone="primary" icon="sparkle">실시간 탐색</Badge>
          {!hasSearched ? <Badge tone="neutral" icon="info">예시 브리핑</Badge> : null}
          {mapStatus === "live"
            ? <Badge tone="safe" icon="check-circle">카카오맵 실시간</Badge>
            : mapStatus === "mock"
              ? <Badge tone="neutral" icon="info">데모 데이터</Badge>
              : null}
        </div>

        {/* 주소 검색 입력폼 */}
        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <div className={styles.searchBox}>
            <div className={styles.searchInputRow}>
              <Icon name="pin" size={16} color="var(--primary)" stroke={2.2} />
              <input
                type="text"
                className={styles.searchInput}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isMobile ? "조회할 주소를 입력하세요 (예: 봉천동)" : "조회할 주소를 입력하세요 (예: 서울 관악구 봉천동, 성남시 분당구 정자동)"}
              />
            </div>
            <div className={styles.searchButtonRow}>
              <button type="submit" className={styles.searchBtn} disabled={isSearching}>
                <Icon name="search" size={15} color="#fff" stroke={2.5} />
                <span>{isSearching ? "주소 확인 중" : "주소 검색"}</span>
              </button>
              <button
                type="button"
                className={styles.locationBtn}
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                title="현재 위치 권한을 허용하면 내 주변 인프라를 바로 볼 수 있어요"
              >
                <Icon name="pin" size={15} stroke={2.3} />
                <span>{isLocating ? "위치 확인 중" : "내 위치로 보기"}</span>
              </button>
            </div>
          </div>
        </form>
        <div className={styles.searchHint}>
          {!hasSearched
            ? `${SAMPLE_ADDRESS} 기준 예시 지도를 먼저 보여드려요. 관심 주소를 검색하거나 내 위치로 바꿔보세요.`
            : `${currentAddress} 기준으로 주변 인프라를 탐색하고 있어요.`}
        </div>
        {locationError ? <div className={styles.locationError}>{locationError}</div> : null}
      </div>

      {/* ZIPT AI 실시간 동네 브리핑 카드를 여기에 배치 (실시간 POI만 연동) */}
      <AiBriefingCard address={searchedAddress} pois={livePois || []} />

      {/* split view */}
      <div className="infra-split">
        {/* map */}
        <div className="infra-map">
          {/* filter chips */}
          <div className={styles.row05}>
            {[["all", "전체", "list"], ...MAIN_CATEGORY_KEYS.map((k) => [k, CAT[k].label, CAT[k].icon])].map(([k, label, ic]) => {
              const on = filter === k;
              const col = k === "all" ? "var(--primary)" : CAT[k].color;
              return (
                <button key={k} onClick={() => setFilter(k)}
                  className={styles.stateButton02} style={{ "--state-button02-border": toCssVariable(`1.5px solid ${on ? col : "var(--line-2)"}`), "--state-button02-background": toCssVariable(on ? col : "var(--surface)"), "--state-button02-color": toCssVariable(on ? "#fff" : "var(--ink-2)") }}>
                  <Icon name={ic} size={15} stroke={2.2} color={on ? "#fff" : (k === "all" ? "var(--ink-3)" : CAT[k].color)} />
                  {label}
                </button>
              );
            })}
            <div className={styles.moreCategoryWrap}>
              <button
                type="button"
                onClick={() => setIsMoreCategoriesOpen((open) => !open)}
                className={styles.stateButton02}
                style={{
                  "--state-button02-border": toCssVariable(`1.5px solid ${moreCategoryKeys.includes(filter) ? "var(--primary)" : "var(--line-2)"}`),
                  "--state-button02-background": toCssVariable(moreCategoryKeys.includes(filter) ? "var(--primary)" : "var(--surface)"),
                  "--state-button02-color": toCssVariable(moreCategoryKeys.includes(filter) ? "#fff" : "var(--ink-2)")
                }}
                aria-expanded={isMoreCategoriesOpen}
              >
                <Icon name="more" size={15} stroke={2.2} color={moreCategoryKeys.includes(filter) ? "#fff" : "var(--ink-3)"} />
                더보기
              </button>
              {isMoreCategoriesOpen ? (
                <div className={styles.moreCategoryPanel}>
                  {MORE_CATEGORY_GROUPS.map((group) => (
                    <div key={group.title} className={styles.moreCategoryGroup}>
                      <div className={styles.moreCategoryTitle}>{group.title}</div>
                      <div className={styles.moreCategoryGrid}>
                        {group.keys.map((k) => {
                          const c = CAT[k];
                          const on = filter === k;
                          return (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                setFilter(k);
                                setIsMoreCategoriesOpen(false);
                              }}
                              className={styles.moreCategoryButton}
                              style={{
                                "--more-category-color": toCssVariable(c.color),
                                "--more-category-bg": toCssVariable(on ? c.soft : "var(--surface)"),
                                "--more-category-border": toCssVariable(on ? c.color : "var(--line-2)")
                              }}
                            >
                              <Icon name={c.icon} size={14} stroke={2.2} color={c.color} />
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {activeSubFilters ? (
            <div className={styles.schoolSubFilter} aria-label={`${CAT[filter]?.label || "카테고리"} 세부 필터`}>
              {activeSubFilters.map((option) => {
                const on = activeSubFilter === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    className={styles.schoolSubFilterButton}
                    onClick={() => setActiveSubFilter(option.key)}
                    style={{
                      "--school-sub-filter-background": toCssVariable(on ? CAT[filter].color : "var(--surface)"),
                      "--school-sub-filter-border": toCssVariable(on ? CAT[filter].color : "var(--line-2)"),
                      "--school-sub-filter-color": toCssVariable(on ? "#fff" : "var(--ink-2)")
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : null}
          <div className="infra-map-canvas">
            {t.mapSrc === "mock" ? (
              <MockInfraMap D={D} filter={filter} subFilter={activeSubFilter} hoverPoi={hoverPoi} setHoverPoi={setHoverPoi} showRoute={t.infraRoute !== false} />
            ) : (
              <LiveInfraMap
                address={currentAddress}
                filter={filter}
                subFilter={activeSubFilter}
                hoverPoi={hoverPoi}
                setHoverPoi={setHoverPoi}
                showRoute={t.infraRoute !== false}
                onPois={(items) => setLivePois(items && items.length ? items : null)}
                onStatus={(st, msg) => {
                  setMapStatus(st);
                  if (st === "invalid_address" && hasSearched && searchedAddress) {
                    setWarningModalText(searchedAddress);
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* briefing cards */}
        <div className={styles.column01}>
          {!hasSearched ? (
            <div className={styles.emptyGuideCard}>
              <Icon name="info" size={20} color="var(--primary-700)" stroke={2} />
              <div className={styles.emptyGuideText}>
                💡 지금은 <b>{SAMPLE_ADDRESS}</b> 기준 예시 브리핑을 보여드리고 있어요. 궁금한 주소를 검색하거나 <b>[내 위치로 보기]</b>를 누르면 해당 동네의 카테고리별 인프라 상세 목록과 맞춤 요약이 표시됩니다.
              </div>
            </div>
          ) : (
            visibleFilterKeys.map((catKey, i) => (
              <div key={catKey} className={styles.stateDiv01} style={{ "--state-div01-animation-delay": toCssVariable(`${i * 0.07}s`) }}>
                <CategoryCard catKey={catKey} data={D.categories[catKey] || {}}
                  pois={applySubFilter(pois.filter(p => p.cat === catKey))}
                  active={filter === catKey}
                  onToggle={() => setFilter(filter === catKey ? "all" : catKey)}
                  onHoverPoi={setHoverPoi} />
              </div>
            ))
          )}

          {/* CTA 1: 등기부 분석 */}
          <div className={styles.row06}>
            <Icon name="info" size={20} color="var(--primary-700)" stroke={2} />
            <div className={styles.div06}>
              입지 탐색과 함께 안전한 계약을 위해 <b className={styles.text04}>등기부상 위험</b>도 점검하세요.
            </div>
            <Button size="sm" onClick={() => onGo("upload")} icon="doc">등기부 분석</Button>
          </div>

          {/* CTA 2: 임대차계약서 분석 */}
          <div className={styles.row06} style={{ marginTop: "5px" }}>
            <Icon name="file" size={20} color="var(--primary-700)" stroke={2} />
            <div className={styles.div06}>
              계약 전 독소조항 없는지 <b className={styles.text04}>임대차계약서</b>도 검토하세요.
            </div>
            <Button size="sm" onClick={() => onGo("contract")} icon="doc">계약서 분석</Button>
          </div>
        </div>
      </div>

      {/* 도로명 주소 미입력 시 모달 팝업 경고 */}
      <AddressWarningModal
        isOpen={Boolean(warningModalText)}
        onClose={() => setWarningModalText("")}
        searchedText={warningModalText}
      />
    </div>
  );
}

export default function MapPageWrapper() {
  return (
    <ErrorBoundary>
      <MapPage />
    </ErrorBoundary>
  );
}
