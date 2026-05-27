import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db, eq } from "@repo/database";
import { users, emailVerifications } from "@repo/database/schema";
import { sendVerificationEmail } from "../../services/email";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

const authResultSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().nullable(),
    role: z.string(),
  }),
});

export const authRouter = router({
  getSupportedAuthenticationProviders: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
    .query(async () => {
      const supportedMethods = await userService.getAuthenticationMethods();
      return supportedMethods;
    }),

  loginWithGoogleCode: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/google-login"), tags: TAGS } })
    .input(z.object({ code: z.string() }))
    .output(authResultSchema)
    .mutation(async ({ input }) => {
      const result = await userService.loginWithGoogleCode(input.code);
      return result;
    }),

  signup: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signup"), tags: TAGS } })
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      }),
    )
    .output(authResultSchema)
    .mutation(async ({ input }) => {
      const result = await userService.signupWithCredentials(
        input.name,
        input.email,
        input.password,
      );

      // Auto-generate credentials verification token & dispatch email (sandbox visual logs supported)
      try {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.insert(emailVerifications).values({
          userId: result.user.id,
          token,
          expiresAt,
        });

        await sendVerificationEmail({ to: result.user.email, token });
      } catch (err) {
        console.error("Failed to generate or send email verification token on signup:", err);
      }

      return result;
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/login"), tags: TAGS } })
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      }),
    )
    .output(authResultSchema)
    .mutation(async ({ input }) => {
      const result = await userService.loginWithCredentials(input.email, input.password);
      return result;
    }),

  verifyEmail: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/verify-email"), tags: TAGS } })
    .input(z.object({ token: z.string().min(1) }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      // Find matching token
      const [verification] = await db
        .select()
        .from(emailVerifications)
        .where(eq(emailVerifications.token, input.token));

      if (!verification) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification link or token.",
        });
      }

      if (new Date() > verification.expiresAt) {
        // Delete expired token
        await db.delete(emailVerifications).where(eq(emailVerifications.id, verification.id));
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification link has expired. Please request a new one.",
        });
      }

      // Update user status and delete token in a database transaction
      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ emailVerified: true })
          .where(eq(users.id, verification.userId));
        await tx.delete(emailVerifications).where(eq(emailVerifications.id, verification.id));
      });

      return {
        success: true,
        message: "Email verified successfully!",
      };
    }),

  resendVerificationEmail: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/resend-verification"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ ctx }) => {
      const userEmail = ctx.user.email;
      const userId = ctx.user.id;

      // Check if user is already verified
      const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
      if (userRecord?.emailVerified) {
        return {
          success: true,
          message: "Email is already verified.",
        };
      }

      // Generate new token (expires in 24 hours)
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Upsert token in a database transaction
      await db.transaction(async (tx) => {
        await tx.delete(emailVerifications).where(eq(emailVerifications.userId, userId));
        await tx.insert(emailVerifications).values({
          userId,
          token,
          expiresAt,
        });
      });

      // Dispatch verification email
      await sendVerificationEmail({ to: userEmail, token });

      return {
        success: true,
        message: "Verification email resent successfully!",
      };
    }),

  me: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        avatar: z.string().nullable(),
        role: z.string(),
        emailVerified: z.boolean(),
      }),
    )
    .query(async ({ ctx }) => {
      const [userRecord] = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id));

      if (!userRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        avatar: userRecord.avatar,
        role: userRecord.role,
        emailVerified: userRecord.emailVerified,
      };
    }),
});
