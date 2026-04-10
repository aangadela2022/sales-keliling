// debt.js - Rekap Hutang (> 7 Hari)

document.addEventListener('DOMContentLoaded', () => {
    loadDebtReport();
});

function loadDebtReport() {
    const orders = getData('orders');
    const tbody = document.querySelector('#debtTable tbody');
    tbody.innerHTML = '';
    
    const todayDate = new Date();
    
    // Filter unpaid and old orders
    const unpaidOrders = orders.filter(order => {
        if (order.status !== 'Belum Lunas') return false;
        
        const orderDate = new Date(order.date);
        const diffTime = Math.abs(todayDate - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        return diffDays > 7;
    });

    if (unpaidOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Tidak ada pelanggan yang menunggak lebih dari 7 hari.</td></tr>';
        return;
    }

    // Sort by oldest date first
    unpaidOrders.sort((a, b) => new Date(a.date) - new Date(b.date));

    let totalKeseluruhan = 0;

    unpaidOrders.forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${order.date}</td>
            <td><strong>${order.customer}</strong></td>
            <td>${order.product}</td>
            <td>${order.qty}</td>
            <td style="color:var(--danger-color); font-weight:bold;">${formatCurrency(order.totalOrder)}</td>
        `;
        tbody.appendChild(tr);
        totalKeseluruhan += Number(order.totalOrder);
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.style.backgroundColor = '#f8f9fa';
    totalRow.innerHTML = `
        <td colspan="5" style="text-align:right; font-weight:bold;">TOTAL KESELURUHAN HUTANG:</td>
        <td style="color:var(--danger-color); font-weight:bold; font-size:1.1rem;">${formatCurrency(totalKeseluruhan)}</td>
    `;
    tbody.appendChild(totalRow);
}
