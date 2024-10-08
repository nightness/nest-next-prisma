// auth/password-reset/complete/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from '../../(styles)/auth.module.css';

export default function PasswordResetCompletePage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setValidationErrors(['Passwords do not match']);
      return;
    }
    try {
      // Handle password reset logic
      // Assuming you have a function to reset the password
      // await resetPassword(token, password);
      // FIXME: FINISH IMPLEMENTATION
      router.push('/auth/password-reset/completed');
    } catch (error: any) {
      setValidationErrors([error.message || 'Unable to reset password.']);
    }
  };

  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          required
          className={styles.input}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Submit
        </button>
        {validationErrors.length > 0 && (
          <ul className={`${styles.message} ${styles.error}`}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
}
