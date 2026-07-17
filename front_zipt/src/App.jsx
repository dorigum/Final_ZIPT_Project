import { Navigate, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/footer';
import { TopButton, AuthModal } from './components/common/index.jsx';

// 페이지 정적 임포트 (LCP 최적화를 위해 홈은 유지)
import HomePage from './pages/home/HomePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { useEffect, lazy, Suspense } from 'react';
import { refresh } from './api/authApi';
import { getMyInfo } from './api/memberApi';

// 페이지 지연 로딩 (Lazy Loading) - 번들 크기 경량화 및 LCP 향상
const AnalysisPage = lazy(() => import('./pages/analysis/AnalysisPage'));
const ContractPage = lazy(() => import('./pages/contract/ContractPage'));
const ContractDetailPage = lazy(() => import('./pages/contract/ContractDetailPage'));
const AnalysisDetailPage = lazy(() => import('./pages/analysis/AnalysisDetailPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const OAuthRedirectPage = lazy(() => import('./pages/auth/OAuthRedirectPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const MapPage = lazy(() => import('./pages/map/MapPage'));
const TermsPage = lazy(() => import('./pages/terms/TermsPage'));
const MyPage = lazy(() => import('./pages/mypage/MyPage'));
const GuidePage = lazy(() => import('./pages/guide/GuidePage'));
const GuideDetailPage = lazy(() => import('./pages/guide/GuideDetailPage'));
const UsefulLinksPage = lazy(() => import('./pages/links/UsefulLinksPage'));

export default function App() {
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setMember = useAuthStore((state) => state.setMember);

  useEffect(() => {
    // OAuth 콜백 경로(/oauth/redirect)는 OAuthRedirectPage가 URL의 accessToken으로
    // 로그인을 전담한다. 이 경로는 백엔드 리다이렉트로 인한 완전히 새로운 페이지 로드라
    // refreshToken 쿠키가 이미 유효하게 심어져 있어, silent refresh를 그대로 실행하면
    // OAuthRedirectPage가 청크를 로드하는 사이 별도로 발급받은(하지만 다른) accessToken을
    // 먼저 스토어에 심었다가 뒤늦게 덮어써 두 토큰이 뒤섞이는 레이스가 발생한다.
    // 이 경로에서는 애초에 silent refresh를 시도하지 않아 경합 자체를 없앤다.
    if (window.location.pathname === '/oauth/redirect') {
      setIsLoading(false);
      return;
    }

    // 앱이 처음 구동될 때 silent refresh 시도
    setIsLoading(true);
    refresh()
      .then((data) => {
        // silent refresh가 진행되는 동안 사용자가 이미 로그인/OAuth 인증을 마쳤거나
        // 로그인 폼 제출·OAuth 콜백 처리가 진행 중이면, 더 오래된 refresh 결과로
        // 최신/예정된 토큰을 덮어쓰지 않도록 방지 (레이스 컨디션)
        const authState = useAuthStore.getState();
        if (authState.isAuthenticated || authState.isExplicitLoginInFlight) return;
        loginStore(data.accessToken);
      })
      .catch(() => {
        // refresh 토큰이 없거나 만료됨 -> 비로그인 상태 유지
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loginStore, setIsLoading]);

  // 로그인 상태가 되면(최초 로그인 / OAuth 콜백 / 새로고침 시 silent refresh) 내 정보를 조회해 스토어에 채움
  useEffect(() => {
    if (!isAuthenticated) return;
    getMyInfo()
      .then((data) => {
        setMember(data);
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error("회원 정보 조회 실패:", error);
        }

        if (error.response) {
          // 401 Unauthorized 등 토큰 유효성 이상 시 로컬 인증 정보 무효화
          if (error.response.status === 401) {
            logoutStore();
          }
        } else {
          // 기타 네트워크 오류 시에도 토큰이 엉망이면 무효화 방안 검토 가능
        }
      });
  }, [isAuthenticated, logoutStore, setMember])
  return (
    <div className="app-layout">
      
      {/* 1️⃣ Header (상단 고정) */}
      <Header />

      {/* 2️  Main Container */}
      <div className="main-container">

        {/* 2-1️ Content Area (메인 콘텐츠) */}
        <main className="content-area">
          <Suspense fallback={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--ink-3)', fontSize: 14, fontWeight: 700 }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--line)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'lazy-spin 0.8s linear infinite' }}></div>
              ZIPT 서비스 로드 중...
              <style>{`
                @keyframes lazy-spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          }>
            <Routes>
  
              {/* ── 비회원 허용 ── */}
              <Route path="/" element={<HomePage />} />
  
              <Route path="/login"     element={<LoginPage />} />
              <Route path="/oauth/redirect" element={<OAuthRedirectPage />} />
              <Route path="/signup"    element={<SignupPage />} />
              <Route path="/map"       element={<MapPage />} />
              <Route path="/terms"    element={<TermsPage />} />
              <Route path="/guide"     element={<GuidePage />} />
              <Route path="/guide/:id" element={<GuideDetailPage />} />
              <Route path="/links"    element={<UsefulLinksPage />} />
              <Route path="/reference-home" element={<Navigate to="/" replace />} />
              <Route path="/glossary" element={<Navigate to="/terms" replace />} />
              <Route path="/board"    element={<Navigate to="/guide" replace />} />
              <Route path="/board/:id" element={<Navigate to="/guide/:id" replace />} />
              <Route path="/tips"     element={<Navigate to="/guide" replace />} />
              <Route path="/tips/:id" element={<Navigate to="/guide/:id" replace />} />
  
              {/* ── 회원 전용 ── */}
              {/* 보호 라우트 - ProtectedRoute가 인증 체크 후 Outlet으로 자식 렌더 */}
              <Route element={<ProtectedRoute />}>
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path={'/contract'} element={<ContractPage />} />
                <Route path={'/contract/:contractId'} element={<ContractDetailPage />} />
                {/* ── 분석 상세 추가 ── */}
                <Route path="/analysis/:id" element={<AnalysisDetailPage />} />
                <Route path="/mypage" element={<MyPage />} />
              </Route>
            </Routes>
          </Suspense>
        </main>

      </div>

      {/* 3️⃣ Footer (하단 고정) */}
      <Footer />

      {/* 4️⃣ Top Button (최상단 이동 버튼) */}
      <TopButton />

      {/* 5️⃣ Auth Modal (로그인 필요 전역 팝업 모달) */}
      <AuthModal />

    </div>
  );
}
