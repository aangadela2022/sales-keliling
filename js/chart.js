// chart.js - Grafik Penjualan

let salesChart;

document.addEventListener('DOMContentLoaded', () => {
    populateFilters();
    renderChart();
});

function populateFilters() {
    const products = getData('products');
    const customers = getData('customers');
    
    const prodSelect = document.getElementById('filterProduct');
    products.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.name;
        option.textContent = prod.name;
        prodSelect.appendChild(option);
    });
    
    const custSelect = document.getElementById('filterCustomer');
    customers.forEach(cust => {
        const option = document.createElement('option');
        option.value = cust.name;
        option.textContent = cust.name;
        custSelect.appendChild(option);
    });
}

function getChartBuckets(period) {
    const today = new Date();
    const buckets = [];
    
    if (period === 'WEEKLY') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            const labelStr = `${dd}-${mm}-${yyyy}`; // date-month-year
            buckets.push({ id: dateStr, label: labelStr, isMatch: (dStr) => dStr === dateStr });
        }
    } else if (period === 'MONTHLY') {
        const currentYear = String(today.getFullYear());
        const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `${currentYear}-${currentMonth}-`;
        
        buckets.push({
            id: 'W1', label: 'Minggu ke I',
            isMatch: (dStr) => dStr.startsWith(prefix) && Number(dStr.split('-')[2]) <= 7
        });
        buckets.push({
            id: 'W2', label: 'Minggu ke II',
            isMatch: (dStr) => dStr.startsWith(prefix) && Number(dStr.split('-')[2]) > 7 && Number(dStr.split('-')[2]) <= 14
        });
        buckets.push({
            id: 'W3', label: 'Minggu ke III',
            isMatch: (dStr) => dStr.startsWith(prefix) && Number(dStr.split('-')[2]) > 14 && Number(dStr.split('-')[2]) <= 21
        });
        buckets.push({
            id: 'W4', label: 'Minggu ke IV',
            isMatch: (dStr) => dStr.startsWith(prefix) && Number(dStr.split('-')[2]) > 21
        });
    } else if (period === 'YEARLY') {
        const currentYear = String(today.getFullYear());
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        months.forEach((m, idx) => {
            const mm = String(idx + 1).padStart(2, '0');
            const prefix = `${currentYear}-${mm}-`;
            buckets.push({
                id: `M${idx+1}`, label: m,
                isMatch: (dStr) => dStr.startsWith(prefix)
            });
        });
    }
    return buckets;
}

function renderChart() {
    const period = document.getElementById('filterPeriod').value;
    const prodFilter = document.getElementById('filterProduct').value;
    const custFilter = document.getElementById('filterCustomer').value;
    
    const orders = getData('orders');
    const buckets = getChartBuckets(period);
    
    // Aggregate data by bucket
    const aggregatedSales = {};
    const aggregatedProfit = {};
    buckets.forEach(b => {
        aggregatedSales[b.id] = 0; // Initialize with 0
        aggregatedProfit[b.id] = 0;
    });
    
    orders.forEach(order => {
        if (prodFilter !== 'ALL' && order.product !== prodFilter) return;
        if (custFilter !== 'ALL' && order.customer !== custFilter) return;
        
        // Find bucket
        const bucket = buckets.find(b => b.isMatch(order.date));
        if (!bucket) return; 
        
        // Sum total order (Rp)
        aggregatedSales[bucket.id] += Number(order.totalOrder);
        
        // Sum profit (Rp)
        const buyPrice = order.buyPrice || 0;
        aggregatedProfit[bucket.id] += (order.price - buyPrice) * order.qty;
    });
    
    function roundTo500(val) {
        if (val === 0) return 0;
        return Math.round(val / 500) * 500;
    }

    const labels = buckets.map(b => b.label);
    const salesData = buckets.map(b => aggregatedSales[b.id]);
    const profitData = buckets.map(b => roundTo500(aggregatedProfit[b.id]));
    
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    if (salesChart) {
        salesChart.destroy();
    }
    
    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Penjualan (Rp)',
                    data: salesData,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1,
                    order: 2
                },
                {
                    label: 'Keuntungan (Rp)',
                    data: profitData,
                    type: 'line',
                    backgroundColor: 'rgba(40, 167, 69, 0.5)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID'); // Format tick to Rp
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}
