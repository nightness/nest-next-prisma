// app/auth/verify-email/requested/page.tsx
import styles from '../../(styles)/auth.module.css';

export default function VerifyEmailRequestedPage() {
  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Verification Email Sent</h1>
    <p className={`${styles.message} ${styles.success}`}>
      Provided you entered a valid un-verified e-mail address, a verification email has been sent to your email address. Please check your inbox.
    </p>
    </div>
  );
}
