import { QueryClient } from '@tanstack/react-query';

// main.jsx와 useAuthStore.js(로그아웃 시 캐시 초기화)가 함께 참조하는 단일 인스턴스
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,   // 5분 캐시
    },
    mutations: {
      retry: false,                 // 파일 업로드 재시도 없음
    },
  },
});

export default queryClient;
