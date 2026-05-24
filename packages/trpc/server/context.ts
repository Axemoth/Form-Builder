import * as trpcExpress from "@trpc/server/adapters/express";
import * as express from "express";

export async function createContext({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions): Promise<{
  req: express.Request;
  res: express.Response;
  token: string | null;
}> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  return {
    req,
    res,
    token,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
