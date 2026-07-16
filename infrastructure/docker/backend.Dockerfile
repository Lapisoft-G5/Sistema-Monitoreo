FROM node:22-alpine

# Set working directory
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# We need openssl for Prisma
RUN apk add --no-cache openssl

# Copy all project files to support the monorepo structure
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Generate prisma client inside the backend filter context
RUN pnpm --filter backend exec prisma generate

# Build the backend application
RUN pnpm --filter backend build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "--filter", "backend", "start:prod"]
