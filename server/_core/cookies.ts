// Minimal request interface — works with both Express and Vercel serverless
interface MinimalRequest {
  protocol?: string;
  headers?: Record<string, string | string[] | undefined>;
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

  const forwardedProto = req.headers?.["x-forwarded-proto"];
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
