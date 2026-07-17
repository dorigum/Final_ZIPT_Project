import SignupForm from '../../components/auth/SignupForm';
import styles from '../../components/auth/AuthForm.module.scss';

export default function SignupPage() {
  return (
    <main className={styles.authPage}>
      <SignupForm />
    </main>
  );
}
