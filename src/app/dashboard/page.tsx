"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SummaryData {
  total: number;
}

interface ExpenseByPerson {
  name: string;
  value: number;
}

interface MonthlyTrend {
  month: string;
  total: number;
}

interface FixedVsVariable {
  name: string;
  value: number;
}

interface FutureExpense {
  id: number;
  item: string;
  amount: number;
  nextPaymentDate: string;
  responsibleParty: string;
  currentInstallment: number;
  totalInstallments: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [expensesByPerson, setExpensesByPerson] = useState<ExpenseByPerson[]>(
    []
  );
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [fixedVsVariable, setFixedVsVariable] = useState<FixedVsVariable[]>(
    []
  );
  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          summaryRes,
          expensesByPersonRes,
          monthlyTrendRes,
          fixedVsVariableRes,
          futureExpensesRes,
        ] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/dashboard/expenses-by-person"),
          fetch("/api/dashboard/monthly-trend"),
          fetch("/api/dashboard/fixed-vs-variable"),
          fetch("/api/dashboard/future-expenses"),
        ]);

        const summaryData = (await summaryRes.json()) as SummaryData;
        const expensesByPersonData = (await expensesByPersonRes.json()) as {
          data: ExpenseByPerson[];
        };
        const monthlyTrendData = (await monthlyTrendRes.json()) as {
          data: MonthlyTrend[];
        };
        const fixedVsVariableData = (await fixedVsVariableRes.json()) as {
          data: FixedVsVariable[];
        };
        const futureExpensesData = (await futureExpensesRes.json()) as {
          data: FutureExpense[];
        };

        setSummary(summaryData);
        setExpensesByPerson(expensesByPersonData.data);
        setMonthlyTrend(monthlyTrendData.data);
        setFixedVsVariable(fixedVsVariableData.data);
        setFutureExpenses(futureExpensesData.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  // Pie Chart Options - Expenses by Person
  const pieChartOptions = {
    title: {
      text: "Despesas por Pessoa",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: R$ {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Despesas",
        type: "pie",
        radius: "50%",
        data: expensesByPerson,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  // Bar Chart Options - Monthly Trend
  const barChartOptions = {
    title: {
      text: "Tendência Mensal de Despesas",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: {
      type: "category",
      data: monthlyTrend.map((item) => item.month),
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "R$ {value}",
      },
    },
    series: [
      {
        name: "Despesas",
        type: "bar",
        data: monthlyTrend.map((item) => item.total),
        itemStyle: {
          color: "#5470c6",
        },
      },
    ],
  };

  // Doughnut Chart Options - Fixed vs Variable
  const doughnutChartOptions = {
    title: {
      text: "Despesas Fixas vs Variáveis",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: R$ {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Tipo de Despesa",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: fixedVsVariable,
      },
    ],
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-4xl font-bold">Dashboard Financeiro</h1>

      <div className="grid gap-6">
        {/* Total Expenses Card */}
        <Card>
          <CardHeader>
            <CardTitle>Total de Despesas (Mês Atual)</CardTitle>
            <CardDescription>
              Soma de todas as despesas do mês corrente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              R$ {summary?.total.toFixed(2).replace(".", ",")}
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <ReactECharts option={pieChartOptions} style={{ height: 400 }} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <ReactECharts
                option={doughnutChartOptions}
                style={{ height: 400 }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend Chart */}
        <Card>
          <CardContent className="pt-6">
            <ReactECharts option={barChartOptions} style={{ height: 400 }} />
          </CardContent>
        </Card>

        {/* Future Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas Futuras</CardTitle>
            <CardDescription>
              Parcelas pendentes de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {futureExpenses.length === 0 ? (
              <div className="text-center text-muted-foreground">
                Nenhuma despesa futura encontrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Próximo Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Pessoa</TableHead>
                    <TableHead>Parcela</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {futureExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.item}</TableCell>
                      <TableCell>
                        {new Date(expense.nextPaymentDate).toLocaleDateString(
                          "pt-BR"
                        )}
                      </TableCell>
                      <TableCell>
                        R$ {expense.amount.toFixed(2).replace(".", ",")}
                      </TableCell>
                      <TableCell>{expense.responsibleParty}</TableCell>
                      <TableCell>
                        {expense.currentInstallment + 1}/
                        {expense.totalInstallments}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
