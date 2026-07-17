import { create } from "zustand";
import queryClient from "../queryClient";

const useAuthStore = create((set) => ({
  // 상태
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // silent refresh 시 로딩 상태
  member: null, // 로그인 사용자 정보
  isAuthModalOpen: false, // 로그인 필요 팝업 모달 상태
  isLoggingOut: false, // 명시적 로그아웃 중에는 로그인 필요 모달을 띄우지 않음
  redirectUrl: null, // 로그인 성공 후 이동할 경로
  isExplicitLoginInFlight: false, // 로그인 폼/OAuth 콜백 진행 중에는 silent refresh 결과가 토큰을 덮어쓰지 못하게 막음

  // 로그인 성공 후 토큰 저장
  login: (token) => set({ accessToken: token, isAuthenticated: true }),
  beginExplicitLogin: () => set({ isExplicitLoginInFlight: true }),
  endExplicitLogin: () => set({ isExplicitLoginInFlight: false }),

  // 토큰만 교체 -> refresh 재발급 전용 (isAuthenticated는 건드리지 않음)
  setAccessToken: (token) => set({ accessToken: token }),

  // 로그아웃 -> 상태 초기화
  // + react-query 캐시 초기화: 캐시를 비우지 않으면 다음에 다른 계정으로 로그인했을 때
  //   이전 계정의 분석/계약서 이력이 staleTime(5분) 동안 그대로 재사용되어 보이는 문제가 있었음
  logout: () => {
    queryClient.clear();
    set({ accessToken: null, isAuthenticated: false, member: null, isAuthModalOpen: false, redirectUrl: null });
  },
  setIsLoading: (bool) => set({ isLoading: bool }),
  setMember: (member) => set({ member }),
  setRedirectUrl: (url) => set({ redirectUrl: url }),

  // 로그인 모달 제어
  openAuthModal: (url = null) => set((state) => (state.isLoggingOut ? state : { isAuthModalOpen: true, redirectUrl: url })),
  closeAuthModal: () => set({ isAuthModalOpen: false, redirectUrl: null }),
  beginLogout: () => set({ isLoggingOut: true, isAuthModalOpen: false, redirectUrl: null }),
  finishLogout: () => set({ isLoggingOut: false }),
}));

export { useAuthStore };
export default useAuthStore;
