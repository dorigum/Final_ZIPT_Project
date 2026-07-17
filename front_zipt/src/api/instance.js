//////////////////
import axios from 'axios';
import { useAuthStore } from "../store/useAuthStore";

const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  return import.meta.env.DEV ? '/api' : (configuredUrl || '/api');
};

const API_BASE_URL = getApiBaseUrl();

const instance = axios.create({
  // 기본 URL은 .env 파일에서 가져오거나 기본값으로 설정
  baseURL: API_BASE_URL,
  timeout: 60000, //타임아웃때문에 6배늘림(분석페이지 로딩이 늦음)
  withCredentials: true // 쿠키를 포함하여 요청을 보냄
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

// 모든 API 요청 직전에 가로채서 토큰 입력
instance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if(accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false;
let failedQueue = [];

// 대기 중이던 요청들을 일괄 처리(깨우기)
// - error가 있으면 전부 reject
// - 성공하면 새 token을 넘겨주며 resolve
const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if(error) promise.reject(error);
    else promise.resolve(token);
  })
  failedQueue = []; // 큐 초기화
};

// 강제 로그아웃
const forceLogout = () => {
  const authState = useAuthStore.getState();
  if (!authState.isAuthenticated && !authState.accessToken) return;

  authState.logout();
  authState.closeAuthModal?.();
  window.location.href = '/login';
};

instance.interceptors.response.use(
  // 정상 응답은 그대로 반환
  (response) => response,

  // 에러 응답 처리
  async (error) => {
    const originalRequest = error.config; // 실패한 원래 요청

    // 401 Unauthorized 에러 처리
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // URL보고 재시도 없이 그냥 reject
    if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    // 이미 한 번 재시도한 요청이 또 401이면 -> 재발급해도 소용없음 -> 로그아웃
    if (originalRequest._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    if(isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest); // 새 토큰으로 재시도
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await refreshClient.post("/auth/refresh");
      const newAccessToken = data.accessToken; // 백엔드 응답 형태에 맞게 조정

      // 새 토큰을 store(메모리)에 저장
      useAuthStore.getState().setAccessToken(newAccessToken);

      // 대기 중이던 다른 요청들을 새 토큰으로 일괄 깨우기
      processQueue(null, newAccessToken);

      // 원래 요청도 새 토큰으로 달고 재시도
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return instance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      // 성공 / 실패와 무관하게 refresh 진행 플래그 해제
      isRefreshing = false;
    }
  }
)

export default instance;




