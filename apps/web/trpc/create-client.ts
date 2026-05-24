import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (env.NEXT_PUBLIC_API_URL) return env.NEXT_PUBLIC_API_URL;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: `${getBaseUrl()}/trpc`,
    fetch(url, options) {
      const headers = new Headers(options?.headers);
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("axeform_auth_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    },
  });
};
