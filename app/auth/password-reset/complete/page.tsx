// app/password-reset/complete/page.js
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import "./page.css";

export default function PasswordResetCompletePage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setValidationErrors(['Passwords do not match']);
      return;
    }
    // Handle password reset logic
  };

  return (
    <div>
      <div id="header-div">
        <h1>Reset Password</h1>
      </div>
      <form id="reset-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="confirm-password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
        <ul>
          {validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </form>
    </div>
  );
}
