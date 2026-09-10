FROM node:22-alpine

# Set working directory
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# We need openssl for Prisma and Chromium with system fonts for Puppeteer PDF reports
RUN apk add --no-cache openssl chromium nss freetype harfbuzz ca-certificates ttf-freefont

# Configure Puppeteer to use the system installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy all project files to support the monorepo structure
COPY . .

# Install dependencies
ENV CI=true
RUN pnpm install --frozen-lockfile

# Generate prisma client inside the backend filter context
RUN pnpm --filter backend exec prisma generate

# Build backend and all its workspace dependencies in topological order
RUN pnpm --filter backend... run build

# Expose port
EXPOSE 3000

# Run pending database migrations and start the application
CMD ["sh", "-c", "pnpm --filter backend exec prisma migrate deploy && pnpm --filter backend start:prod"]
