// map.js - Map Visit Route Logic

let map;
let markers = [];

// Custom red and green icons for Leaflet
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    document.getElementById('locationForm').addEventListener('submit', saveLocation);
});

function initMap() {
    // Default center point (Monas, Jakarta) - adjust as needed
    map = L.map('map').setView([-6.175110, 106.827153], 13);

    // Using Google Streets map tiles directly for Google Map integration without API Key hassle
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(map);

    // Map click event to add new location
    map.on('click', function(e) {
        showLocationForm(e.latlng.lat, e.latlng.lng);
    });

    renderStoreMarkers();
}

/**
 * Calculates days ago a date string (YYYY-MM-DD) was.
 */
function getDaysAgo(dateString) {
    if (!dateString) return Infinity; // No record
    const today = new Date();
    // Default the time to 00:00:00 for accurate day counting
    today.setHours(0,0,0,0);
    
    const visitDate = new Date(dateString);
    visitDate.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today - visitDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    // If future date or today, diffDays is 0. 
    return (today >= visitDate) ? diffDays : 0;
}

function renderStoreMarkers() {
    // Clear existing markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const customers = getData('customers');
    const orders = getData('orders');

    // Mapped customers
    const mappedCustomers = customers.filter(c => c.lat && c.lng);

    if (mappedCustomers.length > 0) {
        let latlngs = [];

        mappedCustomers.forEach(cust => {
            // Find last order for this customer
            const custOrders = orders.filter(o => o.customer === cust.name);
            let lastVisitDate = null;
            
            if (custOrders.length > 0) {
                // Sort by date descending
                custOrders.sort((a,b) => new Date(b.date) - new Date(a.date));
                lastVisitDate = custOrders[0].date;
            }

            const daysAgo = getDaysAgo(lastVisitDate);
            const isRed = daysAgo > 2; // Lebih dari 2 hari -> Merah

            const markerIcon = isRed ? redIcon : greenIcon;

            const marker = L.marker([cust.lat, cust.lng], { icon: markerIcon }).addTo(map);
            
            // Format Last Visit Label
            let visitText = "Belum pernah dikunjungi";
            if (lastVisitDate) {
                visitText = daysAgo === 0 ? "Hari ini" : `${daysAgo} hari yang lalu (${lastVisitDate})`;
            }

            // Create Popup Content
            // Tombol "Buat Penjualan" akan mengarahkan ke form order dengan parameter URL
            const btnHtml = `<button class="btn btn-primary" style="margin-top: 10px; width: 100%; font-size: 14px;" 
                                onclick="window.location.href='order.html?customer=${encodeURIComponent(cust.name)}'">
                                + Buat Penjualan
                             </button>`;

            let popupContent = `
                <div style="min-width: 150px;">
                    <h4 style="margin: 0 0 5px 0;">${cust.name}</h4>
                    <p style="margin: 0 0 2px 0; font-size: 12px;"><strong>Pemilik:</strong> ${cust.owner}</p>
                    <p style="margin: 0 0 5px 0; font-size: 12px; color: ${isRed ? '#EA4335' : '#34A853'};"><strong>Status Kunjungan:</strong><br>${visitText}</p>
                    ${btnHtml}
                </div>
            `;

            marker.bindPopup(popupContent);
            markers.push(marker);
            latlngs.push([cust.lat, cust.lng]);
        });

        // Fit map bounds to show all markers
        if (latlngs.length > 0) {
            map.fitBounds(latlngs, { padding: [50, 50] });
        }
    }
}

function showLocationForm(lat, lng) {
    const customers = getData('customers');
    const unmappedCustomers = customers.filter(c => !c.lat || !c.lng);

    if (unmappedCustomers.length === 0) {
        alert("Semua pelanggan saat ini sudah memiliki titik koordinat di peta.");
        return;
    }

    // Populate dropdown
    const select = document.getElementById('unmappedCustomer');
    select.innerHTML = '<option value="">-- Pilih Toko --</option>';
    
    unmappedCustomers.forEach(cust => {
        const option = document.createElement('option');
        option.value = cust.id;
        option.textContent = `${cust.name} (${cust.owner})`;
        select.appendChild(option);
    });

    document.getElementById('selectedLat').value = lat;
    document.getElementById('selectedLng').value = lng;
    document.getElementById('latLngDisplay').textContent = `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    document.getElementById('locationFormCard').style.display = 'block';
}

function closeLocationForm() {
    document.getElementById('locationFormCard').style.display = 'none';
    document.getElementById('locationForm').reset();
}

function saveLocation(e) {
    e.preventDefault();
    
    const custId = document.getElementById('unmappedCustomer').value;
    const lat = document.getElementById('selectedLat').value;
    const lng = document.getElementById('selectedLng').value;

    if (!custId) {
        alert("Silakan pilih toko!");
        return;
    }

    let customers = getData('customers');
    const index = customers.findIndex(c => c.id === custId);
    
    if (index !== -1) {
        customers[index].lat = parseFloat(lat);
        customers[index].lng = parseFloat(lng);
        saveData('customers', customers);
        
        alert("Lokasi toko berhasil disimpan!");
        closeLocationForm();
        renderStoreMarkers(); // Refresh markers
    } else {
        alert("Terjadi kesalahan, data toko tidak ditemukan.");
    }
}
