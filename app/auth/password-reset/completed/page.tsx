// auth/password-reset/completed/page.tsx
import styles from '../../(styles)/auth.module.css';
import Link from 'next/link';

export default function PasswordResetCompletedPage() {
  return (
    <div className={styles['form-container']} style={{ textAlign: 'center' }}>
      <h1 className={styles['form-title']}>Password Reset Successful</h1>
      <p className={styles.message}>
        Your password has been reset successfully. You can now{' '}
        <Link href="/auth/sign-in" className={styles.link}>
          sign in
        </Link>{' '}
        with your new password.
      </p>
    </div>
  );
}
