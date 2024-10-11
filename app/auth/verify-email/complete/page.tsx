// app/auth/verify-email/complete/page.tsx

import styles from '../../(styles)/auth.module.css';
import Link from 'next/link';
import { verifyEmail } from '../../serverActions';

interface Props {
  searchParams: { token?: string };
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const token = searchParams.token;
  let errorMessage = '';

  if (!token) {
    errorMessage = 'Invalid or missing token.';
  } else {
    try {
      await verifyEmail(token);
    } catch (error) {
      errorMessage = (error as Error)?.message || 'An error occurred during verification.';
    }
  }

  // If there's an error, show the error UI
  if (errorMessage) {
    return (
      <div
        className={styles['form-container']}
        style={{ textAlign: 'center', maxWidth: '500px' }}
      >
        <h1 className={styles['form-title']}>Email Verification Failed</h1>
        <p className={`${styles.message} ${styles.error}`}>
          {errorMessage}
        </p>
        <Link href="/auth/verify-email" className={styles.button}>
          Try Again
        </Link>
      </div>
    );
  }

  // If everything is successful, show the success UI
  return (
    <div
      className={styles['form-container']}
      style={{ textAlign: 'center', maxWidth: '500px' }}
    >
      <h1 className={styles['form-title']}>Email Verified!</h1>
      <p className={styles.message}>
        Thank you for verifying your email address and for being a part of our community.
      </p>
      <Link href="/auth/sign-in" className={styles.button}>
        Sign In
      </Link>
    </div>
  );
}
