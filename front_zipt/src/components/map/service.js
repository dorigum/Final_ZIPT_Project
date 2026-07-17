import { ziptData } from "../../mocks/ziptData.js";

export function getMapBriefing() {
  return {
    infra: ziptData.infra,
    userTags: ziptData.user.tags.map((tag) => tag.replace("#", "")),
  };
}

export function getKakaoMapKey() {
  const queryKey = new URLSearchParams(window.location.search).get("kakaoKey");
  if (queryKey) {
    localStorage.setItem("zipt_kakao_key", queryKey);
    return queryKey;
  }
  return localStorage.getItem("zipt_kakao_key") || import.meta.env.VITE_KAKAO_MAP_KEY || "";
}
