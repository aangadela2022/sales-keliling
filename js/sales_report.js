// sales_report.js - Sales Report and Filtering

document.addEventListener('DOMContentLoaded', () => {
    populateCustomerFilter();
    loadSalesReport();
});

function populateCustomerFilter() {
    const customers = getData('customers');
    const select = document.getElementById('filterCustomer');
    
    customers.forEach(cust => {
        const option = document.createElement('option');
        option.value = cust.name;
        option.textContent = cust.name;
        select.appendChild(option);
    });
}

function loadSalesReport() {
    const orders = getData('orders');
    const filterCustomer = document.getElementById('filterCustomer').value;
    
    let filteredOrders = orders;
    
    if (filterCustomer) {
        filteredOrders = filteredOrders.filter(o => o.customer === filterCustomer);
    }
    
    const tbody = document.querySelector('#salesReportTable tbody');
    tbody.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Tidak ada data penjualan.</td></tr>';
        return;
    }
    
    filteredOrders.reverse().forEach((order, index) => {
        const tr = document.createElement('tr');
        
        // Setup Date Display Format (Hari-Tanggal-Bulan-Tahun)
        const dateObj = new Date(order.date);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = days[dateObj.getDay()];
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        const displayDate = `${dayName}-${dd}-${mm}-${yyyy}`;
        
        const statusBadge = order.status === 'Lunas' 
            ? '<span class="badge bg-success">Lunas</span>' 
            : '<span class="badge bg-danger">Belum Lunas</span>';
            
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${displayDate}</td>
            <td>${order.product}</td>
            <td>${order.qty}</td>
            <td>${formatCurrency(order.totalOrder)}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}
