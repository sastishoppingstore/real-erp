# ⚡ ZATCA Quick Start Card

## 📋 3 منٹ میں شروع کریں

### Step 1: Company Setup (1 منٹ)
```
Settings → Company Profile
├─ Company Name: "اپنا نام"
├─ VAT Number: 3XXXXXXXXXXXXXXXXX3 (15 digits)
└─ CR Number: "کمرشل رجسٹریشن"
```

### Step 2: Create Invoice (1 منٹ)
```
Sales → ZATCA Invoice
├─ Invoice #: INV-001
├─ Date: آج کی تاریخ
├─ Customer: نام (اختیاری)
└─ Items: (کم از کم 1)
   └─ Description
   └─ Quantity
   └─ Unit Price
```

### Step 3: Generate (1 منٹ)
```
کلک کریں: Generate ZATCA Invoice
└─ ✅ QR code ملتا ہے
└─ ✅ Invoice UUID ملتا ہے
└─ ✅ Total amount ملتا ہے
```

---

## 🎯 Key Numbers

| Number | Value |
|--------|-------|
| Min Amount | 0.01 SAR |
| Max Amount | 750,000 SAR |
| VAT Rate | 15% |
| VAT Digits | 15 (3...3) |
| Invoice # Length | 1-40 chars |

---

## ✅ Checklist

- [ ] Company VAT filled
- [ ] Invoice # unique
- [ ] At least 1 item
- [ ] Amount ≤ 750,000
- [ ] Generate button clicked
- [ ] QR received
- [ ] Downloaded

---

## ❌ Common Errors

| Error | Fix |
|-------|-----|
| Invalid VAT | 15 digits: 3...3 |
| No items | Add at least 1 |
| Amount too high | Reduce or discount |
| Settings missing | Fill company profile |

---

## 📱 API Quick Call

```typescript
// Create
trpc.zatcaComplete.invoiceCreate.mutate({...})

// Get
trpc.zatcaComplete.invoiceGet.query({invoiceId: 1})

// List
trpc.zatcaComplete.invoiceList.query()

// Dashboard
trpc.zatcaComplete.complianceDashboard.query()
```

---

## 🔗 Links

- **Full Docs:** `ZATCA_COMPLETE_IMPLEMENTATION.md`
- **Urdu Guide:** `ZATCA_SETUP_URDU.md`
- **Implementation:** `ZATCA_DELIVERY_SUMMARY.md`

---

**Ready? Start now! ⚡**
