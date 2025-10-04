# Application Flow Diagram

## Overall Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   / (Home)   │  │   /import    │  │  /dashboard  │      │
│  │              │  │              │  │              │      │
│  │ Auth Buttons │  │ CSV Upload   │  │   Charts &   │      │
│  │              │  │   + Table    │  │    Tables    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌─────────────────── API Routes ──────────────────────┐    │
│  │ /api/auth/*      NextAuth.js Authentication         │    │
│  │ /api/expenses    Bulk Insert Expenses               │    │
│  │ /api/dashboard/* Dashboard Data Aggregations        │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               NextAuth.js (v5)                       │   │
│  │  • GoogleProvider                                    │   │
│  │  • GitHubProvider                                    │   │
│  │  • DiscordProvider                                   │   │
│  │  • DrizzleAdapter                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             DrizzleORM (Database Layer)              │   │
│  │  • Type-safe queries                                 │   │
│  │  • Schema validation                                 │   │
│  │  • SQL builder                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  users   │  │ accounts │  │ sessions │  │ expenses │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## User Flow: Import Expenses

\`\`\`
1. User Authentication
   ┌─────────────┐
   │ Homepage    │
   │ (/page.tsx) │
   └──────┬──────┘
          │ Click "Entrar com Google/GitHub"
          ▼
   ┌─────────────┐
   │ OAuth Flow  │
   │ NextAuth.js │
   └──────┬──────┘
          │ Redirect back with session
          ▼
   ┌─────────────┐
   │ Homepage    │
   │ (Logged In) │
   └──────┬──────┘
          │ Click "Importar Despesas"
          ▼

2. CSV Import
   ┌──────────────────┐
   │ /import Page     │
   │ ┌──────────────┐ │
   │ │ File Input   │ │
   │ └──────┬───────┘ │
   │        │         │
   │        ▼         │
   │ ┌──────────────┐ │
   │ │ PapaParse    │ │ ← Parse CSV client-side
   │ └──────┬───────┘ │
   │        │         │
   │        ▼         │
   │ ┌──────────────┐ │
   │ │ Detect Bank  │ │ ← Check headers
   │ │ - Nubank     │ │
   │ │ - Inter      │ │
   │ └──────┬───────┘ │
   │        │         │
   │        ▼         │
   │ ┌──────────────┐ │
   │ │ Transform    │ │ ← Parse installments
   │ │ Data         │ │   Clean amounts
   │ └──────┬───────┘ │
   │        │         │
   │        ▼         │
   │ ┌──────────────┐ │
   │ │ Interactive  │ │ ← Edit responsible
   │ │ Table        │ │   Toggle fixed
   │ └──────┬───────┘ │
   │        │         │
   │        ▼         │
   │ Click "Salvar"  │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ POST /api/       │
   │ expenses         │
   │ ┌──────────────┐ │
   │ │ Validate     │ │
   │ │ Auth         │ │
   │ └──────┬───────┘ │
   │        │         │
   │        ▼         │
   │ ┌──────────────┐ │
   │ │ Bulk Insert  │ │ ← DrizzleORM
   │ │ via Drizzle  │ │
   │ └──────┬───────┘ │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ PostgreSQL       │
   │ expenses table   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Redirect to      │
   │ /dashboard       │
   └──────────────────┘
\`\`\`

## User Flow: View Dashboard

\`\`\`
   ┌──────────────────┐
   │ /dashboard Page  │
   │ (Protected)      │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Fetch Dashboard  │
   │ Data (Parallel)  │
   └────────┬─────────┘
            │
     ┌──────┴──────┬──────────┬──────────┬─────────────┐
     │             │          │          │             │
     ▼             ▼          ▼          ▼             ▼
┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────┐ ┌────────────┐
│Summary  │ │By Person │ │ Monthly │ │Fixed │ │   Future   │
│ API     │ │   API    │ │  Trend  │ │ vs   │ │  Expenses  │
│         │ │          │ │   API   │ │Var   │ │    API     │
└────┬────┘ └────┬─────┘ └────┬────┘ └──┬───┘ └─────┬──────┘
     │           │            │         │           │
     └───────────┴────────────┴─────────┴───────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ DrizzleORM       │
                    │ Queries          │
                    │ - Aggregations   │
                    │ - Filters        │
                    │ - Joins          │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ PostgreSQL       │
                    │ Query Execution  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Return JSON Data │
                    └────────┬─────────┘
                             │
                             ▼
   ┌──────────────────────────────────────────┐
   │ Render Dashboard Components              │
   │ ┌──────────────┐  ┌──────────────┐      │
   │ │ Total Card   │  │ Pie Chart    │      │
   │ │ R$ 5.432,10  │  │ (Echarts)    │      │
   │ └──────────────┘  └──────────────┘      │
   │ ┌──────────────┐  ┌──────────────┐      │
   │ │ Bar Chart    │  │ Doughnut     │      │
   │ │ (Echarts)    │  │ (Echarts)    │      │
   │ └──────────────┘  └──────────────┘      │
   │ ┌──────────────────────────────────┐    │
   │ │ Future Expenses Table            │    │
   │ │ Item | Date | Amount | Person    │    │
   │ └──────────────────────────────────┘    │
   └──────────────────────────────────────────┘
\`\`\`

## Database Schema Relationships

\`\`\`
┌────────────────┐
│     users      │
│ ─────────────  │
│ id (PK)        │◄─────────┐
│ name           │          │
│ email          │          │
│ emailVerified  │          │
│ image          │          │
└────────────────┘          │
                            │
                            │ userId (FK)
                            │
┌────────────────┐          │
│    expenses    │          │
│ ─────────────  │          │
│ id (PK)        │          │
│ userId (FK)    │──────────┘
│ item           │
│ amount         │
│ purchaseDate   │
│ responsibleParty
│ currentInstallment
│ totalInstallments
│ isFixed        │
│ bank           │
│ createdAt      │
└────────────────┘

Indexes:
- expense_user_id_idx on userId
- expense_purchase_date_idx on purchaseDate
\`\`\`

## CSV Transformation Flow

\`\`\`
Nubank CSV:
┌─────────────────────────────────────┐
│ date,title,amount                   │
│ 2025-01-15,Netflix,49.90            │
│ 2025-01-20,Compra Parcela 2/3,100  │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Parse & Transform                   │
│ - Extract date → purchaseDate       │
│ - Extract title → item              │
│ - Extract amount → amount           │
│ - Regex match "Parcela X/Y"        │
│   → currentInstallment: X           │
│   → totalInstallments: Y            │
│ - Set bank: "Nubank"                │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Standardized Format                 │
│ {                                   │
│   item: "Compra",                   │
│   amount: 100,                      │
│   purchaseDate: "2025-01-20",       │
│   currentInstallment: 2,            │
│   totalInstallments: 3,             │
│   bank: "Nubank",                   │
│   isFixed: false,                   │
│   responsibleParty: null            │
│ }                                   │
└─────────────────────────────────────┘

Inter Bank CSV:
┌──────────────────────────────────────────┐
│ Data,Lançamento,Categoria,Tipo,Valor    │
│ 15/01/2025,Amazon,Compras,Parcela 1/6,  │
│ R$ 200,00                                │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Parse & Transform                        │
│ - Parse Data → purchaseDate              │
│ - Extract Lançamento → item              │
│ - Clean Valor:                           │
│   • Remove "R$"                          │
│   • Trim whitespace                      │
│   • Replace "," with "."                 │
│   • parseFloat()                         │
│ - Regex match "Parcela X/Y" in Tipo     │
│ - Set bank: "Inter"                      │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Standardized Format                      │
│ {                                        │
│   item: "Amazon",                        │
│   amount: 200.00,                        │
│   purchaseDate: "2025-01-15",            │
│   currentInstallment: 1,                 │
│   totalInstallments: 6,                  │
│   bank: "Inter",                         │
│   isFixed: false,                        │
│   responsibleParty: null                 │
│ }                                        │
└──────────────────────────────────────────┘
\`\`\`

## Dashboard Data Flow

\`\`\`
Summary (Total Current Month):
┌──────────────────────────────────────┐
│ SQL: SELECT SUM(amount)              │
│      FROM expenses                   │
│      WHERE userId = ?                │
│        AND purchaseDate >= start     │
│        AND purchaseDate <= end       │
└─────────────┬────────────────────────┘
              │
              ▼
     { total: 5432.10 }

Expenses by Person:
┌──────────────────────────────────────┐
│ SQL: SELECT responsibleParty,        │
│             SUM(amount)              │
│      FROM expenses                   │
│      WHERE userId = ?                │
│      GROUP BY responsibleParty       │
└─────────────┬────────────────────────┘
              │
              ▼
     [
       { name: "João", value: 2500 },
       { name: "Maria", value: 1932.10 },
       { name: "Não atribuído", value: 1000 }
     ]

Monthly Trend (Last 6 Months):
┌──────────────────────────────────────┐
│ SQL: SELECT TO_CHAR(purchaseDate,    │
│                    'YYYY-MM'),        │
│             SUM(amount)              │
│      FROM expenses                   │
│      WHERE userId = ?                │
│        AND purchaseDate >= 6mo ago   │
│      GROUP BY month                  │
│      ORDER BY month                  │
└─────────────┬────────────────────────┘
              │
              ▼
     [
       { month: "2024-10", total: 3200 },
       { month: "2024-11", total: 4100 },
       { month: "2024-12", total: 5500 },
       { month: "2025-01", total: 4800 },
       { month: "2025-02", total: 3900 },
       { month: "2025-03", total: 5200 }
     ]

Fixed vs Variable:
┌──────────────────────────────────────┐
│ SQL: SELECT SUM(amount)              │
│      FROM expenses                   │
│      WHERE userId = ?                │
│        AND isFixed = true/false      │
│        AND current_month             │
└─────────────┬────────────────────────┘
              │
              ▼
     [
       { name: "Fixas", value: 1500 },
       { name: "Variáveis", value: 3932.10 }
     ]

Future Expenses:
┌──────────────────────────────────────┐
│ SQL: SELECT *                        │
│      FROM expenses                   │
│      WHERE userId = ?                │
│        AND currentInstallment <      │
│            totalInstallments         │
│      ORDER BY purchaseDate           │
└─────────────┬────────────────────────┘
              │
              ▼
     [
       {
         id: 1,
         item: "Notebook",
         amount: 500,
         nextPaymentDate: "2025-04-15",
         responsibleParty: "João",
         currentInstallment: 3,
         totalInstallments: 12
       }
     ]
\`\`\`

---

This diagram provides a visual representation of how data flows through the application from CSV upload to database storage to dashboard visualization.
