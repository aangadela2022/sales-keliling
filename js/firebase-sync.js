// firebase-sync.js - Offline-First Firebase Adapter

let db = null;
let firebaseInitialized = false;

function initFirebase() {
    if (firebaseInitialized) return;
    
    const configStr = localStorage.getItem('firebaseConfig');
    if (!configStr) return; // No config, running in Local-Only Mode
    
    // Dynamically load Firebase SDK if not already loaded
    if (!window.firebase) {
        const scriptApp = document.createElement('script');
        scriptApp.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
        scriptApp.onload = () => {
            const scriptFs = document.createElement('script');
            scriptFs.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
            scriptFs.onload = () => {
                try {
                    const config = JSON.parse(configStr);
                    firebase.initializeApp(config);
                    db = firebase.firestore();
                    firebaseInitialized = true;
                    console.log("[Firebase] Caching engine loaded.");
                } catch(e) {
                    console.error("[Firebase] Init error:", e);
                }
            };
            document.head.appendChild(scriptFs);
        };
        document.head.appendChild(scriptApp);
    }
}

window.pushToFirebase = async function(key, data) {
    if (!firebaseInitialized || !db) return;
    try {
        await db.collection("salesApp").doc(key).set({ items: data });
    } catch(e) {
        console.error("[Firebase] Push error for", key, e);
    }
};

window.pullFromFirebase = async function(btnContext) {
    if (!firebaseInitialized || !db) {
        alert("Firebase belum siap atau tidak terkonfigurasi. Coba lagi.");
        return;
    }
    try {
        if(btnContext) btnContext.textContent = "Menarik Data...";
        
        const collectionsToSync = ['storeProfile', 'customers', 'products', 'orders', 'payments'];
        let updatedCount = 0;
        
        for (let key of collectionsToSync) {
            const doc = await db.collection("salesApp").doc(key).get();
            if (doc.exists) {
                const cloudData = doc.data().items;
                // Save to localStorage directly to avoid infinite trigger loop
                localStorage.setItem(key, JSON.stringify(cloudData));
                updatedCount++;
            }
        }
        alert("Sinkronisasi Selesai! Halaman akan dimuat ulang dengan data terbaru.");
        window.location.reload();
    } catch(e) {
        console.error("Firebase pull error", e);
        alert("Gagal menarik data dari Cloud. Periksa koneksi atau rules Firebase Anda.");
        if(btnContext) btnContext.textContent = "Pull Data Cloud";
    }
};

// Start initialization flow
initFirebase();
