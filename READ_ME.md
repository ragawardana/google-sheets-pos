# 🧾 Modern POS System (Google Apps Script POS)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-blue)
![Frontend](https://img.shields.io/badge/Frontend-Tailwind%20CSS-06B6D4)

> **A complete Point of Sale (POS) system built on Google Sheets.**  
> Designed specifically for MSMEs seeking a modern, free, and easy-to-use cashier solution without the need for expensive servers.

## ✨ Key Features

### 🛒 Cashier Transactions
- **Search & Barcode Scanning:** Find products via text or camera (supports barcode/QR).
- **Dynamic Cart:** Real-time calculation of subtotal, automatic promo discounts, and total.
- **Multi-Payment Support:** Cash (immediate stock reduction) & Non-Cash (pending, requires admin confirmation).
- **Receipt Printing:** Bluetooth Thermal (ESC/POS) or A6 pop-up. Send invoice via email.

### 📦 Inventory Management
- **Product Master:** Manage SKU, name, cost & selling price, image.
- **Batch Stock (FIFO):** Restock system with expiration dates, automatic stock deduction prioritizing near-expired items.
- **Warehouse Access:** Dedicated `warehouse` role can only manage stock, cannot change selling prices.

### 🏷️ Automatic Promotions
- **3 Promotion Types:** Percentage Discount, Amount Discount, and Buy X Get Y Free.
- **Advanced Features:** Limited quota, per-transaction limit, validity period, automatically deactivates when quota runs out.

### 👥 User & Customer Management
- **Role-Based Access Control (RBAC):** Admin, Cashier, Warehouse.
- **Customer Database:** Store client data for transaction history and invoice delivery.

### 📊 Reports & Dashboard
- **Admin Dashboard:** Revenue & profit chart for the last 7 days, expiring stock warnings.
- **Printable Reports:** Stock, Transaction, and Cash Flow reports in print-ready format.

## 🛠️ Technology Stack

| Component          | Technology                                                                |
| :----------------- | :------------------------------------------------------------------------ |
| **Backend**        | Google Apps Script (JavaScript V8)                                        |
| **Database**       | Google Spreadsheet (Multi-sheet relational)                               |
| **Frontend UI**    | HTML5, Tailwind CSS, JavaScript ES6, Chart.js                             |
| **Scanner**        | Html5-Qrcode (Camera) & Image Upload                                      |
| **Thermal Print**  | WebBluetooth API + Thermal Printer Encoder (ESC/POS)                      |
| **Security**       | Password Hashing (SHA-256 + Salt), Token-based Session (PropertiesService)|

## 📁 Project Structure

```
├── Code.gs                # Main backend: API Router, Database helpers, Business logic
├── Index.html             # SPA Frontend: Login UI, Dashboard, Cashier, Management, etc.
├── Scanner.html           # Scanner Popup UI for the "📷 Buka Scanner Barcode" function in Spreadsheet
└── README.md              # This documentation
```

## 🚀 Installation & Deployment Guide

### Prerequisites
- Google Account (Gmail / Google Workspace).
- Browser supporting WebBluetooth (Chrome/Edge) for thermal printer.

### Step 1: Create Spreadsheet & Apps Script Project
1. Create a new **Google Spreadsheet** in your Drive. Name it as desired (e.g., `POS_Database`).
2. Open the Spreadsheet, click **Extensions > Apps Script**.
3. Delete the default `myFunction` code.
4. Copy the entire contents of the following files:
   - `Code.gs` into the **Code.gs** editor.
   - `Index.html` (Create a new HTML file, name it `Index`, then paste).
   - `Scanner.html` (Create a new HTML file, name it `Scanner`, then paste).
5. Click **Save** (floppy disk icon) and name the project, e.g., `Modern POS v1`.

### Step 2: Initialize the Database
1. In the Apps Script editor, select the `initializeDatabase` function from the dropdown.
2. Click **Run** (▶️).
3. **Authorize Access:** A pop-up "Authorization Required" will appear. Click **Review Permissions**, select your Google Account, then click **Advanced > Go to [Project Name] (unsafe)** and **Allow**.
   > *This warning appears because the app is not verified by Google, which is normal for personal projects.*
4. Wait a few moments. When finished, a notification **"✅ Database v1.0 ready."** will appear.
5. Return to your Spreadsheet; new sheets (`Users`, `Products`, etc.) and the custom menu **📦 System Kasir** will appear.

### Step 3: Deploy as a Web App
1. In the Apps Script editor, click **Deploy > New Deployment**.
2. Click the **Select type** icon (⚙️) and choose **Web App**.
3. Enter a description (e.g., `v1.0.0`).
4. Set **Execute as**: `Me ([your_email])`.
5. Set **Who has access**: Choose `Anyone` so the app can be accessed without additional login (or `Anyone with Google account` for more security).
6. Click **Deploy**.
7. **Copy the Web App URL** that appears. This is the address of your POS application.

### Initial Login
- Open the Web App URL.
- Log in with default credentials:
  - **Admin:** `admin` / `admin123`
  - **Cashier:** `kasir1` / `admin123`
  - **Warehouse:** `gudang1` / `admin123`

## 🧑‍💻 Quick Usage Guide

### For Cashiers
1. Open the **Cashier Menu** page.
2. Select products from the grid or scan a barcode.
3. Adjust quantities in the cart.
4. Click **Pay Now**, choose method (Cash/Non-Cash), enter received amount.
5. Print the receipt.

### For Admin / Warehouse
- **Inventory:** Use the `Inventory` tab to add/edit products and restock.
- **Confirmations:** Use the `Payment Confirmations` tab to approve/reject non-cash transactions from cashiers.
- **Reports:** Use the `Reports` tab to print stock/transaction/cash flow reports.
- **Users:** Use the `Users` tab to add new cashier/warehouse accounts.

## ⚠️ Limitations & Important Notes

- **Google Apps Script Quotas:**
  - **Email:** Maximum 100/day (free account) or 1500/day (Workspace).
  - **Execution Time:** Maximum 6 minutes per call. Transactions with many items are fine, but processing thousands of report records may time out.
- **Thermal Printer:** Ensure you are using Chrome/Edge and the printer supports Bluetooth LE.
- **Security:** As it's spreadsheet-based, it is recommended **not to share edit access** to the Spreadsheet with unauthorized individuals. Use the Web App as the primary interface.

## 🧑‍💻 Customization & Further Development

Want to develop further?
- **Data Backup:** Use Google Drive API or export sheets periodically.
- **WhatsApp Gateway:** Integrate with third-party APIs for notifications.
- **clasp:** Use [clasp](https://github.com/google/clasp) for local development with Git and VS Code.

## 📄 License

This project is licensed under the **Apache License, Version 2.0**.  
You may obtain a copy of the license at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

### Brief Summary (Not Legal Advice)
- You are free to use, modify, and distribute this code for personal or commercial purposes.
- You must include the original license and copyright notice with any copy of the code.
- Any significant changes to the code must be stated.
- This license provides explicit patent protection to users.

## 👤 Author

Developed by **[Raga Pratama Wisnu Wardana / Lombok Timur]**
- 📧 Email: [kotaksurat.wisnu28@gmail.com](mailto:kotaksurat.wisnu28@gmail.com)
- 🐙 GitHub: [@ragawardana](https://github.com/ragawardana)

---

## ☕ Support Development

If this application has been beneficial for your business and you would like to support further development, you can buy me a coffee or send a tip via:

- 🛍️ **ShopeePay:** `087888428000`
- 💰 **GoPay:** `085798600201`

Every bit of support, no matter how small, means a lot to keep this project alive and growing. Thank you! 🙏

---

**🌟 If this project is helpful, don't forget to give it a star on this repository!**
