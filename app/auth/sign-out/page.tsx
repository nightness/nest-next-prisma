"use client";

// app/auth/sign-out/page.tsx

import { serverFetch } from "@/utils/serverFetch";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function signOutPage() {
  const router = useRouter();

  const signOut = useCallback(async function () {
    const accessToken = localStorage.getItem('token');
    const currentRefreshToken = localStorage.getItem('refreshToken');

    // Delete the access token
    if (accessToken) {
      localStorage.removeItem('token');
    }

    // If there is no refresh token, there is no need to sign out
    if (currentRefreshToken) {
      // Sign out by sending the refresh token to the server
      try {
        await serverFetch('/api/auth/logout', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });

        // Delete the refresh token
        localStorage.removeItem('refreshToken');
      } catch (error) {
        console.error("Error signing out", error);
      }
    }
    router.push('/');
  }, [router]);
  
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Sign Out</h1>
      <button onClick={signOut}>Sign Out</button>
    </main>
  );
}
