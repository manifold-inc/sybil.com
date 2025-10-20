import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import to from "await-to-js";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { env } from "@/env.mjs";
import { File, genId } from "@/schema/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { S3 } from "@/server/s3";
import { createLogger } from "@/utils/logger";
import { MainSchema } from "../main/schema";

export const CreateFile = z.object({
  name: z.string().min(1),
  size: z.number().default(0),
  mime: z.string(),
});

export const CommitFile = z
  .object({
    threadBlockId: MainSchema.UUID,
    key: z.string().min(1),
  })
  .merge(CreateFile);

const logger = createLogger({ prefix: "[TRPC File]" });

function getS3Key(userId: string, fileName: string) {
  return [userId, genId.file(), fileName].join("/");
}

export const fileRouter = createTRPCRouter({
  createFile: protectedProcedure
    .input(CreateFile)
    .mutation(async ({ input, ctx }) => {
      const publicUserId = ctx.user.id;
      const fileKey = genId.file();
      const key = getS3Key(String(publicUserId), fileKey);
      const [presignedUrl] = await Promise.all([
        getSignedUrl(
          S3,
          new PutObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: key,
            Tagging: String(publicUserId),
            ContentType: input.mime,
          }),
          { expiresIn: 500 }, // this link will be invalid after 500s
        ),
        ctx.db.insert(File).values({
          userId: Number(ctx.user.id),
          size: input.size,
          key: key,
          name: input.name,
        }),
      ]);
      return {
        key,
        presignedUrl,
      };
    }),
  listUserFiles: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({ key: File.key })
      .from(File)
      .where(eq(File.userId, Number(ctx.user.id)));
  }),
  deleteFiles: protectedProcedure
    .input(
      z.object({
        keys: z.string().min(1).array().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [err] = await to(
        S3.send(
          new DeleteObjectsCommand({
            Bucket: env.S3_BUCKET_NAME,
            Delete: {
              Objects: input.keys.map((k) => ({ Key: k })),
            },
          }),
        ),
      );
      if (err) {
        logger.error("failed to delete files", {
          files: input.keys,
          err: err.message,
          cause: err.name,
        });
        return;
      }
      await ctx.db.delete(File).where(inArray(File.key, input.keys));
    }),
});
