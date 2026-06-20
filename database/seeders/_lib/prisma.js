import '../../../apps/backend/node_modules/dotenv/config.js';
import { PrismaClient } from '../../../apps/backend/src/generated/prisma/client.js';
import { PrismaPg } from '../../../apps/backend/node_modules/@prisma/adapter-pg/dist/index.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no esta definida. Verifica apps/backend/.env');
}

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export async function disconnect() {
  await prisma.$disconnect();
}
