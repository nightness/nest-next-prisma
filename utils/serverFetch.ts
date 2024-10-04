import { getBaseUrl } from "./getBaseUrl";

interface ServerFetchOptions extends RequestInit {
  sendAccessToken?: boolean;
}

export async function serverFetch<T>(url: string, { sendAccessToken, ...options }: ServerFetchOptions): Promise<[number, T | null, Error | null]> {
  const baseUrl = getBaseUrl();
  const token = localStorage.getItem('token');
  let headers: HeadersInit = { 'Content-Type': 'application/json', ...options.headers };

  if (sendAccessToken && !token) {
    throw new Error('serverFetch: Not authenticated');
  } else if (sendAccessToken) {
    headers = { ...headers, Authorization: `Bearer ${token}` };
  }

  const response = await fetch(`${baseUrl}${url}`, {
    headers,
    ...options,
  });

  // Check if response is empty
  if (response.ok && response.status !== 204) {
    try {
      const data = (await response.json()) as T;
      return [response.status, data, null];
    } catch (e) {
      return [response.status, null, e as Error];
    }    
  }

  if (!response.ok) {
    let error = 'Request failed';
    try {
      error = await response.text();
    } catch (e) { }
    return [response.status, null, new Error(error)];
  }

  return [response.status, null, null];
}