// app/auth/provider.tsx
'use client';

import { getExpirationTime } from '@/utils/jwt';
import { serverFetch } from '@/utils/serverFetch';
import { User } from '@prisma/client';
import React, { createContext } from 'react';
import { useEffect, useState } from 'react';

// Define the type for the AuthContext value
type AuthContextType = Partial<User> | null;

interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
}

interface RefreshResponse extends AuthenticationResponse {
  user: {
    email: string;
    name: string;
    sub: string;
    iat: number;
    exp: number;
  };
}

let currentUserInitialized = false;
let accessTokenRefreshTimeout: NodeJS.Timeout | null = null;

// TODO: Implement refresh token refresh... I'm thinking the server should handle this by sending a new refresh token
// with the access token, but only if it's close to expiration.

let _currentUser: User | null = null;
const currentUserListeners: ((user: User | null) => void)[] = [];

// Create the context with an initial null value
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Define the AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true); // Loading state
  const currentUser = useCurrentUser(); // Subscribe to global current user changes

  // Initialize the current user
  useEffect(() => {
    async function initialize() {
      if (!currentUserInitialized) {
        setLoading(true);
        await initializeCurrentUser(); // Fetch the user from the server
        currentUserInitialized = true;
        setLoading(false); // Mark loading as complete
      }
    }

    initialize();
  }, []);

  if (loading) {
    return <></>;
  }

  return (
    <AuthContext.Provider value={currentUser}>{children}</AuthContext.Provider>
  );
};

/*
  Pure functions to interact with the server
*/

async function initializeCurrentUser() {
  // Check if the access token is stored in local storage
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    return;
  }

  const refreshToken = localStorage.getItem('refresh_token');

  // Set the access token and refresh token
  await setTokensAndRefreshTimer(accessToken, refreshToken ?? undefined);

  try {
    // Load the current user
    const [status, user, error] = await serverFetch<User>('/api/user/me', {
      sendAccessToken: true,
      abortTimeout: 5000,
    });

    if (status === 200) {
      setCurrentUser(user);
    } else {
      console.error('Failed to get current user: ', error?.message || status);
    }
  } catch (error) {
    console.error(
      'Failed to get current user: ',
      (error as Error)?.message || 'Unknown error'
    );
  }
}

export function isLoggedIn(): boolean {
  // Check if the access token is stored in local storage
  const accessToken = localStorage.getItem('access_token');

  // To keep this from being an async function, we can use the accessTokenRefreshTimeout variable
  // to check if the access token is still valid. If it is, we can assume the user is logged in and it is valid.
  return !!accessToken && accessTokenRefreshTimeout !== null;
}

export async function login(email: string, password: string): Promise<void> {
  try {
    // Fetch the access token and refresh token
    const [, data] = await serverFetch<AuthenticationResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    // Set's the tokens in local storage
    await setTokensAndRefreshTimer(data!.access_token, data!.refresh_token);

    // Fetch the current user
    const [, user] = await serverFetch<User>('/api/user/me', {
      sendAccessToken: true,
    });

    // Set the current user variable
    setCurrentUser(user);
  } catch (err) {
    throw new Error((err as Error)?.message || 'Unable to sign in.');
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });
    } catch {
      throw new Error('Failed to sign out');
    } finally {
      // Clear the refresh token from local storage
      localStorage.removeItem('refresh_token');

      // Stop the refresh timer
      stopRefreshAccessTokenTimer();
    }

    // Clear the current user
    setCurrentUser(null);
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<void> {
  try {
    // Fetch the access token and refresh token
    const [, data] = await serverFetch<{
      access_token: string;
      refresh_token: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    // Set the tokens in local storage
    await setTokensAndRefreshTimer(data!.access_token, data!.refresh_token);

    // Fetch the current user
    const [, user] = await serverFetch<User>('/api/user/me', {
      sendAccessToken: true,
    });

    // Set the current user variable
    setCurrentUser(user);
  } catch (err) {
    throw new Error((err as Error)?.message || 'Unable to sign up.');
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await serverFetch('/api/auth/change-password', {
    method: 'POST',
    sendAccessToken: true,
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

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

async function setRefreshAccessTokenTimer(access_token: string) {
  const timeUntilExpiration = await getExpirationTime(access_token);

  // Set the timer to refresh the token one minute before expiration
  const refreshTimeMs = (timeUntilExpiration - 60) * 1000;

  // Stop the refresh timer, if it is already set
  stopRefreshAccessTokenTimer();

  // Set the refresh token refresh timer
  accessTokenRefreshTimeout = setTimeout(async () => {
    accessTokenRefreshTimeout = null;
    try {
      const { access_token, refresh_token } = (await refreshAccessToken()) || {
        access_token: null,
        refresh_token: null,
      };
      if (!access_token) {
        clearTokens();
        setCurrentUser(null);
      } else {
        await setTokensAndRefreshTimer(access_token, refresh_token);        
      }
    } catch (error) {
      console.error('Failed to refresh access token', error);
    }
  }, refreshTimeMs);
}

function stopRefreshAccessTokenTimer() {
  if (accessTokenRefreshTimeout) {
    clearTimeout(accessTokenRefreshTimeout);
    accessTokenRefreshTimeout = null;
  }
}

function setCurrentUser(user: User | null) {
  _currentUser = user;
  currentUserListeners.forEach((listener) => listener(user));
}

async function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
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
}

async function setTokensAndRefreshTimer(accessToken: string, refreshToken?: string) {
  // Set the tokens
  await setTokens(accessToken, refreshToken);

  // Set refresh timer
  await setRefreshAccessTokenTimer(accessToken);
}

// Make the API request to return the new tokens
async function refreshAccessToken(): Promise<RefreshResponse | null> {
  const [, data, error] = await serverFetch<RefreshResponse>(
    '/api/auth/refresh',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: localStorage.getItem('refresh_token'),
      }),
    }
  );

  if (!data || error) {
    console.error('Failed to refresh access token');
    return null;
  }

  return data!;
}
