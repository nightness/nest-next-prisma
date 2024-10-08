// handlers/not-found.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from './(styles)/error.module.css';
import utilStyles from '../(styles)/utilities.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.message}>
        Sorry, the page you're looking for doesn't exist.
      </p>
      <div className={styles['error-code']}>404</div>
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
