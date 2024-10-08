// auth/sign-in/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../(styles)/auth.module.css';

import { login } from '../provider';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Sign In</h1>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Sign In
        </button>
        {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
      </form>
      <p className={styles.message}>
        Don't have an account?{' '}
        <Link href="/auth/sign-up" className={styles.link}>
          Sign Up
        </Link>
      </p>
      <p className={styles.message}>
        Forgot your password?{' '}
        <Link href="/auth/password-reset" className={styles.link}>
          Reset Password
        </Link>
      </p>
    </div>
  );
}
