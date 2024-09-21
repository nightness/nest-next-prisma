export const dynamic = 'force-dynamic';

// app/page.tsx
import React from 'react';
import Link from 'next/link';
import { getBaseUrl } from './utils/getBaseUrl';

// Fetch posts data from the API
async function getHello(): Promise<{ message: string} | null> {
  console.log("server component");
  try {
    const res = await fetch(`${getBaseUrl()}/api/hello`, {
      cache: 'no-store', // Disable caching to fetch fresh data on each request
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.statusText}`);
    }
    const data = (await res.json()) as { message: string };
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return null;
  }
}

export default async function HomePage() {
  const data = await getHello();

  return (
    <div className='bg-black'>
      <h1>Welcome to NestJS with Next.js!</h1>
      <p>This is the Next.js frontend served by NestJS.</p>

      <h2>API Response</h2>
      <pre>{data?.message || 'Loading...'}</pre>
      <Link href="/dashboard">Dashboard</Link>
    </div>
  );
}
