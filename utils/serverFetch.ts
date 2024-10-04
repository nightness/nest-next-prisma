import { getBaseUrl } from "./getBaseUrl";

export async function serverFetch<T>(url: string, options: RequestInit): Promise<[number, T | null]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });


  if (!response.ok) {
    let error = 'Request failed';
    try {
      error = await response.text();
    } catch (e) {}
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