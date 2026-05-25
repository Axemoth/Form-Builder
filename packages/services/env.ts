import { z } from "zod";

const envSchema = z
  .object({
    GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
    GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
    GOOGLE_OAUTH_REDIRECT_URI: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasId = !!data.GOOGLE_OAUTH_CLIENT_ID;
    const hasSecret = !!data.GOOGLE_OAUTH_CLIENT_SECRET;
    const hasRedirect = !!data.GOOGLE_OAUTH_REDIRECT_URI;

    // If any of the variables are provided, all three must be provided.
    if (hasId || hasSecret || hasRedirect) {
      if (!hasId || !hasSecret || !hasRedirect) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Google OAuth configuration is incomplete. You must define all three variables (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI) or none of them.",
        });
      }
    }
  });

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
