# Safarsetto / GetGoLoad - Testing Guide

**Last Updated:** 2026-05-11
**Backend:** `http://localhost:5001`
**Frontend:** `http://localhost:5173`

---

## Quick Start

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## Authentication Flows

### 1. User Login (Phone OTP)

**Step 1: Send OTP**
```
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "role": "user"
}
```

**Step 2: Verify OTP**
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "1234",  // Use dev OTP from response
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "isNewUser": true,
    "user": { ... }
  }
}
```

> **Dev Mode:** Check console for `[DEV OTP]` or response will include `_devOtp` field.

---

### 2. Vendor Login

**Same OTP flow, but use `"role": "vendor"`**

**First login creates vendor account automatically.**

---

### 3. Admin Login

```
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@getgoload.com",
  "password": "admin123"
}
```

---

## User Flows

### 1. Create Requirement

```
POST /api/requirements
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "serviceType": "goods-transport",
  "vehicleType": "Truck",
  "pickup": {
    "address": "Mumbai, Maharashtra",
    "lat": 19.0760,
    "lon": 72.8777
  },
  "drops": [
    {
      "address": "Pune, Maharashtra",
      "lat": 18.5204,
      "lon": 73.8567
    }
  ],
  "items": "Electronics",
  "weight": "500kg",
  "date": "2026-06-15",
  "time": "10:00",
  "price": 2500
}
```

### 2. Get My Requirements

```
GET /api/requirements/my
Authorization: Bearer <user_token>
```

### 3. Delete Requirement

```
DELETE /api/requirements/<requirement_id>
Authorization: Bearer <user_token>
```

> ⚠️ Cannot delete if bid is already accepted.

### 4. View Bids for Requirement

```
GET /api/requirements/<requirement_id>/bids
Authorization: Bearer <user_token>
```

### 5. Accept a Bid

```
PATCH /api/bids/<bid_id>/accept
Authorization: Bearer <user_token>
```

> When a bid is accepted, all other bids are automatically rejected.

---

## Vendor/Driver Flows

### 1. Browse Available Leads

```
GET /api/leads
Authorization: Bearer <vendor_token>
```

> ⚠️ Requires active subscription. Returns only leads matching vendor's service categories.

### 2. View Lead Details

```
GET /api/leads/<requirement_id>
Authorization: Bearer <vendor_token>
```

### 3. Place Bid

```
POST /api/leads/<requirement_id>/bid
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "amount": 2300,
  "notes": "I can deliver within 24 hours",
  "vehicleType": "Tata Ace"  // Optional - specify vehicle
}
```

### 4. Withdraw Bid

```
DELETE /api/leads/<requirement_id>/withdraw
Authorization: Bearer <vendor_token>
```

> ⚠️ Cannot withdraw an already accepted bid.

---

## Subscription & Plans

### 1. View Plans

```
GET /api/plans
```

### 2. Subscribe to Plan (Free)

```
POST /api/plans/<plan_id>/subscribe
Authorization: Bearer <vendor_token>
```

### 3. Create Payment Order (Paid Plan)

```
POST /api/plans/<plan_id>/subscribe-order
Authorization: Bearer <vendor_token>
```

### 4. Verify Payment & Activate

```
POST /api/plans/<plan_id>/subscribe-verify
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```

### 5. Check Quota

```
GET /api/plans/quota-check
Authorization: Bearer <vendor_token>
```

---

## Chat & Negotiation

### 1. Get Active Chats (User)

```
GET /api/chats/user/active
Authorization: Bearer <user_token>
```

### 2. Get Active Chats (Driver)

```
GET /api/chats/driver/active
Authorization: Bearer <vendor_token>
```

### 3. Get Messages

```
GET /api/chats/<bid_id>/messages
Authorization: Bearer <token>
```

### 4. Send Message

```
POST /api/chats/<bid_id>/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Hello, I can deliver tomorrow",
  "type": "text"
}
```

### 5. Send Counter Offer

```
POST /api/chats/<bid_id>/offer
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 2200
}
```

> This updates the bid amount and broadcasts via Socket.io.

### 6. Send Typing Indicator

```
POST /api/chats/<bid_id>/typing
Authorization: Bearer <token>
```

> Backend emits `user_typing` event to other party.

### 7. Mark Messages as Read

```
PATCH /api/chats/<bid_id>/read
Authorization: Bearer <token>
```

### 8. Accept Deal

```
POST /api/chats/<bid_id>/accept
Authorization: Bearer <user_token>
```

### 9. Accept with Wallet

```
POST /api/chats/<bid_id>/accept/pay-wallet
Authorization: Bearer <user_token>
```

### 10. Accept with Razorpay

```
POST /api/chats/<bid_id>/accept/create-order
Authorization: Bearer <user_token>
```

```
POST /api/chats/<bid_id>/accept/verify-payment
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```

### 11. Reopen Deal

```
POST /api/chats/<bid_id>/reopen
Authorization: Bearer <user_token>
```

---

## Wallet & Payments

### 1. Get Wallet Balance

```
GET /api/users/me
Authorization: Bearer <user_token>
```

> Response includes `wallet.balance` and `wallet.coins`.

### 2. Add Money to Wallet

```
POST /api/users/me/wallet/add-money
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "amount": 5000
}
```

---

## Admin Endpoints

### Dashboard Stats

```
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

### User Management

```
GET /api/admin/users
Authorization: Bearer <admin_token>
```

### Vendor Management

```
GET /api/admin/vendors
Authorization: Bearer <admin_token>
```

### Verify Vendor

```
PATCH /api/admin/vendors/<vendor_id>/verify
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Verified"
}
```

### Category Management

```
GET /api/categories
```

```
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "House Shifting",
  "slug": "house-shifting",
  "description": "Complete house relocation"
}
```

### Vehicle Management

```
GET /api/vehicles
GET /api/vehicles?category=<slug>
```

```
POST /api/vehicles
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Tata Ace",
  "capacity": "750 kg",
  "details": "Mini Truck",
  "categorySlug": "goods-transport"
}
```

### Plan Management

```
GET /api/plans/all
Authorization: Bearer <admin_token>
```

```
POST /api/plans
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Premium Yearly",
  "price": 8999,
  "durationDays": 365,
  "leadQuota": { "type": "unlimited" }
}
```

---

## Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_chat` | `{ bidId }` | Join bid chat room |
| `leave_chat` | `{ bidId }` | Leave chat room |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | Message object | New message received |
| `bid_updated` | `{ bidId, amount }` | Bid amount changed |
| `deal_accepted` | `{ bidId }` | Deal was accepted |
| `deal_reopened` | `{ bidId }` | Deal was reopened |
| `user_typing` | `{ bidId, sender, senderRole }` | User is typing |
| `messages_read` | `{ bidId, readBy }` | Messages marked as read |

---

## Testing Checklist

### User Flow
- [ ] Send OTP → Receive code
- [ ] Verify OTP → Login successful
- [ ] Create requirement with coordinates
- [ ] View my requirements
- [ ] Delete requirement (not accepted)
- [ ] View bids for requirement
- [ ] Accept a bid
- [ ] Other bids auto-rejected

### Vendor Flow
- [ ] View leads (with subscription)
- [ ] View lead details
- [ ] Place bid with vehicleType
- [ ] Withdraw bid
- [ ] Check quota usage

### Chat Flow
- [ ] Send text message
- [ ] Send counter offer (bid updates)
- [ ] Send typing indicator
- [ ] Mark messages as read
- [ ] Accept deal
- [ ] Receive deal_accepted event

### Subscription Flow
- [ ] View plans
- [ ] Subscribe to free plan
- [ ] Quota check works
- [ ] Place bid (quota decrements)
- [ ] Quota resets after period

### Admin Flow
- [ ] Login as admin
- [ ] View dashboard stats
- [ ] Manage users
- [ ] Verify vendors
- [ ] Manage categories (CRUD)
- [ ] Manage vehicles (CRUD)
- [ ] Manage plans

---

## Error Codes

| Code | Meaning |
|------|---------|
| `ACTIVE_SUBSCRIPTION_REQUIRED` | Vendor needs active subscription |
| `SUBSCRIPTION_EXPIRED` | Subscription has expired |
| `QUOTA_EXCEEDED` | Lead quota limit reached |
| `ALREADY_BID` | Vendor already bid on this lead |
| `INVALID_DATE` | Date is in the past |
| `CANNOT_DELETE` | Cannot delete accepted requirement |
| `BID_ACCEPTED` | Cannot withdraw accepted bid |

---

## Default Test Credentials

| Role | Credentials |
|------|-------------|
| Admin | `admin@getgoload.com` / `admin123` |
| User | Any 10-digit phone (OTP: check console) |
| Vendor | Any 10-digit phone (OTP: check console) |
