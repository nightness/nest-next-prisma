// app/auth/verify-email/error.tsx

'use client';

import styles from '../(styles)/auth.module.css';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error in email verification request:', error);
  }, [error]);

  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Request Email Verification</h1>
      <p className={`${styles.message} ${styles.error}`}>
        {error.message || 'An error occurred.'}
      </p>
      <button onClick={() => reset()} className={styles.button}>
        Try Again
      </button>
    </div>
  );
}
