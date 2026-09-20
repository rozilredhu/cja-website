/** Secrets / optional vars not always present in wrangler typegen output. */
interface CloudflareEnv {
  MEDIA?: R2Bucket;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_BYPASS?: string;
  NEXT_PUBLIC_SITE_URL?: string;
}
