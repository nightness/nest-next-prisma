# Full Stack PWA Starter Template with Next.js, NestJS, Prisma, and Docker

Welcome to the **Full Stack PWA Starter Template**, a robust boilerplate that combines the power of **Next.js**, **NestJS**, **Prisma**, and **Docker** to accelerate your development workflow. This template provides a seamless integration between the frontend and backend, sharing the same project structure and ORM schema, all while leveraging Docker for both development and production environments.

## Table of Contents

- [Features](#features)
- [Benefits of Tight Coupling](#benefits-of-tight-coupling)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
    - [Development Mode](#development-mode)
    - [Production Mode](#production-mode)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Usage](#usage)
  - [Accessing the Application](#accessing-the-application)
  - [Choosing Your UI Library](#choosing-your-ui-library)
- [Docker Details](#docker-details)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- **Single project Structure**: No monorepo setup required; frontend and backend in the same project.
- **Next.js Frontend**: React-based frontend with server-side rendering and PWA capabilities.
- **NestJS Backend**: Scalable backend framework with modular architecture.
- **Prisma ORM**: Type-safe database interactions with a shared schema.
- **Dockerized Environment**: Consistent development and production setups using Docker.
- **Live Reloading**: Instant code updates during development with filesystem syncing.
- **Hybrid Server**: Serve both frontend and backend through a single Express server.
- **Swagger Documentation**: Auto-generated API docs for seamless API exploration.
- **TypeScript Support**: End-to-end type safety across the stack.
- **Testing Suite**: Pre-configured Jest for unit and integration tests.
- **Linting and Formatting**: ESLint and Prettier for code consistency.
- **UI Library Agnostic**: Allows you to choose your preferred UI component library and CSS toolset.

## Benefits of Tight Coupling

By tightly integrating **Next.js**, **NestJS**, **Prisma**, and **Docker**, this template offers:

- **Unified Development Experience**: Seamlessly navigate between frontend and backend code in a single project.
- **Shared Types and Schemas**: Reduce duplication and errors by sharing Prisma models and TypeScript interfaces.
- **Consistent Environments**: Docker ensures that development and production environments mirror each other.
- **Simplified Setup**: One-time setup for all services, reducing configuration overhead.
- **Enhanced Productivity**: Live reloading and shared codebase accelerate development speed.
- **Scalability**: Modular architecture allows for easy expansion and maintenance.
- **Flexibility in UI Development**: Choose any UI component library and CSS toolset that fits your project's needs.
- **Nest/Express Routing**: All Next and Nest routes are served through a single Express server. This allows for easy API integration and server-side rendering.

## Getting Started

### Prerequisites

- **Node.js**: Version 18.x or later.
- **Package Manager**: npm, yarn, or pnpm.
- **Docker**: Installed and running.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/nightness/nest-next-prisma.git
   cd nest-next-prisma
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

### Running the Application

#### Development Mode

Start the application in development mode with Docker:

```bash
npm run docker:dev
```

This command builds and runs the Docker containers defined in `docker-compose.dev.yml`, enabling live updates and syncing code changes without restarting the server.

Alternatively, run the application without Docker:

```bash
npm run dev
```

#### Production Mode

Build and run the application in production mode with Docker:

```bash
npm run docker:start
```

This uses the `docker-compose.yml` configuration to build optimized production containers.

To run the application in production without Docker:

```bash
npm run build
npm start
```

## Project Structure

```plaintext
├── app/                    # Next.js frontend
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
├── src/                    # NestJS backend
│   ├── app.controller.ts   # Main controller
│   ├── app.module.ts       # Main module
│   ├── main.ts             # Application entry point
├── prisma/                 # Prisma schema and migrations
├── docker-compose.yml      # Production Docker configuration
├── docker-compose.dev.yml  # Development Docker configuration
├── start-hybrid.js         # Script to start hybrid server
├── package.json            # Project scripts and dependencies
└── ...                     # Additional configuration files
```

## Available Scripts

- **`npm run dev`**: Start development server without Docker.
- **`npm run build`**: Build the application for production.
- **`npm start`**: Start the production server.
- **`npm run lint`**: Lint codebase using ESLint.
- **`npm run format`**: Format code using Prettier.
- **`npm run test`**: Run tests with Jest.
- **`npm run docker:dev`**: Start development environment with Docker.
- **`npm run docker:start`**: Start production environment with Docker.
- **`npm run docker:down`**: Stop and remove Docker containers.
- **`npm run prisma:generate`**: Generate Prisma client.
- **`npm run prisma:studio`**: Open Prisma Studio.

## Usage

### Accessing the Application

- **Frontend**: `http://localhost:3000/`
- **Backend**: `http://localhost:3000/api`
- **Swagger API Docs**: `http://localhost:3000/swagger`

### Choosing Your UI Library

This template is UI library agnostic, meaning you can integrate any UI component library and CSS toolset of your choice. Whether you prefer **Tailwind CSS**, **Material UI**, **Bootstrap**, **Chakra UI**, **Shadcn** or any other library, the template provides a solid foundation for you to build upon.

**To integrate your preferred UI library:**

1. Install the library using your package manager:

   ```bash
   npm install your-ui-library
   ```

2. Import and use the components in your Next.js pages and components.

3. Configure any necessary theme providers or global styles as per the library's documentation.

## Docker Details

- **Development Environment**: `docker-compose.dev.yml` sets up containers with live reloading and volume mappings for code syncing.
- **Production Environment**: `docker-compose.yml` builds optimized containers suitable for deployment.

Services included:

- **App**: The combined Next.js and NestJS application.
- **MySQL**: Database service for data persistence.
- **Redis**: In-memory data store for caching and sessions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
