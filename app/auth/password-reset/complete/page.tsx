// app/auth/password-reset/complete/page.tsx

import { resetPassword } from '@/app/auth/serverActions';
import styles from '../../(styles)/auth.module.css';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Props {
  searchParams: { token?: string; error?: string };
}

export default async function PasswordResetCompletePage({ searchParams }: Props) {
  const token = searchParams.token;
  const errorMessage = searchParams.error;

  // If there's an error related to the token being invalid, display a message and a link to request a new reset
  if (errorMessage === 'Invalid token' || !token) {
    return (
      <div className={styles['form-container']} style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1 className={styles['form-title']}>Password Reset Failed</h1>
        <p className={`${styles.message} ${styles.error}`}>
          {errorMessage || 'Invalid or missing token'}
        </p>
        <Link href="/auth/password-reset" className={styles.button}>
          Request New Password Reset
        </Link>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    'use server';

    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate the passwords
    if (newPassword !== confirmPassword) {
      redirect(`/auth/password-reset/complete?token=${token}&error=Passwords do not match.`);
      return;
    }

    try {
      await resetPassword(token!, newPassword);
      redirect('/auth/password-reset/completed');
    } catch (error) {
      const errorMsg = (error as Error)?.message || 'Unable to reset password. Please try again.';
      redirect(`/auth/password-reset/complete?token=${token}&error=${encodeURIComponent(errorMsg)}`);
    }
  }

  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Reset Password</h1>
      {errorMessage && (
        <p className={`${styles.message} ${styles.error}`}>{errorMessage}</p>
      )}
      <form action={handleSubmit}>
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          required
          className={styles.input}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Submit
        </button>
      </form>
    </div>
  );
}
