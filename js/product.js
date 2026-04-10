// product.js - Product Management

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    document.getElementById('productForm').addEventListener('submit', saveProduct);
});

function loadProducts() {
    const products = getData('products');
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada data produk.</td></tr>';
        return;
    }

    products.forEach((prod, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${prod.name}</td>
            <td>${formatCurrency(prod.buyPrice || 0)}</td>
            <td>${formatCurrency(prod.price)}</td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editProduct('${prod.id}')">Edit</button>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteProduct('${prod.id}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveProduct(e) {
    e.preventDefault();
    
    const idInput = document.getElementById('productId').value;
    const name = document.getElementById('prodName').value;
    const price = document.getElementById('prodPrice').value;
    const buyPrice = document.getElementById('prodBuyPrice').value;

    let products = getData('products');

    if (idInput) {
        // Update existing
        const index = products.findIndex(p => p.id === idInput);
        if (index !== -1) {
            products[index] = { id: idInput, name, price: Number(price), buyPrice: Number(buyPrice) };
            alert('Data produk berhasil diupdate!');
        }
    } else {
        // Add new
        const newId = generateId('products', 'P');
        products.push({ id: newId, name, price: Number(price), buyPrice: Number(buyPrice) });
        alert('Produk baru berhasil ditambahkan!');
    }

    saveData('products', products);
    resetForm();
    loadProducts();
}

function editProduct(id) {
    const products = getData('products');
    const prod = products.find(p => p.id === id);
    
    if (prod) {
        document.getElementById('productId').value = prod.id;
        document.getElementById('prodName').value = prod.name;
        document.getElementById('prodPrice').value = prod.price;
        document.getElementById('prodBuyPrice').value = prod.buyPrice || 0;
        
        document.getElementById('btnSaveProduct').textContent = "Update Produk";
        
        const formCard = document.getElementById('productFormCard');
        if (formCard.style.display === 'none') {
            formCard.style.display = 'block';
        }
        window.scrollTo(0, 0);
    }
}

function deleteProduct(id) {
    if (confirm('Yakin ingin menghapus produk ini?')) {
        let products = getData('products');
        products = products.filter(p => p.id !== id);
        saveData('products', products);
        loadProducts();
    }
}

function toggleForm(formId) {
    const formCard = document.getElementById(formId);
    if (formCard.style.display === "none") {
        formCard.style.display = "block";
    } else {
        formCard.style.display = "none";
        resetForm();
    }
}

function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = "";
    document.getElementById('btnSaveProduct').textContent = "Simpan Produk";
}
