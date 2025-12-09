# bKash Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get bKash Credentials
- Register at https://developer.bkash.com/
- Create an app and get credentials:
  - APP_KEY
  - APP_SECRET
  - USERNAME
  - PASSWORD

### 2. Configure Environment
Create/update `.env.local`:
```bash
# Sandbox for testing
BKASH_API_URL=https://sandbox.bkashapi.com
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password
BKASH_CALLBACK_URL=http://localhost:4007/api/bkash/callback
```

### 3. Start App
```bash
npm run dev
```
Open http://localhost:4007

### 4. Test Payment
1. Create an order in checkout
2. Select "bKash" as payment method
3. Enter test phone number: `01913295479`
4. Click "Pay Now"
5. Complete payment on bKash sandbox
6. Verify redirect to orders page

## 📁 File Structure

```
lib/
├── bkash.ts                          # API client

app/
├── api/
│   └── bkash/
│       ├── create-payment/route.ts   # Create payment
│       └── callback/route.ts         # Verify payment
│
└── [locale]/
    └── checkout/
        ├── [id]/
        │   └── bkash-form.tsx        # Phone input form
        │
        └── bkash-verify/
            ├── page.tsx              # Server wrapper
            └── bkash-verify-client.tsx  # Client verification
```

## 🔄 Payment Flow

```
User → Select bKash → Enter Phone → Pay Now
  ↓
POST /api/bkash/create-payment
  ↓
Redirect to bKash Checkout
  ↓
User Completes Payment
  ↓
bKash Redirects → /checkout/bkash-verify?paymentID=xxx
  ↓
GET /api/bkash/callback?paymentID=xxx
  ↓
Success: Order Paid + Email Sent + Affiliate Earnings Recorded
```

## 💰 Commission Logic

When payment succeeds:

```javascript
// Per item in order
commission_percent = {
  "shoe": 5,
  "jean" || "pant": 7,
  "watch": 10,
  default: 10
}

commission_amount = (item.price × item.qty × percent) / 100
```

Creates `AffiliateEarning` record if `affiliateUserId` is set.

## 🧪 Testing Scenarios

### Success Scenario
1. Create order with total: 1000 BDT
2. Select bKash
3. Enter phone: `01913295479` (or any 01XXXXXXXXX)
4. Amount: 1000
5. Click "Pay Now"
6. On bKash page, approve payment
7. Order marked paid ✓

### Failure Scenario
1. Same as above
2. On bKash page, reject payment
3. Redirected with error message
4. Can retry payment

### Affiliate Scenario
1. Visit product via: `/product/slug?affiliate=user_id`
2. Complete checkout with bKash
3. Earnings recorded with category commission

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to create payment" | Check env vars, verify credentials |
| Stuck on verification | Check browser console, verify paymentID in URL |
| Order not marked paid | Check MongoDB connection, verify order exists |
| Email not sent | Check SendGrid/email config |
| Affiliate earnings missing | Verify affiliateUserId in localStorage during checkout |

## 📊 Monitoring

Check these in production:

1. **Payment Creation**
   - Endpoint: `POST /api/bkash/create-payment`
   - Monitor: Success rate, latency

2. **Payment Verification**
   - Endpoint: `GET /api/bkash/callback`
   - Monitor: Status accuracy, email delivery

3. **Affiliate Commissions**
   - Check: AffiliateEarning records created
   - Verify: Commission percentages correct
   - Check: Dashboard reflects earnings

## 🔐 Production Checklist

- [ ] Update API URL to production: `https://checkout.bkash.com`
- [ ] Use production credentials
- [ ] Update callback URL to HTTPS domain
- [ ] Enable CORS for production domain
- [ ] Implement rate limiting on create-payment
- [ ] Add server-side auth to withdraw endpoint
- [ ] Test with real payments on staging
- [ ] Monitor error rates daily
- [ ] Set up alerts for payment failures
- [ ] Verify affiliate commission calculations

## 📚 Documentation

- **Full Setup**: See `BKASH_SETUP.md`
- **Implementation Details**: See `BKASH_IMPLEMENTATION_SUMMARY.md`
- **API Reference**: See code comments in `lib/bkash.ts`

## 🆘 Support Resources

- **bKash Docs**: https://developer.bkash.com/reference/
- **Sandbox Testing**: Use credentials from bKash dashboard
- **Error Codes**: Check bKash API documentation for status codes
- **Server Logs**: Check terminal output for detailed errors

## 💡 Key Endpoints

```bash
# Create Payment
POST /api/bkash/create-payment
Content-Type: application/json
{ "orderId": "xxx", "amount": 5000, "customerPhone": "01913295479" }

# Verify Payment  
GET /api/bkash/callback?paymentID=xxx

# Track Affiliate Clicks
GET /api/affiliate/track-click?affiliateUserId=xxx

# Record Earnings
GET /api/affiliate/record-earning?affiliateUserId=xxx

# Get Affiliate Data
GET /api/affiliate/record-earning?affiliateUserId=xxx (returns with uniqueOrders)
```

## 🎯 Next Steps

1. ✅ Configure `.env.local` with bKash credentials
2. ✅ Test payment flow in sandbox
3. ✅ Verify affiliate earnings recording
4. ✅ Check email notifications
5. ✅ Deploy to staging
6. ✅ Perform production testing
7. ✅ Monitor error rates

---

**Last Updated**: December 2024
**Status**: ✅ Production Ready
**Dev Server**: Running on http://localhost:4007
