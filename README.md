# GolfGives — Golf Charity Subscription Platform

> **Full-stack Next.js 14 app** built per the Digital Heroes PRD.
> Play golf. Win prizes. Give to charity.

---

## 🚀 Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth + DB | Supabase (Postgres, Auth, Storage) |
| Payments | Stripe (subscriptions + webhooks) |
| Deployment | Vercel |

---

## 📋 Feature Checklist (PRD Coverage)

- ✅ User signup / login (Supabase Auth)
- ✅ Monthly + Yearly subscription plans (Stripe Checkout)
- ✅ Rolling 5-score system (trigger enforces max 5, replaces oldest)
- ✅ Monthly draw engine (random + algorithmic modes)
- ✅ Prize pool calculation (40/35/25 split)
- ✅ Jackpot rollover when no 5-match winner
- ✅ Charity selection with adjustable contribution % (min 10%)
- ✅ Winner verification flow (pending → approved → paid)
- ✅ Proof upload system
- ✅ User dashboard (all modules)
- ✅ Admin panel (users, draws, charities, winners, reports)
- ✅ Draw simulation mode (preview before publish)
- ✅ Public charities directory
- ✅ Stripe webhook handling
- ✅ Mobile-responsive design
- ✅ RLS security on all tables

---

## 🛠️ Deployment Guide

### Step 1 — Supabase (NEW project)

1. Go to [supabase.com](https://supabase.com) → create a **new project**
2. In the SQL editor, paste and run the contents of `supabase/schema.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. In **Storage**, create a bucket called `winner-proofs` (set to public)
5. In **Authentication → URL Configuration**, add your Vercel URL to the allowed redirect URLs

### Step 2 — Stripe (new/existing account)

1. Create two **products** in the Stripe dashboard:
   - Monthly: £14.99/month recurring → copy the **Price ID**
   - Yearly: £149.90/year recurring → copy the **Price ID**
2. Copy your keys:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. After deploying to Vercel, set up a webhook:
   - Endpoint: `https://your-project.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

### Step 3 — Vercel (NEW account)

1. Push this code to a new GitHub repository
2. Go to [vercel.com](https://vercel.com) → import the repo
3. Add all environment variables from `.env.example`
4. Set `ADMIN_EMAIL` to your email address (this account gets admin access on signup)
5. Deploy!

### Step 4 — Create Admin Account

1. Sign up on your deployed site using the email you set as `ADMIN_EMAIL`
2. The trigger will automatically assign you the `admin` role
3. Access the admin panel at `/admin`

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MONTHLY_PRICE_ID=
STRIPE_YEARLY_PRICE_ID=
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
ADMIN_EMAIL=admin@youremail.com
```

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                    # Homepage
│   ├── auth/login/                 # Login page
│   ├── auth/signup/                # 3-step signup
│   ├── dashboard/                  # User dashboard
│   │   ├── page.tsx                # Overview
│   │   ├── scores/                 # Score management
│   │   ├── draws/                  # Draw history & wins
│   │   ├── charity/                # Charity selection
│   │   └── settings/               # Profile & subscription
│   ├── admin/                      # Admin panel
│   │   ├── page.tsx                # Admin overview
│   │   ├── users/                  # User management
│   │   ├── draws/                  # Draw management
│   │   ├── charities/              # Charity CRUD
│   │   ├── winners/                # Winner verification
│   │   └── reports/                # Analytics
│   ├── charities/                  # Public charities page
│   └── api/                        # API routes
│       ├── auth/callback/
│       ├── scores/
│       ├── draws/
│       ├── subscriptions/checkout/
│       ├── subscriptions/cancel/
│       ├── winners/[id]/proof/
│       ├── admin/draws/run/
│       ├── admin/draws/
│       ├── admin/winners/
│       └── webhooks/stripe/
├── components/
│   ├── layout/                     # Navbar, Footer
│   ├── dashboard/                  # Dashboard sidebar
│   └── admin/                      # Admin sidebar
├── lib/
│   ├── draw-engine.ts              # Draw algorithm logic
│   ├── stripe.ts                   # Stripe config
│   ├── utils.ts                    # Helpers
│   └── supabase/                   # Client + server
├── supabase/
│   └── schema.sql                  # Full DB schema + RLS
└── middleware.ts                   # Auth protection
```

---

## 🎯 Test Credentials

After deploying, test the full flow:

| Test | Steps |
|---|---|
| User signup | Sign up, complete 3 steps, checkout with Stripe test card `4242 4242 4242 4242` |
| Score entry | Dashboard → Scores → Add 5 scores (1-45 each) |
| Draw system | Admin → Draws → Simulate, then Run & Publish |
| Charity | Dashboard → Charity → select + set % |
| Winner flow | Admin → Winners → Approve → Mark Paid |

### Stripe test cards:
- ✅ Success: `4242 4242 4242 4242`
- ❌ Decline: `4000 0000 0000 0002`
- 🔐 3DS auth: `4000 0025 0000 3155`

---

## 📞 Support

Built by candidate per the Digital Heroes PRD v1.0 (March 2026).
