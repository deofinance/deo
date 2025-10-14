# DEO Finance - Complete Setup Guide

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** installed
- **PostgreSQL 14+** installed and running
- **npm** or **yarn** package manager
- Git for version control

## Step-by-Step Setup

### 1. Clone and Install

```bash
cd deo
npm install
```

### 2. Database Setup

#### Create Database

```bash
# Create PostgreSQL database
createdb deo_finance

# Or using psql
psql -U postgres
CREATE DATABASE deo_finance;
\q
```

#### Run Schema

```bash
# Run the complete schema
psql deo_finance < database/schema.sql

# Verify tables were created
psql deo_finance -c "\dt"
```

You should see all tables including:
- users
- user_wallets
- stablecoin_balances
- transactions
- user_cards
- etc.

### 3. Environment Configuration

#### Copy Example File

```bash
cp .env.local.example .env.local
```

#### Configure Required Variables

Edit `.env.local` with your credentials:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/deo_finance

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Circle (sign up at https://console.circle.com/)
NEXT_PUBLIC_CIRCLE_APP_ID=your-circle-app-id
CIRCLE_API_KEY=TEST_API_KEY:your-key-id:your-key-secret

# Alchemy (sign up at https://dashboard.alchemy.com/)
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-api-key

# Stripe (sign up at https://dashboard.stripe.com/)
STRIPE_SECRET_KEY=sk_test_your-stripe-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key

# Persona KYC (sign up at https://dashboard.withpersona.com/)
PERSONA_API_KEY=persona_sandbox_your-key
NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID=env_your-id

# AWS SES (optional for emails)
AWS_SES_ACCESS_KEY_ID=your-aws-key
AWS_SES_SECRET_ACCESS_KEY=your-aws-secret
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# App Config
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Third-Party Service Setup

#### Circle Web3 Services

1. Go to https://console.circle.com/
2. Sign up for an account
3. Create a new app (User-Controlled Wallets)
4. Copy the App ID and API Key
5. Add to `.env.local`

#### Alchemy

1. Go to https://dashboard.alchemy.com/
2. Create account and new app
3. Select networks: Ethereum, Polygon, Arbitrum, Optimism
4. Copy API Key
5. Add to `.env.local`

#### Stripe Issuing

1. Go to https://dashboard.stripe.com/
2. Enable "Issuing" in your dashboard
3. Get API keys from Developers section
4. Add to `.env.local`

#### Persona KYC

1. Go to https://dashboard.withpersona.com/
2. Create account
3. Create Inquiry Template (GovID + Selfie)
4. Get Environment ID and API Key
5. Add to `.env.local`

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### 6. Test the Application

#### Test Health Check

```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok" },
    "server": { "status": "ok" }
  }
}
```

#### Test Authentication Flow

1. Go to http://localhost:3000/auth/login
2. Enter your email
3. Check console for OTP (in development)
4. Enter the code
5. You should be redirected to dashboard

### 7. Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Common Issues

### Database Connection Error

**Error**: `Connection refused`

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL if needed (macOS)
brew services start postgresql

# Start PostgreSQL (Windows)
# Use Services app to start PostgreSQL

# Test connection
psql -U postgres -d deo_finance -c "SELECT 1"
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000 (Unix/Mac)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Environment Variables Not Loading

**Solution**:
- Ensure file is named exactly `.env.local`
- Restart development server after changes
- Check file is in project root directory
- Variables with `NEXT_PUBLIC_` prefix are available in browser

### Circle API Errors

**Error**: `Invalid API key`

**Solution**:
- Ensure API key format: `TEST_API_KEY:key_id:key_secret`
- Check you're using the correct environment (sandbox vs production)
- Verify API key is active in Circle console

## Verification Checklist

After setup, verify:

- [ ] Health endpoint returns healthy status
- [ ] Can send OTP to email
- [ ] Can verify OTP and login
- [ ] Dashboard loads with user data
- [ ] Database tables are created
- [ ] All environment variables are set
- [ ] No console errors on page load

## Next Steps

1. **Configure Google OAuth** (optional)
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add redirect URI
   - Update environment variables

2. **Setup Webhooks** (for production)
   - Configure Circle webhook endpoint
   - Configure Stripe webhook endpoint
   - Configure Persona webhook endpoint

3. **Customize Branding**
   - Update logo in `/public`
   - Modify colors in `tailwind.config.js`
   - Update app name in `manifest.json`

4. **Add Test Data** (optional)
   - Create test users
   - Add sample transactions
   - Test all features

## Development Tips

- Use `npm run type-check` to check TypeScript errors
- Use `npm run lint` to check code style
- Check console for errors during development
- Use browser DevTools Network tab to debug API calls
- Check PostgreSQL logs for database errors

## Getting Help

- Review full documentation in `/Documentation` folder
- Check `DEO_Finance_Prompts.md` for detailed specifications
- Open GitHub issues for bugs
- Check console logs for error messages

## Production Deployment

See `DEO_FINANCE_DEPLOYMENT.md` for:
- Netlify deployment guide
- Vercel deployment guide
- Environment configuration for production
- Database setup (Neon/AWS RDS)
- Domain configuration
- SSL/HTTPS setup
- Monitoring setup

---

**Setup complete! 🎉 Start building with DEO Finance.**
