import { AuthProvider } from "./auth/provider"

export const metadata = {
  title: 'Next.js + Nest + Prisma + TypeScript + Jest + ESLint + Prettier + Docker + PWA',
  description: 'The React Stack for Production',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
