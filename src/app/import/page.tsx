"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ParsedExpense {
  item: string;
  amount: number;
  purchaseDate: string;
  currentInstallment: number;
  totalInstallments: number;
  isFixed: boolean;
  responsibleParty: string | null;
  bank: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ParsedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectBankAndParse = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = results.meta.fields;
          let parsedExpenses: ParsedExpense[] = [];

          if (!headers) {
            setError("Could not detect CSV headers");
            return;
          }

          // Detect Nubank format
          if (
            headers.includes("date") &&
            headers.includes("title") &&
            headers.includes("amount")
          ) {
            parsedExpenses = parseNubank(results.data as NubankRow[]);
          }
          // Detect Inter Bank format
          else if (
            headers.includes("Data") &&
            headers.includes("Lançamento") &&
            headers.includes("Valor")
          ) {
            parsedExpenses = parseInterBank(results.data as InterBankRow[]);
          } else {
            setError(
              "Unknown CSV format. Please use Nubank or Inter Bank format."
            );
            return;
          }

          setExpenses(parsedExpenses);
          setError(null);
        } catch (err) {
          setError("Error parsing CSV file: " + (err as Error).message);
        }
      },
      error: (err) => {
        setError("Error reading CSV file: " + err.message);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      detectBankAndParse(file);
    }
  };

  const updateResponsibleParty = (index: number, value: string) => {
    const updated = [...expenses];
    updated[index]!.responsibleParty = value;
    setExpenses(updated);
  };

  const updateIsFixed = (index: number, checked: boolean) => {
    const updated = [...expenses];
    updated[index]!.isFixed = checked;
    setExpenses(updated);
  };

  const handleSaveExpenses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expenses }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error: string };
        throw new Error(data.error ?? "Failed to save expenses");
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Error saving expenses: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Import Credit Card Statement</CardTitle>
          <CardDescription>
            Upload a CSV file from Nubank or Inter Bank to import your expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {expenses.length > 0 && (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Banco</TableHead>
                        <TableHead>Pessoa Responsável</TableHead>
                        <TableHead>Fixo?</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(expense.purchaseDate).toLocaleDateString(
                              "pt-BR"
                            )}
                          </TableCell>
                          <TableCell>{expense.item}</TableCell>
                          <TableCell>
                            R$ {expense.amount.toFixed(2).replace(".", ",")}
                          </TableCell>
                          <TableCell>
                            {expense.currentInstallment}/
                            {expense.totalInstallments}
                          </TableCell>
                          <TableCell>{expense.bank}</TableCell>
                          <TableCell>
                            <Input
                              value={expense.responsibleParty ?? ""}
                              onChange={(e) =>
                                updateResponsibleParty(index, e.target.value)
                              }
                              placeholder="Nome"
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={expense.isFixed}
                              onCheckedChange={(checked) =>
                                updateIsFixed(index, checked === true)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveExpenses}
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? "Salvando..." : "Salvar Despesas"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Type definitions and parsing functions
interface NubankRow {
  date: string;
  title: string;
  amount: string;
}

interface InterBankRow {
  Data: string;
  Lançamento: string;
  Categoria?: string;
  Tipo?: string;
  Valor: string;
}

function parseNubank(data: NubankRow[]): ParsedExpense[] {
  return data.map((row) => {
    // Extract installment info from title
    const installmentRegex = /Parcela (\d+)\/(\d+)/i;
    const installmentMatch = installmentRegex.exec(row.title);
    const currentInstallment = installmentMatch
      ? parseInt(installmentMatch[1]!)
      : 1;
    const totalInstallments = installmentMatch
      ? parseInt(installmentMatch[2]!)
      : 1;

    // Parse date in ISO format (YYYY-MM-DD) or convert from other formats
    let parsedDate = row.date;
    
    // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD
    if (row.date.includes("/")) {
      const parts = row.date.split("/");
      if (parts.length === 3) {
        parsedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    return {
      purchaseDate: parsedDate,
      item: row.title,
      amount: parseFloat(row.amount),
      currentInstallment,
      totalInstallments,
      bank: "Nubank",
      isFixed: false,
      responsibleParty: null,
    };
  });
}

function parseInterBank(data: InterBankRow[]): ParsedExpense[] {
  return data.map((row) => {
    // Clean the amount value: remove "R$", trim, and replace comma with period
    const cleanAmount = row.Valor.replace("R$", "")
      .trim()
      .replace(",", ".");

    // Extract installment info from Tipo column
    const installmentRegex = /Parcela (\d+)\/(\d+)/i;
    const installmentMatch = row.Tipo ? installmentRegex.exec(row.Tipo) : null;
    const currentInstallment = installmentMatch
      ? parseInt(installmentMatch[1]!)
      : 1;
    const totalInstallments = installmentMatch
      ? parseInt(installmentMatch[2]!)
      : 1;

    // Parse date in ISO format (YYYY-MM-DD) or convert from other formats
    let parsedDate = row.Data;
    
    // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD
    if (row.Data.includes("/")) {
      const parts = row.Data.split("/");
      if (parts.length === 3) {
        parsedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    return {
      purchaseDate: parsedDate,
      item: row.Lançamento,
      amount: parseFloat(cleanAmount),
      currentInstallment,
      totalInstallments,
      bank: "Inter",
      isFixed: false,
      responsibleParty: null,
    };
  });
}
