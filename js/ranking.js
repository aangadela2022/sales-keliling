// ranking.js - Ranking Pelanggan

document.addEventListener('DOMContentLoaded', () => {
    populateFilter();
    loadRanking();
});

function populateFilter() {
    const products = getData('products');
    const filterSelect = document.getElementById('filterProduct');
    
    products.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.name;
        option.textContent = prod.name;
        filterSelect.appendChild(option);
    });
}

function loadRanking() {
    const filterSelect = document.getElementById('filterProduct').value;
    const orders = getData('orders');
    const payments = getData('payments');
    
    // Grouping object: { "Nama Toko": { orderCount: 0, orderTotal: 0, paymentTotal: 0 } }
    let customerStats = {};
    
    // 1. Calculate Orders
    orders.forEach(order => {
        if (filterSelect !== 'ALL' && order.product !== filterSelect) return;
        
        if (!customerStats[order.customer]) {
            customerStats[order.customer] = { orderCount: 0, orderTotal: 0, paymentTotal: 0 };
        }
        
        // Count as 1 order transaction or accumulate qty? 
        // Blueprint says: "jumlah order", usually means total order value (Rp) or frequency. 
        // We will show frequency and total Rp.
        customerStats[order.customer].orderCount += 1;
        customerStats[order.customer].orderTotal += Number(order.totalOrder);
    });
    
    // 2. Calculate Payments (For the "Total Pembayaran" column)
    payments.forEach(pay => {
        if (filterSelect !== 'ALL' && pay.product !== filterSelect) return;
        
        if (!customerStats[pay.customer]) {
            customerStats[pay.customer] = { orderCount: 0, orderTotal: 0, paymentTotal: 0 };
        }
        
        customerStats[pay.customer].paymentTotal += Number(pay.totalBayar);
    });
    
    // Convert to array
    let rankingArray = [];
    for (const [customerName, stats] of Object.entries(customerStats)) {
        rankingArray.push({
            name: customerName,
            orderCount: stats.orderCount,
            orderTotal: stats.orderTotal,
            paymentTotal: stats.paymentTotal
        });
    }
    
    // Sort array based on rules:
    // 1. jumlah order (we'll use orderTotal Rp for priority, orderCount as secondary or vice versa)
    // Blueprint says ranking based on: 1. jumlah order 2. total pembayaran
    rankingArray.sort((a, b) => {
        if (b.orderTotal !== a.orderTotal) {
            return b.orderTotal - a.orderTotal;
        }
        return b.paymentTotal - a.paymentTotal;
    });
    
    // Render table
    const tbody = document.querySelector('#rankingTable tbody');
    tbody.innerHTML = '';
    
    if (rankingArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Tidak ada data untuk filter ini.</td></tr>';
        return;
    }
    
    rankingArray.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        // Styling top 3
        let rankStyle = '';
        if (index === 0) rankStyle = "background-color: #ffd700; font-weight: bold;"; // Gold
        else if (index === 1) rankStyle = "background-color: #e3e4e5; font-weight: bold;"; // Silver
        else if (index === 2) rankStyle = "background-color: #cd7f32; color: white; font-weight: bold;"; // Bronze
        
        tr.innerHTML = `
            <td style="${rankStyle} text-align:center;">#${index + 1}</td>
            <td><strong>${item.name}</strong></td>
            <td>${item.orderCount}x (${formatCurrency(item.orderTotal)})</td>
            <td style="color:var(--success-color);">${formatCurrency(item.paymentTotal)}</td>
        `;
        tbody.appendChild(tr);
    });
}
