// layout.tsx
import { AuthProvider } from './auth/provider';
import './(styles)/globals.css';

export const metadata = {
  title: 'Full Stack PWA Starter Template',
  description: 'The React Stack for Production',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
