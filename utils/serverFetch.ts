import { getBaseUrl } from "./getBaseUrl";

interface ServerFetchOptions extends RequestInit {
  sendAccessToken?: boolean;
  abortTimeout?: number;
}

export async function serverFetch<T>(url: string, { sendAccessToken, abortTimeout: abortTimeoutInterval, ...options }: ServerFetchOptions = {}): Promise<[number, T | null, Error | null]> {
  const baseUrl = getBaseUrl();
  const token = localStorage.getItem('access_token');
  let headers: HeadersInit = { 'Content-Type': 'application/json', ...options.headers };

  if (sendAccessToken && !token) {
    throw new Error('serverFetch: Not authenticated');
  } else if (sendAccessToken) {
    headers = { ...headers, Authorization: `Bearer ${token}` };
  }

  // Set up the abort controller to cancel the request after 10 seconds
  const controller = new AbortController();
  const signal = controller.signal;
  let abortTimeout: NodeJS.Timeout | null = null;
  const abortListener = () => {
    console.log('Could not connect to authentication server... Offline?');
    clearTimeout(abortTimeout!);
    signal.removeEventListener('abort', abortListener);
  }

  // Add the abort event listener
  if (abortTimeoutInterval) {
    abortTimeout = setTimeout(() => controller.abort(), abortTimeoutInterval);
    signal.addEventListener('abort', abortListener);
  }

  // Make the request
  const response = await fetch(`${baseUrl}${url}`, {
    headers,
    ...options,
    signal,
  });

  // Clear the timeout and remove the event listener
  if (abortTimeout) {
    clearTimeout(abortTimeout);
    signal.removeEventListener('abort', abortListener);
  }

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