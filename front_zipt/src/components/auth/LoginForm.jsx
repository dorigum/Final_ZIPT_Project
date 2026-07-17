import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './AuthForm.module.scss';
import SnsLoginButtons from './SnsLoginButtons';

const REDIRECT_STORAGE_KEY = 'zipt_post_login_redirect';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginStore = useAuthStore((state) => state.login);
  const redirectUrl = useAuthStore((state) => state.redirectUrl);
  const setRedirectUrl = useAuthStore((state) => state.setRedirectUrl);
  const beginExplicitLogin = useAuthStore((state) => state.beginExplicitLogin);
  const endExplicitLogin = useAuthStore((state) => state.endExplicitLogin);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    beginExplicitLogin();
    try {
      const { accessToken } = await login({ email, password });
      loginStore(accessToken);
      const savedReturnUrl = sessionStorage.getItem(REDIRECT_STORAGE_KEY);
      const returnUrl = redirectUrl || location.state?.from || savedReturnUrl;
      setRedirectUrl(null);
      sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
      navigate(returnUrl || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
      endExplicitLogin();
    }
  };

  return (
    <section className={styles.authShell}>
      <div className={styles.intro}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>Z</span>
          ZIPT
        </div>
        <div>
          <h1 className={styles.introTitle}>안전한 계약 준비를 이어가세요</h1>
          <p className={styles.introCopy}>
            저장된 등기부 분석, 계약서 검토, 인프라 브리핑을 한곳에서 다시 확인할 수 있습니다.
          </p>
        </div>
        <ul className={styles.introList}>
          <li>등기부 분석 결과 보관</li>
          <li>계약 전 위험 신호 확인</li>
          <li>내 매물 리포트 이어보기</li>
        </ul>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.title}>로그인</h2>
        <p className={styles.subtitle}>이메일 계정 또는 소셜 계정으로 ZIPT에 접속하세요.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>이메일</span>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@zipt.kr"
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>비밀번호</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '이메일로 로그인'}
          </button>
        </form>

        <div className={styles.divider}>또는</div>
        <SnsLoginButtons />

        <p className={styles.footerText}>
          아직 계정이 없으신가요?{' '}
          <Link className={styles.footerLink} to="/signup">회원가입</Link>
        </p>
      </div>
    </section>
  );
}
