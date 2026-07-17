import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/authApi';
import { Icon } from '../common/Icon.jsx';
import styles from './AuthForm.module.scss';
import SnsLoginButtons from './SnsLoginButtons';

export default function SignupForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!name.trim()) {
      nextErrors.name = '이름을 입력해 주세요.';
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)) {
      nextErrors.password = '8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.';
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await register({ email, name: name.trim(), password });
      setShowSuccessModal(true);
    } catch (err) {
      setServerError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <section className={styles.authShell}>
      <div className={styles.intro}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>Z</span>
          ZIPT
        </div>
        <div>
          <h1 className={styles.introTitle}>처음 계약도 차분하게 준비해요</h1>
          <p className={styles.introCopy}>
            계정을 만들면 분석 리포트와 계약 준비 상태를 안전하게 보관할 수 있습니다.
          </p>
        </div>
        <ul className={styles.introList}>
          <li>분석 결과 저장</li>
          <li>계약 체크리스트 관리</li>
          <li>내 서류 리포트 모아보기</li>
        </ul>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.title}>회원가입</h2>
        <p className={styles.subtitle}>이메일로 가입하거나 소셜 계정으로 바로 시작하세요.</p>

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
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>이름</span>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름을 입력하세요"
              autoComplete="name"
              required
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>비밀번호</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8자 이상, 영문/숫자/특수문자 포함"
              autoComplete="new-password"
              required
            />
            {errors.password && <p className={styles.error}>{errors.password}</p>}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>비밀번호 확인</span>
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="비밀번호를 한 번 더 입력하세요"
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
          </label>

          {serverError && <p className={styles.error}>{serverError}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>

        <div className={styles.divider}>또는</div>
        <SnsLoginButtons isSignup />

        <p className={styles.footerText}>
          이미 계정이 있으신가요?{' '}
          <Link className={styles.footerLink} to="/login">로그인</Link>
        </p>
      </div>

      {showSuccessModal && (
        <div className={styles.modalBackdrop} role="presentation">
          <div
            className={styles.successModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-success-title"
          >
            <span className={styles.successIcon} aria-hidden="true">
              <Icon name="check-circle" size={30} stroke={2.3} />
            </span>

            <h3 id="signup-success-title" className={styles.modalTitle}>
              회원가입이 완료되었습니다
            </h3>
            <p className={styles.modalCopy}>
              이제 ZIPT에 로그인하여 등기부등본 분석, 계약서 검토, 인프라 브리핑을 이용할 수 있어요.
            </p>

            <button className={styles.modalButton} type="button" onClick={handleGoLogin}>
              로그인하러 가기
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
