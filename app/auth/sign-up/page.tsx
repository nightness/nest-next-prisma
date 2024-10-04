// File: app/auth/sign-up/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { serverFetch } from '@/utils/serverFetch';
import styles from '../../(styles)/styles.module.css';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [status, data] = await serverFetch<{
        access_token: string;
        refresh_token: string;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      localStorage.setItem('token', data!.access_token);
      localStorage.setItem('refreshToken', data!.refresh_token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Unable to sign up.');
    }
  };

  return (
    <form onSubmit={handleSignUp} className={styles.form}>
      <h1 className={styles.title}>Sign Up</h1>
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
      <button type="submit" className={styles.button}>Sign Up</button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
