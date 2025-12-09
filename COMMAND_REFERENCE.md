# 🔧 bKash Integration - Command Reference

## Essential Commands

### Setup Commands

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Install dependencies (if needed)
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Start production server
npm start
```

### Development Commands

```bash
# Format code (if formatter configured)
npm run format

# Lint code
npm run lint

# Type check
npm run type-check

# Run tests (if configured)
npm test
```

---

## Environment Configuration

### Copy Template
```bash
cp .env.example .env.local
```

### Edit Configuration
Add these bKash variables to `.env.local`:

```env
# Sandbox (Testing)
BKASH_API_URL=https://sandbox.bkashapi.com
BKASH_APP_KEY=your_sandbox_app_key
BKASH_APP_SECRET=your_sandbox_app_secret
BKASH_USERNAME=your_sandbox_username
BKASH_PASSWORD=your_sandbox_password
BKASH_CALLBACK_URL=http://localhost:4007/api/bkash/callback

# Production (Live)
# BKASH_API_URL=https://checkout.bkash.com
# BKASH_APP_KEY=your_production_app_key
# BKASH_APP_SECRET=your_production_app_secret
# BKASH_USERNAME=your_production_username
# BKASH_PASSWORD=your_production_password
# BKASH_CALLBACK_URL=https://yourdomain.com/api/bkash/callback
```

---

## Start Development

### Quick Start (3 commands)

```bash
# 1. Configure environment
cp .env.example .env.local
# (Edit .env.local with credentials)

# 2. Start server
npm run dev

# 3. Open in browser
# http://localhost:4007
```

### After Server Starts

1. Navigate to http://localhost:4007
2. Add products to cart
3. Proceed to checkout
4. Select "bKash" as payment method
5. Enter test phone: `01913295479`
6. Click "Pay Now"
7. Complete payment on bKash sandbox
8. Verify redirect to orders page

---

## Testing Endpoints

### Create Payment (Manual Test)

```bash
# Using cURL
curl -X POST http://localhost:4007/api/bkash/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_id_here",
    "amount": 5000,
    "customerPhone": "01913295479"
  }'

# Expected Response:
# {
#   "success": true,
#   "paymentID": "bkash_payment_id",
#   "bkashURL": "https://checkout.sandbox.bkash.com/..."
# }
```

### Verify Payment (Manual Test)

```bash
# Using cURL
curl -X GET "http://localhost:4007/api/bkash/callback?paymentID=bkash_payment_id"

# Expected Response:
# {
#   "success": true,
#   "paymentStatus": "Completed",
#   "orderId": "order_id_here"
# }
```

### Track Affiliate Click

```bash
curl -X GET "http://localhost:4007/api/affiliate/track-click?affiliateUserId=user_id"

# Expected Response:
# {
#   "success": true,
#   "data": { "clicks": 5, "orderId": "..." }
# }
```

---

## Database Commands

### MongoDB Connection Test

```bash
# Check if MongoDB is connected
# View logs in terminal when starting server
# Should see: ✓ Database connected

# Query orders with affiliateUserId
# Use MongoDB Compass or CLI:
# db.orders.find({ affiliateUserId: { $exists: true } })
```

### View Affiliate Earnings

```bash
# Query AffiliateEarning records
# db.affiliateearnings.find({ affiliateUserId: "user_id" })

# Calculate total commissions
# db.affiliateearnings.aggregate([
#   { $match: { affiliateUserId: "user_id" } },
#   { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
# ])
```

---

## Production Deployment Commands

### Before Deployment

```bash
# 1. Build production bundle
npm run build

# 2. Check for TypeScript errors
npm run type-check

# 3. Run tests (if configured)
npm test

# 4. Verify env variables set
echo $BKASH_API_URL
echo $BKASH_APP_KEY
```

### Deploy to Hosting

```bash
# Using Vercel (if applicable)
vercel --prod

# Using Docker
docker build -t luxora .
docker run -p 4007:4007 luxora

# Using PM2 (Node process manager)
pm2 start npm -- run start
pm2 logs luxora
```

### Update Environment for Production

```bash
# SSH to production server
ssh user@production.domain.com

# Update .env file with production credentials
nano .env

# Restart application
pm2 restart luxora
# or
# systemctl restart app-name
```

---

## Monitoring & Logs

### View Dev Server Logs

```bash
# Logs appear in terminal when running:
npm run dev

# Look for:
# ✓ Ready in X.Xs
# ✓ Compiled /api/...
# GET /api/bkash/create-payment 200
```

### Check Payment Logs

```bash
# View in MongoDB:
# db.payments.find()
# db.orders.findOne({ isPaid: true })

# View in application logs:
# Check terminal output during payment requests
# Check server error logs if configured
```

---

## File Management

### Create Backup

```bash
# Backup entire project
zip -r luxora-backup-$(date +%Y%m%d).zip .

# Backup just code (exclude node_modules)
zip -r luxora-code-$(date +%Y%m%d).zip . -x "node_modules/*" ".next/*"

# Backup database
mongodump --out ./backup-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Restore database
mongorestore ./backup-folder

# Restore project
unzip luxora-backup.zip
npm install
npm run dev
```

---

## Cleanup & Maintenance

### Clean Build Cache

```bash
# Remove Next.js cache
rm -rf .next

# Remove node_modules
rm -rf node_modules

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm update package-name

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Troubleshooting Commands

### Check Node Version

```bash
node --version
# Should be v18+ for Next.js 15

npm --version
# Should be v8+
```

### Check Port Usage

```bash
# Windows
netstat -ano | findstr :4007

# macOS/Linux
lsof -i :4007

# Kill process on port 4007
# Windows: taskkill /PID process_id /F
# macOS/Linux: kill -9 process_id
```

### Debug Payment Issues

```bash
# Enable Node debugging
node --inspect node_modules/.bin/next dev

# View detailed logs
npm run dev 2>&1 | tee dev.log

# Check API responses
curl -v http://localhost:4007/api/bkash/create-payment
```

---

## Quick Reference Table

| Task | Command |
|------|---------|
| Setup | `cp .env.example .env.local` |
| Start Dev | `npm run dev` |
| Build | `npm run build` |
| Test Payment | `curl -X POST http://localhost:4007/api/bkash/create-payment` |
| View Logs | `tail -f logs/app.log` |
| Check Status | `npm run type-check` |
| Deploy | `npm run build && npm start` |
| Backup | `zip -r backup.zip . -x "node_modules/*"` |

---

## Documentation Navigation

| Need | Command/File |
|------|--------------|
| Quick Start | Read `BKASH_QUICK_START.md` |
| Setup Help | Read `BKASH_SETUP.md` |
| Code Structure | Read `FILE_STRUCTURE.md` |
| Deployment | Read `BKASH_CHECKLIST.md` |
| Configuration | Edit `.env.local` |

---

## Getting Help

### Check Logs
```bash
# Terminal logs (running server)
# Shows all requests and errors

# Browser Console (F12)
# Shows client-side errors

# MongoDB Logs
# Check document fields and values
```

### Test Scenarios

```bash
# Successful Payment
Phone: 01913295479
Amount: Any
Status: Success on bKash

# Failed Payment
Phone: 01913295479 (but cancel on bKash)
Status: Cancelled on bKash

# Retry
On error page, click "Retry"
Try different phone number
```

---

## Common Issues & Solutions

### Issue: "Failed to create payment"
```bash
# Check credentials
grep BKASH .env.local

# Test bKash connectivity
curl -v https://sandbox.bkashapi.com/v1.2.0/tokenized/checkout/token/request

# Check server logs
npm run dev
# Look for error messages
```

### Issue: "Order not marked paid"
```bash
# Check MongoDB connection
# Look for: "✓ Database connected" in logs

# Verify order exists
# db.orders.findOne({ _id: ObjectId("order_id") })

# Check callback endpoint
curl "http://localhost:4007/api/bkash/callback?paymentID=xxx"
```

### Issue: "Port already in use"
```bash
# Kill process using port 4007
# Windows
netstat -ano | findstr :4007
taskkill /PID process_id /F

# macOS/Linux
lsof -i :4007
kill -9 process_id

# Restart server
npm run dev
```

---

## Performance Monitoring

```bash
# Install performance tools
npm install -D @next/bundle-analyzer

# Analyze bundle size
ANALYZE=true npm run build

# Monitor API latency
# Add timing logs in lib/bkash.ts
console.time("bkash_api_call")
// ... API call
console.timeEnd("bkash_api_call")
```

---

**Last Updated**: December 2024
**For Complete Guide**: See `START_HERE.md`
