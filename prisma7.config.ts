import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { defineConfig } from 'prisma/config';

const env = dotenv.config();
dotenvExpand.expand(env);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.POSTGRES_URI,
  },
});
