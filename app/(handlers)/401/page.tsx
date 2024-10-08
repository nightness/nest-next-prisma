// app/401/page.js
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Unauthorized',
};

export default function UnauthorizedPage() {
  const headersList = headers();
  const referer = headersList.get('referer') || '';
  const url = referer || '';

  return (
    <div>
      <h1>Please login first!</h1>
      <h3>{url}</h3>
      <section className="error-container">
        <span>4</span>
        <span>
          <span className="screen-reader-text">0</span>
        </span>
        <span>1</span>
      </section>
      <p className="zoom-area">
        <Image
          src="/images/EmojiShrug.png"
          alt="Emoji Shrug"
          width={300}
          height={300}
        />
      </p>
      <div className="link-container">
        <Link href="https://google.com/" className="more-link">
          Go to Google
        </Link>
      </div>
    </div>
  );
}
