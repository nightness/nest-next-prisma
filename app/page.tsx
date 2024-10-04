// app/tasks/page.tsx

import React from 'react';
import Link from 'next/link';
import styles from './(styles)/app.module.css';

const features = [
  {
    title: 'Unified Codebase',
    description: 'Frontend and backend in a single repository for easier management.',
  },
  {
    title: 'Prisma ORM',
    description: 'Type-safe database interactions with a shared schema.',
  },
  {
    title: 'Dockerized Environment',
    description: 'Consistent development and production setups using Docker. The Docker development environment supports hot-reloading.',
  },
  {
    title: 'Hybrid Server',
    description: 'Serve both Next and Nest through a single Express server.',
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
        <div className={styles.feature}>
          <div className={styles.footer}>
            <p>
              Get started by editing <code>app/page.tsx</code>
            </p>
            <Link href="/api/hello">Visit API Endpoint</Link>
            {' | '}
            <Link href="/swagger">View Swagger Docs</Link>
            {' | '}
            <Link href="/tasks">Task List Example</Link>
            {' | '}
            <Link href="/auth">Authentication Pages</Link>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        {features.map((feature) => (
          <div key={feature.title} className={styles.feature}>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
