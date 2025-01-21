import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['production', 'development']).optional(),
    ENVIRONMENT: z.enum(['production', 'development']).optional(),

    SITE_URL: z.string().url().optional(),
    VERCEL_URL: z.string().optional(),
    INTERNAL_API_SECRET: z.string().min(1),

    GOOGLE_SERVICE_KEY_B64: z.string().optional(),
    BIGQUERY_DATASET: z.string().optional(),
    BIGQUERY_LOCATION: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_ANALYTICS_SCRIPT: z.string().optional(),
    NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ANALYTICS_SCRIPT: process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },
  emptyStringAsUndefined: true,
});
