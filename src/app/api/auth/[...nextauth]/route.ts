import { handlers } from "@/server/auth";

export const { GET, POST } = handlers;

// Force the auth API route to use Node.js runtime instead of Edge Runtime
// This is necessary because the database adapter requires Node.js modules
export const runtime = "nodejs";
