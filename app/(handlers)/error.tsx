// app/error.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Error({ error, reset } : {
  error: Error;
  reset: () => void;
}) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    console.error(error);
    if (typeof window !== 'undefined') {
      setUrl(window.location.href);
    }
  }, [error]);

  const statusCode = 500;
  const exceptionMessage = error?.message || '';

  return (
    <div>
      <h1>This is embarrassing. We are having some server issues.</h1>
      <h3>URL: {url}</h3>
      <h3>Status Code: {statusCode}</h3>
      {exceptionMessage && <h3>Message: {exceptionMessage}</h3>}
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          margin: '0 auto',
          width: '100%',
          maxWidth: '600px',
          fontSize: 'larger',
        }}
      >
        <pre>{exceptionMessage}</pre>
        <br />
      </div>
      <section className="error-container">
        <span>5</span>
        <span>
          <span className="screen-reader-text">0</span>
        </span>
        <span>0</span>
      </section>
      <div className="link-container">
        <Link href="https://google.com/" className="more-link">
          Go to Google
        </Link>
      </div>
    </div>
  );
}
