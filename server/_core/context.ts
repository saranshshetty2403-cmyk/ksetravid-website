import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"] & { cookies?: Record<string, string> };
  res: CreateExpressContextOptions["res"] & {
    cookie?: (name: string, value: string, options?: any) => void;
    clearCookie?: (name: string, options?: any) => void;
  };
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req as TrpcContext["req"],
    res: opts.res as TrpcContext["res"],
    user,
  };
}
