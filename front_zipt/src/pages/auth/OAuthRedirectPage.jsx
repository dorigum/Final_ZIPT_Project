import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const REDIRECT_STORAGE_KEY = 'zipt_post_login_redirect';

const OAuthRedirectPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginStore = useAuthStore((state) => state.login);
  const setRedirectUrl = useAuthStore((state) => state.setRedirectUrl);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const beginExplicitLogin = useAuthStore((state) => state.beginExplicitLogin);
  const endExplicitLogin = useAuthStore((state) => state.endExplicitLogin);

  useEffect(() => {
    beginExplicitLogin();

    const accessToken = searchParams.get('accessToken');
    if (!accessToken) {
      endExplicitLogin();
      navigate('/login', { replace: true });
      return;
    }

    loginStore(accessToken);
    setIsLoading(false);
    endExplicitLogin();

    const savedReturnUrl = sessionStorage.getItem(REDIRECT_STORAGE_KEY);
    // effect 자신이 setRedirectUrl(null)로 바꾸는 값이라, 구독 대신 실행 시점의 스냅샷을 getState()로 읽어
    // 의존성 배열에 넣지 않는다 (넣으면 값 변경이 effect 재실행을 유발해 begin/endExplicitLogin이 중복 호출됨)
    const returnUrl = useAuthStore.getState().redirectUrl || savedReturnUrl || '/';
    setRedirectUrl(null);
    sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
    navigate(returnUrl, { replace: true });
  }, [beginExplicitLogin, endExplicitLogin, loginStore, navigate, searchParams, setIsLoading, setRedirectUrl]);

  return (
    <div>
      <p>OAuth 로그인 중...</p>
    </div>
  );
};

export default OAuthRedirectPage;
