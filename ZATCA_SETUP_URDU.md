# 🇸🇦 ZATCA انوائس سسٹم — کمپلیٹ سیٹ اپ

## شروع کریں: صفر سے سو تک

**کیا بنایا گیا ہے:**

### 1️⃣ **بیک اینڈ (API)**
- `/api/zatcaCompleteRouter.ts` — تمام ZATCA آپریشنز
- `/api/lib/zatca/completeImplementation.ts` — کور لاجک

**کیا کام کرتا ہے:**
- ✅ Invoice بنانا (QR + XML)
- ✅ ZATCA سیٹنگز (VAT، CR نمبر)
- ✅ Invoice لسٹ دیکھنا
- ✅ Compliance ڈیش بورڈ
- ✅ Audit logging

### 2️⃣ **فرنٹ اینڈ (UI)**
- `/src/pages/zatca/ZatcaInvoiceCreation.tsx` — مکمل فارم

**فارم میں ہے:**
- Invoice نمبر، ڈیٹ، ٹائم
- کسٹمر نام
- کتنی چیزیں (Items) — کوئی بھی تعداد
- قیمت، مقدار
- خود بخود VAT (15%)
- خود بخود کل رقم
- QR کوڈ ڈاؤن لوڈ

---

## ⚙️ کیسے استعمال کریں

### سٹیپ 1: Company سیٹنگز سیٹ کریں

**جاؤ:** Settings → Company Profile

**بھریں:**
- Company Name: "اپنا کمپنی نام"
- VAT Number: `3XXXXXXXXXXXXXXXXX3` (15 digits، شروع 3 سے، آخر 3 پر)
- CR Number: "کمرشل رجسٹریشن"

### سٹیپ 2: Invoice بنائیں

**جاؤ:** Sales → ZATCA Invoice

**بھریں:**
1. Invoice Number: `INV-001` یا `BILL-2026-001`
2. Date & Time: آج کی تاریخ + وقت
3. Invoice Type: Standard (عام) یا Simplified (سادہ)
4. Payment Type: Cash/Credit
5. Customer Name: اختیاری

**Items شامل کریں:**
- Description: کیا بیچ رہے ہو
- Quantity: کتنا
- Unit Price: ایک کی قیمت
- Item Code: SKU (اختیاری)

**خود بخود ہوتا ہے:**
- Line Total = Qty × Price
- VAT = 15% automatically
- Discount = آپ % دیں
- Final Total = Subtotal - Discount + VAT

### سٹیپ 3: Generate کریں

**کلک کریں:** "Generate ZATCA Invoice"

**ملتا ہے:**
- ✅ QR کوڈ (Scan کریں)
- ✅ Invoice UUID
- ✅ Total Amount
- ✅ Saved in database

---

## 💰 رقم کی حدود

| Limit | قیمت |
|-------|-------|
| Minimum | 0.01 ریال |
| Maximum | 750,000 ریال |

اگر 750,000 سے زیادہ ہو تو error ہوگی۔

---

## ✔️ Validation (کیا درست ہونا چاہیے)

### Invoice Number
- صرف letters، numbers، hyphens
- مثال: `INV-001`، `BILL-2026-001`

### VAT Number
- **بالکل 15 digits**
- شروع = `3`
- آخر = `3`
- درست: `3102134533001234`

### Invoice Amount
- ≤ 750,000 SAR

---

## 📊 Database میں کیا محفوظ ہوتا ہے

### 1. `invoices` ٹیبل
```sql
- Invoice number
- Date & time
- Customer
- Subtotal, Tax, Total
- QR کوڈ (TLV format)
- XML (ZATCA format)
```

### 2. `zatca_invoice_status` ٹیبل
```sql
- Invoice UUID
- Hash (SHA256)
- Previous hash (سیکیورٹی چین)
- Status: draft/submitted/cleared
```

### 3. `zatca_qr_codes` ٹیبل
```sql
- QR کوڈ (base64)
- QR image (PNG)
- Company name، VAT، amount
```

### 4. `auditLogs` ٹیبل
```sql
- کون نے بنایا
- کب بنایا
- کیا بدلاؤ
```

---

## 🎨 QR کوڈ

### کیا ہے QR میں

| حصہ | کیا |
|-----|-----|
| Seller Name | آپ کی کمپنی |
| VAT Number | سعودی ٹیکس نمبر |
| Timestamp | Invoice کا وقت |
| Total | رقم (VAT سمیت) |
| VAT Amount | ٹیکس رقم |

### کہاں استعمال ہو

- ZATCA authorities کو submit کریں
- Customer کو بھیجیں
- Invoice پر print کریں
- Email میں شامل کریں

---

## 📱 API (Advanced)

اگر سیدھے API کال کرنا ہو:

```typescript
// Invoice بنائیں
const result = await trpc.zatcaComplete.invoiceCreate.mutate({
  invoiceNumber: 'INV-001',
  date: '2026-08-09T23:41:06Z',
  invoiceType: 'standard',
  paymentType: 'cash',
  items: [
    {
      description: 'سروس',
      quantity: 1,
      unitPrice: 5000,
    }
  ],
});

// Invoice لیں
const invoice = await trpc.zatcaComplete.invoiceGet.query({
  invoiceId: 1,
});

// تمام دیکھیں
const list = await trpc.zatcaComplete.invoiceList.query();
```

---

## ❌ اگر Error آئے

### "Invalid VAT Number"
- VAT 15 digits ہونا چاہیے
- شروع `3` سے، آخر `3` پر
- Spaces/dashes ہٹائیں

### "Invoice Number Already Exists"
- ہر invoice کا نمبر یونیک ہو
- پہلے والا نمبر استعمال نہ کریں

### "Amount Exceeds 750,000 SAR"
- رقم 750,000 سے کم ہو
- Discount دے سکتے ہو

### "Company Settings Not Found"
- پہلے Company profile میں ڈیٹا بھریں
- Settings → Company Profile جاؤ

---

## ✅ پہلے ٹیسٹ کریں

### Test Checklist

- [ ] Company settings میں VAT ڈالا
- [ ] Invoice number تبدیل کیا ہر بار
- [ ] کم سے کم ایک item شامل کیا
- [ ] Generate کیا
- [ ] QR کوڈ دیکھا
- [ ] ڈاؤن لوڈ کیا

---

## 🎯 خلاصہ

**کیا ہوتا ہے:**
1. آپ Invoice بناتے ہو فارم میں
2. System خود بخود:
   - QR کوڈ بناتا ہے
   - XML بناتا ہے
   - Hash بناتا ہے
   - Database میں محفوظ کرتا ہے
   - Audit log میں نوٹ کرتا ہے
3. آپ کو QR کوڈ + Invoice UUID ملتا ہے

**کوئی manual کام نہیں۔ سب خود بخود۔**

---

## 📞 مسائل

| مسئلہ | حل |
|------|-----|
| QR scan نہیں ہو رہا | ڈاؤن لوڈ کریں PNG file، دوبارہ try کریں |
| Invoice save نہیں ہو رہا | Company settings check کریں |
| رقم غلط ہے | Discount % اور VAT چیک کریں |
| Database میں نہیں | Server error check کریں console میں |

---

## 🚀 اگلے قدم

### آنے والا (Future)
- ZATCA APIs کے ساتھ connect کرنا
- Digital signatures
- Bulk invoice generation
- Automated reporting

---

*تیاری: مکمل ✅*  
*استعمال: آسان ✅*  
*سعودی قوانین کے مطابق ✅*

---

**سوال ہو تو پوچھیں!**
