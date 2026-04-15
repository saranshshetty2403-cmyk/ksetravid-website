// Minimal request interface — compatible with Express Request and Vercel serverless
// We only need protocol and headers to determine secure cookie settings
export interface MinimalRequest {
  protocol?: string;
  // Accept any object with string/string[] values (matches Express IncomingHttpHeaders)
  headers: { [key: string]: string | string[] | undefined };
}

export type SessionCookieOptions = {
  domain?: string;
  httpOnly: boolean;
  path: string;
  sameSite: "none" | "lax" | "strict";
  secure: boolean;
  maxAge?: number;
};

function isSecureRequest(req: MinimalRequest): boolean {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some((proto: string) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: MinimalRequest
): SessionCookieOptions {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "none" : "lax",
    secure,
  };
}
