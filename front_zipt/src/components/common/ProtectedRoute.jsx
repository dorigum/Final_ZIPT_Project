/**
 * ProtectedRoute.jsx
 * 
 * 인증이 필요한 라우트를 보호하는 컴포넌트입니다.
 * 사용자가 로그인되어 있지 않으면 로그인 페이지로 리다이렉트합니다.
 */

import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const returnUrl = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoggingOut) {
      openAuthModal(returnUrl);
    }
  }, [isLoading, isAuthenticated, isLoggingOut, openAuthModal, returnUrl]);

  // silentRefresh 완료 전까지 대기 (isLoading=true인 동안 리다이렉트 금지)
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to={isLoggingOut ? "/" : "/login"} replace state={{ from: returnUrl }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
