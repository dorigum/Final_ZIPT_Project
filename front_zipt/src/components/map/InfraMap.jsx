import { useEffect, useRef, useState } from "react";
import { loadKakao } from "./kakaoLoader.js";
import styles from "./InfraMap.module.scss";

const DEFAULT_CENTER = { lat: 37.4827, lng: 126.9417 };

const CATEGORY_META = {
  food: { color: "#e65100", label: "Food" },
  cafe: { color: "#795548", label: "Cafe" },
  transit: { color: "#2a6be6", label: "Transit" },
  medical: { color: "#15a36a", label: "Medical" },
  market: { color: "#e1902f", label: "Market" },
  school: { color: "#8b5cf6", label: "School" },
  pet: { color: "#ec4899", label: "Pet" },
  park: { color: "#6f8f12", label: "Park" },
  safety: { color: "#0891b2", label: "Safety" },
  laundry: { color: "#14b8a6", label: "Laundry" },
  exercise: { color: "#f97316", label: "Exercise" },
  noise: { color: "#ef4444", label: "Noise" },
  bank: { color: "#0f766e", label: "Bank" },
  public: { color: "#475569", label: "Public office" },
  parking: { color: "#64748b", label: "Parking" },
  culture: { color: "#6366f1", label: "Culture" },
};

const SEARCH_GROUPS = {
  food: [
    { type: "category", code: "FD6", label: "Restaurant" },
  ],
  cafe: [
    { type: "category", code: "CE7", label: "Cafe" },
  ],
  transit: [
    { type: "category", code: "SW8", label: "Subway" },
    {
      type: "keyword",
      query: "버스정류장",
      label: "Bus stop",
      match: ["버스", "정류장", "승차"],
    },
  ],
  medical: [
    { type: "category", code: "HP8", label: "Hospital", exclude: ["동물", "수의"] },
    { type: "category", code: "PM9", label: "Pharmacy" },
  ],
  market: [
    { type: "category", code: "MT1", label: "Mart" },
    { type: "category", code: "CS2", label: "Convenience store" },
  ],
  school: [
    {
      type: "keyword",
      query: "학교",
      label: "School",
      match: ["학교", "초등학교", "중학교", "고등학교", "대학교"],
    },
  ],
  pet: [
    {
      type: "keyword",
      query: "동물병원",
      label: "Animal hospital",
      match: ["동물", "수의", "펫", "메디컬"],
    },
    {
      type: "keyword",
      query: "애견카페",
      label: "Pet cafe",
      match: ["애견", "펫", "강아지", "도그", "반려", "동반"],
    },
  ],
  park: [
    {
      type: "keyword",
      query: "공원",
      label: "Park",
      match: ["공원", "산책로", "녹지"],
    },
  ],
  bank: [
    {
      type: "keyword",
      query: "은행",
      label: "Bank",
      match: ["은행", "ATM", "새마을금고", "신협"],
    },
  ],
  public: [
    {
      type: "keyword",
      query: "주민센터",
      label: "Public office",
      match: ["주민센터", "행정복지센터", "구청", "동사무소"],
    },
  ],
  parking: [
    {
      type: "keyword",
      query: "주차장",
      label: "Parking",
      match: ["주차장", "공영주차장"],
    },
  ],
  safety: [
    {
      type: "keyword",
      query: "경찰서",
      label: "Police",
      match: ["경찰서", "지구대", "파출소"],
      subCategory: "police",
    },
    {
      type: "keyword",
      query: "파출소",
      label: "Police box",
      match: ["경찰서", "지구대", "파출소"],
      subCategory: "police",
    },
    {
      type: "keyword",
      query: "안심택배함",
      label: "Safe facility",
      match: ["안심", "택배함", "무인택배"],
      subCategory: "safe_facility",
    },
  ],
  laundry: [
    {
      type: "keyword",
      query: "코인세탁소",
      label: "Coin laundry",
      match: ["코인세탁", "빨래방", "세탁소"],
      subCategory: "coin_laundry",
    },
    {
      type: "keyword",
      query: "무인택배함",
      label: "Parcel locker",
      match: ["무인택배", "택배함", "보관함"],
      subCategory: "parcel",
    },
  ],
  exercise: [
    {
      type: "keyword",
      query: "헬스장",
      label: "Gym",
      match: ["헬스", "피트니스", "GYM"],
      subCategory: "gym",
    },
    {
      type: "keyword",
      query: "필라테스",
      label: "Pilates",
      match: ["필라테스", "요가"],
      subCategory: "pilates_yoga",
    },
    {
      type: "keyword",
      query: "체육관",
      label: "Sports facility",
      match: ["체육관", "체육센터", "수영장"],
      subCategory: "sports",
    },
  ],
  noise: [
    {
      type: "keyword",
      query: "술집",
      label: "Bar",
      match: ["술집", "호프", "포차", "주점", "bar", "BAR"],
      subCategory: "bar",
    },
    {
      type: "keyword",
      query: "노래방",
      label: "Karaoke",
      match: ["노래방", "코인노래"],
      subCategory: "karaoke",
    },
  ],
  culture: [
    {
      type: "keyword",
      query: "도서관",
      label: "Library",
      match: ["도서관"],
      subCategory: "library",
    },
    {
      type: "keyword",
      query: "영화관",
      label: "Cinema",
      match: ["영화관", "CGV", "롯데시네마", "메가박스", "공연장"],
      subCategory: "cinema",
    },
    {
      type: "keyword",
      query: "서점",
      label: "Bookstore",
      match: ["서점", "문고", "북스"],
      subCategory: "bookstore",
    },
  ],
};

function compactCategory(categoryName) {
  if (!categoryName) return "";
  return categoryName.split(/[>,]/).map((item) => item.trim()).filter(Boolean).pop() || "";
}

function containsAny(place, tokens) {
  if (!tokens?.length) return false;
  const target = `${place.place_name || ""} ${place.category_name || ""}`;
  return tokens.some((token) => target.includes(token));
}

function filterPlaces(places, rule) {
  let result = places;

  if (rule.match) {
    result = result.filter((place) => containsAny(place, rule.match));
  }

  if (rule.exclude) {
    result = result.filter((place) => !containsAny(place, rule.exclude));
  }

  return result;
}

function getSchoolLevel(place) {
  const target = `${place?.place_name || place?.name || ""} ${place?.category_name || place?.meta || ""}`;
  if (target.includes("대학교") || target.includes("대학") || target.includes("University")) return "university";
  return "primary_secondary";
}

function markerHtml(category, poi, isHovered = false) {
  const meta = CATEGORY_META[category] || { color: "var(--primary)" };
  const zIndex = isHovered ? 9999 : 10;
  const transform = isHovered ? "scale(1.22) translateY(-6px)" : "translateY(-2px)";
  const border = isHovered ? `3.5px solid ${meta.color}` : "3px solid #fff";
  const boxShadow = isHovered ? `0 10px 24px ${meta.color}80` : "0 3px 8px rgba(15,27,51,.28)";

  return `
    <div id="poi-marker-${poi.id}" onmouseenter="if(window.ziptHoverPoi) window.ziptHoverPoi('${poi.id}')" onmouseleave="if(window.ziptHoverPoi) window.ziptHoverPoi(null)" style="display:flex;flex-direction:column;align-items:center;transform:${transform};transition:all .18s cubic-bezier(0.16,1,0.3,1);cursor:pointer;z-index:${zIndex};">
      <div style="width:32px;height:32px;border-radius:50%;background:${meta.color};border:${border};box-shadow:${boxShadow};display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 21s7-4.7 7-11a7 7 0 1 0-14 0c0 6.3 7 11 7 11z"></path>
          <circle cx="12" cy="10" r="2.5"></circle>
        </svg>
      </div>
      <div style="margin-top:4px;white-space:nowrap;font:800 11px/1 Pretendard,sans-serif;color:${isHovered ? meta.color : meta.color};background:${isHovered ? '#ffffff' : 'rgba(255,255,255,.95)'};padding:3px 8px;border-radius:999px;box-shadow:0 2px 6px rgba(15,27,51,.2);border:1.5px solid ${isHovered ? meta.color : 'transparent'};">
        ${poi.name} · ${poi.walk}분
      </div>
    </div>
  `;
}

function homeHtml() {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px);pointer-events:none;">
      <div style="width:36px;height:36px;border-radius:50% 50% 50% 4px;transform:rotate(45deg);background:linear-gradient(135deg,#2a6be6,#0e2a66);border:3px solid #fff;box-shadow:0 8px 24px rgba(15,27,51,.2);"></div>
      <div style="margin-top:6px;white-space:nowrap;font:800 11px/1 Pretendard,sans-serif;color:#0e2a66;background:#fff;padding:3px 9px;border-radius:999px;box-shadow:0 1px 3px rgba(15,27,51,.18);">Home</div>
    </div>
  `;
}

function toPoi(place, category, fallbackMeta, index, subCategory) {
  const distance = Number(place.distance || 0);

  const poi = {
    id: place.id || `${category}-${index}`,
    cat: category,
    name: place.place_name,
    meta: compactCategory(place.category_name) || fallbackMeta,
    walk: Math.max(1, Math.round(distance / 67)),
    dist: distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`,
    far: distance > 1200,
    lat: Number(place.y),
    lng: Number(place.x),
  };

  if (category === "school") {
    const schoolLevel = getSchoolLevel(place);
    poi.schoolLevel = schoolLevel;
    poi.subCategory = schoolLevel;
  } else if (subCategory) {
    poi.subCategory = subCategory;
  }

  return poi;
}

export default function InfraMap({
  address,
  filter = "all",
  subFilter = "all",
  showRoute = true,
  hoverPoi,
  setHoverPoi,
  onPois,
  onStatus,
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({ map: null, overlays: [], route: null, extras: [], runId: 0, pois: [] });
  const filterRef = useRef(filter);
  const subFilterRef = useRef(subFilter);
  const showRouteRef = useRef(showRoute);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.ziptHoverPoi = (id) => {
        setHoverPoi?.(id);
      };
    }
  }, [setHoverPoi]);

  const updateStatus = (nextStatus, nextError = "") => {
    setStatus(nextStatus);
    setErrorMessage(nextError);
    onStatus?.(nextStatus);
  };

  const clearMap = () => {
    const state = stateRef.current;

    state.overlays.forEach((item) => item.overlay?.setMap?.(null));
    state.extras.forEach((overlay) => overlay.setMap?.(null));
    state.route?.setMap?.(null);
    state.map = null;
    state.overlays = [];
    state.extras = [];
    state.route = null;
    state.pois = [];
  };

  const applyFilter = (nextFilter) => {
    const state = stateRef.current;
    if (!state.map) return;

    state.overlays.forEach((item) => {
      const categoryVisible = nextFilter === "all" || item.cat === nextFilter;
      const subVisible = nextFilter === "all"
        || item.cat !== nextFilter
        || subFilterRef.current === "all"
        || item.poi.subCategory === subFilterRef.current
        || item.poi.schoolLevel === subFilterRef.current;
      item.overlay.setMap(categoryVisible && subVisible ? state.map : null);
    });

    if (state.route) {
      state.route.setMap((nextFilter === "all" || nextFilter === "transit") && showRouteRef.current ? state.map : null);
    }
  };

  useEffect(() => {
    filterRef.current = filter;
    subFilterRef.current = subFilter;
    showRouteRef.current = showRoute;
    applyFilter(filter);
  }, [filter, subFilter, showRoute]);

  // 호버 마커 강조 처리
  useEffect(() => {
    const state = stateRef.current;
    if (!state.map || !state.overlays.length) return;

    state.overlays.forEach((item) => {
      const isHovered = item.poi.id === hoverPoi;
      item.overlay.setContent(markerHtml(item.cat, item.poi, isHovered));
      if (item.overlay.setZIndex) {
        item.overlay.setZIndex(isHovered ? 9999 : 10);
      }
    });
  }, [hoverPoi]);

  useEffect(() => {
    stateRef.current.runId += 1;
    const runId = stateRef.current.runId;

    clearMap();
    updateStatus("loading");

    loadKakao()
      .then((kakao) => {
        if (runId !== stateRef.current.runId || !containerRef.current) return;
        buildMap(kakao, runId);
      })
      .catch((error) => {
        if (runId === stateRef.current.runId) {
          updateStatus("error", error.message);
        }
        console.error("[InfraMap]", error);
      });

    return () => clearMap();
  }, [address]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      const state = stateRef.current;
      if (state.map && state.center) {
        state.map.relayout();
        state.map.setCenter(state.center);
      }
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  function buildMap(kakao, runId) {
    const services = kakao.maps.services;

    new services.Geocoder().addressSearch(address, (results, geocoderStatus) => {
      if (runId !== stateRef.current.runId || !containerRef.current) return;

      if (geocoderStatus === services.Status.OK && results[0]) {
        const center = new kakao.maps.LatLng(results[0].y, results[0].x);
        containerRef.current.innerHTML = "";

        const map = new kakao.maps.Map(containerRef.current, { center, level: 4 });
        const homeMarker = new kakao.maps.CustomOverlay({
          map,
          position: center,
          content: homeHtml(),
          yAnchor: 1,
          zIndex: 30,
        });
        const radius = new kakao.maps.Circle({
          map,
          center,
          radius: 800,
          strokeWeight: 1,
          strokeColor: "#2a6be6",
          strokeOpacity: 0.5,
          strokeStyle: "dash",
          fillColor: "#2a6be6",
          fillOpacity: 0.06,
        });

        stateRef.current.map = map;
        stateRef.current.center = center;
        stateRef.current.extras.push(homeMarker, radius);
        updateStatus("live");
        searchPois(kakao, center, runId);
      } else {
        // 도로명 주소가 아닌 장소명/상호명 입력 시 invalid_address 상태 전달
        updateStatus("invalid_address", address);
      }
    });
  }

  function searchPois(kakao, center, runId) {
    const services = kakao.maps.services;
    const places = new services.Places();
    const rawPois = [];
    let pending = 0;

    Object.entries(SEARCH_GROUPS).forEach(([category, rules]) => {
      rules.forEach((rule) => {
        pending += 1;

        const callback = (data, placeStatus) => {
          if (runId !== stateRef.current.runId) return;

          if (placeStatus === services.Status.OK) {
            filterPlaces(data, rule).forEach((place) => {
              const poi = toPoi(place, category, rule.label, rawPois.length, rule.subCategory);
              rawPois.push(poi);
            });
          }

          pending -= 1;
          if (pending === 0) {
            finishPois(kakao, center, rawPois, runId);
          }
        };

        const radiusMeters = category === "transit" ? 3000 : 1500;
        const options = { location: center, radius: radiusMeters, sort: services.SortBy.DISTANCE };

        if (rule.type === "category") {
          places.categorySearch(rule.code, callback, options);
        } else {
          places.keywordSearch(rule.query, callback, options);
        }
      });
    });
  }

  function finishPois(kakao, center, pois, runId) {
    if (runId !== stateRef.current.runId) return;

    // 1. 동일 place id 중복 제거
    const uniqueMap = new Map();
    pois.forEach((p) => {
      if (!uniqueMap.has(p.id)) uniqueMap.set(p.id, p);
    });
    const uniquePois = Array.from(uniqueMap.values());

    // 2. 카테고리별 그룹화 후 도보거리 최단 순 4개 선택
    const byCategory = {};
    uniquePois.forEach((poi) => {
      byCategory[poi.cat] = byCategory[poi.cat] || [];
      byCategory[poi.cat].push(poi);
    });

    const trimmedPois = Object.values(byCategory).flatMap((items) =>
      items.sort((a, b) => a.walk - b.walk).slice(0, 4)
    );

    // 3. 정확히 트리밍된 POI 목록에 대해서만 지도 마커 오버레이 생성 (마커-리스트 100% 동기화)
    trimmedPois.forEach((poi) => {
      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(poi.lat, poi.lng),
        content: markerHtml(poi.cat, poi, false),
        yAnchor: 1,
        zIndex: 10,
      });

      overlay._cat = poi.cat;
      overlay._poiId = poi.id;
      overlay.setMap(stateRef.current.map);
      stateRef.current.overlays.push({ overlay, cat: poi.cat, poi });
    });

    stateRef.current.pois = trimmedPois;
    onPois?.(trimmedPois);

    // 4. 대중교통 경로 선 연결
    const nearestTransit = (byCategory.transit || []).sort((a, b) => a.walk - b.walk)[0];
    if (nearestTransit) {
      stateRef.current.route = new kakao.maps.Polyline({
        path: [center, new kakao.maps.LatLng(nearestTransit.lat, nearestTransit.lng)],
        strokeWeight: 4,
        strokeColor: "#2a6be6",
        strokeOpacity: 0.85,
        strokeStyle: "shortdash",
      });
    }

    applyFilter(filterRef.current);
  }

  return (
    <div className={styles.div01}>
      <div
        ref={containerRef}
        className={styles.panel01}
      />
      {status !== "live" && (
        <div className={styles.row01}>
          {status === "loading"
            ? "Loading Kakao Map..."
            : `Failed to load Kakao Map.${errorMessage ? ` (${errorMessage})` : ""}`}
        </div>
      )}
    </div>
  );
}
