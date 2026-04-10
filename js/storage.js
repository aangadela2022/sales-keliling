// storage.js - Utility for LocalStorage

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    // Trigger Firebase sync if available
    if (window.pushToFirebase) {
        window.pushToFirebase(key, data);
    }
}

function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Default initial data for testing if nothing exists
function initializeStorage() {
    if (!localStorage.getItem('storeProfile')) {
        saveData('storeProfile', {
            namaToko: "Toko Sinar Jaya",
            alamat: "Jl. Sudirman No 1",
            noHp: "081234567890"
        });
    }
    
    if (!localStorage.getItem('customers')) {
        saveData('customers', []);
    }
    
    if (!localStorage.getItem('products')) {
        saveData('products', []);
    }
    
    if (!localStorage.getItem('orders')) {
        saveData('orders', []);
    }
    
    if (!localStorage.getItem('payments')) {
        saveData('payments', []);
    }
}

// Generate unique ID based on prefix and count
function generateId(key, prefix) {
    const data = getData(key);
    const count = data.length + 1;
    return `${prefix}${String(count).padStart(3, '0')}`;
}

// Call on load
initializeStorage();
