"use client";

import { getExpirationTime } from "@/utils/jwt";
import { serverFetch } from "@/utils/serverFetch";
// app/auth/provider.tsx
import { User } from "@prisma/client";
import React, { createContext, use } from "react";
import { useEffect, useState } from 'react';

// Define the type for the AuthContext value
type AuthContextType = Partial<User> | null;

interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
}

interface RefreshResponse {
  access_token: string;
}

let currentUserInitialized = false;
let accessTokenRefreshTimeout: NodeJS.Timeout | null = null;
let refreshTokenRefreshTimeout: NodeJS.Timeout | null = null; // TODO: Implement refresh token refresh

let _currentUser: User | null = null;
const currentUserListeners: ((user: User | null) => void)[] = [];

// Create the context with an initial null value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useCurrentUser(); // Subscribe to global current user changes

  // Initialize the current user
  useEffect(() => {
    if (!currentUserInitialized) {
      initializeCurrentUser();
      currentUserInitialized = true;
    }
  }, []);

  return (
    <AuthContext.Provider value={currentUser}>
      {children}
    </AuthContext.Provider>
  );
};

/*
  Pure functions to interact with the server
*/

function initializeCurrentUser() {

  console.log('Initializing current user...');

  // Check if the access token is stored in local storage
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    return;
  }

  // Get the expiration time of the access token
  getExpirationTime(accessToken)
    .then((timeUntilExpiration) => {
      // Set refresh timer
      setRefreshTimer(timeUntilExpiration);
    })
    .catch((error) => {
      console.error('Failed to get expiration time', error);
    });
}

export function isLoggedIn(): boolean {
  // Check if the access token is stored in local storage
  const accessToken = localStorage.getItem('access_token');

  // To keep this from being an async function, we can use the accessTokenRefreshTimeout variable
  // to check if the access token is still valid. If it is, we can assume the user is logged in and it is valid.
  return !!accessToken && accessTokenRefreshTimeout !== null;
}

async function setTokens(accessToken: string, refreshToken?: string) {
  if (!accessToken) {
    throw new Error('No token provided');
  }


  // Update the stored access token if needed
  localStorage.setItem('access_token', accessToken);

  // Update the stored refresh token if needed
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }

  // Get the expiration time of the access token
  const timeUntilExpiration = await getExpirationTime(accessToken);

  // Set refresh timer
  setRefreshTimer(timeUntilExpiration);

  console.log('Access token refresh timer set');
}

function setRefreshTimer(timeUntilExpiration: number) {
  // Set the timer to refresh the token one minute before expiration
  const refreshTimeMs = (timeUntilExpiration - 60) * 1000;

  // Stop the refresh timer, if it is already set
  stopRefreshTimer();

  // Set the refresh token refresh timer
  accessTokenRefreshTimeout = setTimeout(async () => {
    accessTokenRefreshTimeout = null;
    try {
      const newToken = await refreshAccessToken();
      setTokens(newToken);
      timeUntilExpiration = await getExpirationTime(newToken);
    } catch (error) {
      console.error('Failed to refresh access token', error);
    }
  }, refreshTimeMs);
}

async function refreshAccessToken(): Promise<string> {
  // Make the API request to refresh the access token
  const [status, data] = await serverFetch<RefreshResponse>('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: localStorage.getItem('refresh_token'),
    }),
  });

  const { access_token: newToken } = data!;
  await setTokens(newToken);
  return newToken;
}

export async function login(email: string, password: string): Promise<void> {
  try {
    // Fetch the access token and refresh token
    const [status, data] = await serverFetch<AuthenticationResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Set's the tokens in local storage
    await setTokens(data!.access_token, data!.refresh_token);

    // Fetch the current user
    const [meStatus, user] = await serverFetch<User>('/api/auth/me', {
      sendAccessToken: true,
    });

    // Set the current user variable
    setCurrentUser(user);
  } catch (err: any) {
    throw new Error(err?.message || 'Unable to sign in.');
  }
}

export async function signOut() {
  const accessToken = localStorage.getItem('access_token');
  const currentRefreshToken = localStorage.getItem('refresh_token');

  // Delete the access token
  if (accessToken) {
    localStorage.removeItem('access_token');
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
    } catch (error) {
      throw new Error('Failed to sign out');
    } finally {
      // Clear the refresh token from local storage
      localStorage.removeItem('refresh_token');

      // Stop the refresh timer
      stopRefreshTimer()
    }

    // Clear the current user
    setCurrentUser(null);
  }
}

export async function signUp(email: string, password: string, name: string): Promise<void> {
  try {
    // Fetch the access token and refresh token
    const [status, data] = await serverFetch<{
      access_token: string;
      refresh_token: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    // Set the tokens in local storage
    await setTokens(data!.access_token, data!.refresh_token);

    // Fetch the current user
    const [meStatus, user] = await serverFetch<User>('/api/auth/me', {
      sendAccessToken: true,
    });

    // Set the current user variable
    setCurrentUser(user);
  } catch (err: any) {
    throw new Error(err?.message || 'Unable to sign up.');
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await serverFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  } catch (err: any) {
    throw new Error(err?.message || 'Unable to send password reset email.');
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await serverFetch('/api/auth/change-password', {
    method: 'POST',
    sendAccessToken: true,
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

export function onCurrentUserChange(listener: (user: User | null) => void) {
  currentUserListeners.push(listener);

  // Return a function to remove the listener
  return () => {
    const index = currentUserListeners.indexOf(listener);
    if (index !== -1) {
      currentUserListeners.splice(index, 1);
    }
  };
}

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(_currentUser);

  useEffect(() => {
    return onCurrentUserChange(setCurrentUser);
  }, []);

  return currentUser;
}

function stopRefreshTimer() {
  if (refreshTokenRefreshTimeout) {
    clearTimeout(refreshTokenRefreshTimeout)
    refreshTokenRefreshTimeout = null;
  }
}

function setCurrentUser(user: User | null) {
  _currentUser = user;
  currentUserListeners.forEach((listener) => listener(user));
}
