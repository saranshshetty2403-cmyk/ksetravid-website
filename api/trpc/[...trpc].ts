/**
 * Vercel Serverless Function — tRPC handler
 * All /api/trpc/* requests are handled here.
 * This file is the entry point for the Vercel deployment.
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Wrap the import in a try/catch to surface module-load errors
let appRouter: any = null;
let importError: Error | null = null;

try {
  const mod = await import("../../server/routers.js");
  appRouter = mod.appRouter;
} catch (err: any) {
  importError = err;
  console.error("[Vercel] Failed to import appRouter:", err?.message, err?.stack);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // If the router failed to load, return a descriptive error
  if (importError || !appRouter) {
    const msg = importError?.message ?? "appRouter not loaded";
    console.error("[Vercel] Handler called but router unavailable:", msg);
    res.status(500).json({ error: "Server initialization failed", detail: msg });
    return;
  }

  // Convert Vercel req/res to Fetch API Request/Response for tRPC fetch adapter
  const url = `https://${req.headers.host}${req.url}`;

  // Build headers from Vercel request
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  // Build body for non-GET requests
  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = JSON.stringify(req.body);
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
  });

  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: async () => {
        // Parse cookies from the Cookie header
        const cookieHeader = req.headers.cookie ?? "";
        const cookies: Record<string, string> = {};
        cookieHeader.split(";").forEach(part => {
          const [k, ...v] = part.trim().split("=");
          if (k) cookies[k.trim()] = decodeURIComponent(v.join("="));
        });

        return {
          user: null, // Manus OAuth not used on Vercel
          req: {
            ...req,
            cookies,
            protocol: req.headers["x-forwarded-proto"] as string ?? "https",
          } as any,
          res: {
            cookie: (name: string, value: string, options: any) => {
              const cookieParts = [`${name}=${encodeURIComponent(value)}`];
              if (options?.maxAge) cookieParts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
              if (options?.httpOnly) cookieParts.push("HttpOnly");
              if (options?.secure) cookieParts.push("Secure");
              if (options?.sameSite) cookieParts.push(`SameSite=${options.sameSite}`);
              if (options?.path) cookieParts.push(`Path=${options.path}`);
              res.setHeader("Set-Cookie", cookieParts.join("; "));
            },
            clearCookie: (name: string, options: any) => {
              const cookieParts = [`${name}=`];
              cookieParts.push("Max-Age=0");
              if (options?.httpOnly) cookieParts.push("HttpOnly");
              if (options?.secure) cookieParts.push("Secure");
              if (options?.sameSite) cookieParts.push(`SameSite=${options.sameSite}`);
              if (options?.path) cookieParts.push(`Path=${options.path}`);
              res.setHeader("Set-Cookie", cookieParts.join("; "));
            },
          } as any,
        };
      },
      onError: ({ error }) => {
        if (error.code !== "UNAUTHORIZED" && error.code !== "NOT_FOUND") {
          console.error("[tRPC Error]", error);
        }
      },
    });

    // Write response back to Vercel
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const responseBody = await response.text();
    res.send(responseBody);
  } catch (err: any) {
    console.error("[Vercel] Request handler crashed:", err?.message, err?.stack);
    res.status(500).json({ error: "Request handler crashed", detail: err?.message });
  }
}
