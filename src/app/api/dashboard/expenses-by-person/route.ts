import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { expenses } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get expenses grouped by responsible party
    const result = await db
      .select({
        responsibleParty: expenses.responsibleParty,
        total: sql<string>`SUM(${expenses.amount})`,
      })
      .from(expenses)
      .where(eq(expenses.userId, session.user.id))
      .groupBy(expenses.responsibleParty);

    const data = result.map((row) => ({
      name: row.responsibleParty ?? "Não atribuído",
      value: parseFloat(row.total),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching expenses by person:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses by person" },
      { status: 500 }
    );
  }
}
