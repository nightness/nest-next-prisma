// auth/sign-out/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import styles from '../(styles)/auth.module.css';
import { signOut } from '../provider';

export default function SignOutPage() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut();
      router.push('/');
    } catch (error: any) {
      console.error(error.message);
    }
  }

  return (
    <div className={styles['form-container']} style={{ textAlign: 'center' }}>
      <h1 className={styles['form-title']}>Sign Out</h1>
      <button onClick={handleSignOut} className={styles.button}>
        Confirm Sign Out
      </button>
    </div>
  );
}
