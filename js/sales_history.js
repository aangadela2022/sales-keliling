// sales_history.js - Riwayat Penjualan Per Toko with Excel Export

let filteredOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    populateCustomerFilter();

    // Auto-select customer from URL params (e.g. linked from customer page)
    const urlParams = new URLSearchParams(window.location.search);
    const preselect = urlParams.get('customer');
    if (preselect) {
        const select = document.getElementById('filterCustomer');
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === preselect) {
                select.selectedIndex = i;
                break;
            }
        }
        applyFilter();
    }
});

function populateCustomerFilter() {
    const customers = getData('customers');
    const orders = getData('orders');
    const select = document.getElementById('filterCustomer');

    // Get unique customer names from orders (some may not be in customer list)
    const orderCustomers = [...new Set(orders.map(o => o.customer))];
    
    // Merge with registered customers
    const allNames = new Set([...customers.map(c => c.name), ...orderCustomers]);
    
    [...allNames].sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function applyFilter() {
    const customerFilter = document.getElementById('filterCustomer').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const statusFilter = document.getElementById('filterStatus').value;

    const allOrders = getData('orders');

    filteredOrders = allOrders.filter(order => {
        // Filter by customer
        if (customerFilter && order.customer !== customerFilter) return false;
        // Filter by date range
        if (dateFrom && order.date < dateFrom) return false;
        if (dateTo && order.date > dateTo) return false;
        // Filter by status
        if (statusFilter && order.status !== statusFilter) return false;
        return true;
    });

    // Sort by date descending, then customer name
    filteredOrders.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return a.customer.localeCompare(b.customer);
    });

    renderResults();
}

function resetFilter() {
    document.getElementById('filterCustomer').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    document.getElementById('filterStatus').value = '';
    
    filteredOrders = [];

    // Hide results
    document.getElementById('summaryRow').style.display = 'none';
    document.getElementById('actionBar').style.display = 'none';
    document.getElementById('historyTable').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
}

function renderResults() {
    const tbody = document.getElementById('historyTableBody');
    const table = document.getElementById('historyTable');
    const emptyState = document.getElementById('emptyState');
    const summaryRow = document.getElementById('summaryRow');
    const actionBar = document.getElementById('actionBar');

    tbody.innerHTML = '';

    if (filteredOrders.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <div class="icon">📭</div>
            <p>Tidak ada data penjualan yang sesuai dengan filter.</p>
        `;
        summaryRow.style.display = 'none';
        actionBar.style.display = 'none';
        return;
    }

    // Show UI elements
    emptyState.style.display = 'none';
    table.style.display = 'table';
    summaryRow.style.display = 'grid';
    actionBar.style.display = 'flex';

    // Calculate summaries
    let totalOrder = 0;
    let totalLunas = 0;
    let totalBelumLunas = 0;

    filteredOrders.forEach((order, index) => {
        const amount = Number(order.totalOrder) || 0;
        totalOrder += amount;
        
        if (order.status === 'Lunas') {
            totalLunas += amount;
        } else {
            totalBelumLunas += amount;
        }

        const tr = document.createElement('tr');

        // Format date display
        const displayDate = formatDateDisplay(order.date);

        const statusBadge = order.status === 'Lunas'
            ? '<span class="badge bg-success">Lunas</span>'
            : '<span class="badge bg-danger">Belum Lunas</span>';

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${displayDate}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.qty}</td>
            <td>${formatCurrency(order.price)}</td>
            <td>${formatCurrency(order.totalOrder)}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });

    // Update summary
    document.getElementById('sumCount').textContent = filteredOrders.length;
    document.getElementById('sumOrder').textContent = formatCurrency(totalOrder);
    document.getElementById('sumLunas').textContent = formatCurrency(totalLunas);
    document.getElementById('sumBelumLunas').textContent = formatCurrency(totalBelumLunas);
    document.getElementById('resultCount').textContent = filteredOrders.length;
}

function formatDateDisplay(dateStr) {
    const dateObj = new Date(dateStr);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[dateObj.getDay()];
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    return `${dayName}, ${dd}-${mm}-${yyyy}`;
}

function exportToExcel() {
    if (filteredOrders.length === 0) {
        alert('Tidak ada data untuk di-export. Silakan filter terlebih dahulu.');
        return;
    }

    // Get store profile for header
    const profile = getData('storeProfile');
    const storeName = profile?.namaToko || 'Sales Keliling';

    // Get filter info for filename & header
    const customerFilter = document.getElementById('filterCustomer').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const statusFilter = document.getElementById('filterStatus').value;

    // Build header rows
    const headerRows = [];
    headerRows.push([storeName]);
    headerRows.push(['Riwayat Penjualan' + (customerFilter ? ` - ${customerFilter}` : ' - Semua Toko')]);
    
    let periodText = 'Periode: ';
    if (dateFrom && dateTo) {
        periodText += `${formatDateSimple(dateFrom)} s/d ${formatDateSimple(dateTo)}`;
    } else if (dateFrom) {
        periodText += `Dari ${formatDateSimple(dateFrom)}`;
    } else if (dateTo) {
        periodText += `Sampai ${formatDateSimple(dateTo)}`;
    } else {
        periodText += 'Semua waktu';
    }
    if (statusFilter) periodText += ` | Status: ${statusFilter}`;
    headerRows.push([periodText]);
    headerRows.push([]); // Empty row

    // Column headers
    headerRows.push(['No', 'Tanggal', 'Pelanggan', 'Produk', 'Qty', 'Harga Satuan', 'Total Order', 'Status']);

    // Data rows
    const dataRows = filteredOrders.map((order, index) => [
        index + 1,
        formatDateDisplay(order.date),
        order.customer,
        order.product,
        order.qty,
        Number(order.price),
        Number(order.totalOrder),
        order.status
    ]);

    // Summary rows
    const totalOrder = filteredOrders.reduce((sum, o) => sum + Number(o.totalOrder), 0);
    const totalLunas = filteredOrders.filter(o => o.status === 'Lunas').reduce((sum, o) => sum + Number(o.totalOrder), 0);
    const totalBelumLunas = filteredOrders.filter(o => o.status !== 'Lunas').reduce((sum, o) => sum + Number(o.totalOrder), 0);

    const summaryRows = [
        [],
        ['', '', '', '', '', 'Total Keseluruhan:', totalOrder, ''],
        ['', '', '', '', '', 'Total Lunas:', totalLunas, ''],
        ['', '', '', '', '', 'Total Belum Lunas:', totalBelumLunas, ''],
        [],
        [`Dicetak pada: ${new Date().toLocaleString('id-ID')}`]
    ];

    // Combine all rows
    const allRows = [...headerRows, ...dataRows, ...summaryRows];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Set column widths
    ws['!cols'] = [
        { wch: 5 },   // No
        { wch: 22 },  // Tanggal
        { wch: 25 },  // Pelanggan
        { wch: 20 },  // Produk
        { wch: 8 },   // Qty
        { wch: 18 },  // Harga Satuan
        { wch: 18 },  // Total Order
        { wch: 14 }   // Status
    ];

    // Merge header cells
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Store name
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Title
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Period
    ];

    // Format number cells as currency
    const dataStartRow = 5; // 0-indexed row where data begins (after header rows)
    for (let i = 0; i < dataRows.length; i++) {
        const rowIdx = dataStartRow + i;
        // Harga Satuan (column F = index 5)
        const cellF = XLSX.utils.encode_cell({ r: rowIdx, c: 5 });
        if (ws[cellF]) ws[cellF].z = '#,##0';
        // Total Order (column G = index 6)
        const cellG = XLSX.utils.encode_cell({ r: rowIdx, c: 6 });
        if (ws[cellG]) ws[cellG].z = '#,##0';
    }

    // Format summary number cells
    const summaryStartRow = dataStartRow + dataRows.length + 1;
    for (let i = 0; i < 3; i++) {
        const cellG = XLSX.utils.encode_cell({ r: summaryStartRow + i, c: 6 });
        if (ws[cellG]) ws[cellG].z = '#,##0';
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const sheetName = customerFilter ? customerFilter.substring(0, 31) : 'Riwayat Penjualan';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename
    let filename = 'Riwayat_Penjualan';
    if (customerFilter) filename += `_${customerFilter.replace(/\s+/g, '_')}`;
    if (dateFrom) filename += `_dari_${dateFrom}`;
    if (dateTo) filename += `_sd_${dateTo}`;
    filename += '.xlsx';

    // Download
    XLSX.writeFile(wb, filename);
}

function formatDateSimple(dateStr) {
    const parts = dateStr.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}
