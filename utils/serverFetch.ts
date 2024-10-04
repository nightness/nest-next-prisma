import { getBaseUrl } from "./getBaseUrl";

interface ServerFetchOptions extends RequestInit {
  sendAccessToken?: boolean;
}

export async function serverFetch<T>(url: string, { sendAccessToken, ...options }: ServerFetchOptions): Promise<[number, T | null]> {
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


  if (!response.ok) {
    let error = 'Request failed';
    try {
      error = await response.text();
    } catch (e) { }
    throw new Error(error);
  }

  // Check if response is empty
  if (response.status !== 204) {
    // Check that content type is JSON
    // if (!response.headers.get('content-type')?.includes('application/json')) {
    //   throw new Error('Invalid content type');
    // }
    return [response.status, await response.json() as T];
  }

  return [response.status, null];
}