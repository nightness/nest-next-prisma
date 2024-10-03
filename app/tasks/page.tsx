// app/tasks/page.tsx

import Link from 'next/link';

export default function TasksIndexPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Task Examples</h1>
      <ul>
        <li>
          <Link href="/tasks/client-api">Client API Example</Link>
        </li>
        <li>
          <Link href="/tasks/rsc">React Server Components Example</Link>
        </li>
      </ul>
    </main>
  );
}
