// File: app/auth/sign-in/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    } catch (error: any) {
      setError(error.message);
      return;
    }
    router.push('/');
  };

  return (
    <form onSubmit={handleSignIn} className={styles.form}>
      <h1 className={styles.title}>Sign In</h1>
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
      <button type="submit" className={styles.button}>Sign In</button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
