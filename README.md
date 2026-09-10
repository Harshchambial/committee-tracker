# Samiti - Committee Fund & Payment Tracker 🇮🇳

A transparent, high-performance web tool built with **Next.js 16**, **TypeScript**, and **Tailwind CSS** to track monthly ₹1,000 committee contributions, verify UPI payments, and maintain a publicly auditable fund utilization ledger.

---

## ✨ Key Features

1. **Member & Public Transparency Portal**:
   - **Live Treasury Dashboard**: Live Net Balance in Bank, Total Collections, Total Expenses, and Active Members.
   - **12-Month Payment Matrix**: Visual grid showing all members and months (Green = Paid, Amber = Under Verification, Red = Due, Gray = Not Joined).
   - **Member Self-Service Ledger**: Any member can select their name or phone number to view their lifetime contribution, check pending dues, and download verified digital receipts.

2. **Zero-Fee UPI Payment Workflow (Option 2)**:
   - Dynamic UPI QR Code pre-filled with the committee's UPI ID, Payee Name, ₹1,000 amount, and member reference.
   - Click-to-pay button for mobile users (`GPay`, `PhonePe`, `Paytm`, `BHIM`).
   - Member inputs their 12-digit UPI Reference / UTR Number.
   - Automated duplicate-UTR detection to prevent duplicate claims.

3. **Admin Dashboard (For Father / Treasurer)**:
   - Protected by a secure Admin PIN (Default: `1234`, customizable).
   - **1-Tap Approval Queue**: Quickly approve or reject submitted UTRs against bank alerts.
   - **Offline Cash Payment Logger**: Easily record ₹1,000 cash payments handed in person by members.
   - **1-Click WhatsApp Reminders**: Direct WhatsApp button with pre-formatted polite reminder messages for members with pending dues.
   - **Expense & Fund Utilization Tracker**: Record every expense (Category, Amount, Date, Voucher note, Description).
   - **Member Directory**: Add and manage members as the committee scales from 10 to 100–500 members.
   - **1-Click JSON Backup**: Download complete database backup anytime.

4. **Digital Payment Receipts**:
   - Official digital receipt with receipt number, member name, month/year, UTR reference, authorized seal, printable to PDF, and shareable directly to WhatsApp.

---

## 🚀 Quick Start

### 1. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run in Production Mode
```bash
npm run build
npm run start -p 3000
```

---

## 🔐 Admin Credentials

- **Default Admin PIN**: `1234`
- You can change the Admin PIN anytime from the **Admin Panel → Settings & Backup** tab.

---

## ⚙️ Configuration

To set your father's actual UPI ID and Payee Name:
1. Open the app and click **Admin Login** in the top right.
2. Enter PIN: `1234`.
3. Go to the **Settings & Backup** tab.
4. Update **Committee UPI ID** (e.g. `fathername@okhdfcbank`) and **Payee Name**.
5. Click **Save Settings**.

All newly generated QR codes will instantly point to your father's UPI account!

---

## 📱 Mobile Experience (PWA Ready)
Committee members can open the URL in Chrome or Safari on their Android or iPhone and tap **"Add to Home Screen"** to use it like a native app.
