// app/tasks/page.tsx
import Link from 'next/link';
import styles from '../(styles)/app.module.css';

export default function TasksIndexPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Task List Example</h1>
      <div className={styles.linkList}>
          <Link href="/tasks/client-api">
            <div className={styles.a}>Client API Example</div>
          </Link>
          <Link href="/tasks/rsc">
            <div className={styles.a}>React Server Components Example</div>
          </Link>
      </div>
    </main>
  );
}
