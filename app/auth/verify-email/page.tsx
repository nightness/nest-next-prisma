// app/auth/verify-email/page.tsx
import { verifyEmail } from '@/app/auth/serverActions';
import styles from '../(styles)/auth.module.css';

interface Props {
  searchParams: { token?: string };
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const token = searchParams.token;

  if (!token) {
    throw new Error('Invalid or missing token.');
  }

  try {
    await verifyEmail(token);
    return (
      <div className={styles['form-container']}>
        <h1 className={styles['form-title']}>Email Verified</h1>
        <p className={`${styles.message} ${styles.success}`}>
          Your email has been successfully verified.
        </p>
      </div>
    );
  } catch (error) {
    throw new Error((error as Error)?.message || 'Unable to verify email.');
  }
}
