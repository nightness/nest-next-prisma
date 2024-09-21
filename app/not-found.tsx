// app/not-found.tsx
import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link href="/">Go Home</Link>
    </div>
  );
}
