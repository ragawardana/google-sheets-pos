# 📘 Panduan Pengguna - Sistem Kasir Modern

Selamat datang di aplikasi **Sistem Kasir Modern**! Panduan ini akan membantu Anda memahami dan menggunakan seluruh fitur yang tersedia untuk mengelola transaksi penjualan, inventaris, pelanggan, dan laporan bisnis Anda.

## 📑 Daftar Isi

1. [Persiapan Awal](#1-persiapan-awal)
2. [Login ke Aplikasi](#2-login-ke-aplikasi)
3. [Mengenal Antarmuka Utama](#3-mengenal-antarmuka-utama)
4. [Menu Kasir (POS)](#4-menu-kasir-pos)
5. [Manajemen Pelanggan](#5-manajemen-pelanggan)
6. [Inventaris (Produk & Stok)](#6-inventaris-produk--stok)
7. [Manajemen Promo](#7-manajemen-promo)
8. [Riwayat Transaksi](#8-riwayat-transaksi)
9. [Konfirmasi Pembayaran Non-Tunai](#9-konfirmasi-pembayaran-non-tunai)
10. [Laporan](#10-laporan)
11. [Manajemen Pengguna (Admin)](#11-manajemen-pengguna-admin)
12. [Pengaturan Toko (Admin)](#12-pengaturan-toko-admin)
13. [Profil & Logout](#13-profil--logout)
14. [Troubleshooting (Masalah Umum)](#14-troubleshooting-masalah-umum)

---

## 1. Persiapan Awal

Sebelum menggunakan aplikasi, pastikan Anda telah:

- Mendapatkan **URL Web App** dari administrator atau tim IT.
- Menggunakan browser modern seperti **Google Chrome** atau **Microsoft Edge** (disarankan untuk dukungan printer thermal).
- Koneksi internet yang stabil.
- (Opsional) Printer thermal Bluetooth jika ingin mencetak struk langsung.

## 2. Login ke Aplikasi

1. Buka URL Web App yang diberikan.
2. Anda akan melihat halaman login dengan logo toko.
3. Masukkan **Username** dan **Password** yang telah diberikan.
   > **Default Login:**
   > - Admin: `admin` / `admin123`
   > - Kasir: `kasir1` / `admin123`
   > - Gudang: `gudang1` / `admin123`
4. Klik tombol **"Masuk Platform"**.
5. Jika berhasil, Anda akan diarahkan ke halaman utama sesuai dengan hak akses (role) Anda.

## 3. Mengenal Antarmuka Utama

Setelah login, tampilan utama terdiri dari:

- **Sidebar (Desktop) / Navigasi Bawah (Mobile):** Menu untuk berpindah antar fitur.
- **Header:** Berisi logo toko, kotak pencarian, tombol scanner, dan akses cepat ke profil/logout.
- **Area Konten:** Menampilkan halaman sesuai menu yang dipilih.

**Ikon dan Fungsinya:**

| Ikon | Fungsi |
| :--- | :--- |
| 🧮 | Menu Kasir (POS) |
| 👥 | Manajemen Pelanggan |
| 📦 | Inventaris (Produk & Stok) |
| 🏷️ | Manajemen Promo |
| 🕒 | Riwayat Transaksi |
| ✅ | Konfirmasi Pembayaran Non-Tunai |
| 📄 | Laporan |
| 👤 | Manajemen Pengguna (Admin) |
| ⚙️ | Pengaturan Toko (Admin) |

## 4. Menu Kasir (POS)

Halaman ini digunakan oleh **Kasir** dan **Admin** untuk melakukan transaksi penjualan.

### 4.1. Mencari Produk
- **Cari Manual:** Ketik nama atau SKU produk di kotak pencarian atas.
- **Scan Barcode:** Klik ikon 📷 atau gunakan kamera untuk scan barcode produk. Hasil scan akan otomatis masuk ke keranjang.

### 4.2. Menambahkan Produk ke Keranjang
- Klik kartu produk yang tersedia di grid.
- Produk akan masuk ke panel keranjang di sisi kanan (desktop) atau bawah (mobile).

### 4.3. Mengatur Keranjang
- **Ubah Jumlah:** Gunakan tombol **+** dan **-** pada item di keranjang.
- **Hapus Item:** Kurangi jumlah hingga 0 untuk menghapus.
- **Kosongkan Keranjang:** Klik tombol **"Kosongkan"** di atas panel keranjang.

### 4.4. Memilih Pelanggan (Opsional)
- Pada dropdown **"Kaitkan ke Klien"**, pilih pelanggan yang melakukan transaksi. Ini berguna untuk riwayat pembelian dan pengiriman invoice.

### 4.5. Melakukan Pembayaran
1. Klik tombol **"Bayar Sekarang"**.
2. Akan muncul modal pembayaran.
3. **Pilih Metode:**
   - **Tunai:** Masukkan jumlah uang yang diterima. Sistem akan menghitung kembalian otomatis.
   - **Non-Tunai:** Pilih opsi ini untuk transaksi transfer/QRIS (memerlukan konfirmasi admin).
4. Klik **"Proses Pembayaran"**.
   - **Transaksi Tunai:** Stok langsung berkurang, dan Anda dapat langsung mencetak struk.
   - **Transaksi Non-Tunai:** Status transaksi menjadi *pending* dan akan muncul di halaman **Konfirmasi** Admin. Stok **belum** berkurang sampai dikonfirmasi.

### 4.6. Mencetak Struk & Kirim Invoice
- Setelah pembayaran sukses, akan muncul dialog:
  - **Cetak Thermal:** Mencetak langsung ke printer Bluetooth (jika terhubung).
  - **Cetak A6:** Membuka pop-up struk untuk dicetak dengan printer biasa.
  - **Kirim Email:** Mengirim invoice PDF ke email pelanggan (jika data email tersedia).

## 5. Manajemen Pelanggan

Menu ini untuk mengelola data pelanggan tetap. Hanya **Admin** dan **Kasir** yang dapat mengakses.

### 5.1. Melihat Daftar Pelanggan
- Tabel menampilkan ID, Nama, Kontak, dan Alamat pelanggan.

### 5.2. Menambah Pelanggan Baru
1. Klik tombol **"Klien Baru"**.
2. Isi formulir:
   - Nama Lengkap (wajib)
   - No. Handphone (wajib)
   - Email (opsional)
   - Alamat Lengkap (opsional)
3. Klik **"Simpan Pelanggan"**.

### 5.3. Mengedit / Menghapus Pelanggan
- Klik ikon **✏️ (Edit)** untuk mengubah data.
- Klik ikon **🗑️ (Hapus)** untuk menghapus pelanggan (konfirmasi akan muncul).

## 6. Inventaris (Produk & Stok)

Menu ini untuk mengelola master data produk dan stok. Hanya **Admin** dan **Gudang** yang dapat mengakses.

### 6.1. Melihat Daftar Produk
- Tabel menampilkan foto, SKU, nama, harga modal*, harga jual, dan stok saat ini.
- *Harga modal disembunyikan untuk role Gudang (hanya tampil ***).

### 6.2. Menambah Produk Baru
1. Klik **"Tambah Produk"**.
2. Isi formulir:
   - **Barcode/SKU:** Kode unik produk (bisa di-scan).
   - **Nama Produk.**
   - **Harga Modal:** Harga beli dari supplier.
   - **Harga Jual:** Harga yang dijual ke pelanggan (*role Gudang tidak bisa mengisi ini*).
   - **Stok Awal:** Jumlah stok saat pertama masuk.
   - **Tgl Expired:** Tanggal kedaluwarsa produk.
   - **URL Gambar:** Link gambar produk (opsional).
3. Klik **"Simpan Data"**.

### 6.3. Mengedit Produk
- Klik ikon **✏️** pada produk.
- **Catatan:** Stok tidak dapat diubah langsung di sini. Gunakan fitur **Restock** untuk menambah stok.

### 6.4. Restock (Tambah Stok)
- Klik ikon **📦** pada produk.
- Masukkan **Jumlah Masuk** dan **Tanggal Kedaluwarsa** batch baru.
- Klik **"Konfirmasi Restock"**. Stok akan bertambah dan dicatat sebagai batch baru (FIFO).

### 6.5. Menghapus Produk
- Klik ikon **🗑️** untuk menghapus produk secara permanen.

## 7. Manajemen Promo

Menu ini untuk membuat aturan diskon atau bonus otomatis. Hanya **Admin** yang dapat mengakses.

### 7.1. Melihat Daftar Promo
- Tabel menampilkan status, nama, mekanisme, syarat, periode, dan sisa kuota promo.

### 7.2. Membuat Promo Baru
1. Klik **"Buat Promo"**.
2. Pilih **Mekanisme Promo:**
   - **Beli X Gratis Y:** Beli sejumlah produk target, dapat produk bonus gratis.
   - **Diskon Persentase:** Potongan harga sekian persen.
   - **Diskon Nominal:** Potongan harga dalam Rupiah.
3. Isi detail promo:
   - **SKU Syarat Beli:** Produk yang harus dibeli.
   - **Minimal Beli (Qty):** Jumlah minimal pembelian agar promo berlaku.
   - **Nilai Diskon / SKU Bonus:** Sesuaikan dengan mekanisme.
   - **Kuota:** Batas total pemakaian promo (0 = tak terbatas).
   - **Periode:** Tanggal mulai dan selesai promo.
4. Centang **"Promo Status Aktif"** untuk mengaktifkan.
5. Klik **"Simpan Promo"**.

### 7.3. Mengedit / Menghapus Promo
- Gunakan ikon ✏️ dan 🗑️ pada baris promo.

## 8. Riwayat Transaksi

Menu ini untuk mencari dan melihat ulang transaksi yang sudah terjadi. Hanya **Admin** dan **Kasir** yang dapat mengakses.

### 8.1. Mencari Transaksi
- Gunakan filter:
  - **ID Transaksi:** Masukkan sebagian atau seluruh ID.
  - **Dari Tanggal / Sampai Tanggal:** Pilih rentang waktu.
- Klik **"Cari"**. Hasil akan muncul di tabel bawah.

### 8.2. Melihat Detail & Mencetak Ulang
- Klik pada baris transaksi untuk melihat detail item.
- Pada modal detail, Anda dapat:
  - **Thermal:** Cetak ulang via Bluetooth.
  - **Cetak A6:** Cetak ulang via pop-up.
  - **Kirim Email:** Kirim invoice via email.

## 9. Konfirmasi Pembayaran Non-Tunai

Menu ini khusus untuk **Admin** guna menyetujui atau menolak transaksi non-tunai yang dibuat oleh Kasir.

### 9.1. Daftar Pending
- Tabel menampilkan transaksi yang menunggu konfirmasi.

### 9.2. Mengonfirmasi / Menolak
- Klik **✔️ (Konfirmasi)** jika dana sudah diterima. Stok akan otomatis berkurang dan transaksi dianggap selesai.
- Klik **❌ (Tolak)** jika pembayaran tidak valid. Stok **tidak** berkurang. Anda dapat menambahkan catatan alasan penolakan.

## 10. Laporan

Menu ini untuk mencetak laporan resmi. Hanya **Admin** yang dapat mengakses.

Tersedia tiga jenis laporan:
1. **Stok Barang:** Daftar stok terkini dan total nilai inventaris.
2. **Transaksi:** Ringkasan transaksi dalam periode tertentu (wajib isi tanggal mulai dan selesai).
3. **Arus Kas:** Laporan pemasukan dari transaksi yang telah selesai (wajib isi tanggal).

Klik **"Cetak"** pada kartu laporan yang diinginkan. Laporan akan terbuka di tab baru dan siap dicetak.

## 11. Manajemen Pengguna (Admin)

Menu ini untuk mengelola akun yang dapat login ke sistem. Hanya **Admin** yang dapat mengakses.

### 11.1. Menambah Pengguna
1. Klik **"Akun Baru"**.
2. Isi **Username** dan **Password**.
3. Pilih **Role:**
   - **Kasir:** Hanya akses POS dan Pelanggan.
   - **Gudang:** Hanya akses Inventaris.
   - **Admin:** Akses penuh.
4. Klik **"Simpan Pengguna"**.

### 11.2. Mengedit / Menghapus Pengguna
- **Edit:** Ubah username, password (kosongkan jika tidak ingin mengubah), atau role.
- **Hapus:** Hapus akun. **Peringatan:** Admin tidak dapat dihapus jika hanya tersisa satu.

## 12. Pengaturan Toko (Admin)

Menu ini untuk mengatur identitas toko yang muncul di aplikasi dan struk.

1. Buka menu **Pengaturan**.
2. Isi informasi:
   - **Nama Aplikasi:** Judul halaman web.
   - **URL Logo:** Link gambar logo (tampil di pojok kiri atas).
   - **Nama Toko / Perusahaan.**
   - **Alamat Lengkap.**
   - **Kontak (Telp / Email).**
3. Klik **"Simpan Pengaturan"**. Perubahan akan langsung terlihat.

## 13. Profil & Logout

### 13.1. Mengubah Profil Sendiri
1. Klik area profil Anda di pojok kiri bawah (desktop) atau logo di header (mobile).
2. Ubah **Username** atau **Password Baru**.
3. Klik **"Perbarui Profil"**.

### 13.2. Logout
- Klik ikon **🚪 (Sign Out)** di sebelah nama pengguna (desktop) atau di header (mobile).

## 14. Troubleshooting (Masalah Umum)

| Masalah | Solusi |
| :--- | :--- |
| **Tidak bisa login** | Pastikan username & password benar. Coba reset password oleh Admin. |
| **Menu tidak muncul lengkap** | Menu disesuaikan dengan role Anda. Kasir tidak bisa melihat menu Inventaris atau Laporan. |
| **Scanner kamera tidak berfungsi** | Pastikan browser memiliki izin akses kamera. Gunakan opsi unggah gambar sebagai alternatif. |
| **Printer thermal tidak terdeteksi** | Pastikan Bluetooth laptop/PC menyala. Gunakan Chrome/Edge. Pastikan printer dalam mode pairing. Jika tetap gagal, gunakan cetak A6. |
| **Stok tidak berkurang setelah transaksi** | Transaksi Non-Tunai menunggu konfirmasi Admin. Hubungi Admin untuk konfirmasi. |
| **Promo tidak muncul di keranjang** | Periksa apakah syarat minimal beli terpenuhi, periode promo masih berlaku, dan kuota belum habis. |
| **Laporan tidak muncul** | Pastikan rentang tanggal diisi dengan benar. |
| **Aplikasi terasa lambat** | Refresh halaman. Batasi pencarian transaksi hingga 50 data terbaru. |

---

**Terima kasih telah menggunakan Sistem Kasir Modern!**  
Jika ada pertanyaan lebih lanjut, hubungi administrator atau pengembang aplikasi Anda.