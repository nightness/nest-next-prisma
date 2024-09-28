# Stage 1: Build the application
FROM node:18 AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npx prisma generate
# RUN npm run build
# COPY --from=builder /usr/src/app/.nest ./
# COPY --from=builder /usr/src/app/.next ./
# COPY --from=builder /usr/src/app/prisma ./
# COPY --from=builder /usr/src/app/package.* ./
# COPY --from=builder /usr/src/app/next.* ./
# COPY --from=builder /usr/src/app/postcss.config.mjs ./
# COPY --from=builder /usr/src/app/tsconfig.* ./
# COPY --from=builder /usr/src/app/.env ./
# COPY --from=builder /usr/src/app/nest-cli.json ./
# COPY --from=builder /usr/src/app/start-hybrid.js ./


# Stage 2: Run the application
FROM node:18
WORKDIR /usr/src/app
# COPY --from=builder /usr/src/app/.nest ./
# COPY --from=builder /usr/src/app/.next ./
# COPY --from=builder /usr/src/app/prisma ./
# COPY --from=builder /usr/src/app/package.* ./
# COPY --from=builder /usr/src/app/next.* ./
# COPY --from=builder /usr/src/app/postcss.config.mjs ./
# COPY --from=builder /usr/src/app/tsconfig.* ./
# COPY --from=builder /usr/src/app/.env ./
# COPY --from=builder /usr/src/app/nest-cli.json ./
# COPY --from=builder /usr/src/app/start-hybrid.js ./
COPY --from=builder /usr/src/app ../

# Install netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd
COPY . .
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "dist/main"]
