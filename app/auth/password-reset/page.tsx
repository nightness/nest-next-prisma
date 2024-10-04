// File: app/auth/password-reset/page.tsx
"use client";

import { useState } from 'react';
import { serverFetch } from '@/utils/serverFetch';
import styles from '../../(styles)/styles.module.css';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await serverFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess('Password reset email sent.');
    } catch (err: any) {
      setError(err.message || 'Unable to send password reset email.');
    }
  };

  return (
    <form onSubmit={handlePasswordReset} className={styles.form}>
      <h1 className={styles.title}>Password Reset</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className={styles.input}
      />
      <button type="submit" className={styles.button}>Reset Password</button>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
}
