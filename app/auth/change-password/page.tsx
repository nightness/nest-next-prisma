// auth/change-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../(styles)/auth.module.css';

import { changePassword, isLoggedIn } from '../provider';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  if (!isLoggedIn()) {
    router.push('/auth/sign-in');
    return null;
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword(currentPassword, newPassword);
      setMessage('Password successfully changed.');
    } catch (err) {
      setMessage((err as Error)?.message || 'Unable to change password.');
    }
  };

  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Change Password</h1>
      <form onSubmit={handleChangePassword}>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
          required
          className={styles.input}
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Change Password
        </button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
}
