import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { db, eq } from "@repo/database";
import { sessions, users } from "@repo/database/schema";

import { createContext } from "./context";

export const tRPCContext = initTRPC.meta<OpenApiMeta>().context<typeof createContext>().create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

// Authentication Middleware
const isAuthed = tRPCContext.middleware(async ({ ctx, next }) => {
  if (!ctx.token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication session token is missing. Please log in first.",
    });
  }

  // Look up session
  const [session] = await db.select().from(sessions).where(eq(sessions.token, ctx.token));

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Session not found or invalid session token.",
    });
  }

  if (new Date() > session.expiresAt) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    });
  }

  // Look up user
  const [user] = await db.select().from(users).where(eq(users.id, session.userId));

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User associated with this session no longer exists.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

export const protectedProcedure = tRPCContext.procedure.use(isAuthed);

// Admin Authorization Procedure (inherits 'user' from protectedProcedure)
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Access Denied: You do not have permission to access Fleet Admiral Headquarters.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
