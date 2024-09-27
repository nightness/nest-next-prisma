// app/utils/getBaseUrl.ts
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Client-side: Use relative URL
    return '';
  }
  // Server-side
  return process.env.BASE_URL || 'http://localhost:3000';
}
