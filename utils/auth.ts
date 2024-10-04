// File: app/utils/authUtils.ts
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

async function setTokens(accessToken: string, refreshToken?: string) {
  if (!accessToken) {
    throw new Error('No token provided');
  }

  // Clear the refresh timeout if it exists
  if (accessTokenRefreshTimeout) {
    clearTimeout(accessTokenRefreshTimeout);
  }

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
    const [status, data] = await serverFetch<AuthenticationResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setTokens(data!.access_token, data!.refresh_token);
  } catch (err: any) {
    throw new Error(err?.message || 'Unable to sign in.');
  }
}

export async function isLoggedIn(): Promise<boolean> {
  // Check if the access token is stored in local storage
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    return false;
  }

  try {
    // Get the expiration time of the access token, will throw an error if the token is expired
    await getExpirationTime(accessToken);  
    return true;
  } catch (error) {
    return false;
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

      // Clear the refresh token from local storage
      localStorage.removeItem('refresh_token');
    } catch (error) {
      throw new Error('Failed to sign out');
    } finally {
      // Clear the refresh token from local storage
      // localStorage.removeItem('refreshToken');
    }
  }
}

export async function signUp(email: string, password: string, name: string): Promise<void> {
  try {
    const [status, data] = await serverFetch<{
      access_token: string;
      refresh_token: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    await setTokens(data!.access_token, data!.refresh_token);
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
