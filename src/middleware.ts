import NextAuth from "next-auth";
import { middlewareAuthConfig } from "@/server/auth/middleware-config";

// Use middleware-specific config without any database imports for Edge Runtime compatibility
const { auth } = NextAuth(middlewareAuthConfig);

export { auth as middleware };

export const config = {
  matcher: ["/dashboard/:path*", "/import/:path*"],
};
