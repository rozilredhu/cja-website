import { getCloudflareContext } from "@opennextjs/cloudflare";

/** D1 binding helper. Prefer async in Server Components / Actions. */
export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) {
    throw new Error("D1 binding DB is not configured");
  }
  return env.DB;
}

export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

/** Optional until R2 is enabled on the Cloudflare account. */
export async function getMediaBucket(): Promise<R2Bucket | null> {
  const env = await getEnv();
  return env.MEDIA ?? null;
}
