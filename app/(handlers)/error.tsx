// handlers/error.tsx
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './(styles)/error.module.css';
import utilStyles from '../(styles)/utilities.module.css';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Server Error</h1>
      <p className={styles.message}>We're sorry, something went wrong.</p>
      <div className={styles['error-code']}>500</div>
      <div className={styles['image-container']}>
        <Image
          src="/images/EmojiShrug.png"
          alt="Emoji Shrug"
          width={150}
          height={150}
        />
      </div>
      <div className={styles['link-container']}>
        <Link href="/" className={utilStyles.button}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
