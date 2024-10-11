// app/auth/password-reset/complete/page.tsx
import { resetPassword } from '@/app/auth/serverActions';
import styles from '../../(styles)/auth.module.css';
import { redirect } from 'next/navigation';

interface Props {
  searchParams: { token?: string };
}

export default function PasswordResetCompletePage({ searchParams }: Props) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className={styles['form-container']}>
        <h1 className={styles['form-title']}>Invalid Token</h1>
        <p className={`${styles.message} ${styles.error}`}>Invalid or missing token.</p>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    'use server';

    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    try {
      await resetPassword(token!, newPassword);
      redirect('/auth/password-reset/completed');
    } catch (error) {
      throw new Error((error as Error)?.message || 'Unable to reset password.');
    }
  }

  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Reset Password</h1>
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
