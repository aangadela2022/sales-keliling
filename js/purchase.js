// purchase.js - Purchase Management

let purchaseCart = [];

document.addEventListener('DOMContentLoaded', () => {
    // Set today's date
    const dateValueInput = document.getElementById('purchaseDate');
    const dateDisplayInput = document.getElementById('purchaseDateDisplay');
    
    if(dateValueInput && dateDisplayInput) {
        const todayStr = getTodayDateString();
        dateValueInput.value = todayStr;
        
        // Format for display (Senin, 15-03-2026)
        const todayObj = new Date();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = days[todayObj.getDay()];
        
        const dd = String(todayObj.getDate()).padStart(2, '0');
        const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
        const yyyy = todayObj.getFullYear();
        
        dateDisplayInput.value = `${dayName}, ${dd}-${mm}-${yyyy}`;
    }

    populateDropdowns();
    loadPurchases();

    // Event listeners for calculations
    document.getElementById('purchaseProduct').addEventListener('change', calculateItemTotal);
    document.getElementById('purchaseForm').addEventListener('submit', saveFinalPurchase);
});

function populateDropdowns() {
    const suppliers = getData('suppliers');
    const products = getData('products');
    
    const supSelect = document.getElementById('purchaseSupplier');
    const prodSelect = document.getElementById('purchaseProduct');
    
    // Populate Suppliers
    suppliers.forEach(sup => {
        const option = document.createElement('option');
        option.value = sup.name;
        option.textContent = sup.name;
        supSelect.appendChild(option);
    });
    
    // Populate Products
    products.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.name;
        option.textContent = prod.name;
        option.dataset.buyPrice = prod.buyPrice || 0;
        option.dataset.id = prod.id;
        prodSelect.appendChild(option);
    });
}

function calculateItemTotal() {
    const prodSelect = document.getElementById('purchaseProduct');
    const priceDisplay = document.getElementById('purchasePriceDisplay');
    const priceValue = document.getElementById('purchasePriceValue');

    if (prodSelect.selectedIndex > 0) {
        const selectedOption = prodSelect.options[prodSelect.selectedIndex];
        const buyPrice = Number(selectedOption.dataset.buyPrice);

        priceDisplay.value = formatCurrency(buyPrice);
        priceValue.value = buyPrice;
    } else {
        priceDisplay.value = "";
        priceValue.value = "";
    }
}

function addItemToCart() {
    const prodSelect = document.getElementById('purchaseProduct');
    const qtyInput = document.getElementById('purchaseQty');
    const priceValue = document.getElementById('purchasePriceValue');
    
    const product = prodSelect.value;
    const qty = Number(qtyInput.value);
    const buyPrice = Number(priceValue.value);
    
    if (!product || qty <= 0) {
        alert("Pilih produk dan masukkan jumlah qty yang valid!");
        return;
    }
    
    // Check if product already in cart, if yes add qty
    const existingItem = purchaseCart.find(item => item.product === product);
    if (existingItem) {
        existingItem.qty += qty;
        // Optionally update price if it changed
        existingItem.buyPrice = buyPrice; 
    } else {
        purchaseCart.push({
            product: product,
            buyPrice: buyPrice,
            qty: qty
        });
    }
    
    // Reset product input area
    prodSelect.value = "";
    qtyInput.value = "";
    calculateItemTotal();
    
    renderCart();
}

function renderCart() {
    const tbody = document.getElementById('cartTableBody');
    tbody.innerHTML = '';
    
    if (purchaseCart.length === 0) {
        tbody.innerHTML = '<tr id="emptyCartRow"><td colspan="4" style="text-align:center; font-style:italic; color:#777;">Daftar item masih kosong</td></tr>';
        updateGrandTotal();
        return;
    }
    
    purchaseCart.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.product}</td>
            <td>${formatCurrency(item.buyPrice)}</td>
            <td>${item.qty}</td>
            <td>
                <button type="button" class="btn btn-danger" style="padding: 2px 8px; font-size: 0.8rem;" onclick="removeItem(${index})">X</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    updateGrandTotal();
}

function removeItem(index) {
    purchaseCart.splice(index, 1);
    renderCart();
}

function updateGrandTotal() {
    const textTotalPembelian = document.getElementById('textTotalPembelian');
    
    let total = 0;
    purchaseCart.forEach(item => {
        total += (item.buyPrice * item.qty);
    });
    
    textTotalPembelian.textContent = formatCurrency(total);
}

function loadPurchases() {
    const allPurchases = getData('purchases');
    const todayStr = getTodayDateString();
    const purchases = allPurchases.filter(p => p.date === todayStr);
    const tbody = document.querySelector('#purchaseTable tbody');
    tbody.innerHTML = '';
    
    if (purchases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Belum ada data pembelian.</td></tr>';
        return;
    }

    // Sort by ID descending (newest first)
    purchases.reverse().forEach((purchase, index) => {
        const tr = document.createElement('tr');
        
        // Setup Date Display Format
        const dateObj = new Date(purchase.date);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = days[dateObj.getDay()];
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        const displayDate = `${dayName}, ${dd}-${mm}-${yyyy}`;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${displayDate}</td>
            <td>${purchase.supplier}</td>
            <td>${purchase.product}</td>
            <td>${purchase.qty}</td>
            <td>${formatCurrency(purchase.buyPrice)}</td>
            <td>${formatCurrency(purchase.totalPurchase)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function saveFinalPurchase(e) {
    e.preventDefault();
    
    const date = document.getElementById('purchaseDate').value;
    const supplier = document.getElementById('purchaseSupplier').value;
    
    if (!supplier) {
        alert("Pilih Suplier terlebih dahulu!");
        return;
    }
    
    if (purchaseCart.length === 0) {
        alert("Daftar item kosong! Tambahkan produk terlebih dahulu.");
        return;
    }

    const purchases = getData('purchases');
    
    purchaseCart.forEach(item => {
        const newId = generateId('purchases', 'PUR');
        const totalPurchaseItem = item.buyPrice * item.qty;
        
        const newPurchase = {
            id: newId,
            date: date,
            supplier: supplier,
            product: item.product,
            qty: item.qty,
            buyPrice: item.buyPrice,
            totalPurchase: totalPurchaseItem
        };
        
        purchases.push(newPurchase);
        saveData('dummy', { id: newId }); 
    });

    saveData('purchases', purchases);

    alert(`Berhasil merekam ${purchaseCart.length} item pembelian!`);
    
    // Reset form
    document.getElementById('purchaseForm').reset();
    purchaseCart = [];
    renderCart();
    toggleForm('purchaseFormCard'); // Hide form
    loadPurchases();
}

function toggleForm(formId) {
    const formCard = document.getElementById(formId);
    if (formCard.style.display === "none") {
        formCard.style.display = "block";
    } else {
        formCard.style.display = "none";
        // Do not reset form yet if user cancels
    }
}
