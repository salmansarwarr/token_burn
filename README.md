# Armchair - Production SIWE Authentication System

A production-ready Web3 authentication system built with Next.js 13, featuring Sign-In with Ethereum (SIWE/EIP-4361), wallet connect via ConnectKit, Prisma + PostgreSQL database, and secure admin authentication.

## 🎯 Features

- ✅ **Wallet Connect** - ConnectKit + wagmi integration with MetaMask and WalletConnect support
- ✅ **SIWE Authentication** - Full EIP-4361 implementation with server-side verification
- ✅ **Secure Sessions** - iron-session with httpOnly, secure cookies
- ✅ **Database** - Prisma ORM with PostgreSQL
- ✅ **Admin Panel** - Secure admin authentication with bcrypt password hashing
- ✅ **Promo Code System** - Secure code management with hashing, encryption, and usage tracking ([See docs](docs/PROMO_CODES.md))
- ✅ **Route Protection** - Next.js middleware for protected routes
- ✅ **Health Check** - API endpoint for monitoring
- ✅ **TypeScript** - Full type safety throughout

## 🛠 Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: wagmi v2, viem, ConnectKit, SIWE
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: iron-session, bcrypt
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- WalletConnect Project ID ([Get one here](https://cloud.walletconnect.com))

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd armchair
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database - PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/armchair?schema=public"

# Session Secret - Generate with: openssl rand -base64 32
SESSION_SECRET="your-32-character-or-longer-secret-here"

# App URL - Used for SIWE domain validation
NEXTAUTH_URL="http://localhost:3000"

# WalletConnect Project ID - Get from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"

# Admin Credentials - For initial database seed
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

**Important**:

- Generate a strong `SESSION_SECRET` using `openssl rand -base64 32`
- Get a WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
- Choose a strong admin password

### 3. Database Setup

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

Seed the database with an admin user:

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Management

### View Database in Prisma Studio

```bash
npm run db:studio
```

This opens a GUI at `http://localhost:5555` to view and edit your database.

### Create New Migration

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

## 🔐 Security Features

- **Server-Side SIWE Verification** - All signature verification happens on the server
- **Nonce Validation** - Cryptographically secure nonces, single-use only
- **Domain Validation** - SIWE messages validated against app domain
- **Secure Cookies** - httpOnly, sameSite, secure flags in production
- **Password Hashing** - bcrypt with cost factor 12
- **Route Protection** - Middleware-based authentication checks
- **CSRF Protection** - Custom token validation for mutation endpoints

## 🧪 Testing the Application

### 1. Test Wallet Connect & SIWE

1. Navigate to `http://localhost:3000`
2. Click "Connect Wallet"
3. Connect MetaMask or another wallet
4. Click "Sign In with Ethereum"
5. Sign the SIWE message in your wallet
6. You should be redirected to `/dashboard`
7. Refresh the page - session should persist

### 2. Test Protected Routes

1. Disconnect wallet or clear cookies
2. Try accessing `/dashboard` directly
3. Should redirect to home page

### 3. Test Admin Login

1. Navigate to `/admin/login`
2. Enter credentials from `.env.local`
3. Should redirect to `/admin/dashboard`
4. Refresh - session should persist

### 4. Test Health Check

```bash
curl http://localhost:3000/api/health
```

Should return:

```json
{
    "status": "ok",
    "database": "connected",
    "timestamp": "2026-01-23T..."
}
```

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables in Vercel dashboard:
    - `DATABASE_URL` - Your production PostgreSQL URL
    - `SESSION_SECRET` - Same as local or generate new
    - `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
    - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Your WalletConnect Project ID
    - `ADMIN_EMAIL` - Admin email
    - `ADMIN_PASSWORD` - Admin password

4. Deploy!

### 3. Run Database Migrations on Production

After first deployment, run migrations:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy

# Seed admin user
npm run db:seed
```

### 4. Verify Deployment

Visit your deployment URL and test:

- Health check: `https://your-app.vercel.app/api/health`
- Wallet connect and SIWE flow
- Admin login

## 📁 Project Structure

```
armchair/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # SIWE auth endpoints
│   │   │   ├── admin/         # Admin auth endpoints
│   │   │   └── health/        # Health check
│   │   ├── dashboard/         # Protected user dashboard
│   │   ├── admin/             # Admin pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Web3 providers
│   ├── components/
│   │   └── ConnectWallet.tsx  # Wallet connect button
│   ├── hooks/
│   │   ├── useAuth.ts         # Auth state hook
│   │   └── useSIWE.ts         # SIWE flow hook
│   ├── lib/
│   │   ├── auth.ts            # Auth utilities
│   │   ├── prisma.ts          # Prisma client
│   │   ├── session.ts         # Session management
│   │   └── wagmi.ts           # Wagmi configuration
│   └── middleware.ts          # Route protection
├── .env.example               # Environment variables template
├── .env.local                 # Your local environment (gitignored)
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Deploy database migrations
- `npm run db:seed` - Seed database with admin user
- `npm run db:studio` - Open Prisma Studio

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall/network settings

### Wallet Connection Issues

- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Check browser console for errors
- Try different wallet (MetaMask, WalletConnect, Coinbase)

### SIWE Verification Fails

- Ensure `NEXTAUTH_URL` matches your app URL
- Check that nonce is being generated and stored
- Verify wallet is on correct network (mainnet/sepolia)

### Admin Login Fails

- Verify admin user was created via seed script
- Check credentials match `.env.local`
- Run `npm run db:studio` to verify admin user exists

## 📝 License

MIT

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [wagmi](https://wagmi.sh/)
- [ConnectKit](https://docs.family.co/connectkit)
- [SIWE](https://login.xyz/)
- [Prisma](https://www.prisma.io/)
