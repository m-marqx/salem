import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { expenses } from "@/server/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current month date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get fixed expenses total
    const fixedResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, session.user.id),
          eq(expenses.isFixed, true),
          gte(expenses.purchaseDate, firstDayOfMonth),
          lte(expenses.purchaseDate, lastDayOfMonth)
        )
      );

    // Get variable expenses total
    const variableResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, session.user.id),
          eq(expenses.isFixed, false),
          gte(expenses.purchaseDate, firstDayOfMonth),
          lte(expenses.purchaseDate, lastDayOfMonth)
        )
      );

    const fixedTotal = parseFloat(fixedResult[0]?.total ?? "0");
    const variableTotal = parseFloat(variableResult[0]?.total ?? "0");

    const data = [
      { name: "Fixas", value: fixedTotal },
      { name: "Variáveis", value: variableTotal },
    ];

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching fixed vs variable:", error);
    return NextResponse.json(
      { error: "Failed to fetch fixed vs variable data" },
      { status: 500 }
    );
  }
}
