const SHEET_USERS = 'Users';
const SHEET_PRODUCTS = 'Products';
const SHEET_TRANSACTIONS = 'Transactions';
const SHEET_TX_DETAILS = 'TransactionDetails';
const SHEET_PROMOTIONS = 'Promotions';
const SHEET_PRICE_HISTORY = 'Price_History';
const SHEET_BATCHES = 'Stok_Masuk';
const SHEET_SETTINGS = 'Settings';
const SHEET_CUSTOMERS = 'Customers';
const SHEET_PAYMENT_CONFIRMATIONS = 'PaymentConfirmations';
const SHEET_DAILY_SUMMARY = 'DailySummary';

function doGet(e) {
    return HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('Sistem Kasir Modern')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
    try {
        const payload = JSON.parse(e.postData.contents);
        const result = serverRouter(payload);
        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
    }
}

function serverRouter(payload) {
    try {
        const action = payload.action;
        const data = payload.data || {};
        const token = payload.token;

        const publicActions = ['login', 'getSettings'];
        if (!publicActions.includes(action)) {
            const session = validateSession(token);
            data.__session = session;
        }

        switch (action) {
            case 'login': return processLogin(data);
            case 'logout':
                destroySession(token);
                return { success: true };
            case 'getUsers': return getUsers();
            case 'saveUser': return processSaveUser(data);
            case 'deleteUser': return processDeleteUser(data);
            case 'updateProfile': return processUpdateProfile(data);

            case 'getProducts': return getProducts();
            case 'addProduct': return processAddProduct(data);
            case 'updateProduct': return processUpdateProduct(data);
            case 'deleteProduct': return processDeleteProduct(data);
            case 'addStockBatch': return processAddStockBatch(data);

            case 'getPromotions': return getPromotions();
            case 'savePromotion': return processSavePromotion(data);
            case 'deletePromotion': return processDeletePromotion(data);

            case 'getCustomers': return getCustomers();
            case 'saveCustomer': return processSaveCustomer(data);
            case 'deleteCustomer': return processDeleteCustomer(data);

            case 'checkout': return processCheckout(data);
            case 'generateReceiptHtml': return { success: true, data: generateReceiptHtml(data.transactionId) };
            case 'sendInvoiceEmail': return sendInvoiceEmail(data);
            case 'searchTransactions': return searchTransactions(data);
            case 'getTransactionDetail': return getTransactionDetail(data.transactionId);
            case 'getPendingConfirmations': return getPendingConfirmations();
            case 'processPaymentConfirmation': return processPaymentConfirmation(data);
            case 'generateReport': return generateReport(data);

            case 'getDashboardData': return getDashboardData();

            case 'getSettings': return getSettings();
            case 'saveSettings': return processSaveSettings(data);

            default: throw new Error("Aksi API tidak dikenali oleh sistem backend.");
        }
    } catch (error) {
        console.error("Router Error: ", error.message);
        return { success: false, error: error.message };
    }
}

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('📦 System Kasir')
        .addItem('📷 Buka Scanner Barcode', 'showScanner')
        .addSeparator()
        .addItem('⚙️ Setup/Reset Database', 'initializeDatabase')
        .addToUi();
}

function showScanner() {
    const html = HtmlService.createHtmlOutputFromFile('Scanner')
        .setTitle('Pemindai Barcode & QR')
        .setWidth(600)
        .setHeight(550)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    SpreadsheetApp.getUi().showModalDialog(html, 'Scan Barcode/QR');
}

function saveData(code) {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = ss.getSheetByName("Scan_Logs");

        if (!sheet) {
            sheet = ss.insertSheet("Scan_Logs");
            sheet.appendRow(["Timestamp", "Hasil Scan Barcode / QR"]);
            sheet.getRange("A1:B1").setFontWeight("bold").setBackground("#e2e8f0");
        }

        sheet.appendRow([new Date(), "'" + code]);
        return "✅ Berhasil: " + code + " telah tersimpan.";
    } catch (error) {
        return "❌ Error: " + error.message;
    }
}

function getDb() {
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;

    const props = PropertiesService.getScriptProperties();
    const dbId = props.getProperty('DB_ID');

    if (dbId) {
        try {
            return SpreadsheetApp.openById(dbId);
        } catch (e) {
            props.deleteProperty('DB_ID');
        }
    }
    throw new Error("Database belum diinisialisasi. Harap jalankan fungsi initializeDatabase() dari Script Editor.");
}

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

// --- Security & Session Helpers ---
function hashPassword(password, salt = '') {
    const combined = salt + password;
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined);
    return hash.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

function generateSalt() {
    return Utilities.getUuid();
}

function createSession(user) {
    const token = Utilities.getUuid();
    const sessionData = {
        userId: user.id,
        username: user.username,
        role: user.role,
        createdAt: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 jam
    };
    const props = PropertiesService.getScriptProperties();
    props.setProperty(`session_${token}`, JSON.stringify(sessionData));
    return token;
}

function validateSession(token) {
    if (!token) throw new Error('Token tidak ditemukan.');
    const props = PropertiesService.getScriptProperties();
    const data = props.getProperty(`session_${token}`);
    if (!data) throw new Error('Sesi tidak valid atau telah berakhir.');

    const session = JSON.parse(data);
    if (session.expires < Date.now()) {
        props.deleteProperty(`session_${token}`);
        throw new Error('Sesi telah kadaluarsa. Silakan login ulang.');
    }
    return session;
}

function destroySession(token) {
    if (token) {
        PropertiesService.getScriptProperties().deleteProperty(`session_${token}`);
    }
}

// --- Helper Extensions ---
function getProductBySku(sku) {
    const products = getProducts().data;
    return products.find(p => p.sku === sku);
}

function calculateCartTotals(cart) {
    const ss = getDb();
    const productSheet = ss.getSheetByName(SHEET_PRODUCTS);
    const promoSheet = ss.getSheetByName(SHEET_PROMOTIONS);

    const productData = productSheet.getDataRange().getValues();
    const productMap = {};
    for (let i = 1; i < productData.length; i++) {
        productMap[productData[i][0]] = {
            sku: productData[i][1],
            name: productData[i][2],
            price: productData[i][4],
            stock: productData[i][5]
        };
    }

    let subtotal = 0;
    const validatedCart = cart.map(item => {
        const dbProduct = productMap[item.id];
        if (!dbProduct) throw new Error(`Produk dengan ID ${item.id} tidak ditemukan.`);
        if (dbProduct.price !== item.price) {
            console.warn(`Harga produk ${item.id} tidak cocok. Frontend: ${item.price}, DB: ${dbProduct.price}`);
        }
        const correctPrice = dbProduct.price;
        subtotal += correctPrice * item.qty;
        return { ...item, price: correctPrice };
    });

    const activePromos = [];
    if (promoSheet) {
        const promoData = promoSheet.getDataRange().getValues();
        const now = new Date();
        for (let i = 1; i < promoData.length; i++) {
            const p = promoData[i];
            if (!p[13]) continue;

            const validFrom = p[8] ? new Date(p[8]) : null;
            const validTo = p[9] ? new Date(p[9]) : null;
            if (validFrom && now < validFrom) continue;
            if (validTo && now > validTo) continue;

            const quota = p[11] || 0;
            const usedQuota = p[12] || 0;
            if (quota > 0 && usedQuota >= quota) continue;

            activePromos.push({
                id: p[0], name: p[1], type: p[2], targetSku: p[3], rewardSku: p[4],
                value: p[5], minQty: p[6], rewardQty: p[7], maxPerTx: p[10],
                quota: quota, usedQuota: usedQuota
            });
        }
    }

    let totalDiscount = 0;
    const promosApplied = [];

    activePromos.forEach(promo => {
        const targetItem = validatedCart.find(item => item.sku === promo.targetSku);
        if (!targetItem) return;

        let applicableCount = promo.minQty > 0 ? Math.floor(targetItem.qty / promo.minQty) : targetItem.qty;
        if (applicableCount === 0) return;
        if (promo.maxPerTx > 0 && applicableCount > promo.maxPerTx) applicableCount = promo.maxPerTx;

        const remainingQuota = promo.quota > 0 ? promo.quota - promo.usedQuota : Infinity;
        if (applicableCount > remainingQuota) applicableCount = remainingQuota;
        if (applicableCount <= 0) return;

        let discount = 0;
        if (promo.type === 'DISCOUNT_PERCENT') {
            discount = (targetItem.price * (promo.value / 100)) * (promo.minQty > 0 ? applicableCount * promo.minQty : applicableCount);
        } else if (promo.type === 'DISCOUNT_AMOUNT') {
            discount = promo.value * applicableCount;
        }

        totalDiscount += discount;
        promosApplied.push({
            id: promo.id, count: applicableCount, discount: discount, type: promo.type,
            rewardSku: promo.rewardSku, rewardQty: promo.rewardQty
        });
    });

    const finalTotal = Math.max(0, subtotal - totalDiscount);

    return {
        subtotal: subtotal,
        totalDiscount: totalDiscount,
        finalTotal: finalTotal,
        promosApplied: promosApplied,
        validatedCart: validatedCart
    };
}

function getCustomers() {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get('customers_data');
    if (cachedData) return { success: true, data: JSON.parse(cachedData) };

    const ss = getDb();
    const db = ss.getSheetByName(SHEET_CUSTOMERS);
    if (!db) return { success: true, data: [] };

    const records = db.getDataRange().getValues();
    const customers = [];

    for (let i = 1; i < records.length; i++) {
        customers.push({
            id: records[i][0],
            name: records[i][1],
            phone: records[i][2],
            email: records[i][3],
            address: records[i][4]
        });
    }

    cache.put('customers_data', JSON.stringify(customers), 600);
    return { success: true, data: customers };
}

function processSaveCustomer(data) {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk. Gagal menyimpan data pelanggan.");
    try {
        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_CUSTOMERS);
        const records = sheet.getDataRange().getValues();

        if (data.id) {
            let rowIndex = -1;
            for (let i = 1; i < records.length; i++) {
                if (records[i][0] === data.id) {
                    rowIndex = i + 1;
                    break;
                }
            }
            if (rowIndex === -1) throw new Error("Pelanggan tidak ditemukan di database.");
            sheet.getRange(rowIndex, 2, 1, 4).setValues([[data.name, data.phone, data.email, data.address]]);
        } else {
            const newId = "CUST-" + new Date().getTime();
            sheet.appendRow([newId, data.name, data.phone, data.email, data.address]);
        }

        CacheService.getScriptCache().remove('customers_data');
        return { success: true };
    } finally {
        lock.releaseLock();
    }
}

function processDeleteCustomer(data) {
    const session = data.__session;
    if (!session || (session.role !== 'admin' && session.role !== 'kasir')) {
        throw new Error('Akses ditolak.');
    }
    const id = data.id;
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk. Gagal menghapus data pelanggan.");
    try {
        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_CUSTOMERS);
        const records = sheet.getDataRange().getValues();

        for (let i = 1; i < records.length; i++) {
            if (records[i][0] === id) {
                sheet.deleteRow(i + 1);
                CacheService.getScriptCache().remove('customers_data');
                return { success: true };
            }
        }
        throw new Error("Pelanggan tidak ditemukan.");
    } finally {
        lock.releaseLock();
    }
}

function processLogin(data) {
    const { username, password } = data;
    const ss = getDb();
    const db = ss.getSheetByName(SHEET_USERS);
    const records = db.getDataRange().getValues();

    for (let i = 1; i < records.length; i++) {
        const row = records[i];
        if (row[1] === username) {
            const storedHash = row[2];
            let salt = row[4] || '';
            let inputHash = hashPassword(password, salt);

            // Fallback: jika salt kosong, coba hash tanpa salt (cara lama)
            if (!salt) {
                const oldHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                    .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
                if (storedHash === oldHash) {
                    // Upgrade: generate salt dan update hash
                    salt = generateSalt();
                    const newHash = hashPassword(password, salt);
                    db.getRange(i + 1, 3).setValue(newHash);
                    db.getRange(i + 1, 5).setValue(salt);
                    inputHash = newHash;
                }
            }

            if (storedHash === inputHash) {
                const user = { id: row[0], username: row[1], role: row[3] };
                const token = createSession(user);
                return { success: true, data: { token, user } };
            }
        }
    }
    return { success: false, error: "Username atau Password salah!" };
}

function getUsers() {
    const ss = getDb();
    const db = ss.getSheetByName(SHEET_USERS);
    const records = db.getDataRange().getValues();
    const users = [];
    for (let i = 1; i < records.length; i++) {
        users.push({ id: records[i][0], username: records[i][1], role: records[i][3] });
    }
    return { success: true, data: users };
}

function processSaveUser(data) {
    const session = data.__session;
    if (!session || session.role !== 'admin') {
        throw new Error('Akses ditolak. Hanya admin yang dapat mengelola pengguna.');
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk.");
    try {
        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_USERS);
        const records = sheet.getDataRange().getValues();

        if (data.id) {
            let rowIndex = -1;
            for (let i = 1; i < records.length; i++) {
                if (records[i][0] === data.id) { rowIndex = i + 1; break; }
            }
            if (rowIndex === -1) throw new Error("Pengguna tidak ditemukan.");

            sheet.getRange(rowIndex, 2).setValue(data.username);
            if (data.password && data.password.trim() !== "") {
                const salt = generateSalt();
                const hashed = hashPassword(data.password, salt);
                sheet.getRange(rowIndex, 3).setValue(hashed);
                sheet.getRange(rowIndex, 5).setValue(salt);
            }
            sheet.getRange(rowIndex, 4).setValue(data.role);
        } else {
            if (!data.password || data.password.trim() === "") throw new Error("Password wajib diisi untuk pengguna baru.");
            for (let i = 1; i < records.length; i++) {
                if (records[i][1] === data.username) throw new Error("Username sudah digunakan.");
            }
            const salt = generateSalt();
            const hashed = hashPassword(data.password, salt);
            sheet.appendRow(["U" + new Date().getTime(), data.username, hashed, data.role, salt]);
        }
        return { success: true };
    } finally {
        lock.releaseLock();
    }
}

function processDeleteUser(data) {
    const session = data.__session;
    if (!session || session.role !== 'admin') {
        throw new Error('Akses ditolak. Hanya admin yang dapat menghapus pengguna.');
    }
    const id = data.id;
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk.");
    try {
        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_USERS);
        const records = sheet.getDataRange().getValues();

        let adminCount = 0;
        for (let i = 1; i < records.length; i++) {
            if (records[i][3] === 'admin') adminCount++;
        }

        for (let i = 1; i < records.length; i++) {
            if (records[i][0] === id) {
                if (records[i][3] === 'admin' && adminCount <= 1) throw new Error("Tidak dapat menghapus satu-satunya Admin.");
                sheet.deleteRow(i + 1);
                return { success: true };
            }
        }
        throw new Error("Pengguna tidak ditemukan.");
    } finally {
        lock.releaseLock();
    }
}

function processUpdateProfile(data) {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk.");
    try {
        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_USERS);
        const records = sheet.getDataRange().getValues();

        let rowIndex = -1;
        for (let i = 1; i < records.length; i++) {
            if (records[i][0] === data.id) { rowIndex = i + 1; break; }
        }
        if (rowIndex === -1) throw new Error("Sesi tidak valid, pengguna tidak ditemukan.");

        sheet.getRange(rowIndex, 2).setValue(data.username);
        if (data.newPassword && data.newPassword.trim() !== "") {
            const salt = generateSalt();
            const hashed = hashPassword(data.newPassword, salt);
            sheet.getRange(rowIndex, 3).setValue(hashed);
            sheet.getRange(rowIndex, 5).setValue(salt);
        }
        return { success: true, data: { username: data.username } };
    } finally {
        lock.releaseLock();
    }
}

function getDefaultSettings() {
    return {
        appName: 'Toko Pro',
        storeName: 'Toko Kelontong Bersama',
        storeAddress: 'Jl. Contoh Alamat No. 123, Kota',
        storeContact: '081234567890 | email@toko.com',
        storeLogo: ''
    };
}

function getSettings() {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get('store_settings');
    if (cachedData) return { success: true, data: JSON.parse(cachedData) };

    try {
        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_SETTINGS);
        if (!sheet) return { success: true, data: getDefaultSettings() };

        const records = sheet.getDataRange().getValues();
        if (records.length <= 1) return { success: true, data: getDefaultSettings() };

        let settings = {};
        for (let i = 1; i < records.length; i++) {
            if (records[i][0]) settings[records[i][0]] = records[i][1];
        }

        const finalSettings = { ...getDefaultSettings(), ...settings };
        CacheService.getScriptCache().put('store_settings', JSON.stringify(finalSettings), 3600);
        return { success: true, data: finalSettings };
    } catch (error) {
        return { success: true, data: getDefaultSettings() };
    }
}

function processSaveSettings(data) {
    const session = data.__session;
    if (!session || session.role !== 'admin') {
        throw new Error('Akses ditolak.');
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk.");
    try {
        const ss = getDb();
        let sheet = ss.getSheetByName(SHEET_SETTINGS);

        if (!sheet) {
            sheet = ss.insertSheet(SHEET_SETTINGS);
            sheet.appendRow(['Key', 'Value']);
            sheet.getRange("A1:B1").setFontWeight("bold").setBackground("#e2e8f0");
        }

        const lastRow = sheet.getLastRow();
        if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 2).clearContent();

        const rows = [];
        for (const key in data) rows.push([key, data[key]]);
        if (rows.length > 0) sheet.getRange(2, 1, rows.length, 2).setValues(rows);

        CacheService.getScriptCache().remove('store_settings');
        return { success: true };
    } finally {
        lock.releaseLock();
    }
}

function getProducts() {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get('products_data');
    if (cachedData) return { success: true, data: JSON.parse(cachedData) };

    const ss = getDb();
    const db = ss.getSheetByName(SHEET_PRODUCTS);
    const records = db.getDataRange().getValues();
    const products = [];

    for (let i = 1; i < records.length; i++) {
        products.push({
            id: records[i][0],
            sku: records[i][1],
            name: records[i][2],
            basePrice: records[i][3],
            price: records[i][4],
            stock: records[i][5],
            image: records[i][6] || ""
        });
    }
    cache.put('products_data', JSON.stringify(products), 600);
    return { success: true, data: products };
}

function processAddProduct(data) {
    const session = data.__session;
    if (!session || (session.role !== 'admin' && session.role !== 'gudang')) {
        throw new Error('Akses ditolak.');
    }

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sedang menyimpan data.");
    try {
        const products = getProducts().data;
        const existing = products.find(p => p.sku === data.sku);
        if (existing) {
            throw new Error(`SKU "${data.sku}" sudah terdaftar pada produk "${existing.name}". Silakan gunakan SKU yang berbeda.`);
        }

        const role = session ? session.role : data.userRole;
        if (role === 'gudang') data.price = 0;

        const ss = getDb();
        const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
        const batchSheet = ss.getSheetByName(SHEET_BATCHES);
        const historySheet = ss.getSheetByName(SHEET_PRICE_HISTORY);

        const newId = "P" + new Date().getTime();
        prodSheet.appendRow([newId, data.sku, data.name, data.basePrice, data.price, data.stock, data.image || ""]);
        batchSheet.appendRow(["B" + new Date().getTime(), newId, new Date(), data.stock, data.expiryDate, data.stock]);

        if (historySheet) {
            const username = session ? session.username : "System";
            historySheet.appendRow(["LOG" + new Date().getTime(), newId, data.name, 0, data.basePrice, 0, data.price, username, new Date()]);
        }

        CacheService.getScriptCache().remove('products_data');
        return { success: true, data: newId };
    } finally {
        lock.releaseLock();
    }
}

function processUpdateProduct(data) {
    const session = data.__session;
    if (!session || (session.role !== 'admin' && session.role !== 'gudang')) {
        throw new Error('Akses ditolak.');
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sedang diakses pengguna lain.");
    try {
        const products = getProducts().data;
        const existing = products.find(p => p.sku === data.sku && p.id !== data.id);
        if (existing) {
            throw new Error(`SKU "${data.sku}" sudah digunakan oleh produk lain ("${existing.name}").`);
        }

        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_PRODUCTS);
        const productData = sheet.getDataRange().getValues();

        let rowIndex = -1; let oldBase = 0; let oldSell = 0; let pName = "";
        for (let i = 1; i < productData.length; i++) {
            if (productData[i][0] === data.id) {
                rowIndex = i + 1; pName = productData[i][2]; oldBase = productData[i][3] || 0; oldSell = productData[i][4] || 0; break;
            }
        }
        if (rowIndex === -1) throw new Error("Produk tidak ditemukan.");

        if (data.userRole === 'gudang') data.price = oldSell;

        if (oldBase !== data.basePrice || oldSell !== data.price) {
            const hSheet = ss.getSheetByName(SHEET_PRICE_HISTORY);
            if (hSheet) {
                const changedBy = session ? session.username : "System";
                hSheet.appendRow(["LOG" + new Date().getTime(), data.id, pName, oldBase, data.basePrice, oldSell, data.price, changedBy, new Date()]);
            }
        }

        sheet.getRange(rowIndex, 2, 1, 6).setValues([[data.sku, data.name, data.basePrice, data.price, productData[rowIndex - 1][5], data.image || ""]]);

        CacheService.getScriptCache().remove('products_data');
        return { success: true, data: data.id };
    } finally {
        lock.releaseLock();
    }
}

function processAddStockBatch(data) {
    const session = data.__session;
    if (!session || (session.role !== 'admin' && session.role !== 'gudang')) {
        throw new Error('Akses ditolak.');
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk.");
    try {
        const ss = getDb();
        const batchSheet = ss.getSheetByName(SHEET_BATCHES);
        const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);

        batchSheet.appendRow(["B" + new Date().getTime(), data.id, new Date(), data.qty, data.expiryDate, data.qty]);

        const prodData = prodSheet.getDataRange().getValues();
        for (let i = 1; i < prodData.length; i++) {
            if (prodData[i][0] === data.id) {
                prodSheet.getRange(i + 1, 6).setValue((parseInt(prodData[i][5]) || 0) + parseInt(data.qty));
                break;
            }
        }

        CacheService.getScriptCache().remove('products_data');
        return { success: true };
    } finally {
        lock.releaseLock();
    }
}

function processDeleteProduct(data) {
    const session = data.__session;
    if (!session || (session.role !== 'admin' && session.role !== 'gudang')) {
        throw new Error('Akses ditolak.');
    }
    const id = data.id;
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk.");
    try {
        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_PRODUCTS);
        const productData = sheet.getDataRange().getValues();

        for (let i = 1; i < productData.length; i++) {
            if (productData[i][0] === id) {
                sheet.deleteRow(i + 1);
                CacheService.getScriptCache().remove('products_data');
                return { success: true };
            }
        }
        throw new Error("Produk tidak ditemukan.");
    } finally {
        lock.releaseLock();
    }
}

function getPromotions() {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get('promos_data');
    if (cachedData) return { success: true, data: JSON.parse(cachedData) };

    const ss = getDb();
    const db = ss.getSheetByName(SHEET_PROMOTIONS);
    if (!db) return { success: true, data: [] };

    const records = db.getDataRange().getValues();
    const promos = [];

    for (let i = 1; i < records.length; i++) {
        promos.push({
            id: records[i][0], name: records[i][1], type: records[i][2],
            targetSku: records[i][3], rewardSku: records[i][4], value: records[i][5],
            minQty: records[i][6], rewardQty: records[i][7],
            validFrom: records[i][8] ? new Date(records[i][8]).toISOString() : null,
            validTo: records[i][9] ? new Date(records[i][9]).toISOString() : null,
            maxPerTx: records[i][10], quota: records[i][11], usedQuota: records[i][12] || 0,
            isActive: records[i][13]
        });
    }
    CacheService.getScriptCache().put('promos_data', JSON.stringify(promos), 600);
    return { success: true, data: promos };
}

function processSavePromotion(data) {
    const session = data.__session;
    if (!session || session.role !== 'admin') {
        throw new Error('Akses ditolak. Hanya admin yang dapat mengelola promo.');
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk.");
    try {
        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_PROMOTIONS);
        const records = sheet.getDataRange().getValues();
        const validFrom = data.validFrom ? new Date(data.validFrom) : "";
        const validTo = data.validTo ? new Date(data.validTo) : "";

        const rowData = [
            data.id || "PRM" + new Date().getTime(), data.name, data.type, data.targetSku, data.rewardSku,
            data.value, data.minQty, data.rewardQty, validFrom, validTo, data.maxPerTx, data.quota,
            data.usedQuota || 0, data.isActive
        ];

        if (data.id) {
            let rowIndex = -1;
            for (let i = 1; i < records.length; i++) {
                if (records[i][0] === data.id) { rowIndex = i + 1; break; }
            }
            sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
        } else {
            sheet.appendRow(rowData);
        }
        CacheService.getScriptCache().remove('promos_data');
        return { success: true };
    } finally {
        lock.releaseLock();
    }
}

function processDeletePromotion(data) {
    const session = data.__session;
    if (!session || session.role !== 'admin') {
        throw new Error('Akses ditolak.');
    }
    const id = data.id;
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Sistem sibuk.");
    try {
        const ss = getDb();
        const sheet = ss.getSheetByName(SHEET_PROMOTIONS);
        const records = sheet.getDataRange().getValues();
        for (let i = 1; i < records.length; i++) {
            if (records[i][0] === id) {
                sheet.deleteRow(i + 1);
                CacheService.getScriptCache().remove('promos_data');
                return { success: true };
            }
        }
    } finally {
        lock.releaseLock();
    }
}

function processCheckout(data) {
    const session = data.__session;
    if (!session || (session.role !== 'admin' && session.role !== 'kasir')) {
        throw new Error('Akses ditolak. Hanya kasir atau admin yang dapat melakukan transaksi.');
    }

    const { cart, total, customerId, amountPaid, paymentMethod } = data;

    // Default payment method = cash jika tidak dikirim
    const method = paymentMethod || 'cash';

    // Jika tunai, proses langsung (kurangi stok, simpan transaksi completed)
    if (method === 'cash') {
        return processCashCheckout(data, session);
    }

    // Non-tunai
    if (session.role === 'admin') {
        // Admin dianggap sudah menerima dana, langsung proses seperti tunai
        return processCashCheckout(data, session);
    } else {
        // Kasir: buat transaksi pending tanpa mengurangi stok
        return processPendingNonCashCheckout(data, session);
    }
}

/**
 * Memproses checkout tunai (atau non-tunai oleh admin).
 */
function processCashCheckout(data, session) {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(25000)) throw new Error("Server Kasir sedang sibuk. Silakan coba lagi.");

    try {
        const calculation = calculateCartTotals(data.cart);
        const calculatedTotal = calculation.finalTotal;

        if (Math.abs(calculatedTotal - data.total) > 1) {
            console.error(`Manipulasi total terdeteksi! Frontend: ${data.total}, Backend: ${calculatedTotal}`);
            throw new Error("Terjadi ketidakcocokan total transaksi. Silakan refresh dan coba lagi.");
        }

        const finalTotal = calculatedTotal;
        const promosApplied = calculation.promosApplied;
        const validatedCart = calculation.validatedCart;

        const ss = getDb();
        const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
        const detailSheet = ss.getSheetByName(SHEET_TX_DETAILS);
        const promoSheet = ss.getSheetByName(SHEET_PROMOTIONS);

        const txId = "TX" + new Date().getTime();
        const date = new Date();

        // Update kuota promosi
        if (promosApplied.length > 0 && promoSheet) {
            const promoData = promoSheet.getDataRange().getValues();
            promosApplied.forEach(applied => {
                for (let i = 1; i < promoData.length; i++) {
                    if (promoData[i][0] === applied.id) {
                        let currentUsed = parseInt(promoData[i][12]) || 0;
                        let maxQuota = parseInt(promoData[i][11]) || 0;
                        if (maxQuota > 0 && (currentUsed + applied.count) > maxQuota) {
                            throw new Error(`Kuota promo "${promoData[i][1]}" telah habis.`);
                        }
                        promoData[i][12] = currentUsed + applied.count;
                        promoSheet.getRange(i + 1, 13).setValue(promoData[i][12]);
                        break;
                    }
                }
            });
            CacheService.getScriptCache().remove('promos_data');
        }

        // Kurangi stok (FIFO)
        reduceStockFIFO(validatedCart);

        const paid = data.amountPaid || finalTotal;
        const change = paid - finalTotal;
        const cashierId = session.userId;

        // Simpan transaksi dengan status completed, PaymentMethod = cash
        // Asumsi kolom: A=ID, B=Date, C=CashierID, D=Total, E=CustomerID, F=AmountPaid, G=Change, H=PaymentMethod, I=PaymentStatus
        txSheet.appendRow([
            txId, date, cashierId, finalTotal, data.customerId || "",
            paid, change, 'cash', 'completed'
        ]);

        // Simpan detail transaksi
        let detailsRows = [];
        validatedCart.forEach(item => {
            detailsRows.push([Utilities.getUuid(), txId, item.id, item.qty, item.price, item.qty * item.price]);
        });

        promosApplied.filter(p => p.type === 'BUY_X_GET_Y').forEach(p => {
            const rewardProduct = getProductBySku(p.rewardSku);
            if (rewardProduct) {
                const rewardQty = p.rewardQty * p.count;
                detailsRows.push([Utilities.getUuid(), txId, rewardProduct.id, rewardQty, 0, 0]);
            }
        });

        if (detailsRows.length > 0) {
            detailSheet.getRange(detailSheet.getLastRow() + 1, 1, detailsRows.length, detailsRows[0].length).setValues(detailsRows);
        }

        const profit = calculateTransactionProfit(txId);
        updateDailySummary(date, finalTotal, profit);

        CacheService.getScriptCache().remove('products_data');
        return { success: true, data: { receipt: txId, status: 'completed' } };
    } catch (err) {
        throw err;
    } finally {
        lock.releaseLock();
    }
}

/**
 * Memproses checkout non-tunai oleh kasir -> pending, stok belum berkurang.
 */
function processPendingNonCashCheckout(data, session) {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error("Server sibuk. Gagal memproses transaksi.");

    try {
        const calculation = calculateCartTotals(data.cart);
        const calculatedTotal = calculation.finalTotal;

        if (Math.abs(calculatedTotal - data.total) > 1) {
            throw new Error("Terjadi ketidakcocokan total transaksi.");
        }

        const finalTotal = calculatedTotal;
        const validatedCart = calculation.validatedCart;

        const ss = getDb();
        const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
        const detailSheet = ss.getSheetByName(SHEET_TX_DETAILS);

        const txId = "TX" + new Date().getTime();
        const date = new Date();

        // Simpan transaksi dengan status pending, stok TIDAK dikurangi
        // PaymentMethod = non-cash, PaymentStatus = pending
        txSheet.appendRow([
            txId, date, session.userId, finalTotal, data.customerId || "",
            data.amountPaid || finalTotal, (data.amountPaid || finalTotal) - finalTotal,
            data.paymentMethod || 'non-cash', 'pending'
        ]);

        // Simpan detail transaksi (untuk referensi)
        let detailsRows = [];
        validatedCart.forEach(item => {
            detailsRows.push([Utilities.getUuid(), txId, item.id, item.qty, item.price, item.qty * item.price]);
        });
        if (detailsRows.length > 0) {
            detailSheet.getRange(detailSheet.getLastRow() + 1, 1, detailsRows.length, detailsRows[0].length).setValues(detailsRows);
        }

        // Buat permintaan konfirmasi
        createPaymentConfirmation(txId, session.userId, finalTotal, data.paymentMethod || 'non-cash');

        return { success: true, data: { receipt: txId, status: 'pending' } };
    } catch (err) {
        throw err;
    } finally {
        lock.releaseLock();
    }
}

// --- Fungsi Helper untuk Pembayaran Non-Tunai ---

/**
 * Membuat record permintaan konfirmasi pembayaran non-tunai.
 */
function createPaymentConfirmation(transactionId, cashierId, total, method) {
    const ss = getDb();
    const sheet = ss.getSheetByName(SHEET_PAYMENT_CONFIRMATIONS);
    const confId = 'CONF-' + new Date().getTime();
    sheet.appendRow([
        confId,
        transactionId,
        cashierId,
        total,
        method,
        'pending',
        new Date(),
        '',
        '',
        ''
    ]);
    return confId;
}

/**
 * Mengurangi stok berdasarkan item keranjang (FIFO).
 * Fungsi ini adalah ekstraksi dari processCashCheckout.
 */
function reduceStockFIFO(cartItems) {
    const ss = getDb();
    const productSheet = ss.getSheetByName(SHEET_PRODUCTS);
    const batchSheet = ss.getSheetByName(SHEET_BATCHES);

    const batchData = batchSheet.getDataRange().getValues();
    const prodData = productSheet.getDataRange().getValues();

    // Agregasi cart
    let aggregatedCart = {};
    cartItems.forEach(item => {
        if (!aggregatedCart[item.id]) {
            aggregatedCart[item.id] = { id: item.id, name: item.name || '', qtyToFulfill: 0 };
        }
        aggregatedCart[item.id].qtyToFulfill += item.qty;
    });

    const batchUpdates = [];
    const productStockUpdates = [];

    for (let pId in aggregatedCart) {
        let item = aggregatedCart[pId];
        let productBatches = [];

        for (let i = 1; i < batchData.length; i++) {
            if (batchData[i][1] === item.id && parseInt(batchData[i][5]) > 0) {
                productBatches.push({
                    rIndex: i,
                    expiryTime: new Date(batchData[i][4]).getTime(),
                    stock: parseInt(batchData[i][5])
                });
            }
        }

        productBatches.sort((a, b) => a.expiryTime - b.expiryTime);

        let remainingToDeduct = item.qtyToFulfill;
        for (let b of productBatches) {
            if (remainingToDeduct <= 0) break;
            let deductAmount = Math.min(b.stock, remainingToDeduct);
            batchData[b.rIndex][5] -= deductAmount;
            remainingToDeduct -= deductAmount;
            batchUpdates.push({
                row: b.rIndex + 1,
                newValue: batchData[b.rIndex][5]
            });
        }

        if (remainingToDeduct > 0) {
            throw new Error(`Stok produk ${item.name} tidak mencukupi.`);
        }

        for (let i = 1; i < prodData.length; i++) {
            if (prodData[i][0] === item.id) {
                prodData[i][5] -= item.qtyToFulfill;
                productStockUpdates.push({
                    row: i + 1,
                    newStock: prodData[i][5]
                });
                break;
            }
        }
    }

    // Terapkan update stok
    batchUpdates.forEach(update => {
        batchSheet.getRange(update.row, 6).setValue(update.newValue);
    });
    productStockUpdates.forEach(update => {
        productSheet.getRange(update.row, 6).setValue(update.newStock);
    });

    CacheService.getScriptCache().remove('products_data');
}

/**
 * Mengambil daftar konfirmasi yang masih pending.
 */
function getPendingConfirmations() {
    const ss = getDb();
    const sheet = ss.getSheetByName(SHEET_PAYMENT_CONFIRMATIONS);
    if (!sheet) return { success: true, data: [] };

    const data = sheet.getDataRange().getValues();
    const pending = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][5] === 'pending') { // Kolom F = Status
            pending.push({
                confirmationId: data[i][0],
                transactionId: data[i][1],
                cashierId: data[i][2],
                total: data[i][3],
                method: data[i][4],
                requestTime: data[i][6],
            });
        }
    }
    return { success: true, data: pending };
}

/**
 * Memproses konfirmasi (confirm/reject) oleh admin.
 */
function processPaymentConfirmation(data) {
    const session = data.__session;
    if (!session || session.role !== 'admin') {
        throw new Error('Akses ditolak. Hanya admin yang dapat mengonfirmasi pembayaran.');
    }

    const { confirmationId, action, notes } = data; // action: 'confirm' atau 'reject'
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) throw new Error("Server sibuk. Silakan coba lagi.");

    try {
        const ss = getDb();
        const confSheet = ss.getSheetByName(SHEET_PAYMENT_CONFIRMATIONS);
        const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
        const detailSheet = ss.getSheetByName(SHEET_TX_DETAILS);
        const promoSheet = ss.getSheetByName(SHEET_PROMOTIONS);

        // Cari data konfirmasi
        const confData = confSheet.getDataRange().getValues();
        let confRow = -1, txId = null, total = 0;
        for (let i = 1; i < confData.length; i++) {
            if (confData[i][0] === confirmationId) {
                confRow = i + 1;
                txId = confData[i][1];
                total = confData[i][3];
                if (confData[i][5] !== 'pending') {
                    throw new Error('Konfirmasi ini sudah diproses sebelumnya.');
                }
                break;
            }
        }
        if (confRow === -1) throw new Error('Data konfirmasi tidak ditemukan.');

        // Cari transaksi terkait
        const txData = txSheet.getDataRange().getValues();
        let txRow = -1;
        for (let i = 1; i < txData.length; i++) {
            if (txData[i][0] === txId) {
                txRow = i + 1;
                break;
            }
        }
        if (txRow === -1) throw new Error('Transaksi tidak ditemukan.');

        const now = new Date();

        if (action === 'confirm') {
            // Ambil detail transaksi untuk mengurangi stok
            const detailData = detailSheet.getDataRange().getValues();
            const cartItems = [];
            for (let i = 1; i < detailData.length; i++) {
                if (detailData[i][1] === txId) {
                    cartItems.push({
                        id: detailData[i][2],
                        qty: detailData[i][3],
                        price: detailData[i][4]
                    });
                }
            }

            // Kurangi stok (FIFO)
            reduceStockFIFO(cartItems);

            // Update status transaksi menjadi confirmed
            // Asumsi kolom I = PaymentStatus (indeks 9, karena 1-based = 9)
            txSheet.getRange(txRow, 9).setValue('confirmed');

            // Update konfirmasi
            confSheet.getRange(confRow, 6).setValue('confirmed');   // Status
            confSheet.getRange(confRow, 8).setValue(now);           // ConfirmationTime
            confSheet.getRange(confRow, 9).setValue(session.userId); // AdminID
            if (notes) confSheet.getRange(confRow, 10).setValue(notes);

            const profit = calculateTransactionProfit(txId);
            updateDailySummary(now, total, profit);

        } else if (action === 'reject') {
            // Update status transaksi menjadi rejected
            txSheet.getRange(txRow, 9).setValue('rejected');

            // Update konfirmasi
            confSheet.getRange(confRow, 6).setValue('rejected');
            confSheet.getRange(confRow, 8).setValue(now);
            confSheet.getRange(confRow, 9).setValue(session.userId);
            if (notes) confSheet.getRange(confRow, 10).setValue(notes);
        } else {
            throw new Error('Aksi tidak valid. Gunakan "confirm" atau "reject".');
        }

        // Hapus cache produk karena stok berubah
        CacheService.getScriptCache().remove('products_data');
        return { success: true };
    } finally {
        lock.releaseLock();
    }
}

function generateReceiptHtml(transactionId) {
    const ss = getDb();
    const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
    const detailSheet = ss.getSheetByName(SHEET_TX_DETAILS);

    const settingsRes = getSettings();
    const settings = settingsRes.success ? settingsRes.data : getDefaultSettings();

    const txData = txSheet.getDataRange().getValues();
    let transaction = null;
    for (let i = 1; i < txData.length; i++) {
        if (txData[i][0] === transactionId) {
            transaction = {
                id: txData[i][0],
                date: txData[i][1],
                cashierId: txData[i][2],
                total: txData[i][3],
                customerId: txData[i][4],
                amountPaid: txData[i][5],
                change: txData[i][6]
            };
            break;
        }
    }
    if (!transaction) throw new Error("Transaksi tidak ditemukan.");

    const detailData = detailSheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < detailData.length; i++) {
        if (detailData[i][1] === transactionId) {
            items.push({
                productId: detailData[i][2],
                qty: detailData[i][3],
                price: detailData[i][4],
                subtotal: detailData[i][5]
            });
        }
    }

    const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
    const prodData = prodSheet.getDataRange().getValues();
    const productMap = {};
    for (let i = 1; i < prodData.length; i++) {
        productMap[prodData[i][0]] = prodData[i][2]; // name
    }

    const tz = Session.getScriptTimeZone();
    const formattedDate = Utilities.formatDate(new Date(transaction.date), tz, "dd/MM/yyyy HH:mm");

    let itemsHtml = '';
    items.forEach(item => {
        const productName = productMap[item.productId] || 'Produk Tidak Dikenal';
        itemsHtml += `
      <tr>
        <td style="text-align:left;">${productName}</td>
        <td class="right">${item.qty}</td>
        <td class="right">${formatRupiah(item.price)}</td>
        <td class="right">${formatRupiah(item.subtotal)}</td>
      </tr>
    `;
    });

    const changeDisplay = transaction.change > 0 ? formatRupiah(transaction.change) : '0';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: 105mm 148mm; margin: 0; }
    body {
      font-family: 'Courier New', monospace;
      width: 105mm;
      margin: 0;
      padding: 8mm 5mm;
      box-sizing: border-box;
      background: white;
      color: black;
    }
    .header { text-align: center; margin-bottom: 5mm; }
    .store-name { font-size: 14pt; font-weight: bold; }
    .store-info { font-size: 10pt; margin-top: 2mm; }
    .divider { border-top: 1px dashed #000; margin: 3mm 0; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    td { padding: 2px 0; }
    .right { text-align: right; }
    .total-row { font-weight: bold; font-size: 12pt; margin-top: 3mm; }
    .footer { text-align: center; margin-top: 5mm; font-size: 9pt; }
    .thankyou { margin-top: 3mm; }
  </style>
</head>
<body>
  <div class="header">
    <div class="store-name">${settings.storeName}</div>
    <div class="store-info">${settings.storeAddress}</div>
    <div class="store-info">${settings.storeContact}</div>
  </div>
  <div class="divider"></div>
  <div style="display: flex; justify-content: space-between;">
    <span>No: ${transaction.id}</span>
    <span>${formattedDate}</span>
  </div>
  <div>Kasir: ${transaction.cashierId}</div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Item</th>
        <th class="right">Qty</th>
        <th class="right">Harga</th>
        <th class="right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>
  <div class="divider"></div>
  <div style="display: flex; justify-content: space-between;">
    <span>Total Belanja</span>
    <span class="right">${formatRupiah(transaction.total)}</span>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span>Tunai</span>
    <span class="right">${formatRupiah(transaction.amountPaid)}</span>
  </div>
  <div style="display: flex; justify-content: space-between; font-weight: bold;">
    <span>Kembalian</span>
    <span class="right">${changeDisplay}</span>
  </div>
  <div class="footer">
    <div class="thankyou">--- Terima Kasih ---</div>
    <div>Barang yang sudah dibeli tidak dapat dikembalikan.</div>
  </div>
</body>
</html>
  `;

    return html;
}

function sendInvoiceEmail(data) {
    const { transactionId, email } = data;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Alamat email tidak valid.");
    }

    const htmlContent = generateReceiptHtml(transactionId);
    const blob = Utilities.newBlob(htmlContent, 'text/html', `Invoice_${transactionId}.html`);
    const pdf = blob.getAs('application/pdf').setName(`Invoice_${transactionId}.pdf`);

    const subject = `Invoice Transaksi ${transactionId}`;
    const body = "Terima kasih telah berbelanja. Berikut terlampir invoice pembelian Anda.";

    GmailApp.sendEmail(email, subject, body, {
        attachments: [pdf],
        name: "Sistem Kasir"
    });

    return { success: true, message: "Email berhasil dikirim." };
}

function searchTransactions(data) {
    const { query, startDate, endDate } = data;
    const ss = getDb();
    const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
    if (!txSheet) return { success: true, data: [] };

    const records = txSheet.getDataRange().getValues();
    const results = [];
    const tz = Session.getScriptTimeZone();

    let filterStart = null, filterEnd = null;
    if (startDate) {
        filterStart = new Date(startDate);
        filterStart.setHours(0, 0, 0, 0);
    }
    if (endDate) {
        filterEnd = new Date(endDate);
        filterEnd.setHours(23, 59, 59, 999);
    }

    for (let i = 1; i < records.length; i++) {
        const row = records[i];
        const txId = row[0].toString();
        const txDate = new Date(row[1]);

        let idMatch = true;
        if (query && !txId.toLowerCase().includes(query.toLowerCase())) {
            idMatch = false;
        }

        let dateMatch = true;
        if (filterStart && txDate < filterStart) dateMatch = false;
        if (filterEnd && txDate > filterEnd) dateMatch = false;

        if (idMatch && dateMatch) {
            results.push({
                rawDate: txDate.getTime(),
                id: txId,
                date: Utilities.formatDate(txDate, tz, "dd/MM/yyyy HH:mm"),
                cashier: row[2],
                total: row[3],
                customerId: row[4] || "",
                amountPaid: row[5],
                change: row[6]
            });
        }
    }

    results.sort((a, b) => b.rawDate - a.rawDate);
    const limited = results.slice(0, 50).map(r => {
        delete r.rawDate;
        return r;
    });

    return { success: true, data: limited };
}

function getTransactionDetail(transactionId) {
    const ss = getDb();
    const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
    const detailSheet = ss.getSheetByName(SHEET_TX_DETAILS);
    const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);

    const txData = txSheet.getDataRange().getValues();
    let header = null;
    for (let i = 1; i < txData.length; i++) {
        if (txData[i][0] === transactionId) {
            header = {
                id: txData[i][0],
                date: txData[i][1],
                cashier: txData[i][2],
                total: txData[i][3],
                customerId: txData[i][4] || "",
                amountPaid: txData[i][5],
                change: txData[i][6]
            };
            break;
        }
    }
    if (!header) throw new Error("Transaksi tidak ditemukan.");

    const detailData = detailSheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < detailData.length; i++) {
        if (detailData[i][1] === transactionId) {
            items.push({
                productId: detailData[i][2],
                qty: detailData[i][3],
                price: detailData[i][4],
                subtotal: detailData[i][5]
            });
        }
    }

    const prodData = prodSheet.getDataRange().getValues();
    const productMap = {};
    for (let i = 1; i < prodData.length; i++) {
        productMap[prodData[i][0]] = prodData[i][2];
    }

    const itemsWithName = items.map(item => ({
        ...item,
        productName: productMap[item.productId] || 'Produk Tidak Dikenal'
    }));

    const tz = Session.getScriptTimeZone();
    return {
        success: true,
        data: {
            header: {
                ...header,
                formattedDate: Utilities.formatDate(new Date(header.date), tz, "dd/MM/yyyy HH:mm")
            },
            items: itemsWithName
        }
    };
}

function getDashboardData() {
    const ss = getDb();
    const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
    const detailSheet = ss.getSheetByName(SHEET_TX_DETAILS);
    const batchSheet = ss.getSheetByName(SHEET_BATCHES);
    const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);

    if (!txSheet || !detailSheet || !batchSheet || !prodSheet) throw new Error("Database belum disiapkan.");

    const tz = Session.getScriptTimeZone();
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);

    const batches = batchSheet.getDataRange().getValues();
    const prods = prodSheet.getDataRange().getValues();

    let prodMap = {};
    for (let i = 1; i < prods.length; i++) {
        prodMap[prods[i][0]] = { sku: prods[i][1], name: prods[i][2], basePrice: parseFloat(prods[i][3]) || 0 };
    }

    let expiringSoon = [];
    for (let i = 1; i < batches.length; i++) {
        let qty = parseInt(batches[i][5]);
        let expDateStr = batches[i][4];

        if (qty > 0 && expDateStr && expDateStr.toString().indexOf("2099") === -1) {
            let expDate = new Date(expDateStr);
            if (expDate <= thirtyDays) {
                let p = prodMap[batches[i][1]];
                let isExpired = expDate < now;
                expiringSoon.push({
                    batchId: batches[i][0],
                    sku: p ? p.sku : 'N/A',
                    name: p ? p.name : 'Unknown',
                    qty: qty,
                    expiryDate: Utilities.formatDate(expDate, tz, "dd MMM yyyy"),
                    status: isExpired ? "Kedaluwarsa" : "Hampir Habis"
                });
            }
        }
    }
    expiringSoon.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    let salesData = {};
    for (let i = 6; i >= 0; i--) {
        let d = new Date(); d.setDate(now.getDate() - i);
        salesData[Utilities.formatDate(d, tz, "yyyy-MM-dd")] = { date: Utilities.formatDate(d, tz, "dd MMM"), revenue: 0, cost: 0, profit: 0, txCount: 0 };
    }

    const txData = txSheet.getDataRange().getValues();
    const detailsData = detailSheet.getDataRange().getValues();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const recentTx = [];
    const recentTxIds = new Set();

    for (let i = 1; i < txData.length; i++) {
        const txDate = new Date(txData[i][1]);
        if (txDate >= thirtyDaysAgo) {
            recentTx.push(txData[i]);
            recentTxIds.add(txData[i][0]);
        }
    }

    const recentDetails = detailsData.filter((row, index) => index === 0 || recentTxIds.has(row[1]));

    let txDateMap = {};
    for (let i = 0; i < recentTx.length; i++) {
        let txId = recentTx[i][0];
        let tDate = new Date(recentTx[i][1]);
        let dateStr = Utilities.formatDate(tDate, tz, "yyyy-MM-dd");
        if (salesData[dateStr]) {
            txDateMap[txId] = dateStr;
            salesData[dateStr].txCount += 1;
        }
    }

    for (let i = 1; i < recentDetails.length; i++) {
        let dateStr = txDateMap[recentDetails[i][1]];
        if (dateStr) {
            let qty = parseInt(recentDetails[i][3]) || 0;
            let subtotal = parseFloat(recentDetails[i][5]) || 0;
            let totalCost = (prodMap[recentDetails[i][2]] ? prodMap[recentDetails[i][2]].basePrice : 0) * qty;

            salesData[dateStr].revenue += subtotal;
            salesData[dateStr].cost += totalCost;
            salesData[dateStr].profit += (subtotal - totalCost);
        }
    }
    return { success: true, data: { expiringSoon, chartData: Object.values(salesData) } };
}

/**
 * Mendapatkan map harga modal produk (basePrice) dari sheet Products.
 * @returns {Object} Map dengan key productId dan value basePrice.
 */
function getProductCostMap() {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('product_cost_map');
    if (cached) return JSON.parse(cached);

    const ss = getDb();
    const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
    const data = prodSheet.getDataRange().getValues();
    const map = {};
    for (let i = 1; i < data.length; i++) {
        map[data[i][0]] = parseFloat(data[i][3]) || 0; // basePrice kolom ke-4 (indeks 3)
    }
    cache.put('product_cost_map', JSON.stringify(map), 600);
    return map;
}

/**
 * Menghitung total profit dari detail transaksi.
 * @param {string} txId - ID transaksi.
 * @returns {number} Total profit (omzet - total modal).
 */
function calculateTransactionProfit(txId) {
    const ss = getDb();
    const detailSheet = ss.getSheetByName(SHEET_TX_DETAILS);
    const costMap = getProductCostMap();
    const data = detailSheet.getDataRange().getValues();
    let profit = 0;
    for (let i = 1; i < data.length; i++) {
        if (data[i][1] === txId) {
            const productId = data[i][2];
            const qty = data[i][3] || 0;
            const subtotal = data[i][5] || 0;
            const cost = (costMap[productId] || 0) * qty;
            profit += (subtotal - cost);
        }
    }
    return profit;
}

function generateReport(data) {
    const session = data.__session;
    if (!session || session.role !== 'admin') {
        throw new Error('Akses ditolak. Hanya admin yang dapat membuat laporan.');
    }

    const { type, startDate, endDate } = data;
    const tz = Session.getScriptTimeZone();

    // Default periode: bulan berjalan
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;
    // Set endDate ke akhir hari
    end.setHours(23, 59, 59, 999);

    let html = '';
    switch (type) {
        case 'stock':
            html = generateStockReport();
            break;
        case 'transactions':
            html = generateTransactionsReport(start, end, tz);
            break;
        case 'cashflow':
            html = generateCashflowReport(start, end, tz);
            break;
        default:
            throw new Error('Jenis laporan tidak dikenal. Gunakan "stock", "transactions", atau "cashflow".');
    }
    return { success: true, data: html };
}

function generateStockReport() {
    const ss = getDb();
    const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
    const data = prodSheet.getDataRange().getValues();
    const settings = getSettings().data;
    const tz = Session.getScriptTimeZone();
    const printDate = Utilities.formatDate(new Date(), tz, "dd MMMM yyyy HH:mm");

    let rows = '';
    let totalValue = 0;
    for (let i = 1; i < data.length; i++) {
        const p = data[i];
        const sku = p[1] || '-';
        const name = p[2] || '-';
        const stock = parseInt(p[5]) || 0;
        const basePrice = parseFloat(p[3]) || 0;
        const sellPrice = parseFloat(p[4]) || 0;
        const value = stock * basePrice;
        totalValue += value;
        rows += `<tr>
      <td>${sku}</td>
      <td>${name}</td>
      <td class="text-right">${stock}</td>
      <td class="text-right">${formatRupiah(basePrice)}</td>
      <td class="text-right">${formatRupiah(sellPrice)}</td>
      <td class="text-right">${formatRupiah(value)}</td>
    </tr>`;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Laporan Stok Barang</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2cm; }
    h1 { color: #10b981; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .text-right { text-align: right; }
    .footer { margin-top: 30px; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <h1>${settings.storeName} - Laporan Stok Barang</h1>
  <p>Tanggal Cetak: ${printDate}</p>
  <table>
    <thead>
      <tr>
        <th>SKU</th><th>Nama Produk</th><th>Stok</th><th>Harga Modal</th><th>Harga Jual</th><th>Nilai Stok</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr><th colspan="5" class="text-right">Total Nilai Stok</th><th class="text-right">${formatRupiah(totalValue)}</th></tr>
    </tfoot>
  </table>
  <div class="footer">Dicetak oleh ${Session.getActiveUser().getEmail()}</div>
</body>
</html>`;
    return html;
}

function generateTransactionsReport(start, end, tz) {
    const ss = getDb();
    const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
    const data = txSheet.getDataRange().getValues();
    const settings = getSettings().data;

    let rows = '';
    let totalRevenue = 0, totalProfit = 0, totalTx = 0;

    // Asumsi kolom: A=ID, B=Date, C=CashierID, D=Total, E=CustomerID, F=Paid, G=Change, H=Method, I=Status
    for (let i = 1; i < data.length; i++) {
        const tx = data[i];
        const txDate = new Date(tx[1]);
        if (txDate < start || txDate > end) continue;

        const status = tx[8]; // kolom I
        // Hanya transaksi yang sudah selesai (completed/confirmed)
        if (status !== 'completed' && status !== 'confirmed') continue;

        const txId = tx[0];
        const total = parseFloat(tx[3]) || 0;
        const profit = calculateTransactionProfit(txId);
        totalRevenue += total;
        totalProfit += profit;
        totalTx++;

        rows += `<tr>
      <td>${txId}</td>
      <td>${Utilities.formatDate(txDate, tz, "dd/MM/yyyy HH:mm")}</td>
      <td>${tx[2]}</td>
      <td class="text-right">${formatRupiah(total)}</td>
      <td class="text-right">${formatRupiah(profit)}</td>
      <td>${tx[7] || 'cash'}</td>
      <td>${status}</td>
    </tr>`;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Laporan Transaksi</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2cm; }
    h1 { color: #10b981; }
    .summary { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f2f2f2; }
    .text-right { text-align: right; }
    .footer { margin-top: 30px; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <h1>${settings.storeName} - Laporan Transaksi</h1>
  <p>Periode: ${Utilities.formatDate(start, tz, "dd MMM yyyy")} - ${Utilities.formatDate(end, tz, "dd MMM yyyy")}</p>
  <div class="summary">
    <p><strong>Total Transaksi:</strong> ${totalTx}</p>
    <p><strong>Total Omzet:</strong> ${formatRupiah(totalRevenue)}</p>
    <p><strong>Total Profit:</strong> ${formatRupiah(totalProfit)}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>ID Transaksi</th><th>Tanggal</th><th>Kasir</th><th>Total</th><th>Profit</th><th>Metode</th><th>Status</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Dicetak oleh ${Session.getActiveUser().getEmail()}</div>
</body>
</html>`;
    return html;
}

function generateCashflowReport(start, end, tz) {
    const ss = getDb();
    const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
    const data = txSheet.getDataRange().getValues();
    const settings = getSettings().data;

    let totalIncome = 0;
    let detailsHtml = '';

    for (let i = 1; i < data.length; i++) {
        const tx = data[i];
        const txDate = new Date(tx[1]);
        if (txDate < start || txDate > end) continue;

        const status = tx[8];
        if (status !== 'completed' && status !== 'confirmed') continue;

        const total = parseFloat(tx[3]) || 0;
        totalIncome += total;
        detailsHtml += `<tr>
      <td>${tx[0]}</td>
      <td>${Utilities.formatDate(txDate, tz, "dd/MM/yyyy")}</td>
      <td>${tx[2]}</td>
      <td class="text-right">${formatRupiah(total)}</td>
      <td>${tx[7] || 'cash'}</td>
    </tr>`;
    }

    // Untuk pengeluaran, bisa ditambahkan sheet terpisah nanti. Saat ini set ke 0.
    const totalExpense = 0;
    const netCashflow = totalIncome - totalExpense;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Laporan Arus Kas</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2cm; }
    h1 { color: #10b981; }
    .summary { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f2f2f2; }
    .text-right { text-align: right; }
  </style>
</head>
<body>
  <h1>${settings.storeName} - Laporan Arus Kas</h1>
  <p>Periode: ${Utilities.formatDate(start, tz, "dd MMM yyyy")} - ${Utilities.formatDate(end, tz, "dd MMM yyyy")}</p>
  <div class="summary">
    <p><strong>Total Pemasukan:</strong> ${formatRupiah(totalIncome)}</p>
    <p><strong>Total Pengeluaran:</strong> ${formatRupiah(totalExpense)}</p>
    <p><strong>Saldo Bersih:</strong> ${formatRupiah(netCashflow)}</p>
  </div>
  <h3>Rincian Pemasukan</h3>
  <table>
    <thead>
      <tr><th>ID Transaksi</th><th>Tanggal</th><th>Kasir</th><th>Jumlah</th><th>Metode</th></tr>
    </thead>
    <tbody>${detailsHtml}</tbody>
  </table>
</body>
</html>`;
    return html;
}

function updateDailySummary(date, revenue, profit) {
    const ss = getDb();
    const sheet = ss.getSheetByName(SHEET_DAILY_SUMMARY);
    const data = sheet.getDataRange().getValues();
    const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
        const rowDate = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), "yyyy-MM-dd");
        if (rowDate === dateStr) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex === -1) {
        sheet.appendRow([date, revenue, profit, 1]);
    } else {
        const currentRevenue = parseFloat(data[rowIndex - 1][1]) || 0;
        const currentProfit = parseFloat(data[rowIndex - 1][2]) || 0;
        const currentCount = parseInt(data[rowIndex - 1][3]) || 0;
        sheet.getRange(rowIndex, 2).setValue(currentRevenue + revenue);
        sheet.getRange(rowIndex, 3).setValue(currentProfit + profit);
        sheet.getRange(rowIndex, 4).setValue(currentCount + 1);
    }
}

function initializeDatabase() {
    const props = PropertiesService.getScriptProperties();
    let ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!ss) {
        const dbId = props.getProperty('DB_ID');
        if (dbId) {
            try { ss = SpreadsheetApp.openById(dbId); } catch (e) { props.deleteProperty('DB_ID'); }
        }
        if (!ss) {
            ss = SpreadsheetApp.create('Database_POS_Kelontong_v3_2');
            props.setProperty('DB_ID', ss.getId());
        }
    }

    const createOrReset = (name, headers) => {
        let sheet = ss.getSheetByName(name);
        if (!sheet) {
            sheet = ss.insertSheet(name);
            sheet.appendRow(headers);
            sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
        }
        return sheet;
    };

    const userSheet = createOrReset(SHEET_USERS, ['ID', 'Username', 'PasswordHash', 'Role', 'Salt']);
    if (userSheet.getLastRow() === 1) {
        const salt1 = generateSalt();
        const pass1 = hashPassword("admin123", salt1);
        userSheet.appendRow(['U001', 'admin', pass1, 'admin', salt1]);

        const salt2 = generateSalt();
        const pass2 = hashPassword("admin123", salt2);
        userSheet.appendRow(['U002', 'kasir1', pass2, 'kasir', salt2]);

        const salt3 = generateSalt();
        const pass3 = hashPassword("admin123", salt3);
        userSheet.appendRow(['U003', 'gudang1', pass3, 'gudang', salt3]);
    }

    createOrReset(SHEET_PRODUCTS, ['ID', 'SKU', 'Name', 'BasePrice', 'SellPrice', 'Stock', 'Image']);
    createOrReset(SHEET_BATCHES, ['BatchID', 'ProductID', 'DateIn', 'InitialQty', 'ExpiryDate', 'RemainingQty']);

    createOrReset(SHEET_TRANSACTIONS, ['TransactionID', 'Date', 'CashierID', 'TotalAmount', 'CustomerID', 'AmountPaid', 'Change', 'PaymentMethod', 'PaymentStatus']);

    createOrReset(SHEET_TX_DETAILS, ['DetailID', 'TransactionID', 'ProductID', 'Qty', 'Price', 'Subtotal']);
    createOrReset(SHEET_PROMOTIONS, ['PromoID', 'Name', 'Type', 'TargetSKU', 'RewardSKU', 'Value', 'MinQty', 'RewardQty', 'ValidFrom', 'ValidTo', 'MaxPerTx', 'Quota', 'UsedQuota', 'IsActive']);
    createOrReset(SHEET_PRICE_HISTORY, ['LogID', 'ProductID', 'ProductName', 'OldBasePrice', 'NewBasePrice', 'OldSellPrice', 'NewSellPrice', 'ChangedBy', 'Timestamp']);

    createOrReset(SHEET_CUSTOMERS, ['CustomerID', 'Name', 'Phone', 'Email', 'Address']);

    createOrReset(SHEET_PAYMENT_CONFIRMATIONS, [
        'ConfirmationID', 'TransactionID', 'CashierID', 'TotalAmount', 'PaymentMethod',
        'Status', 'RequestTime', 'ConfirmationTime', 'AdminID', 'Notes'
    ]);

    createOrReset(SHEET_DAILY_SUMMARY, ['Date', 'TotalRevenue', 'TotalProfit', 'TransactionCount']);

    const settingSheet = createOrReset(SHEET_SETTINGS, ['Key', 'Value']);
    if (settingSheet.getLastRow() === 1) {
        const defaultSettings = getDefaultSettings();
        for (const key in defaultSettings) settingSheet.appendRow([key, defaultSettings[key]]);
    }

    const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
    const batchSheet = ss.getSheetByName(SHEET_BATCHES);
    if (prodSheet.getLastRow() > 1 && batchSheet.getLastRow() === 1) {
        const pData = prodSheet.getDataRange().getValues();
        for (let i = 1; i < pData.length; i++) {
            if (pData[i][5] > 0) {
                batchSheet.appendRow(["B_LEGACY_" + i, pData[i][0], new Date(), pData[i][5], "2099-12-31", pData[i][5]]);
            }
        }
    }

    CacheService.getScriptCache().removeAll(['products_data', 'promos_data', 'store_settings', 'customers_data']);

    const successMessage = "✅ Database v1.0 siap.";
    Logger.log(successMessage);
    try {
        SpreadsheetApp.getUi().alert(successMessage);
    } catch (e) { }

    return successMessage;
}