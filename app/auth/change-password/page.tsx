"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { serverFetch } from '@/utils/serverFetch';
import styles from '../(styles)/auth.module.css';
import { changePassword, isLoggedIn } from '@/utils/auth';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  if (!isLoggedIn()) {
    router.push('/auth/sign-in');
    return null;
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password successfully changed.');
    } catch (err: any) {
      setError(err.message || 'Unable to change password.');
    }
  };

  return (
    <form onSubmit={handleChangePassword} className={styles.form}>
      <h1 className={styles.title}>Change Password</h1>
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
      <button type="submit" className={styles.button}>Change Password</button>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
}
