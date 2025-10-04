import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { expenses } from "@/server/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

// Force API route to use Node.js runtime for database compatibility
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get expenses for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${expenses.purchaseDate}, 'YYYY-MM')`,
        total: sql<string>`SUM(${expenses.amount})`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, session.user.id),
          gte(expenses.purchaseDate, sixMonthsAgo)
        )
      )
      .groupBy(sql`TO_CHAR(${expenses.purchaseDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${expenses.purchaseDate}, 'YYYY-MM')`);

    const data = result.map((row) => ({
      month: row.month,
      total: parseFloat(row.total),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching monthly trend:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly trend" },
      { status: 500 }
    );
  }
}
