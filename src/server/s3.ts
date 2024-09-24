import { S3Client } from "@aws-sdk/client-s3";

import { env } from "@/env.mjs";

export const S3 = new S3Client({
  region: "auto",
  endpoint: env.S3_API_URL,
  credentials: {
    accessKeyId: env.S3_API_KEY_ID,
    secretAccessKey: env.S3_API_KEY,
  },
});
