# NestJS and Next.js Hybrid Starter Template

Starter template that incorporates a **Next.js** frontend with a **NestJS** backend.

## Description

This project is a starter template that combines [NestJS](https://nestjs.com/) and [Next.js](https://nextjs.org/) to build a full-stack application with server-side rendering (SSR) and API capabilities. The current implementation includes example code for posts and blogs to demonstrate the integration between the frontend and backend.

The goal of this template is to provide a solid foundation for building applications that can be extended with UI components from [shadcn/ui](https://ui.shadcn.com/) and backend modules for features like authentication, user profiles, blogs, and more. Future enhancements include CLI commands to install and configure popular tools like Tailwind CSS, Prisma, and add frontend or backend modules to the project.

## Features

- **Next.js Frontend**: A React-based frontend with server-side rendering.
- **NestJS Backend**: A robust backend framework for building scalable server-side applications.
- **API Integration**: Demonstrates how to fetch data from the NestJS API in Next.js pages.
- **Example Modules**: Includes example code for posts and blogs.
- **TypeScript**: Written entirely in TypeScript for type safety and better developer experience.
- **Testing Setup**: Configured with Jest for unit and integration testing.
- **Linting and Formatting**: ESLint and Prettier are set up for code quality and consistency.
- **Hot Reloading**: Nodemon is configured for development to automatically restart the server on code changes.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js (v14.x or later) installed.
- **npm or Yarn**: Use npm (comes with Node.js) or install Yarn.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/nightness/nested-nextjs
   cd nested-nextjs
   ```

2. **Install Dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Or using Yarn:

   ```bash
   yarn install
   ```

### Running the Application

#### Development Mode

To start the application in development mode with hot reloading:

```bash
npm run dev
```

This command runs the NestJS server and Next.js frontend together. The application will be available at `http://localhost:3000`.

#### Production Mode

To build and run the application in production mode:

```bash
npm run build
npm start
```

## Project Structure

```plaintext
├── app/                    # Next.js frontend application
│   ├── page.tsx            # Home page
│   ├── posts/              # Posts pages
│   │   ├── [id]/page.tsx   # Individual post page
│   │   ├── page.tsx        # Posts list page
│   │   └── posts.module.css# CSS module for posts
│   ├── layout.tsx          # Root layout
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404 page
│   ├── globals.css         # Global CSS
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── src/                    # NestJS backend application
│   ├── app.controller.ts   # Root controller
│   ├── app.module.ts       # Root module
│   ├── main.ts             # Entry point
│   └── blog/               # Blog module
│       ├── blog.controller.ts
│       ├── blog.service.ts
│       └── interfaces/
│           └── post.interface.ts
├── jest.config.json        # Jest configuration
├── next.config.mjs         # Next.js configuration
├── package.json            # Project metadata and scripts
├── tsconfig.json           # TypeScript configuration
├── tsconfig.build.json     # TypeScript build configuration for NestJS
├── tsconfig.server.json    # TypeScript configuration for server-side code
├── eslint.config.mjs       # ESLint configuration
├── .prettierrc             # Prettier configuration
└── nodemon.json            # Nodemon configuration for development
```

## Available Scripts

- **`npm run dev`**: Starts the development server with hot reloading.
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

- **Home Page**: Visit `http://localhost:3000/` to see the welcome message and API response.
- **Posts List**: Navigate to `http://localhost:3000/posts` to view a list of blog posts.
- **Single Post**: Click on any post title to view its content.

### API Endpoints

- **Get Welcome Message**: `GET http://localhost:3000/api/hello`
- **Get All Posts**: `GET http://localhost:3000/api/posts`
- **Get Single Post**: `GET http://localhost:3000/api/posts/:id`

## License

This project is **UNLICENSED**. See the [LICENSE](LICENSE) file for more details.
