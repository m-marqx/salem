# Personal Finance Dashboard

A full-stack personal finance dashboard built with Next.js, TypeScript, DrizzleORM, and NextAuth.js. Import credit card statements from Nubank and Inter Bank, assign expenses to individuals, and visualize financial insights with interactive charts.

## Features

- 📊 **CSV Import**: Upload credit card statements from Nubank or Inter Bank
- 🔄 **Data Transformation**: Automatically detect bank format and parse CSV data
- ✏️ **Interactive Editing**: Assign expenses to individuals and categorize as fixed/variable
- 📈 **Visual Analytics**: View expenses through multiple chart types:
  - Pie chart showing expenses by person
  - Bar chart displaying monthly trends
  - Doughnut chart comparing fixed vs variable expenses
  - Table listing future installment payments
- 🔐 **Secure Authentication**: Sign in with Google, GitHub, or Discord
- 💾 **PostgreSQL Database**: Store and manage all financial data

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js v5
- **ORM**: DrizzleORM
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Echarts (via echarts-for-react)
- **CSV Parsing**: PapaParse

## Database Schema

The application uses the following main tables:

### `expenses` Table
- `id`: Serial primary key
- `userId`: Foreign key referencing users
- `item`: Description of the expense
- `amount`: Decimal value (10,2)
- `purchaseDate`: Timestamp of the purchase
- `responsibleParty`: Person responsible for the expense (nullable)
- `currentInstallment`: Current installment number (default: 1)
- `totalInstallments`: Total installment count (default: 1)
- `isFixed`: Boolean flag for fixed/recurring expenses (default: false)
- `bank`: Source bank ('Nubank' or 'Inter')
- `createdAt`: Timestamp of record creation

## Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL database
- OAuth credentials for Google, GitHub, and/or Discord

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd salem
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables. Create a \`.env.local\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"

# NextAuth
AUTH_SECRET="your-secret-key-here"
# Generate with: openssl rand -base64 32

# Discord OAuth (optional)
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"

# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# GitHub OAuth
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
\`\`\`

### Setting Up OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: \`http://localhost:3000/api/auth/callback/google\`
6. Copy Client ID and Client Secret to \`.env.local\`

#### GitHub OAuth
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: \`http://localhost:3000/api/auth/callback/github\`
4. Copy Client ID and Client Secret to \`.env.local\`

#### Discord OAuth (Optional)
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 section
4. Add redirect: \`http://localhost:3000/api/auth/callback/discord\`
5. Copy Client ID and Client Secret to \`.env.local\`

### Database Setup

1. Push the schema to your database:
\`\`\`bash
pnpm db:push
\`\`\`

2. (Optional) Open Drizzle Studio to view your database:
\`\`\`bash
pnpm db:studio
\`\`\`

### Run the Application

Development mode:
\`\`\`bash
pnpm dev
\`\`\`

Production build:
\`\`\`bash
pnpm build
pnpm start
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Usage Guide

### 1. Authentication
- Visit the homepage and click on one of the sign-in buttons
- Authenticate with your chosen provider (Google, GitHub, or Discord)

### 2. Import Expenses

#### Nubank CSV Format
Your Nubank CSV should have the following columns:
- \`date\`: Purchase date (YYYY-MM-DD)
- \`title\`: Description (may include "Parcela X/Y" for installments)
- \`amount\`: Amount as a decimal number

Example:
\`\`\`csv
date,title,amount
2025-01-15,Netflix,49.90
2025-01-20,Compra Parcela 1/3,100.00
\`\`\`

#### Inter Bank CSV Format
Your Inter Bank CSV should have the following columns:
- \`Data\`: Purchase date
- \`Lançamento\`: Description
- \`Categoria\`: Category (optional)
- \`Tipo\`: Type (may include "Parcela X/Y" for installments)
- \`Valor\`: Amount with "R$" prefix and comma decimal separator

Example:
\`\`\`csv
Data,Lançamento,Categoria,Tipo,Valor
15/01/2025,Amazon,Compras,À vista,R$ 150,00
20/01/2025,Magazine Luiza,Eletrônicos,Parcela 1/6,R$ 200,00
\`\`\`

#### Import Process
1. Navigate to `/import` page
2. Click "Choose File" and select your CSV file
3. The system automatically detects the bank format
4. Review the parsed data in the table
5. Edit the "Pessoa Responsável" (Responsible Party) column for each expense
6. Check the "Fixo?" (Fixed) checkbox for recurring expenses
7. Click "Salvar Despesas" (Save Expenses) to store in the database
8. You'll be redirected to the dashboard

### 3. View Dashboard

The dashboard displays:

- **Total Expenses Card**: Sum of all expenses for the current month
- **Expenses by Person (Pie Chart)**: Distribution of expenses grouped by responsible party
- **Monthly Expense Trend (Bar Chart)**: Total expenses for the last 6 months
- **Fixed vs Variable Expenses (Doughnut Chart)**: Proportion of fixed and variable expenses
- **Future Expenses Table**: List of upcoming installment payments

## API Routes

- \`POST /api/expenses\`: Save bulk expenses (protected)
- \`GET /api/dashboard/summary\`: Get current month total
- \`GET /api/dashboard/expenses-by-person\`: Get expenses grouped by person
- \`GET /api/dashboard/monthly-trend\`: Get last 6 months data
- \`GET /api/dashboard/fixed-vs-variable\`: Get fixed vs variable breakdown
- \`GET /api/dashboard/future-expenses\`: Get pending installments

## Project Structure

\`\`\`
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth routes
│   │   ├── expenses/              # Expense management API
│   │   └── dashboard/             # Dashboard data APIs
│   ├── dashboard/                 # Dashboard page
│   ├── import/                    # CSV import page
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Homepage with auth
├── components/
│   └── ui/                        # shadcn/ui components
├── server/
│   ├── auth/                      # NextAuth configuration
│   └── db/                        # Database schema and client
└── styles/
    └── globals.css                # Global styles
\`\`\`

## Development Commands

\`\`\`bash
# Development
pnpm dev                # Start dev server
pnpm build              # Build for production
pnpm start              # Start production server

# Database
pnpm db:push            # Push schema changes
pnpm db:generate        # Generate migrations
pnpm db:migrate         # Run migrations
pnpm db:studio          # Open Drizzle Studio

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix ESLint issues
pnpm format:check       # Check formatting
pnpm format:write       # Format code
pnpm typecheck          # Run TypeScript checks
\`\`\`

## Troubleshooting

### Database Connection Issues
- Verify your \`DATABASE_URL\` in \`.env.local\`
- Ensure PostgreSQL is running
- Check that the database exists

### OAuth Authentication Fails
- Verify all OAuth credentials are correct
- Ensure redirect URIs match exactly (including http/https)
- Check that \`AUTH_SECRET\` is set

### CSV Import Not Working
- Verify CSV format matches Nubank or Inter Bank specification
- Check for encoding issues (should be UTF-8)
- Ensure no extra columns or missing headers

### Charts Not Displaying
- Check browser console for errors
- Verify API routes are returning data
- Ensure user is authenticated

## Future Enhancements

- [ ] Support for more bank formats
- [ ] Export functionality (PDF reports)
- [ ] Budget tracking and alerts
- [ ] Category-based expense analysis
- [ ] Mobile responsive improvements
- [ ] Multi-currency support
- [ ] Recurring expense automation

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
