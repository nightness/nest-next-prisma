"use client";

// File: app/auth/sign-up/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { serverFetch } from '@/utils/serverFetch';

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
      }); // Data won't be null, not a no-content response
      localStorage.setItem('token', data!.access_token);
      localStorage.setItem('refreshToken', data!.refresh_token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Unable to sign up.');
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <h1>Sign Up</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
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
      <button type="submit">Sign Up</button>
      {error && <p>{error}</p>}
    </form>
  );
}