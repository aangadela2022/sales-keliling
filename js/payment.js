// payment.js - Payment and Retur Management

document.addEventListener('DOMContentLoaded', () => {
    populateUnpaidCustomersDropdown();
    loadTodayPayments();
});

function populateUnpaidCustomersDropdown() {
    const select = document.getElementById("searchCustomer");
    select.innerHTML = '<option value="">-- Pilih Customer --</option>';
    
    const orders = getData('orders');
    const unpaidOrders = orders.filter(o => o.status === 'Belum Lunas');
    const uniqueCustNames = [...new Set(unpaidOrders.map(o => o.customer))];
    
    uniqueCustNames.forEach(custName => {
        const option = document.createElement("option");
        option.value = custName;
        option.textContent = custName;
        select.appendChild(option);
    });
}

function selectCustomer(customerName) {
    document.getElementById('paymentArea').style.display = 'block';
    document.getElementById('paymentCustomerName').textContent = customerName;
    
    const orders = getData('orders');
    const unpaidOrders = orders.filter(o => o.customer === customerName && o.status === 'Belum Lunas');
    
    const listContainer = document.getElementById('unpaidOrdersList');
    listContainer.innerHTML = '';
    
    if (unpaidOrders.length === 0) {
        listContainer.innerHTML = '<p>Tidak ada tagihan tertunggak untuk customer ini.</p>';
        return;
    }
    
    unpaidOrders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-card';
        div.innerHTML = `
            <div class="order-header">
                <span>ID: ${order.id} (${order.date})</span>
                <span>Total Order: ${formatCurrency(order.totalOrder)}</span>
            </div>
            <div style="margin-bottom:10px;">
                <strong>Produk:</strong> ${order.product} <br>
                <strong>Qty:</strong> ${order.qty} | <strong>Harga:</strong> ${formatCurrency(order.price)}
            </div>
            
            <div style="background:#fff; padding:10px; border-radius:4px; border:1px solid #ddd;">
                <h5 style="margin-top:0; margin-bottom:10px;">Form Pembayaran</h5>
                <div class="form-group" style="margin-bottom:10px;">
                    <label style="font-size:0.9rem;">Retur (Qty)</label>
                    <input type="number" class="form-control retur-input" style="padding:5px;" 
                           min="0" max="${order.qty}" value="0" 
                           data-id="${order.id}" data-price="${order.price}" data-total="${order.totalOrder}"
                           oninput="calculateRetur('${order.id}')" id="retur_${order.id}">
                </div>
                <div style="font-size:0.9rem; text-align:right;">
                    <div>Total Retur: <span id="returTotal_${order.id}" style="color:var(--danger-color);">Rp 0</span></div>
                    <div style="font-size:1.1rem; font-weight:bold; margin-top:5px;">
                        Total Bayar: <span id="bayarTotal_${order.id}" style="color:var(--success-color);">${formatCurrency(order.totalOrder)}</span>
                    </div>
                </div>
                <button type="button" class="btn btn-success" style="margin-top:10px; width:100%;" onclick="processPayment('${order.id}')">Lunasi Tagihan Ini</button>
            </div>
        `;
        listContainer.appendChild(div);
    });
}

function calculateRetur(orderId) {
    const input = document.getElementById(`retur_${orderId}`);
    let returQty = Number(input.value);
    
    // Ensure retur doesn't exceed ordered qty
    if (returQty > Number(input.max)) {
        input.value = input.max;
        returQty = Number(input.max);
    }
    if (returQty < 0) {
        input.value = 0;
        returQty = 0;
    }
    
    const price = Number(input.dataset.price);
    const originalTotal = Number(input.dataset.total);
    
    // Total Retur = Qty Retur * Harga
    const totalReturAsli = returQty * price;
    
    // Pembulatan ke 500
    // Contoh 3320 -> 3500, 4980 -> 5000
    // Algorithm: Math.ceil(val / 500) * 500 
    // Atau round ke nearest 500: Math.round(val / 500) * 500
    // Berdasarkan contoh: 3320 -> 3500 (ceil to 500 or round up)
    // 4980 -> 5000
    let totalReturBulat = totalReturAsli;
    if (totalReturAsli > 0) {
         // We will just round to nearest 500 for simplicity as required by blueprint
         // Or use Math.ceil to always go up. Example 2: 2 * 1660=3320->3500. 3320/500=6.64 -> round is 7*500=3500. 
         totalReturBulat = Math.round(totalReturAsli / 500) * 500;
         
         // Fix special cases if round doesn't match blueprint exactly. 
         // Let's use Math.ceil(val/500)*500 if blueprint implies ceiling, or just round.
         // 3320/500 = 6.64 -> round 7 * 500 = 3500. 
         // 4980/500 = 9.96 -> round 10 * 500 = 5000.
    }
    
    document.getElementById(`returTotal_${orderId}`).textContent = formatCurrency(totalReturBulat);
    
    const totalBayar = originalTotal - totalReturBulat;
    document.getElementById(`bayarTotal_${orderId}`).textContent = formatCurrency(Math.max(0, totalBayar));
    
    // Store calculated values in dataset for submission
    input.dataset.calculatedRetur = totalReturBulat;
    input.dataset.calculatedBayar = Math.max(0, totalBayar);
}

function processPayment(orderId) {
    if(!confirm("Proses pelunasan untuk order ini?")) return;
    
    const input = document.getElementById(`retur_${orderId}`);
    const returQty = Number(input.value);
    
    const totalRetur = Number(input.dataset.calculatedRetur) || 0;
    
    // If calculatedBayar is missing (User never changed input), it equals totalOrder
    let totalBayar = input.dataset.calculatedBayar;
    if (totalBayar === undefined) {
        totalBayar = input.dataset.total;
    } else {
        totalBayar = Number(totalBayar);
    }
    
    const orders = getData('orders');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return;
    
    // Update order status
    orders[orderIndex].status = "Lunas";
    saveData('orders', orders);
    
    // Create payment record
    const payments = getData('payments');
    payments.push({
        id: generateId('payments', 'PAY'),
        orderId: orderId,
        date: getTodayDateString(),
        customer: orders[orderIndex].customer,
        product: orders[orderIndex].product,
        qty: orders[orderIndex].qty,
        returQty: returQty,
        totalRetur: totalRetur,
        totalBayar: totalBayar
    });
    saveData('payments', payments);
    
    // Background Sync to Google Sheets
    syncPaymentToSheet(orders[orderIndex].customer, [
        { orderId: orderId, paymentTotal: totalBayar }
    ]);
    
    alert('Pembayaran berhasil diproses!');
    
    // Refresh view
    populateUnpaidCustomersDropdown();
    
    // Check if the current customer still has unpaid orders
    const currentCustomer = orders[orderIndex].customer;
    const stillUnpaid = getData('orders').filter(o => o.customer === currentCustomer && o.status === 'Belum Lunas');
    
    if (stillUnpaid.length === 0) {
        // No more unpaid orders for this customer, hide the payment area
        document.getElementById('paymentArea').style.display = 'none';
        document.getElementById('searchCustomer').value = '';
    } else {
        // Customer still has unpaid orders, keep them selected and refresh the list
        document.getElementById('searchCustomer').value = currentCustomer;
        selectCustomer(currentCustomer);
    }
    
    loadTodayPayments();
}

function loadTodayPayments() {
    const payments = getData('payments');
    const tbody = document.querySelector('#paymentTable tbody');
    tbody.innerHTML = '';
    
    // Show only payments from today
    const todayStr = getTodayDateString();
    const todayPayments = payments.filter(p => p.date === todayStr);

    if (todayPayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada data pembayaran.</td></tr>';
        return;
    }

    todayPayments.reverse().forEach((pay, index) => {
        const tr = document.createElement('tr');
        
        // Setup Date Display Format
        const dateObj = new Date(pay.date);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = days[dateObj.getDay()];
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        const displayDate = `${dayName}, ${dd}-${mm}-${yyyy}`;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${displayDate}</td>
            <td>${pay.customer}</td>
            <td>${pay.product}</td>
            <td>${pay.qty} (${pay.returQty})</td>
            <td><strong style="color:var(--success-color);">${formatCurrency(pay.totalBayar)}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}
