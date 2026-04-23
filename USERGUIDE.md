# 📘 User Guide - Modern POS System

Welcome to the **Modern POS System**! This guide will help you understand and use all available features to manage sales transactions, inventory, customers, and business reports.

## 📑 Table of Contents

1. [Getting Started](#1-getting-started)
2. [Logging In](#2-logging-in)
3. [Understanding the Main Interface](#3-understanding-the-main-interface)
4. [Cashier Menu (POS)](#4-cashier-menu-pos)
5. [Customer Management](#5-customer-management)
6. [Inventory (Products & Stock)](#6-inventory-products--stock)
7. [Promotion Management](#7-promotion-management)
8. [Transaction History](#8-transaction-history)
9. [Non-Cash Payment Confirmations](#9-non-cash-payment-confirmations)
10. [Reports](#10-reports)
11. [User Management (Admin)](#11-user-management-admin)
12. [Store Settings (Admin)](#12-store-settings-admin)
13. [Profile & Logout](#13-profile--logout)
14. [Troubleshooting (Common Issues)](#14-troubleshooting-common-issues)

---

## 1. Getting Started

Before using the application, ensure you have:

- Received the **Web App URL** from your administrator or IT team.
- A modern browser such as **Google Chrome** or **Microsoft Edge** (recommended for thermal printer support).
- A stable internet connection.
- (Optional) A Bluetooth thermal printer for direct receipt printing.

## 2. Logging In

1. Open the provided Web App URL.
2. You will see a login page with the store logo.
3. Enter the **Username** and **Password** provided to you.
   > **Default Credentials:**
   > - Admin: `admin` / `admin123`
   > - Cashier: `kasir1` / `admin123`
   > - Warehouse: `gudang1` / `admin123`
4. Click the **"Masuk Platform"** button.
5. If successful, you will be directed to the main page according to your assigned role.

## 3. Understanding the Main Interface

After logging in, the main interface consists of:

- **Sidebar (Desktop) / Bottom Navigation (Mobile):** Menu for switching between features.
- **Header:** Contains store logo, search box, scanner button, and quick access to profile/logout.
- **Content Area:** Displays the page corresponding to the selected menu.

**Icons and Their Functions:**

| Icon | Function |
| :--- | :--- |
| 🧮 | Cashier Menu (POS) |
| 👥 | Customer Management |
| 📦 | Inventory (Products & Stock) |
| 🏷️ | Promotion Management |
| 🕒 | Transaction History |
| ✅ | Non-Cash Payment Confirmations |
| 📄 | Reports |
| 👤 | User Management (Admin) |
| ⚙️ | Store Settings (Admin) |

## 4. Cashier Menu (POS)

This page is used by **Cashiers** and **Admins** to process sales transactions.

### 4.1. Searching for Products
- **Manual Search:** Type the product name or SKU in the top search box.
- **Barcode Scan:** Click the 📷 icon or use the camera to scan a product barcode. The scanned result will automatically be added to the cart.

### 4.2. Adding Products to Cart
- Click on a product card in the grid.
- The product will appear in the cart panel on the right side (desktop) or bottom (mobile).

### 4.3. Managing the Cart
- **Change Quantity:** Use the **+** and **-** buttons on each cart item.
- **Remove Item:** Reduce the quantity to 0 to remove it.
- **Clear Cart:** Click the **"Kosongkan"** (Clear) button at the top of the cart panel.

### 4.4. Selecting a Customer (Optional)
- From the **"Kaitkan ke Klien"** (Link to Client) dropdown, select the customer making the purchase. This is useful for purchase history and invoice delivery.

### 4.5. Processing Payment
1. Click the **"Bayar Sekarang"** (Pay Now) button.
2. A payment modal will appear.
3. **Choose Payment Method:**
   - **Cash:** Enter the amount received. The system will automatically calculate the change.
   - **Non-Cash:** Select this option for bank transfer/QRIS transactions (requires admin confirmation).
4. Click **"Proses Pembayaran"** (Process Payment).
   - **Cash Transaction:** Stock is immediately reduced, and you can print the receipt right away.
   - **Non-Cash Transaction:** The transaction status becomes *pending* and will appear on the Admin's **Confirmations** page. Stock is **not** reduced until confirmed.

### 4.6. Printing Receipts & Sending Invoices
- After a successful payment, a dialog will appear:
  - **Thermal Print:** Print directly to a connected Bluetooth printer.
  - **A6 Print:** Open a pop-up receipt for printing with a standard printer.
  - **Send Email:** Send a PDF invoice to the customer's email address (if available).

## 5. Customer Management

This menu is for managing regular customer data. Only **Admin** and **Cashier** roles have access.

### 5.1. Viewing Customer List
- The table displays Customer ID, Name, Contact, and Address.

### 5.2. Adding a New Customer
1. Click the **"Klien Baru"** (New Client) button.
2. Fill out the form:
   - Full Name (required)
   - Phone Number (required)
   - Email (optional)
   - Full Address (optional)
3. Click **"Simpan Pelanggan"** (Save Customer).

### 5.3. Editing / Deleting a Customer
- Click the **✏️ (Edit)** icon to modify data.
- Click the **🗑️ (Delete)** icon to remove the customer (a confirmation prompt will appear).

## 6. Inventory (Products & Stock)

This menu is for managing product master data and stock. Only **Admin** and **Warehouse** roles have access.

### 6.1. Viewing Product List
- The table displays photo, SKU, name, cost price*, selling price, and current stock.
- *Cost price is hidden for the Warehouse role (displayed as ***).

### 6.2. Adding a New Product
1. Click **"Tambah Produk"** (Add Product).
2. Fill out the form:
   - **Barcode/SKU:** Unique product code (can be scanned).
   - **Product Name.**
   - **Cost Price:** Purchase price from the supplier.
   - **Selling Price:** Price sold to customers (*Warehouse role cannot fill this*).
   - **Initial Stock:** Quantity upon first entry.
   - **Expiry Date:** Product expiration date.
   - **Image URL:** Link to the product image (optional).
3. Click **"Simpan Data"** (Save Data).

### 6.3. Editing a Product
- Click the **✏️** icon on the product.
- **Note:** Stock cannot be directly changed here. Use the **Restock** feature to add stock.

### 6.4. Restock (Add Stock)
- Click the **📦** icon on the product.
- Enter the **Quantity In** and **Expiry Date** for the new batch.
- Click **"Konfirmasi Restock"** (Confirm Restock). Stock will increase and be recorded as a new batch (FIFO).

### 6.5. Deleting a Product
- Click the **🗑️** icon to permanently delete the product.

## 7. Promotion Management

This menu is for creating automatic discount or bonus rules. Only **Admin** has access.

### 7.1. Viewing Promotion List
- The table displays status, name, mechanism, conditions, period, and remaining quota of promotions.

### 7.2. Creating a New Promotion
1. Click **"Buat Promo"** (Create Promo).
2. Choose **Promotion Mechanism:**
   - **Buy X Get Y Free:** Purchase a certain quantity of a target product, receive a bonus product for free.
   - **Percentage Discount:** Discount by a certain percentage.
   - **Amount Discount:** Discount by a specific nominal amount in Rupiah.
3. Fill in promotion details:
   - **Target SKU:** The product that must be purchased.
   - **Min Purchase (Qty):** Minimum quantity required for the promo to apply.
   - **Discount Value / Bonus SKU:** Adjust according to the mechanism.
   - **Quota:** Total usage limit for the promo (0 = unlimited).
   - **Period:** Start and end date of the promo.
4. Check **"Promo Status Aktif"** (Promo Active Status) to activate.
5. Click **"Simpan Promo"** (Save Promo).

### 7.3. Editing / Deleting a Promotion
- Use the ✏️ and 🗑️ icons on the promotion row.

## 8. Transaction History

This menu is for searching and reviewing past transactions. Only **Admin** and **Cashier** roles have access.

### 8.1. Searching Transactions
- Use the filters:
  - **Transaction ID:** Enter part or all of the ID.
  - **From Date / To Date:** Select a date range.
- Click **"Cari"** (Search). Results will appear in the table below.

### 8.2. Viewing Details & Reprinting
- Click on a transaction row to view item details.
- In the detail modal, you can:
  - **Thermal:** Reprint via Bluetooth.
  - **Print A6:** Reprint via pop-up.
  - **Send Email:** Send invoice via email.

## 9. Non-Cash Payment Confirmations

This menu is specifically for **Admin** to approve or reject non-cash transactions created by Cashiers.

### 9.1. Pending List
- The table displays transactions awaiting confirmation.

### 9.2. Confirming / Rejecting
- Click **✔️ (Confirm)** if the funds have been received. Stock will automatically be reduced, and the transaction is considered complete.
- Click **❌ (Reject)** if the payment is invalid. Stock is **not** reduced. You can add a note for the rejection reason.

## 10. Reports

This menu is for printing official reports. Only **Admin** has access.

Three types of reports are available:
1. **Stock Report:** List of current stock and total inventory value.
2. **Transaction Report:** Summary of transactions within a specific period (start and end dates required).
3. **Cash Flow Report:** Income statement from completed transactions (start and end dates required).

Click **"Cetak"** (Print) on the desired report card. The report will open in a new tab, ready for printing.

## 11. User Management (Admin)

This menu is for managing accounts that can log into the system. Only **Admin** has access.

### 11.1. Adding a User
1. Click **"Akun Baru"** (New Account).
2. Fill in **Username** and **Password**.
3. Select **Role:**
   - **Kasir:** Only access to POS and Customers.
   - **Gudang:** Only access to Inventory.
   - **Admin:** Full access.
4. Click **"Simpan Pengguna"** (Save User).

### 11.2. Editing / Deleting a User
- **Edit:** Change username, password (leave blank to keep unchanged), or role.
- **Delete:** Remove the account. **Warning:** The last remaining Admin cannot be deleted.

## 12. Store Settings (Admin)

This menu is for configuring the store identity that appears in the app and on receipts.

1. Open the **Settings** menu.
2. Fill in the information:
   - **Application Name:** Web page title.
   - **Logo URL:** Link to the logo image (appears in the top left corner).
   - **Store / Company Name.**
   - **Full Address.**
   - **Contact (Phone / Email).**
3. Click **"Simpan Pengaturan"** (Save Settings). Changes will take effect immediately.

## 13. Profile & Logout

### 13.1. Changing Your Own Profile
1. Click on your profile area in the bottom left corner (desktop) or the logo in the header (mobile).
2. Change **Username** or **New Password**.
3. Click **"Perbarui Profil"** (Update Profile).

### 13.2. Logout
- Click the **🚪 (Sign Out)** icon next to your username (desktop) or in the header (mobile).

## 14. Troubleshooting (Common Issues)

| Issue | Solution |
| :--- | :--- |
| **Cannot log in** | Ensure username & password are correct. Ask Admin to reset your password. |
| **Menus are not fully visible** | Menus are tailored to your role. Cashiers cannot see Inventory or Reports menus. |
| **Camera scanner not working** | Ensure the browser has camera permission. Use the image upload option as an alternative. |
| **Thermal printer not detected** | Ensure laptop/PC Bluetooth is on. Use Chrome/Edge. Ensure the printer is in pairing mode. If it still fails, use A6 print. |
| **Stock not reduced after transaction** | Non-Cash transactions await Admin confirmation. Contact Admin for confirmation. |
| **Promo not applying in cart** | Check if minimum purchase requirements are met, the promo period is still valid, and the quota is not exhausted. |
| **Report does not appear** | Ensure the date range is correctly filled. |
| **Application feels slow** | Refresh the page. Limit transaction searches to the latest 50 records. |

---

**Thank you for using the Modern POS System!**  
If you have further questions, please contact your application administrator or developer.