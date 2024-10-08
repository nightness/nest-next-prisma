// handlers/403/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from '../(styles)/error.module.css';
import utilStyles from '../../(styles)/utilities.module.css';

export const metadata = {
  title: 'Forbidden',
};

export default function ForbiddenPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Access Denied</h1>
      <p className={styles.message}>
        You do not have permission to view this page.
      </p>
      <div className={styles['error-code']}>403</div>
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
