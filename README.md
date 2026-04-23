# 🧾 Sistem Kasir Modern (Google Apps Script POS)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-blue)
![Frontend](https://img.shields.io/badge/Frontend-Tailwind%20CSS-06B6D4)

> **Sistem Point of Sale (POS) lengkap berbasis Google Sheets.**  
> Dirancang khusus untuk UMKM yang menginginkan solusi kasir modern, gratis, dan mudah dioperasikan tanpa perlu server mahal.

## ✨ Fitur Utama

### 🛒 Transaksi Kasir
- **Pencarian & Scan Barcode:** Cari produk via teks atau kamera (mendukung barcode/QR).
- **Keranjang Dinamis:** Hitung subtotal, diskon promo otomatis, dan total real-time.
- **Dukungan Multi-Pembayaran:** Tunai (langsung kurangi stok) & Non-Tunai (pending, perlu konfirmasi admin).
- **Cetak Struk:** Thermal Bluetooth (ESC/POS) atau pop-up A6. Kirim invoice via email.

### 📦 Manajemen Inventaris
- **Master Produk:** Kelola SKU, nama, harga modal & jual, gambar.
- **Stok Batch (FIFO):** Sistem restock dengan tanggal kedaluwarsa, pengurangan stok otomatis prioritas yang hampir expired.
- **Akses Gudang:** Role khusus `gudang` hanya bisa mengelola stok, tidak bisa ubah harga jual.

### 🏷️ Promosi Otomatis
- **3 Jenis Promo:** Diskon Persentase, Diskon Nominal, dan Beli X Gratis Y.
- **Fitur Lanjutan:** Kuota terbatas, batas per transaksi, periode berlaku, otomatis nonaktif jika kuota habis.

### 👥 Manajemen Pengguna & Pelanggan
- **Role-Based Access Control (RBAC):** Admin, Kasir, Gudang.
- **Database Pelanggan:** Simpan data klien untuk riwayat transaksi dan pengiriman invoice.

### 📊 Laporan & Dashboard
- **Dashboard Admin:** Grafik omzet & profit 7 hari terakhir, peringatan stok kedaluwarsa.
- **Laporan Cetak:** Laporan Stok, Transaksi, dan Arus Kas dalam format siap print.

## 🛠️ Teknologi yang Digunakan

| Komponen          | Teknologi                                                                 |
| :---------------- | :------------------------------------------------------------------------- |
| **Backend**       | Google Apps Script (JavaScript V8)                                         |
| **Database**      | Google Spreadsheet (Multi-sheet relational)                                |
| **Frontend UI**   | HTML5, Tailwind CSS, JavaScript ES6, Chart.js                              |
| **Scanner**       | Html5-Qrcode (Kamera) & Upload Gambar                                      |
| **Thermal Print** | WebBluetooth API + Thermal Printer Encoder (ESC/POS)                       |
| **Keamanan**      | Password Hashing (SHA-256 + Salt), Token-based Session (PropertiesService) |

## 📁 Struktur Proyek

```
├── Code.gs                # Backend utama: API Router, Database helpers, Logic bisnis
├── Index.html             # Frontend SPA: UI Login, Dashboard, Kasir, Manajemen, dll.
├── Scanner.html           # UI Popup Scanner untuk fungsi "📷 Buka Scanner Barcode" di Spreadsheet
├── appsscript.json        # Manifest proyek (Scopes, OAuth, dll.)
└── README.md              # Dokumentasi ini
```

## 🚀 Panduan Instalasi & Deployment

### Prasyarat
- Akun Google (Gmail / Google Workspace).
- Browser yang mendukung WebBluetooth (Chrome/Edge) untuk printer thermal.

### Langkah 1: Buat Spreadsheet & Proyek Apps Script
1. Buat **Google Spreadsheet** baru di Drive Anda. Beri nama sesuai keinginan (contoh: `Database_POS_Kelontong`).
2. Buka Spreadsheet tersebut, klik menu **Ekstensi > Apps Script**.
3. Hapus semua kode default (`myFunction`).
4. Salin seluruh isi file:
   - `Code.gs` ke editor **Code.gs**.
   - `Index.html` (Buat file HTML baru, beri nama `Index`, lalu tempel).
   - `Scanner.html` (Buat file HTML baru, beri nama `Scanner`, lalu tempel).
5. Klik **Simpan** (ikon disket) dan beri nama proyek, misal `Sistem Kasir v1`.

### Langkah 2: Inisialisasi Database
1. Di editor Apps Script, pilih fungsi `initializeDatabase` dari dropdown.
2. Klik **Jalankan** (▶️).
3. **Izinkan Akses:** Akan muncul pop-up "Authorization Required". Klik **Review Permissions**, pilih akun Google Anda, lalu klik **Advanced > Go to [Nama Proyek] (unsafe)** dan **Allow**.
   > *Peringatan ini muncul karena aplikasi belum diverifikasi Google, wajar untuk proyek pribadi.*
4. Tunggu beberapa saat. Setelah selesai, akan muncul notifikasi **"✅ Database v1.0 siap."**
5. Kembali ke Spreadsheet Anda, akan muncul sheet-sheet baru (`Users`, `Products`, dll.) dan menu kustom **📦 System Kasir**.

### Langkah 3: Deploy sebagai Web App
1. Di editor Apps Script, klik **Deploy > New Deployment**.
2. Klik ikon **Select type** (⚙️) dan pilih **Web App**.
3. Isi deskripsi (misal: `v1.0.0`).
4. Atur **Execute as**: `Me ([email_anda])`.
5. Atur **Who has access**: Pilih `Anyone` agar aplikasi bisa diakses tanpa login ulang (atau `Anyone with Google account` untuk keamanan lebih).
6. Klik **Deploy**.
7. **Salin URL Web App** yang muncul. Inilah alamat aplikasi kasir Anda.

### Login Awal
- Buka URL Web App.
- Login dengan kredensial default:
  - **Admin:** `admin` / `admin123`
  - **Kasir:** `kasir1` / `admin123`
  - **Gudang:** `gudang1` / `admin123`

## 🧑‍💻 Panduan Penggunaan Cepat

### Untuk Kasir
1. Buka halaman **Menu Kasir**.
2. Pilih produk dari grid atau scan barcode.
3. Atur jumlah di keranjang.
4. Klik **Bayar Sekarang**, pilih metode (Tunai/Non-Tunai), input uang diterima.
5. Cetak struk.

### Untuk Admin / Gudang
- **Inventaris:** Tab `Inventaris` untuk menambah/mengedit produk dan restock.
- **Konfirmasi:** Tab `Konfirmasi Bayar` untuk menyetujui/menolak transaksi non-tunai dari kasir.
- **Laporan:** Tab `Laporan` untuk mencetak laporan stok/transaksi/arus kas.
- **Pengguna:** Tab `Pengguna` untuk menambah akun kasir/gudang baru.

## ⚠️ Batasan & Catatan Penting

- **Kuota Google Apps Script:**
  - **Email:** Maksimal 100/hari (akun gratis) atau 1500/hari (Workspace).
  - **Waktu Eksekusi:** Maksimal 6 menit per panggilan. Transaksi dengan banyak item tetap aman, namun jika memproses ribuan data laporan mungkin akan timeout.
- **Printer Thermal:** Pastikan menggunakan Chrome/Edge dan printer mendukung Bluetooth LE.
- **Keamanan:** Karena berbasis Spreadsheet, disarankan **tidak membagikan akses edit Spreadsheet** ke sembarang orang. Gunakan Web App sebagai antarmuka utama.

## 🧑‍💻 Kustomisasi & Pengembangan Lanjutan

Ingin mengembangkan lebih jauh?
- **Backup Data:** Gunakan Google Drive API atau ekspor sheet secara berkala.
- **WhatsApp Gateway:** Integrasikan dengan API pihak ketiga untuk kirim notifikasi.
- **clasp:** Gunakan [clasp](https://github.com/google/clasp) untuk development lokal dengan Git dan VS Code.

## 📄 Lisensi

Proyek ini dilisensikan di bawah **Apache License, Version 2.0**.  
Anda dapat melihat salinan lisensi ini di [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

### Ringkasan Singkat (Bukan Nasihat Hukum)
- Anda bebas menggunakan, memodifikasi, dan mendistribusikan kode ini untuk keperluan pribadi maupun komersial.
- Anda wajib menyertakan pemberitahuan lisensi dan hak cipta asli pada setiap salinan kode.
- Setiap perubahan signifikan pada kode harus diberi tahu.
- Lisensi ini memberikan perlindungan paten eksplisit kepada pengguna.

## 👤 Author

Dikembangkan oleh **[Raga Pratama Wisnu Wardana / Lombok Timur]**
- 📧 Email: [kotaksurat.wisnu28@gmail.com](mailto:kotaksurat.wisnu28@gmail.com)
- 🐙 GitHub: [@ragawardana](https://github.com/ragawardana)

---

## ☕ Dukung Pengembangan

Jika aplikasi ini bermanfaat untuk bisnis Anda dan ingin mendukung pengembangan lebih lanjut, Anda bisa memberikan dukungan berupa traktiran kopi atau saweran melalui:

- 🛍️ **ShopeePay:** `087888428000`
- 💰 **GoPay:** `085798600201`

Setiap dukungan, sekecil apa pun, sangat berarti untuk menjaga proyek ini tetap hidup dan terus berkembang. Terima kasih! 🙏

---

**🌟 Jika proyek ini bermanfaat, jangan lupa beri bintang di repositori ini!**
