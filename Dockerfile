# syntax=docker/dockerfile:1
# Multi-stage build for production

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with secrets (uses 'vite build' - no lint/type check)
# Env vars from secret file are loaded at build time for Vite to inline
RUN --mount=type=secret,id=envfile \
    if [ -f /run/secrets/envfile ]; then \
        export $(cat /run/secrets/envfile | grep -v '^#' | xargs); \
    fi && \
    npm run build

# Stage 2: Production server
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
