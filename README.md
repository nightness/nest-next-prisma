# NestJS and Next.js Hybrid Starter Template

Starter template that incorporates a **Next.js** frontend with a **NestJS** backend, both sharing the same project structure and Prisma ORM schema. The template also includes Docker setup for both production and development environments, with live updates enabled during development.

## Description

This project is a starter template that combines [NestJS](https://nestjs.com/) and [Next.js](https://nextjs.org/) to build a full-stack Progressive Web application. It uses a shared Prisma ORM schema for database interactions. Running the two together allows Express to serve both backend and frontend through a single server.

Docker support is built in to streamline deployment in both development and production environments. Development mode supports live updates with filesystem syncing, ensuring code changes are automatically reflected without restarting the server.

The project structure includes a `src/` directory for the NestJS backend and an `app/` directory for the Next.js (app router) frontend and other project-root level folders (not already used) can be used by Next. The `start-hybrid.js` script allows both servers to run together; with Next running as Nest/Express middleware. All Nest routes start with the `/api/` prefix. Nest also handles the `/css/` and `/swagger/` prefixes, all other routes are handled by Next. These routes are also not cached by the PWA service worker.

## Features

- **Next.js Frontend**: A React-based frontend with server-side rendering.
- **NestJS Backend**: A backend framework built to scale.
- **Material UI Integration**: Integrates Material UI (v6) for a modern UI framework.
- **TypeScript Support**: Written entirely in TypeScript for type safety.
- **Hybrid Server**: Both Next.js and NestJS run together using a custom script.
- **Swagger API Documentation**: Auto-generated API documentation using Swagger.
- **Prisma ORM**: Simplifies database interaction through type-safe queries.
- **Testing Setup**: Jest is configured for both unit and integration testing.
- **Linting and Formatting**: ESLint and Prettier are used to ensure code consistency.
- **Docker Support**:
  - **Production**: Docker setup for production with proper environment management.
  - **Development**: Docker environment supports live updates using file watching.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js (v18.x or later) installed.
- **npm, yarn, pnpm**: Use your preferred package manager to manage dependencies.
- **Docker**: Install Docker to use the containerized environment.

### Installation

1. **Clone the Repository**
2. **Install Dependencies**

   ```bash
   npm install
   ```

### Running the Application

#### Development Mode

To start the application in development mode with Docker:

```bash
docker-compose -f docker-compose.dev.yml up --build
```
Or use the npm script:
```bash
npm run docker:dev
```

This will bring up the entire development environment (NestJS and Next.js) in Docker with live updates enabled. Any changes made to the codebase will be reflected without needing to restart the container.

Alternatively, you can run the app without Docker:

Or use the npm script:
```bash
npm run dev
```

#### Production Mode

To build and run the application in production mode with Docker:

```bash
docker-compose up --build
```

This starts the container with the application built for production. The application will be available at `http://localhost:3000`.

You can also run the application in production without Docker:

```bash
npm run build
npm start
```

## Project Structure

```plaintext
├── app/                    # Next.js frontend application
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global CSS
│   └── theme/              # MUI theme configuration
├── src/                    # NestJS backend application
│   ├── app.controller.ts   # Root controller
│   ├── app.module.ts       # Root module
│   ├── main.ts             # Entry point
├── docker-compose.yml       # Docker configuration for production
├── docker-compose.dev.yml   # Docker configuration for development (with live updates)
├── start-hybrid.js         # Custom script to start the hybrid server
├── jest.config.json        # Jest configuration
├── next.config.js          # Next.js configuration
├── package.json            # Project metadata and scripts
├── tsconfig.json           # TypeScript configuration
└── tsconfig.server.json    # TypeScript configuration for server-side code
```

## Available Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the application for production.
- **`npm start`**: Starts the production server.
- **`npm run lint`**: Lints the codebase using ESLint.
- **`npm run lint:fix`**: Fixes fixable linting errors.
- **`npm run format`**: Formats code using Prettier.
- **`npm run test`**: Runs tests with Jest.
- **`npm run docker:dev`**: Starts the development environment using Docker, but with live updates.
- **`npm run docker:start`**: Starts the production environment using Docker.
- **`npm run docker:down`**: Stops and removes the Docker containers.
- **`npm run docker:clean`**: Stops and removes the Docker containers and volumes.
- **`npm run docker:logs`**: Shows the logs of the Docker containers.
- **`npm run docker:prune`**: Removes all stopped Docker containers.
- **`npm run docker:shell`**: Opens a shell in the Docker container.

## Usage

### Accessing the Application

- **Home Page**: Visit `http://localhost:3000/` to see the home page.
- **Swagger API Docs**: Access the Swagger API docs at `http://localhost:3000/swagger`.

### Material UI Integration

- **Theme Configuration**: The MUI theme is configured in `app/theme/index.ts`.

## Docker Details

The application is set up with Docker for both development and production environments:

- **Production Docker**: The `docker-compose.yml` file configures the production environment, including Redis and MySQL services.
- **Development Docker (with live updates)**: The `docker-compose.dev.yml` file is configured for development with live updates, ensuring the containers reload automatically when code changes are detected. The volume mappings ensure your changes in the host filesystem are synced with the Docker container.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Acknowledgements

- [Modernize-Nextjs-Free](https://github.com/adminmart/Modernize-Nextjs-Free) - The frontend template used.
