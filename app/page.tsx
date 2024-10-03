// app/page.tsx
import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

const features = [
  {
    title: 'Unified Codebase',
    description: 'Frontend and backend in a single repository for easier management.',
  },
  {
    title: 'Next.js Frontend',
    description: 'React-based frontend with server-side rendering and PWA capabilities.',
  },
  {
    title: 'NestJS Backend',
    description: 'Scalable backend framework with modular architecture.',
  },
  {
    title: 'Prisma ORM',
    description: 'Type-safe database interactions with a shared schema.',
  },
  {
    title: 'Dockerized Environment',
    description: 'Consistent development and production setups using Docker.',
  },
  {
    title: 'Live Reloading',
    description: 'Instant code updates during development with filesystem syncing.',
  },
  {
    title: 'Hybrid Server',
    description: 'Serve both frontend and backend through a single Express server.',
  },
  {
    title: 'Swagger Documentation',
    description: 'Auto-generated API docs for seamless API exploration.',
  },
  {
    title: 'TypeScript Support',
    description: 'End-to-end type safety across the stack.',
  },
  {
    title: 'Testing Suite',
    description: 'Pre-configured Jest for unit and integration tests.',
  },
  {
    title: 'Linting and Formatting',
    description: 'ESLint and Prettier for code consistency.',
  },
  {
    title: 'UI Library Agnostic',
    description: 'Choose any UI component library and CSS toolset.',
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Full Stack PWA Starter Template</h1>
      <p className={styles.description}>
        A robust boilerplate combining Next.js, NestJS, Prisma, and Docker.
      </p>

      <div className={styles.features}>
        {features.map((feature) => (
          <div key={feature.title} className={styles.feature}>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <p>
          Get started by editing <code>app/page.tsx</code>
        </p>
        <Link href="/api/hello">Visit API Endpoint</Link>
        {' | '}
        <Link href="/swagger">View Swagger Docs</Link>
      </footer>
    </main>
  );
}
