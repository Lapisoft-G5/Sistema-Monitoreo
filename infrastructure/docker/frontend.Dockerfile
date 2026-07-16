# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package configurations first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/ ./packages/

# Install dependencies (frozen lockfile ensures reproducible builds)
# Need to copy everything since the workspace relies on linking packages
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build the frontend application
# Pass environment variables if needed by Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter frontend build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS production

# Copy the custom nginx configuration to handle SPA routing
COPY infrastructure/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the builder stage
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
