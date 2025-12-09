# bKash Payment Gateway Setup Guide

This guide explains how to set up and use the bKash payment integration in the Luxora e-commerce platform.

## Overview

bKash is a mobile financial services provider in Bangladesh. This integration allows customers to pay for orders using bKash wallet/mobile money.

## Components

### 1. **Backend API Client** (`lib/bkash.ts`)
- Handles all communication with bKash API
- Methods:
  - `getToken()` - Obtains authentication token (auto-cached for 55 minutes)
  - `createPayment()` - Initiates a payment request
  - `executePayment()` - Captures payment after user approval
  - `queryPayment()` - Checks payment status
  - `refundPayment()` - Refunds a transaction

### 2. **Payment Creation Endpoint** (`app/api/bkash/create-payment/route.ts`)
- POST endpoint that creates a bKash payment request
- Input: `{ orderId, amount, customerPhone }`
- Returns: `{ paymentID, bkashURL }`
- User is redirected to `bkashURL` to complete payment

### 3. **Callback Handler** (`app/api/bkash/callback/route.ts`)
- GET endpoint that handles bKash redirect after payment
- Verifies payment status with bKash
- Marks order as paid when successful
- Records affiliate earnings (if applicable)
- Sends receipt email
- Returns status information

### 4. **Verification Page** (`app/[locale]/checkout/bkash-verify/`)
- Server component: `page.tsx`
- Client component: `bkash-verify-client.tsx`
- Displays payment verification status
- Redirects to orders page on success

### 5. **Checkout Form** (`app/[locale]/checkout/[id]/bkash-form.tsx`)
- Client component for bKash payment input
- Accepts phone number
- Shows payment instructions
- Calls create-payment endpoint

## Environment Setup

### 1. Get bKash Merchant Credentials

1. Register as a merchant on [bKash Developer Portal](https://developer.bkash.com/)
2. Create an application
3. Obtain credentials:
   - APP_KEY
   - APP_SECRET
   - USERNAME
   - PASSWORD

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update bKash settings:

```bash
# Sandbox (testing)
BKASH_API_URL=https://sandbox.bkashapi.com
BKASH_APP_KEY=your_sandbox_app_key
BKASH_APP_SECRET=your_sandbox_app_secret
BKASH_USERNAME=your_sandbox_username
BKASH_PASSWORD=your_sandbox_password
BKASH_CALLBACK_URL=http://localhost:4007/api/bkash/callback

# Production (live)
# BKASH_API_URL=https://checkout.bkash.com
# BKASH_APP_KEY=your_production_app_key
# BKASH_APP_SECRET=your_production_app_secret
# BKASH_USERNAME=your_production_username
# BKASH_PASSWORD=your_production_password
# BKASH_CALLBACK_URL=https://yourdomain.com/api/bkash/callback
```

### 3. Database Setup

The Order model includes a new field:
- `affiliateUserId` (optional String) - Stores affiliate user ID if order came through affiliate link

This field is automatically populated when creating orders through affiliate links.

## Payment Flow

### User Journey

```
1. User adds items to cart
2. User proceeds to checkout
3. User selects "bKash" as payment method
4. User enters phone number (01XXXXXXXXX format)
5. User clicks "Pay Now"
   ↓
6. System creates payment request with bKash
   ↓
7. User redirected to bKash payment page
8. User completes payment on bKash
   ↓
9. bKash redirects back to /checkout/bkash-verify?paymentID=xxx
   ↓
10. Verification page queries payment status
11. If successful:
    - Order marked as paid
    - Receipt email sent
    - Affiliate earnings recorded (if applicable)
    - User redirected to /account/orders
12. If failed:
    - Error message shown
    - Option to retry
```

### Code Flow

1. **Create Payment** → `POST /api/bkash/create-payment`
   - Input: Order ID, Amount, Phone
   - Calls: `bkash.createPayment()`
   - Returns: Payment ID & bKash URL

2. **User Payment** → bKash payment page (external)

3. **Callback Verification** → `GET /api/bkash/callback?paymentID=xxx`
   - Calls: `bkash.queryPayment()`
   - Updates Order: `isPaid = true`
   - Records Earnings: AffiliateEarning (if `affiliateUserId` set)
   - Sends: Receipt email

4. **Redirect Success** → `/account/orders`

## Commission Calculation

When a payment is successful and `affiliateUserId` is set:

- **Category-based commissions** are applied:
  - Shoes: 5%
  - Jeans/Pants: 7%
  - Watches: 10%
  - Others: 10%

- For each item in order:
  ```
  commissionAmount = (itemPrice × quantity × commissionPercent) / 100
  ```

- AffiliateEarning record created with status: `"confirmed"`

## Testing with bKash Sandbox

### Test Credentials

For sandbox testing, use these test phone numbers (provided by bKash):

- Valid test account: `01913295479` (example - get from bKash docs)

### Test Payment Flow

1. Start dev server: `npm run dev`
2. Create test order at `http://localhost:4007/checkout/[orderId]`
3. Select bKash payment
4. Enter test phone number
5. Enter amount
6. On bKash sandbox page, approve payment
7. Verify payment completion

### Debugging

Check browser console and server logs for:
- API response status codes
- Payment ID mismatch
- Token expiration errors
- Callback verification failures

Enable logging in `lib/bkash.ts`:
```typescript
console.log("bKash response:", data);
```

## Transitioning to Production

### 1. Update Environment Variables

```bash
BKASH_API_URL=https://checkout.bkash.com
BKASH_CALLBACK_URL=https://yourdomain.com/api/bkash/callback
# Use production credentials
```

### 2. Security Checklist

- ✅ Verify HTTPS callback URL
- ✅ Validate phone number format strictly
- ✅ Implement rate limiting on create-payment endpoint
- ✅ Add server-side authentication for affiliate withdraw endpoint
- ✅ Monitor payment verification logs
- ✅ Set up error alerts for failed payments

### 3. Monitoring

Monitor these metrics:
- Payment success rate
- Average payment time
- Callback delivery reliability
- Affiliate commission accuracy

## Troubleshooting

### Payment Not Creating

**Error**: `statusCode !== "0000"`

**Solutions**:
1. Check credentials in `.env.local`
2. Verify API URL is correct (sandbox vs production)
3. Ensure phone number format: `01XXXXXXXXX`
4. Check if token is expired (should auto-refresh)

### Callback Not Processing

**Error**: `Order marked paid but not in database`

**Solutions**:
1. Verify `merchantInvoiceNumber` matches order ID
2. Check MongoDB connection
3. Ensure Order collection exists
4. Check server logs for errors

### Payment Status Stuck

**Error**: Verification page keeps loading

**Solutions**:
1. Check if paymentID in URL is valid
2. Verify callback endpoint is accessible
3. Check bKash API rate limits
4. Try refreshing page

## API Endpoints

### Create Payment
```
POST /api/bkash/create-payment
Content-Type: application/json

{
  "orderId": "order_id_string",
  "amount": 5000,
  "customerPhone": "01913295479"
}

Response:
{
  "success": true,
  "paymentID": "bkash_payment_id",
  "bkashURL": "https://checkout.sandbox.bkash.com/..."
}
```

### Verify Payment
```
GET /api/bkash/callback?paymentID=bkash_payment_id

Response:
{
  "success": true,
  "paymentStatus": "Completed",
  "orderId": "order_id_string"
}
```

## References

- [bKash Developer Documentation](https://developer.bkash.com/)
- [bKash API Reference](https://developer.bkash.com/reference/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Stripe Integration Guide](./STRIPE_SETUP.md) (for comparison)

## Support

For issues with:
- **bKash API**: Contact bKash developer support
- **Integration code**: Check server logs at `app/api/bkash/callback/route.ts`
- **Payment verification**: Review browser Network tab during checkout

---

**Last Updated**: December 2024
**Next Phase**: Real-time payment status updates via WebSocket/SSE
