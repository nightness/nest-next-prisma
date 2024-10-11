// app/auth/password-reset/complete/page.tsx

import { resetPassword } from '@/app/auth/serverActions';
import styles from '../../(styles)/auth.module.css';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Props {
  searchParams: { token?: string };
}

export default async function PasswordResetCompletePage({ searchParams }: Props) {
  const token = searchParams.token;
  let errorMessage = '';

  if (!token) {
    errorMessage = 'Invalid or missing token.';
  }

  async function handleSubmit(formData: FormData) {
    'use server';

    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validation is minimal since the server action will handle the logic
    if (!token) {
      throw new Error('Invalid or missing token.');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    try {
      await resetPassword(token, newPassword);
      redirect('/auth/password-reset/completed');
    } catch (error) {
      throw new Error((error as Error)?.message || 'Unable to reset password.');
    }
  }

  if (!token) {
    return (
      <div className={styles['form-container']} style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1 className={styles['form-title']}>Password Reset Failed</h1>
        <p className={`${styles.message} ${styles.error}`}>{errorMessage}</p>
        <Link href="/auth/password-reset" className={styles.button}>
          Try Again
        </Link>        
      </div>
    );
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
