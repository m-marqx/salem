import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { expenses } from "@/server/db/schema";

// Force API route to use Node.js runtime for database compatibility
export const runtime = "nodejs";

interface ExpenseInput {
  item: string;
  amount: number;
  purchaseDate: string;
  responsibleParty: string | null;
  currentInstallment: number;
  totalInstallments: number;
  isFixed: boolean;
  bank: string;
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { expenses: ExpenseInput[] };
    const expensesData = body.expenses;

    if (!Array.isArray(expensesData) || expensesData.length === 0) {
      return NextResponse.json(
        { error: "Invalid expenses data" },
        { status: 400 }
      );
    }

    // Transform and validate the data
    const expensesToInsert = expensesData.map((expense) => {
      // Parse and validate the date
      const parsedDate = new Date(expense.purchaseDate);
      
      // Check if date is valid
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date format: ${expense.purchaseDate}`);
      }

      return {
        userId: session.user.id,
        item: expense.item,
        amount: expense.amount.toString(),
        purchaseDate: parsedDate,
        responsibleParty: expense.responsibleParty ?? null,
        currentInstallment: expense.currentInstallment ?? 1,
        totalInstallments: expense.totalInstallments ?? 1,
        isFixed: expense.isFixed ?? false,
        bank: expense.bank,
      };
    });

    // Bulk insert using DrizzleORM
    const result = await db.insert(expenses).values(expensesToInsert).returning();

    return NextResponse.json({
      success: true,
      count: result.length,
      expenses: result,
    });
  } catch (error) {
    console.error("Error saving expenses:", error);
    return NextResponse.json(
      { error: "Failed to save expenses" },
      { status: 500 }
    );
  }
}
