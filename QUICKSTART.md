# 🚀 Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js 20+ installed
- [ ] PostgreSQL database running
- [ ] pnpm installed (`npm install -g pnpm`)

## 5-Minute Setup

### Step 1: Environment Variables (2 minutes)
1. Copy the example file:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Edit `.env.local` and add your database URL:
   \`\`\`env
   DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
   \`\`\`

3. Generate AUTH_SECRET:
   \`\`\`bash
   # On Windows PowerShell:
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   
   # On Linux/Mac:
   openssl rand -base64 32
   \`\`\`

4. Add at least one OAuth provider (Google is easiest):
   - Visit: https://console.cloud.google.com/
   - Create project → APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Add redirect: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Secret to `.env.local`

### Step 2: Database Setup (1 minute)
\`\`\`bash
pnpm db:push
\`\`\`

### Step 3: Run Application (1 minute)
\`\`\`bash
pnpm dev
\`\`\`

Visit: http://localhost:3000

### Step 4: Test the App (1 minute)
1. Click "Sign in with Google" (or your configured provider)
2. Navigate to `/import`
3. Upload a test CSV file
4. Review and save expenses
5. Check the dashboard at `/dashboard`

## Test CSV Files

### Nubank Test File
Create `test-nubank.csv`:
\`\`\`csv
date,title,amount
2025-01-15,Netflix Subscription,49.90
2025-01-20,Amazon Purchase Parcela 1/3,100.00
2025-01-20,Grocery Store,250.75
\`\`\`

### Inter Bank Test File
Create `test-inter.csv`:
\`\`\`csv
Data,Lançamento,Categoria,Tipo,Valor
15/01/2025,Spotify,Entretenimento,À vista,R$ 19,90
20/01/2025,Notebook Dell,Eletrônicos,Parcela 1/10,R$ 500,00
25/01/2025,Supermercado,Alimentação,À vista,R$ 320,50
\`\`\`

## Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running: `psql -U postgres`
- Verify DATABASE_URL format
- Ensure database exists

### "OAuth callback error"
- Verify redirect URIs match exactly
- Check OAuth credentials in `.env.local`
- Ensure AUTH_SECRET is set

### "Module not found"
- Run: `pnpm install`
- Clear cache: `rm -rf .next`

### "Port 3000 already in use"
- Use different port: `pnpm dev -- -p 3001`
- Or kill process: `npx kill-port 3000`

## Common Commands

\`\`\`bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Update database schema
pnpm db:studio        # Open visual database editor

# Code Quality
pnpm lint             # Check for issues
pnpm typecheck        # TypeScript validation
pnpm format:write     # Format code
\`\`\`

## Next Steps

1. **Customize**: Edit colors, fonts, and styling in `src/styles/globals.css`
2. **Add Data**: Import real CSV files from your bank
3. **Explore**: Try different visualizations in the dashboard
4. **Extend**: Add new features based on your needs

## Need Help?

1. Check `FINANCE_DASHBOARD_README.md` for detailed documentation
2. Review `IMPLEMENTATION_SUMMARY.md` for technical details
3. Look at code comments in source files
4. Check the console for error messages

## Production Deployment

### Environment Variables
Add all environment variables to your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Railway: Project → Variables

### Database
- Use a managed PostgreSQL service (Supabase, Neon, Railway)
- Update DATABASE_URL in production

### OAuth Redirect URIs
Add production URLs to each OAuth provider:
- `https://yourdomain.com/api/auth/callback/google`
- `https://yourdomain.com/api/auth/callback/github`
- `https://yourdomain.com/api/auth/callback/discord`

---

**You're all set! Happy expense tracking! 📊💰**
