// app/auth/page.tsx

import Link from 'next/link';
import styles from '../(styles)/app.module.css';
import { getCurrentUser } from '@/utils/auth';

export default function AuthIndexPage() {
  const currentUser = getCurrentUser();
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>E-Mail Based User Authentication</h1>
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
    </main>
  );
}
