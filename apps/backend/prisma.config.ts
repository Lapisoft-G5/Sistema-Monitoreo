import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node --env-file=.env --import tsx ../../database/seeders/dev-seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/monitoring',
  },
});