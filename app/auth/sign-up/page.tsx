// auth/sign-up/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../(styles)/auth.module.css';

import { signUp } from '../provider';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, name);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Sign Up</h1>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className={styles.input}
        />
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
          Sign Up
        </button>
        {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
      </form>
      <p className={styles.message}>
        Already have an account?{' '}
        <Link href="/auth/sign-in" className={styles.link}>
          Sign In
        </Link>
      </p>
    </div>
  );
}
