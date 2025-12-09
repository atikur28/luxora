# bKash Integration - File Directory & Purpose

## 📁 Complete File Structure

```
e:/luxoraa/luxora/
│
├── 📄 DOCUMENTATION
│   ├── BKASH_README.md ......................... Overview & Quick Links
│   ├── BKASH_QUICK_START.md ................... 5-minute setup guide
│   ├── BKASH_SETUP.md ......................... Complete setup guide
│   ├── BKASH_IMPLEMENTATION_SUMMARY.md ........ Technical implementation details
│   ├── BKASH_CHECKLIST.md ..................... Deployment & maintenance checklist
│   └── .env.example ........................... Environment variables template
│
├── lib/
│   ├── 🔑 bkash.ts ........................... bKash API CLIENT
│   │   └── Exports: { bkash } object with methods:
│   │       • getToken() - Get/cache auth token
│   │       • createPayment() - Create payment request
│   │       • executePayment() - Capture approved payment
│   │       • queryPayment() - Check payment status
│   │       • refundPayment() - Process refund
│   │
│   ├── db/models/
│   │   ├── order.model.ts ................... UPDATED: Added affiliateUserId field
│   │   ├── affiliate-earning.model.ts ....... Tracks affiliate commissions
│   │   ├── affiliate-click.model.ts ......... Tracks affiliate link clicks
│   │   └── affiliate-withdraw.model.ts ...... Tracks withdrawal requests
│   │
│   ├── actions/
│   │   └── order.actions.ts ................. UPDATED: Now accepts affiliateUserId
│   │       • createOrder(cart, affiliateUserId)
│   │       • createOrderFromCart(cart, userId, affiliateUserId)
│   │
│   └── validator.ts .......................... UPDATED: OrderInputSchema includes affiliateUserId
│
├── app/
│   ├── api/
│   │   └── bkash/
│   │       ├── 📨 create-payment/route.ts ... CREATE PAYMENT ENDPOINT
│   │       │   └── POST /api/bkash/create-payment
│   │       │       Input: { orderId, amount, customerPhone }
│   │       │       Output: { paymentID, bkashURL }
│   │       │
│   │       └── ✅ callback/route.ts ........ PAYMENT VERIFICATION ENDPOINT
│   │           └── GET /api/bkash/callback?paymentID=xxx
│   │               • Verifies payment status
│   │               • Marks order as paid
│   │               • Records affiliate earnings
│   │               • Sends receipt email
│   │
│   └── [locale]/
│       └── checkout/
│           ├── 📋 checkout-form.tsx ......... UPDATED: Extract affiliateUserId from localStorage
│           │
│           ├── [id]/
│           │   ├── 💳 bkash-form.tsx ........ BKASH CHECKOUT FORM
│           │   │   └── Component for:
│           │   │       • Phone input (01XXXXXXXXX)
│           │   │       • Payment instructions
│           │   │       • Submit handler
│           │   │
│           │   └── payment-form.tsx ......... UPDATED: Import & render BkashForm
│           │
│           └── bkash-verify/
│               ├── 🎯 page.tsx ............. SERVER VERIFICATION PAGE
│               │   └── Handles: /checkout/bkash-verify?paymentID=xxx
│               │       • Validates paymentID
│               │       • Renders client component
│               │
│               └── 📱 bkash-verify-client.tsx CLIENT VERIFICATION
│                   └── Component for:
│                       • Poll payment status every 500ms
│                       • Show success/error messages
│                       • Redirect to orders on success
│                       • Offer retry on failure
```

---

## 🎯 File Purpose & Responsibilities

### API Tier (Backend)

#### `lib/bkash.ts` - Core API Client
**Purpose**: Communicate with bKash payment gateway
**Responsibility**:
- Manage authentication tokens
- Create payment requests
- Verify payment status
- Handle refunds
- Error handling

**Key Methods**:
```typescript
bkash.getToken()              // Returns cached or new token
bkash.createPayment(...)      // POST /v1.2.0/tokenized/checkout/create
bkash.queryPayment(paymentID) // POST /v1.2.0/tokenized/checkout/payment/status
```

---

#### `app/api/bkash/create-payment/route.ts` - Payment Initiation
**Purpose**: Handle checkout "Pay Now" button click
**HTTP**: `POST /api/bkash/create-payment`
**Input**: `{ orderId, amount, customerPhone }`
**Process**:
1. Validate inputs
2. Find order in database
3. Call bkash.createPayment()
4. Return paymentID & bkashURL

**Output**: `{ success, paymentID, bkashURL }`

---

#### `app/api/bkash/callback/route.ts` - Payment Processing
**Purpose**: Handle bKash redirect after customer pays
**HTTP**: `GET /api/bkash/callback?paymentID=xxx`
**Process**:
1. Query bKash for payment status
2. If SUCCESS:
   - Find order by ID
   - Set `order.isPaid = true`
   - Record affiliate earnings (if affiliateUserId)
   - Send receipt email
3. If FAILED/CANCELLED:
   - Return error status

**Output**: `{ success, message, status, orderId }`

**Affiliate Earnings Recording**:
```
For each item in order:
  commission_percent = getCommissionPercent(item.category)
  commission_amount = (item.price × item.quantity × percent) / 100
  
  Create AffiliateEarning record:
  {
    affiliateUserId,
    orderId,
    productId,
    orderAmount,
    commissionPercent,
    commissionAmount,
    status: "confirmed"
  }
```

---

### UI Tier (Frontend/Components)

#### `app/[locale]/checkout/[id]/bkash-form.tsx` - Payment Form
**Purpose**: Collect bKash payment details from customer
**Props**: `{ orderId, totalPrice }`
**Features**:
- Phone input field
- Instructions display
- Loader during submission
- Error messages

**Flow**:
1. User enters phone: `01913295479`
2. Click "Pay Now"
3. POST to `/api/bkash/create-payment`
4. Receive bkashURL
5. Redirect to bKash checkout

---

#### `app/[locale]/checkout/bkash-verify/page.tsx` - Server Page
**Purpose**: Server-side wrapper for verification
**Route**: `/checkout/bkash-verify?paymentID=xxx`
**Process**:
1. Extract paymentID from search params
2. Validate paymentID exists
3. Render BkashVerifyClient component

**Handles**: Invalid paymentID error page

---

#### `app/[locale]/checkout/bkash-verify/bkash-verify-client.tsx` - Verification Client
**Purpose**: Poll and display payment verification status
**Flow**:
1. On mount: Start polling GET `/api/bkash/callback?paymentID=xxx`
2. Every 500ms: Check payment status
3. Show loading spinner
4. On success:
   - Display success message
   - Wait 2 seconds
   - Redirect to `/account/orders`
5. On failure:
   - Display error message
   - Offer retry option

---

### Model & Validation Tier

#### `lib/db/models/order.model.ts` - Order Schema
**Updated Field**:
```typescript
affiliateUserId: { 
  type: String,  // Optional
  // Stores affiliate user ID if order came through affiliate link
}
```

**Purpose**: Link orders to affiliates for commission tracking

---

#### `lib/validator.ts` - Validation Schema
**Updated Schema**:
```typescript
OrderInputSchema = z.object({
  // ... existing fields
  affiliateUserId: z.string().optional(),
})
```

**Purpose**: Validate affiliateUserId during order creation

---

### Action Tier (Server Functions)

#### `lib/actions/order.actions.ts` - Order Actions
**Updated Functions**:

```typescript
createOrder(clientSideCart, affiliateUserId?) 
  • Called from checkout-form.tsx
  • Gets session user
  • Calls createOrderFromCart
  • Passes affiliateUserId

createOrderFromCart(cart, userId, affiliateUserId?)
  • Calculates delivery date & price
  • Validates with schema
  • Creates Order document
  • Stores affiliateUserId if provided
```

---

### Integration Points

#### `app/[locale]/checkout/checkout-form.tsx` - Checkout Entry
**Updated Code**:
```typescript
const handlePlaceOrder = async () => {
  // NEW: Extract affiliateUserId from localStorage
  const affiliateUserId = localStorage.getItem("affiliateUserId")
  
  // UPDATED: Pass affiliateUserId to createOrder
  const res = await createOrder(cartData, affiliateUserId)
}
```

**Purpose**: Capture affiliate tracking from product page to checkout

---

#### `app/[locale]/checkout/[id]/payment-form.tsx` - Payment Method Selector
**Updated Code**:
```typescript
// NEW: Import bKash form
import BkashForm from "./bkash-form"

// NEW: Conditional render in JSX
{!isPaid && paymentMethod === "bKash" && (
  <BkashForm orderId={order._id} totalPrice={order.totalPrice} />
)}
```

**Purpose**: Show bKash form when selected as payment method

---

## 🔗 Data Flow Diagram

```
CHECKOUT FLOW
=============

1. PRODUCT PAGE
   └─ User clicks "Generate Affiliate Link"
   └─ URL: /product/slug?affiliate=userId
   └─ affiliate-param-storer.tsx stores affiliateUserId in localStorage

2. CHECKOUT PAGE
   └─ checkout-form.tsx loads
   └─ User fills shipping & selects bKash
   └─ Clicks "Place Order"
   └─ handlePlaceOrder extracts affiliateUserId from localStorage
   └─ Calls createOrder(cart, affiliateUserId)

3. ORDER CREATION
   └─ createOrder() creates order with affiliateUserId
   └─ Order stored in MongoDB with affiliateUserId field
   └─ Returns orderId to checkout

4. PAYMENT PAGE
   └─ Routes to /checkout/orderId
   └─ Shows bkash-form.tsx
   └─ User enters phone and clicks "Pay Now"

5. CREATE PAYMENT
   └─ POST /api/bkash/create-payment
   └─ lib/bkash.ts → bkash.createPayment()
   └─ Returns { paymentID, bkashURL }
   └─ Client redirects to bKash checkout

6. BKASH PAYMENT
   └─ User completes payment on bKash
   └─ bKash redirects to /checkout/bkash-verify?paymentID=xxx

7. VERIFICATION
   └─ bkash-verify/page.tsx handles request
   └─ Renders bkash-verify-client.tsx
   └─ Client polls GET /api/bkash/callback?paymentID=xxx

8. PAYMENT VERIFICATION
   └─ lib/bkash.ts → bkash.queryPayment(paymentID)
   └─ Receives status from bKash
   └─ If "Completed":
      └─ Find order by ID
      └─ Set order.isPaid = true
      └─ Record AffiliateEarning (if affiliateUserId exists)
      └─ Send receipt email
      └─ Return success

9. SUCCESS REDIRECT
   └─ Client sees success message
   └─ Redirects to /account/orders
   └─ User sees paid order in dashboard
```

---

## 🧪 Testing File Locations

### Test Payment Creation
```
File: app/api/bkash/create-payment/route.ts
Call: POST /api/bkash/create-payment
Body: { "orderId": "xxx", "amount": 5000, "customerPhone": "01913295479" }
Expected: { "success": true, "paymentID": "...", "bkashURL": "..." }
```

### Test Payment Verification
```
File: app/api/bkash/callback/route.ts
Call: GET /api/bkash/callback?paymentID=xxx
Expected: { "success": true, "paymentStatus": "Completed", "orderId": "..." }
```

### Test Order with Affiliate
```
File: app/[locale]/checkout/checkout-form.tsx
Steps:
1. Visit product with ?affiliate=userId
2. Add to cart
3. Go to checkout
4. Check localStorage: localStorage.getItem("affiliateUserId")
5. Place order
6. Check MongoDB: order.affiliateUserId should be set
```

---

## 📊 File Size & Complexity

| File | Lines | Complexity | Purpose |
|------|-------|-----------|---------|
| `lib/bkash.ts` | ~250 | Medium | API Client |
| `create-payment/route.ts` | ~45 | Low | Simple endpoint |
| `callback/route.ts` | ~120 | High | Order fulfillment |
| `bkash-form.tsx` | ~80 | Low | Form component |
| `bkash-verify/page.tsx` | ~40 | Low | Server wrapper |
| `bkash-verify-client.tsx` | ~130 | Medium | Polling logic |

**Total Code**: ~665 lines of new/modified code

---

## 🔐 Security Considerations

### Files with Security Impact
1. **`callback/route.ts`** - Most critical
   - Verifies payment status
   - Updates order isPaid
   - Must validate order ownership

2. **`bkash.ts`** - Token management
   - Don't expose tokens to client
   - Keep API secrets secure
   - Validate all API responses

3. **`create-payment/route.ts`** - Payment initiation
   - Validate order exists
   - Validate amount matches order
   - Add rate limiting in production

---

## 🚀 Deployment Locations

### Development
- Dev Server: http://localhost:4007
- Callback: http://localhost:4007/api/bkash/callback

### Staging
- Server: https://staging.domain.com
- Callback: https://staging.domain.com/api/bkash/callback

### Production
- Server: https://domain.com
- Callback: https://domain.com/api/bkash/callback

**⚠️ Update BKASH_CALLBACK_URL in .env for each environment!**

---

## ✅ Quick File Checklist

```
CRITICAL FILES (Must exist):
☐ lib/bkash.ts
☐ app/api/bkash/create-payment/route.ts
☐ app/api/bkash/callback/route.ts
☐ app/[locale]/checkout/[id]/bkash-form.tsx
☐ app/[locale]/checkout/bkash-verify/page.tsx
☐ app/[locale]/checkout/bkash-verify/bkash-verify-client.tsx

UPDATED FILES (Must have changes):
☐ lib/db/models/order.model.ts (has affiliateUserId)
☐ lib/validator.ts (has affiliateUserId)
☐ lib/actions/order.actions.ts (accepts affiliateUserId)
☐ app/[locale]/checkout/checkout-form.tsx (extracts affiliateUserId)
☐ app/[locale]/checkout/[id]/payment-form.tsx (has BkashForm)

DOCUMENTATION:
☐ .env.example (has bKash variables)
☐ BKASH_README.md
☐ BKASH_QUICK_START.md
☐ BKASH_SETUP.md
☐ BKASH_IMPLEMENTATION_SUMMARY.md
☐ BKASH_CHECKLIST.md
```

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready
