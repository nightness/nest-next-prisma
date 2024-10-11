// auth/verify-email/complete/page.tsx
import styles from '../../(styles)/auth.module.css';
import Link from 'next/link';

interface Props {
  searchParams: { token?: string };
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const token = searchParams.token;

  if (!token) {
    throw new Error('Invalid or missing token.');
  }

  return (
    <div className={styles['form-container']} style={{ textAlign: 'center', maxWidth: '500px' }}>
      <h1 className={styles['form-title']}>Email Verified!</h1>
      <p className={styles.message}>
        Thank you for verifying your email address and for being a part of our community.</p>
      <Link href="/auth/sign-in" className={styles.button}>
        Sign In
      </Link>
    </div>
  );
}
