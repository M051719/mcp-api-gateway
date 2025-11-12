# RepMotivatedSeller - Quick Command Reference

## 🚀 One-Command Migration

```powershell
# Run from mcp-api-gateway directory
.\scripts\migrate-netlify-files.ps1
```

---

## 📋 Essential Commands

### Setup & Installation

```bash
# Navigate to project
cd "c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Install dependencies
npm install

# Set up environment
cp .env.example .env
```

### Supabase Commands

```bash
# Initialize Supabase
supabase init

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Start local Supabase
supabase start

# Check status
supabase status

# Stop Supabase
supabase stop

# Run migrations
supabase db push

# Reset database
supabase db reset

# View diff
supabase db diff
```

### Edge Functions

```bash
# Deploy all functions
supabase functions deploy send-notification-email
supabase functions deploy create-checkout-session

# View logs
supabase functions logs send-notification-email --follow

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

# List secrets
supabase secrets list
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Queries

```sql
-- Create admin user
INSERT INTO profiles (id, email, name, membership_tier)
VALUES ('user-id', 'admin@repmotivatedseller.org', 'Admin', 'enterprise');

-- View all foreclosure submissions
SELECT * FROM foreclosure_responses ORDER BY created_at DESC;

-- View user subscriptions
SELECT * FROM profiles WHERE membership_tier != 'free';

-- Check urgent cases
SELECT * FROM foreclosure_responses 
WHERE nod = 'yes' OR missed_payments >= 3;
```

---

## 🗂️ File Locations

### Source Files (Netlify)
```
C:\Users\monte\Documents\cert api token keys ids\ORIGINAL FILES FOLDER FROM NETLIFY\
```

### Target Project
```
c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller\
```

### Migration Tools
```
c:\Users\monte\Documents\cert api token keys ids\GITHUB FOLDER\GitHub\mcp-api-gateway\
├── docs/
│   ├── NETLIFY_TO_SUPABASE_MIGRATION_ANALYSIS.md
│   ├── MIGRATION_SCRIPTS.md
│   ├── MIGRATION_README.md
│   └── QUICK_REFERENCE.md (this file)
└── scripts/
    └── migrate-netlify-files.ps1
```

---

## 🔑 Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx
```

---

## 🧪 Testing Checklist

```bash
# Auth
- [ ] Sign up
- [ ] Log in
- [ ] Log out
- [ ] Password reset

# Foreclosure
- [ ] Submit questionnaire
- [ ] View in admin dashboard
- [ ] Email notification sent

# Contracts
- [ ] Wholesale contract
- [ ] Fix-flip contract
- [ ] Cash-out refi application
- [ ] PDF generation
- [ ] Download

# Subscriptions
- [ ] View pricing
- [ ] Checkout flow
- [ ] Subscription created
- [ ] Portal access
- [ ] Plan upgrade
- [ ] Plan cancellation

# Admin
- [ ] Access dashboard
- [ ] View submissions
- [ ] View users
- [ ] CRM functionality
```

---

## 🐛 Troubleshooting

### Can't connect to Supabase?
```bash
supabase status
# Check if URL and keys in .env match supabase status output
```

### Edge Function not working?
```bash
supabase functions logs function-name --follow
# Check for errors in real-time
```

### Database migration failed?
```bash
supabase db reset
supabase db push
# Reset and re-run migrations
```

### Stripe webhook not receiving events?
```bash
# 1. Check webhook URL in Stripe Dashboard
# 2. Verify webhook secret in supabase secrets
# 3. Check function logs
supabase functions logs stripe-webhook
```

---

## 📊 Key Metrics

### Migration Stats
- **Files to migrate**: 39
- **Components**: 25+
- **Database tables**: 5
- **Edge Functions**: 3
- **Estimated time**: 2-4 hours

### Features
- **Auth**: Supabase Auth
- **Database**: PostgreSQL
- **Payments**: Stripe
- **Email**: Edge Function notifications
- **States covered**: 36
- **Loan range**: $30K - FHA cap
- **Interest rates**: 8% - 15%

---

## 📱 Important URLs

### Development
```
Local: http://localhost:5173
Supabase Studio: http://localhost:54323
```

### Production
```
App: https://your-domain.com
Supabase: https://your-project-ref.supabase.co
Stripe Dashboard: https://dashboard.stripe.com
```

---

## 🎯 Admin Access

**Admin Email**: `admin@repmotivatedseller.org`

Features:
- View all foreclosure submissions
- User management
- Call records (CRM)
- Property management
- Analytics dashboard

---

## 💡 Quick Tips

1. **Always check logs first**: `supabase functions logs function-name --follow`
2. **Use test mode**: Keep Stripe in test mode until ready for production
3. **Backup before migrations**: `supabase db dump > backup.sql`
4. **Monitor RLS policies**: Ensure Row Level Security is working
5. **Test with different users**: Don't just test as admin

---

## 🔗 Documentation Links

- [Full Migration Analysis](./NETLIFY_TO_SUPABASE_MIGRATION_ANALYSIS.md)
- [Migration Scripts](./MIGRATION_SCRIPTS.md)
- [Complete README](./MIGRATION_README.md)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)

---

## 📞 Support Workflow

1. **Check logs**: View Supabase and function logs
2. **Verify config**: Ensure .env variables are correct
3. **Review docs**: Check migration analysis document
4. **Test locally**: Use `supabase start` for local testing
5. **Check database**: Query tables to verify data

---

**Last Updated**: November 11, 2025  
**Quick Start**: Run `migrate-netlify-files.ps1` → `npm install` → `supabase start` → `npm run dev`
