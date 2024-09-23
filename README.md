# NestJS and Next.js Hybrid Starter Template

Starter template that incorporates a **Next.js** frontend with a **NestJS** backend.

## Description

This project is a starter template that combines [NestJS](https://nestjs.com/) and [Next.js](https://nextjs.org/) to build a full-stack application in a single project. The template is designed to provide a solid foundation for building applications with modern React features and Material UI components.

The current implementation includes example code for a dashboard and demonstrates how to integrate Material UI (MUI) v6 with Next.js and NestJS. It also shows how to properly configure client-side components using the `"use client"` directive required by Next.js for components that utilize React hooks or state.

Next runs as first piece of Nest middleware. All Nest routes start with the `/api/` prefix, all other routes are handled by Next.

## Features

- **Next.js Frontend**: A React-based frontend with server-side rendering, utilizing the Next.js app directory structure.
- **NestJS Backend**: A robust backend framework for building scalable server-side applications.
- **Material UI Integration**: Demonstrates how to integrate MUI v6 with Next.js, including theming and styled components.
- **TypeScript**: Written entirely in TypeScript for type safety and better developer experience.
- **Prisma ORM**: Prisma ORM enables working with your favorite database in an intuitive type-safe way.
- **Testing Setup**: Configured with Jest for unit and integration testing.
- **Linting and Formatting**: ESLint and Prettier are set up for code quality and consistency.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js (v16.x or later) installed.
- **npm, yarn, pnpm**: Use to manage dependencies.

### Installation

1. **Clone the Repository**
2. **Install Dependencies**

   ```bash
   npm install
   ```

### Running the Application

#### Development Mode

To start the application in development mode:

```bash
npm run dev
```

This command runs both the NestJS server and the Next.js frontend together. The application will be available at `http://localhost:3000`.

#### Production Mode

To build and run the application in production mode:

```bash
npm run build
npm start
```

## Project Structure

```plaintext
├── app/                    # Next.js frontend application
│   ├── _dashboard/         # Dashboard components
│   │   ├── Dashboard.tsx
│   │   └── components/
│   │       ├── AppNavbar.tsx
│   │       └── MenuButton.tsx
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404 page
│   ├── globals.css         # Global CSS
│   ├── theme/              # MUI theme configuration
│   │   └── index.ts        # Theme setup
│   └── types/              # TypeScript types
├── src/                    # NestJS backend application
│   ├── app.controller.ts   # Root controller
│   ├── app.middleware.ts   # Middleware
│   ├── app.module.ts       # Root module
│   ├── main.ts             # Entry point
├── jest.config.json        # Jest configuration
├── next.config.js          # Next.js configuration
├── package.json            # Project metadata and scripts
├── tsconfig.json           # TypeScript configuration
├── tsconfig.build.json     # TypeScript build configuration for NestJS
├── tsconfig.server.json    # TypeScript configuration for server-side code
├── eslint.config.mjs       # ESLint configuration
├── .prettierrc             # Prettier configuration
└── start-dev.js            # Custom development server script
```

## Available Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the application for production.
- **`npm start`**: Starts the built application in production mode.
- **`npm run lint`**: Runs ESLint to check for linting errors.
- **`npm run lint:fix`**: Runs ESLint and fixes fixable linting errors.
- **`npm run format`**: Formats code using Prettier.
- **`npm run test`**: Runs tests using Jest.
- **`npm run test:watch`**: Runs tests in watch mode.
- **`npm run test:coverage`**: Runs tests and generates a coverage report.

## Usage

### Accessing the Application

- **Home Page**: Visit `http://localhost:3000/` to see the home page.
- **Dashboard**: Navigate to `http://localhost:3000/dashboard` to view the dashboard (if implemented).

### Notes on Next.js and Client Components

- **Client Components**: Components that use React hooks, state, or other client-side features must include the `"use client"` directive at the top of the file.
- **Example**:

  ```tsx
  // app/page.tsx

  "use client";

  import React from 'react';

  const HomePage = () => {
    // React hooks and state can be used here
    return <div>Welcome to the Home Page</div>;
  };

  export default HomePage;
  ```

### Material UI Integration

- **MUI v6**: The project uses Material UI version 6.
- **Importing Components and Utilities**:

  - Import `styled` and other utilities directly from `'@mui/material'`.
  - Ensure that all MUI-related imports are consistent and up-to-date.

- **Theme Configuration**:

  - The MUI theme is configured in `app/theme/index.ts`.

## Important Configuration Notes

- **TypeScript Configuration**: Ensure that your `tsconfig.json` and `tsconfig.server.json` files have correct configurations for both client and server code.
- **Dependencies**:

  - Ensure that all MUI and Emotion packages are on compatible versions.
  - Use the following versions (or update to the latest compatible versions):

    ```json
    {
      "dependencies": {
        "@mui/material": "^6.1.1",
        "@mui/system": "^6.1.1",
        "@emotion/react": "^11.11.0",
        "@emotion/styled": "^11.11.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "next": "^13.5.0"
      }
    }
    ```

## License

This project is **UNLICENSED**. See the [LICENSE](LICENSE) file for more details.

## Notes

- **No Nodemon**: The project does **not** use Nodemon. Hot reloading is handled by Next.js during development and a custom Nest server run script.
- **Development Server**: A custom script `start-dev.js` is used to start the development server and watch for changes.

## Conclusion

This updated template provides a modern starting point for building full-stack applications with NestJS and Next.js, integrating Material UI components, and following best practices for client-side React development.
