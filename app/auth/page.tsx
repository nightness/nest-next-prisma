// app/auth/page.tsx

import Link from 'next/link';

export default function AuthIndexPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>E-Mail Based User Authentication</h1>
      <ul>
        <li>
          <Link href="/auth/sign-up">Sign Up</Link>          
        </li>
        <li>
          <Link href="/auth/sign-in">Sign In</Link>
        </li>
        <li>
          <Link href="/auth/sign-out">Sign Out</Link>
        </li>
        <li>
          <Link href="/auth/password-reset">Password Reset</Link>
        </li>
        <li>
          <Link href="/auth/change-password">Change Password</Link>
        </li>
      </ul>
    </main>
  );
}
