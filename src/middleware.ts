import NextAuth from "next-auth";
import { baseAuthConfig } from "@/server/auth/config";

// Use base config without database adapter for Edge Runtime compatibility
const { auth } = NextAuth(baseAuthConfig);

export { auth as middleware };

export const config = {
  matcher: ["/dashboard/:path*", "/import/:path*"],
};
