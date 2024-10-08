// handlers/401/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from '../(styles)/error.module.css';
import utilStyles from '../../(styles)/utilities.module.css';

export const metadata = {
  title: 'Unauthorized',
};

export default function UnauthorizedPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Unauthorized Access</h1>
      <p className={styles.message}>
        Please{' '}
        <Link href="/auth/sign-in" className={utilStyles.link}>
          sign in
        </Link>{' '}
        to access this page.
      </p>
      <div className={styles['error-code']}>401</div>
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
