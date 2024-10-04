"use client";

// File: app/auth/sign-in/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { serverFetch } from '@/utils/serverFetch';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [status, data] = await serverFetch<{
        access_token: string;
        refresh_token: string;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }); // Data won't be null, not a no-content response
      console.log("Sign-in data", data);
      localStorage.setItem('token', data!.access_token);
      localStorage.setItem('refreshToken', data!.refresh_token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in.');
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <h1>Sign In</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Sign In</button>
      {error && <p>{error}</p>}
    </form>
  );
}