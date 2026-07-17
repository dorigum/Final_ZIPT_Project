import styles from './AuthForm.module.scss';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const REDIRECT_STORAGE_KEY = 'zipt_post_login_redirect';

const getBackendOrigin = () => {
  const baseUrl = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || '/api');
  return baseUrl.replace(/\/$/, '');
};

export default function SnsLoginButtons({ isSignup = false }) {
  const location = useLocation();
  const redirectUrl = useAuthStore((state) => state.redirectUrl);

  const handleSocialLogin = (provider) => {
    const returnUrl = redirectUrl || location.state?.from;
    if (returnUrl) {
      sessionStorage.setItem(REDIRECT_STORAGE_KEY, returnUrl);
    }
    window.location.href = `${getBackendOrigin()}/oauth2/authorization/${provider}`;
  };

  const suffix = isSignup ? '시작하기' : '계속하기';

  return (
    <div className={styles.snsGroup}>
      <button
        type="button"
        className={`${styles.snsButton} ${styles.google}`}
        onClick={() => handleSocialLogin('google')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Google로 {suffix}
      </button>
      <button
        type="button"
        className={`${styles.snsButton} ${styles.kakao}`}
        onClick={() => handleSocialLogin('kakao')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M12 3c-5.52 0-10 3.58-10 8.01 0 2.92 1.93 5.49 4.82 6.82-.2.69-.73 2.52-.84 2.92-.14.52.18.51.38.38.16-.1 2.52-1.72 3.52-2.4.68.09 1.38.14 2.12.14 5.52 0 10-3.58 10-8.01S17.52 3 12 3z"/>
        </svg>
        카카오로 {suffix}
      </button>
      <button
        type="button"
        className={`${styles.snsButton} ${styles.naver}`}
        onClick={() => handleSocialLogin('naver')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M16.2 3H21v18h-4.8l-8.4-12v12H3V3h4.8l8.4 12V3z"/>
        </svg>
        네이버로 {suffix}
      </button>
    </div>
  );
}
