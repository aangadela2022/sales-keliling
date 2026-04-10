Blueprint Aplikasi Sales Keliling (MVP – Local Storage)
1. Overview
Aplikasi Sales Keliling adalah aplikasi web ringan untuk membantu sales mencatat aktivitas penjualan saat mengunjungi pelanggan.
Fungsi utama:
•	Mengelola pelanggan
•	Mengelola produk
•	Mencatat order
•	Mengelola pembayaran
•	Menghitung retur barang
•	Monitoring hutang pelanggan
•	Ranking pelanggan
•	Grafik penjualan
Aplikasi berjalan sepenuhnya offline menggunakan Local Storage.
________________________________________
2. Teknologi
Komponen	Teknologi
Frontend	HTML
Styling	CSS
Logic	JavaScript
Storage	Local Storage
Grafik	Chart.js
Platform	Mobile Browser
________________________________________
3. Struktur Menu Aplikasi
Dashboard
│
├── Profil Toko
├── Pelanggan
├── Produk
├── Order
├── Pembayaran
├── Rekap Hutang
├── Ranking Pelanggan
├── Grafik Penjualan
└── Laporan
________________________________________
4. Struktur Folder Project
sales-keliling-app
│
├── index.html
├── dashboard.html
├── customers.html
├── products.html
├── order.html
├── payment.html
├── debt.html
├── ranking.html
├── chart.html
├── report.html
│
├── css
│   └── style.css
│
├── js
│   ├── app.js
│   ├── storage.js
│   ├── customer.js
│   ├── product.js
│   ├── order.js
│   ├── payment.js
│   ├── debt.js
│   ├── ranking.js
│   └── chart.js
________________________________________
5. Struktur Data Local Storage
Profil Toko
storeProfile
Contoh data:
{
namaToko: "Toko Sumber Rejeki",
alamat: "Jl Raya No 10",
noHp: "08123456789"
}
________________________________________
6. Data Pelanggan
customers
Contoh:
[
{
id: "C001",
name: "Toko Maju",
owner: "Budi",
phone: "08123456789",
address: "Jl Raya 1"
}
]
________________________________________
7. Data Produk
products
Contoh:
[
{
id: "P001",
name: "Minyak Goreng",
price: 1660
}
]
________________________________________
8. Data Order
orders
Contoh:
[
{
id: "ORD001",
date: "2026-03-15",
customer: "Toko Maju",
product: "Minyak Goreng",
qty: 12,
price: 1660,
totalOrder: 20000,
status: "Belum Lunas"
}
]
________________________________________
9. Data Pembayaran
payments
Contoh:
[
{
orderId: "ORD001",
date: "2026-03-15",
returQty: 2,
totalRetur: 3500,
totalBayar: 16500
}
]
________________________________________
10. Dashboard
Dashboard menampilkan statistik penjualan harian.
Informasi yang ditampilkan:
Jumlah Pelanggan Order Hari Ini

Total Order Hari Ini

Total Pembayaran Hari Ini

Jumlah Pelanggan Belum Lunas > 7 Hari
________________________________________
11. Menu Profil Toko
Form input:
Nama Toko
Alamat
No HP
Data disimpan di Local Storage.
________________________________________
12. Menu Pelanggan
Form input pelanggan:
Nama Toko
Nama Pemilik
No HP
Alamat
Tabel pelanggan:
| No | Nama Toko | Pemilik | HP | Alamat |
________________________________________
13. Menu Produk
Form produk:
Nama Produk
Harga
Tabel produk:
| No | Nama Produk | Harga |
________________________________________
14. Menu Order
Digunakan untuk mencatat order pelanggan.
________________________________________
14.1 Form Order
Tanggal

Customer
[ dropdown ]

Produk
[ dropdown ]

Harga
(otomatis muncul)

Jumlah
[input]
________________________________________
14.2 Perhitungan Total Order
Rumus:
Total = Harga × Qty
Total dibulatkan ke ribuan.
Contoh:
1660 × 12 = 19920
dibulatkan → 20000
________________________________________
14.3 Tabel Order Harian
No	Tanggal	Customer	Nama Produk	Jumlah	Total Order	Status
1	15-03-2026	Toko Maju	Minyak Goreng	12	20000	Belum Lunas
________________________________________
15. Menu Pembayaran
Digunakan untuk melunasi order.
________________________________________
15.1 Pilih Customer
Dropdown dengan auto suggestion.
Contoh:
ketik: tok
muncul:
Toko Maju
Toko Jaya
Toko Makmur
________________________________________
15.2 Input Retur
Produk	Qty Order	Harga	Retur
Minyak Goreng	12	1660	input
________________________________________
15.3 Perhitungan Retur
Total Retur = Qty Retur × Harga
Hasil dibulatkan ke 500 atau 1000.
Contoh:
2 × 1660 = 3320 → 3500
3 × 1660 = 4980 → 5000
________________________________________
15.4 Total Pembayaran
Total Bayar = Total Order - Total Retur
Contoh:
20000 - 3500 = 16500
________________________________________
15.5 Tabel Pembayaran Harian
No	Tanggal	Customer	Produk	Qty	Total Bayar
________________________________________
16. Rekap Pelanggan Belum Lunas > 7 Hari
Tabel hutang pelanggan.
| No | Tanggal | Nama Toko | Nama Produk | Jumlah | Total Belum Bayar |
________________________________________
17. Ranking Pelanggan
Ranking dihitung dari order pertama hingga terakhir.
Filter:
Filter Produk
[ Semua Produk ]
Tabel ranking:
| Ranking | Nama Toko | Jumlah Order | Total Pembayaran |
Ranking berdasarkan:
1.	jumlah order
2.	total pembayaran
________________________________________
18. Grafik Penjualan
Grafik menggunakan Chart.js.
Jenis grafik:
Grafik Batang
Filter:
Periode
- Mingguan
- Bulanan
- Tahunan

Filter
- Produk
- Pelanggan
________________________________________
19. Flow Sistem
Sales membuat order
↓
Total dihitung dan dibulatkan
↓
Order masuk tabel harian
↓
Status = Belum Lunas
↓
Sales melakukan pembayaran
↓
Retur dihitung
↓
Total bayar dihitung
↓
Status berubah menjadi Lunas
↓
Data digunakan untuk:
   - Rekap hutang
   - Ranking pelanggan
   - Grafik penjualan
________________________________________
20. Fungsi Local Storage
Simpan data:
function saveData(key,data){
localStorage.setItem(key,JSON.stringify(data))
}
Ambil data:
function getData(key){
return JSON.parse(localStorage.getItem(key)) || []
}
________________________________________
21. UX Mobile Friendly
Aplikasi dirancang untuk sales lapangan:
•	tombol besar
•	tabel sederhana
•	dropdown cepat
•	auto suggestion customer
•	grafik responsif
•	bisa digunakan offline

