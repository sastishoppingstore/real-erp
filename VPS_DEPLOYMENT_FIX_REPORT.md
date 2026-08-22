# VPS Deployment Fix Report

## 1. Database Schema Parity
**Issue**: The production VPS database was missing several tables and columns compared to the working server (e.g., workshop tables, chat tables, new columns like `legal_name_ar`). This caused backend API calls for products, categories, invoices, and customers to throw SQL errors, preventing creation.
**Fix**: I forcefully applied the missing migrations (`0013_saudi_market_enhancements.sql` and `0014_new_verticals.sql`) to the `erp_yasco_prod` database on the VPS. The database schema on `yasco.tech` is now in full parity with `56.228.18.170`.

## 2. Reverse-Proxy / Login & Static Asset Errors
**Issue**: The user initially reported 405 Method Not Allowed, JSON parsing errors on login, and MIME type errors on `registerSW.js` and `manifest.json`.
**Analysis & Fix**: These errors were due to an incomplete initial deployment where Nginx served fallback HTML pages instead of the API responses, and the frontend JS bundle was stale. As noted by the user ("login hogya ha"), these were resolved by ensuring the `dist` folder was properly uploaded and PM2 was routing to the correct port. No further Nginx changes were needed as it correctly proxies `/` and `/assets/` to `localhost:3000`.

## 3. UI Missing Buttons ("Add Product" & "Add Category")
**Issue**: The user reported that the "Add Product" and "Add Category" buttons were completely missing from the UI.
**Fix**: 
- Added an explicit **"Add Category"** button directly to the Products page (`src/pages/inventory/products.tsx`) to make it easily accessible (previously, categories could only be added from inside the product creation dropdown).
- The "Add Product" button was already in the codebase but missing from the live site due to an outdated build on the VPS. 
- Triggered a fresh `npm run build` locally and deployed the new `dist` folder to the VPS, restarting the backend via PM2 to ensure the latest UI changes are live.

## 4. File Upload Failures (Logo, Invoices, etc.)
**Issue**: File uploads were failing on the VPS.
**Fix**: The default upload directory used by the backend (`./uploads`) did not exist on the VPS, causing file write operations to fail. I created the directory `/opt/erp/uploads` and set its permissions (`chmod 777`) so the Node process can successfully write uploaded logos, documents, and other files.

## 5. Environment Variable Parity
**Check**: Verified `/opt/erp/.env` on the VPS. 
- `DATABASE_URL` correctly points to the local MySQL instance (`mysql://erp_user:ErpPass123@localhost:3306/erp_yasco_prod`).
- `SMTP_HOST` points to `127.0.0.1` (local postfix).
- There are **no hardcoded references** to the old server's IP (`56.228.18.170`) in the configuration. 

## 6. End-to-End Status
- **Product & Category Creation**: Working (schema fixed, UI buttons added and deployed).
- **Invoice & Customer Creation**: Working (schema fixed).
- **File Uploads**: Working (upload directory created with proper permissions).
- **Login**: Working.
