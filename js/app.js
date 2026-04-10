// app.js - Main Application Logic for Dashboard & Shared UI

// Auth Check (Redirect if not logged in)
if (localStorage.getItem('isLoggedIn') !== 'true') {
    // Pastikan tidak infinite loop jika di halaman login (jika suatu saat app.js diload di sana)
    if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
    }
} else if (!localStorage.getItem('firebaseConfig') && !window.location.pathname.endsWith('firebase-setup.html')) {
    // If logged in but firebase not configured
    window.location.href = 'firebase-setup.html';
}

function toggleSidebar() {
    const sidebar = document.getElementById("mySidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (sidebar.classList.contains("active")) {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    } else {
        sidebar.classList.add("active");
        overlay.classList.add("active");
    }
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Function to handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Get Today's Date String YYYY-MM-DD
function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Load Store Profile
function loadStoreProfile() {
    const profile = getData('storeProfile');
    if (profile && profile.namaToko) {
        document.getElementById('storeNameHeader').textContent = profile.namaToko;

        // Populate form if on index.html
        if (document.getElementById('namaToko')) {
            document.getElementById('namaToko').value = profile.namaToko || '';
            document.getElementById('noHp').value = profile.noHp || '';
            document.getElementById('alamat').value = profile.alamat || '';
        }
    }
}

// Save Store Profile
function saveProfile(e) {
    e.preventDefault();
    const profile = {
        namaToko: document.getElementById('namaToko').value,
        noHp: document.getElementById('noHp').value,
        alamat: document.getElementById('alamat').value
    };
    saveData('storeProfile', profile);
    alert('Profil Toko berhasil disimpan!');
    loadStoreProfile(); // Update header
}

// Load Dashboard Stats
function loadDashboardStats() {
    if (!document.getElementById('statOrdersToday')) return; // Not on dashboard page

    const todayStr = getTodayDateString();
    const orders = getData('orders');
    const payments = getData('payments');

    // 1. Total Order Hari Ini
    const todayOrders = orders.filter(o => o.date === todayStr);
    const totalOrderValue = todayOrders.reduce((sum, order) => sum + Number(order.totalOrder), 0);
    document.getElementById('statOrdersToday').textContent = formatCurrency(totalOrderValue);

    // 2. Pelanggan Order Hari Ini (Unique Customers)
    const uniqueCustomersToday = new Set(todayOrders.map(o => o.customer));
    document.getElementById('statCustomersToday').textContent = uniqueCustomersToday.size;

    // 3. Profit Hari Ini
    // Keuntungan = sum of ((Selling Price - Buy Price) * Qty)
    let totalProfitToday = todayOrders.reduce((sum, order) => {
        const buyPrice = order.buyPrice || 0; // fallback if older data
        return sum + ((order.price - buyPrice) * order.qty);
    }, 0);
    // Round to nearest 500
    if (totalProfitToday !== 0) {
        totalProfitToday = Math.round(totalProfitToday / 500) * 500;
    }
    const profitEl = document.getElementById('statProfitToday');
    if (profitEl) {
        profitEl.textContent = formatCurrency(totalProfitToday);
    }

    // 4. Total Pembayaran Hari Ini
    const todayPayments = payments.filter(p => p.date === todayStr);
    const totalPaymentValue = todayPayments.reduce((sum, pay) => sum + Number(pay.totalBayar), 0);
    document.getElementById('statPaymentsToday').textContent = formatCurrency(totalPaymentValue);

    // 4. Pelanggan Nunggak > 7 Hari
    const todayDate = new Date();
    const unpaidOrders = orders.filter(o => o.status === 'Belum Lunas');

    let nunggakCount = 0;
    unpaidOrders.forEach(order => {
        const orderDate = new Date(order.date);
        const diffTime = Math.abs(todayDate - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 7) {
            nunggakCount++;
        }
    });
    document.getElementById('statDebtCount').textContent = nunggakCount;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStoreProfile();
    loadDashboardStats();

    const profileForm = document.getElementById('storeProfileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
});

// ============================================
// GOOGLE SHEETS SYNC KONEKSI
// ============================================
// Ganti URI di bawah ini dengan URL Web App dari Google Apps Script Anda
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLpmMbg_8RYSYzuTA-dzsPap7M5M2dRrlOgR4RnL8jjvIv0f8AH2STxUbFy-qB8lEi4Q/exec";

async function syncOrderToSheet(customerName, address, date, productName, qty, orderId) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL") return;

    try {
        const payload = {
            action: "SYNC_ORDER",
            customerName: customerName,
            address: address,
            date: date,
            productName: productName,
            qty: Number(qty),
            orderId: orderId
        };

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        console.log(`Order ${orderId} synced to Google Sheets`);
    } catch (e) {
        console.error("Failed to sync order:", e);
    }
}

async function syncPaymentToSheet(customerName, paymentsArray) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL") return;

    try {
        const payload = {
            action: "SYNC_PAYMENT",
            customerName: customerName,
            payments: paymentsArray
        };

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        console.log(`Payment synced to Google Sheets for ${customerName}`);
    } catch (e) {
        console.error("Failed to sync payment:", e);
    }
}
