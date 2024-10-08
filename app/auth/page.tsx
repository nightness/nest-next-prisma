"use client";
// app/auth/page.tsx

import Link from 'next/link';
import stylesApp from '../(styles)/app.module.css';
import styles from '../auth/(styles)/auth.module.css';

import { useCurrentUser } from './provider';

export default function AuthIndexPage() {
  const currentUser = useCurrentUser();
  return (
    <div className={styles['form-container']} style={{ "maxWidth": '600px'}}>
      <h1 className={styles['form-title']}>E-Mail Based User Authentication</h1>
      <h2>Current User: {currentUser ? currentUser.name : 'Not signed in'}</h2>
      <div className={styles.linkList}>
        <Link href="/auth/sign-up">
          <div className={styles.a}>Sign Up</div>
        </Link>
        <Link href="/auth/sign-in">
          <div className={styles.a}>Sign In</div>
        </Link>
        <Link href="/auth/sign-out">
          <div className={styles.a}>Sign Out</div>
        </Link>
        <Link href="/auth/password-reset">
          <div className={styles.a}>Password Reset</div>
        </Link>
        <Link href="/auth/change-password">
          <div className={styles.a}>Change Password</div>
        </Link>
      </div>
    </div>
  );
}
