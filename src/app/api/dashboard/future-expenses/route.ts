import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { expenses } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get expenses with pending installments
    const result = await db
      .select({
        id: expenses.id,
        item: expenses.item,
        amount: expenses.amount,
        purchaseDate: expenses.purchaseDate,
        responsibleParty: expenses.responsibleParty,
        currentInstallment: expenses.currentInstallment,
        totalInstallments: expenses.totalInstallments,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, session.user.id),
          sql`${expenses.currentInstallment} < ${expenses.totalInstallments}`
        )
      )
      .orderBy(expenses.purchaseDate);

    const data = result.map((row) => ({
      id: row.id,
      item: row.item,
      amount: parseFloat(row.amount),
      nextPaymentDate: calculateNextPaymentDate(
        new Date(row.purchaseDate),
        row.currentInstallment,
        row.totalInstallments
      ),
      responsibleParty: row.responsibleParty ?? "Não atribuído",
      currentInstallment: row.currentInstallment,
      totalInstallments: row.totalInstallments,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching future expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch future expenses" },
      { status: 500 }
    );
  }
}

function calculateNextPaymentDate(
  purchaseDate: Date,
  currentInstallment: number,
  totalInstallments: number
): string {
  if (currentInstallment >= totalInstallments) {
    return purchaseDate.toISOString();
  }

  // Calculate months to add for next installment
  const monthsToAdd = 1;
  const nextDate = new Date(purchaseDate);
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);

  return nextDate.toISOString();
}
