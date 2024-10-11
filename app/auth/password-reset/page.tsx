// auth/password-reset/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../(styles)/auth.module.css';
import { sendPasswordResetEmail } from '../serverActions';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(email);
      setMessage('Password reset email sent.');
    } catch (err) {
      setMessage((err as Error)?.message || 'Unable to send password reset email.');
    }
  };

  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Password Reset</h1>
      <form onSubmit={handlePasswordReset}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Reset Password
        </button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
      <p className={styles.message}>
        Remembered your password?{' '}
        <Link href="/auth/sign-in" className={styles.link}>
          Sign In
        </Link>
      </p>
    </div>
  );
}
