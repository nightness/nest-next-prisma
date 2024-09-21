// app/layout.tsx
import React from 'react';
import './globals.css';

export const metadata = {
  title: 'NestJS with Next.js',
  description:
    'An application integrating Next.js frontend with NestJS backend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
