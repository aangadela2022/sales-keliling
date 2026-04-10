// order.js - Order Management

let currentCart = [];

document.addEventListener('DOMContentLoaded', () => {
    // Set today's date
    const dateValueInput = document.getElementById('orderDate');
    const dateDisplayInput = document.getElementById('orderDateDisplay');
    
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
    
    // Auto-select Customer from Map Navigation
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCustomer = urlParams.get('customer');
    if (selectedCustomer) {
        const custSelect = document.getElementById('orderCustomer');
        for (let i = 0; i < custSelect.options.length; i++) {
            if (custSelect.options[i].value === selectedCustomer) {
                custSelect.selectedIndex = i;
                break;
            }
        }
        // Pastikan form order ditampilkan otomatis
        const formCard = document.getElementById('orderFormCard');
        if (formCard) formCard.style.display = 'block';
    }

    loadTodayOrders();

    // Event listeners for calculations
    document.getElementById('orderProduct').addEventListener('change', calculateItemTotal);
    document.getElementById('orderQty').addEventListener('input', calculateItemTotal);
    
    document.getElementById('orderForm').addEventListener('submit', saveFinalOrder);
});

function populateDropdowns() {
    const customers = getData('customers');
    const products = getData('products');
    
    const custSelect = document.getElementById('orderCustomer');
    const prodSelect = document.getElementById('orderProduct');
    
    // Populate Customers
    customers.forEach(cust => {
        const option = document.createElement('option');
        option.value = cust.name; // blueprint says name
        option.textContent = `${cust.name} (${cust.owner})`;
        // Storing ID in dataset just in case
        option.dataset.id = cust.id;
        custSelect.appendChild(option);
    });
    
    // Populate Products
    products.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.name;
        option.textContent = prod.name;
        option.dataset.price = prod.price;
        option.dataset.buyPrice = prod.buyPrice || 0;
        option.dataset.id = prod.id;
        prodSelect.appendChild(option);
    });
}

function calculateItemTotal() {
    const prodSelect = document.getElementById('orderProduct');
    const priceDisplay = document.getElementById('orderPriceDisplay');
    const priceValue = document.getElementById('orderPriceValue');

    if (prodSelect.selectedIndex > 0) {
        const selectedOption = prodSelect.options[prodSelect.selectedIndex];
        const price = Number(selectedOption.dataset.price);
        const buyPrice = Number(selectedOption.dataset.buyPrice);

        priceDisplay.value = formatCurrency(price);
        priceValue.value = price;
        priceValue.dataset.buyPrice = buyPrice;
    } else {
        priceDisplay.value = "";
        priceValue.value = "";
        priceValue.dataset.buyPrice = 0;
    }
}

function addItemToCart() {
    const prodSelect = document.getElementById('orderProduct');
    const qtyInput = document.getElementById('orderQty');
    const priceValue = document.getElementById('orderPriceValue');
    
    const product = prodSelect.value;
    const qty = Number(qtyInput.value);
    const price = Number(priceValue.value);
    const buyPrice = Number(priceValue.dataset.buyPrice) || 0;
    
    if (!product || qty <= 0) {
        alert("Pilih produk dan masukkan jumlah qty yang valid!");
        return;
    }
    
    // Check if product already in cart, if yes add qty
    const existingItem = currentCart.find(item => item.product === product);
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        currentCart.push({
            product: product,
            price: price,
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
    
    if (currentCart.length === 0) {
        tbody.innerHTML = '<tr id="emptyCartRow"><td colspan="4" style="text-align:center; font-style:italic; color:#777;">Keranjang masih kosong</td></tr>';
        updateGrandTotal();
        return;
    }
    
    currentCart.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.product}</td>
            <td>${formatCurrency(item.price)}</td>
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
    currentCart.splice(index, 1);
    renderCart();
}

function updateGrandTotal() {
    const textTotalAsli = document.getElementById('textTotalAsli');
    const textTotalBulat = document.getElementById('textTotalBulat');
    
    let totalAsli = 0;
    currentCart.forEach(item => {
        totalAsli += (item.price * item.qty);
    });
    
    // Pembulatan ke ribuan
    const totalBulat = Math.round(totalAsli / 1000) * 1000;
    
    textTotalAsli.textContent = totalAsli.toLocaleString('id-ID');
    textTotalBulat.textContent = formatCurrency(totalBulat);
}

function loadTodayOrders() {
    const orders = getData('orders');
    const tbody = document.querySelector('#orderTable tbody');
    tbody.innerHTML = '';
    
    // Show only today's orders for the table view
    const todayStr = getTodayDateString();
    const todayOrders = orders.filter(o => o.date === todayStr);

    if (todayOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Belum ada data order.</td></tr>';
        return;
    }

    // Sort by ID descending (newest first)
    todayOrders.reverse().forEach((order, index) => {
        const tr = document.createElement('tr');
        
        const statusBadge = order.status === 'Lunas' 
            ? '<span class="badge bg-success">Lunas</span>' 
            : '<span class="badge bg-danger">Belum Lunas</span>';
            
        // Setup Date Display Format
        const dateObj = new Date(order.date);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = days[dateObj.getDay()];
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        const displayDate = `${dayName}, ${dd}-${mm}-${yyyy}`;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${displayDate}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.qty}</td>
            <td>${formatCurrency(order.totalOrder)}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

function saveFinalOrder(e) {
    e.preventDefault();
    
    const date = document.getElementById('orderDate').value; // YYYY-MM-DD
    const customer = document.getElementById('orderCustomer').value;
    
    if (!customer) {
        alert("Pilih Customer terlebih dahulu!");
        return;
    }
    
    if (currentCart.length === 0) {
        alert("Keranjang belanja kosong! Tambahkan produk terlebih dahulu.");
        return;
    }

    const orders = getData('orders');
    
    // To support payment module that reads item by item, we will save EACH ROW as a separate order record
    // However, they will share the same date and customer, mimicking multiple orders in a single visit.
    
    // Get Customer address for GSheet Sync
    const allCustomers = getData('customers');
    const custObj = allCustomers.find(c => c.name === customer);
    const customerAddress = custObj ? custObj.address : "-";
    
    const syncTasks = [];

    currentCart.forEach(item => {
        const newId = generateId('orders', 'ORD');
        
        const totalAsliItem = item.price * item.qty;
        const totalOrderItem = Math.round(totalAsliItem / 1000) * 1000;
        
        const newOrder = {
            id: newId,
            date: date,
            customer: customer,
            product: item.product,
            qty: item.qty,
            price: item.price,
            buyPrice: item.buyPrice || 0,
            totalOrder: totalOrderItem,
            status: "Belum Lunas"
        };
        
        orders.push(newOrder);
        // Hacky way to push generation ID
        saveData('dummy', { id: newId }); 
        
        // Queue Background Sync to Google Sheets
        syncTasks.push(() => syncOrderToSheet(customer, customerAddress, date, item.product, item.qty, newId));
    });

    saveData('orders', orders);

    alert(`Berhasil menyimpan ${currentCart.length} item order!`);
    
    // Reset form
    document.getElementById('orderForm').reset();
    currentCart = [];
    renderCart();
    toggleForm('orderFormCard'); // Hide form
    loadTodayOrders();
    
    // Execute syncs sequentially to prevent Google Apps Script race conditions
    if (syncTasks.length > 0) {
        (async () => {
            for (let task of syncTasks) {
                await task();
                // 1.5 seconds delay to be extremely safe with GAS concurrent limits
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        })();
    }
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
