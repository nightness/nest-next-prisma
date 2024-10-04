"use client";

// File: app/auth/password-reset/page.tsx

import { useState } from 'react';
import { serverFetch } from '@/utils/serverFetch';

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
    <form onSubmit={handlePasswordReset}>
      <h1>Password Reset</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <button type="submit">Reset Password</button>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
    </form>
  );
}