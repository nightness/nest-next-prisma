// app/auth/sign-out/page.tsx
"use client";

import { serverFetch } from "@/utils/serverFetch";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import styles from '../(styles)/auth.module.css';
import { signOut } from "@/utils/auth";

export default function signOutPage() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut();
      router.push('/');
    }
    catch (error: any) {
      console.error(error.message);
    }
  }
  
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Sign Out</h1>
      <button onClick={handleSignOut}>Sign Out</button>
    </main>
  );
}
