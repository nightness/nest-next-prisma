# Stage 1: Build the application
FROM node:18 AS builder
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
COPY system ./system/
RUN npm install
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build both NestJS and Next.js applications
RUN npm run build

# Stage 2: Run the application
FROM node:18
WORKDIR /usr/src/app

# Copy necessary files from the builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/.nest ./.nest
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/system ./system

# Install netcat-openbsd and set timezone
RUN apt-get update && apt-get install -y netcat-openbsd tzdata

#ENV TZ=America/New_York
#ENV TZ=America/Chicago
#ENV TZ=America/Denver
#ENV TZ=America/Los_Angeles
#ENV TZ=America/Anchorage
#ENV TZ=Pacific/Honolulu
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Expose port
EXPOSE 3000

# Set the default command
CMD ["npm", "run", "start"]
