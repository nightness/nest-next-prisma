// File: app/utils/authUtils.ts
import { User } from '@prisma/client';
import { getExpirationTime } from './jwt';
import { serverFetch } from './serverFetch';

interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
}

interface RefreshResponse {
  access_token: string;
}

let accessTokenRefreshTimeout: NodeJS.Timeout | null = null;
let refreshTokenRefreshTimeout: NodeJS.Timeout | null = null; // TODO: Implement refresh token refresh

let _currentUser: User | null = null;

// Get the current user, this is fetched and set when the user logs in, and unset when the user logs out
export const getCurrentUser = () => _currentUser;

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

  // Stop the refresh timer
  stopRefreshTimer();

  // Update the stored access token if needed
  localStorage.setItem('access_token', accessToken);

  // Update the stored refresh token if needed
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }

  // Get the expiration time of the access token
  const timeUntilExpiration = await getExpirationTime(accessToken);

  console.log('Access token set, expires in', timeUntilExpiration, 'seconds');

  // Set the timer to refresh the token one minute before expiration
  const refreshTimeMs = (timeUntilExpiration - 60) * 1000;

  accessTokenRefreshTimeout = setTimeout(async () => {
    accessTokenRefreshTimeout = null;
    try {
      const newToken = await refreshAccessToken();
      setTokens(newToken);
    } catch (error) {
      console.error('Failed to refresh access token', error);
    }
  }, refreshTimeMs);

  console.log('Access token refresh timer set');
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
    _currentUser = user!;
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
    _currentUser = null;
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
    _currentUser = user!;
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

function stopRefreshTimer() {
  if (refreshTokenRefreshTimeout) {
    clearTimeout(refreshTokenRefreshTimeout)
    refreshTokenRefreshTimeout = null;
  }
}
