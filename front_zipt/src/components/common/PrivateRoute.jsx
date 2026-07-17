import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.js";

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const returnUrl = `${location.pathname}${location.search}${location.hash}`;

  // silentRefresh 완료 전까지 대기 (isLoading=true인 동안 리다이렉트 금지)
  if (isLoading) return null;

  return accessToken ? children : <Navigate to={isLoggingOut ? "/" : "/login"} replace state={{ from: returnUrl }} />;
}
