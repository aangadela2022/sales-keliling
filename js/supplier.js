// supplier.js - Supplier Management

document.addEventListener('DOMContentLoaded', () => {
    loadSuppliers();
    document.getElementById('supplierForm').addEventListener('submit', saveSupplier);
});

function loadSuppliers() {
    const suppliers = getData('suppliers');
    const tbody = document.querySelector('#supplierTable tbody');
    tbody.innerHTML = '';

    if (suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada data suplier.</td></tr>';
        return;
    }

    suppliers.forEach((sup, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${sup.name}</td>
            <td>${sup.contact}</td>
            <td>${sup.phone}</td>
            <td>${sup.address}</td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editSupplier('${sup.id}')">Edit</button>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteSupplier('${sup.id}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveSupplier(e) {
    e.preventDefault();
    
    const idInput = document.getElementById('supplierId').value;
    const name = document.getElementById('supName').value;
    const contact = document.getElementById('supContact').value;
    const phone = document.getElementById('supPhone').value;
    const address = document.getElementById('supAddress').value;

    let suppliers = getData('suppliers');

    if (idInput) {
        // Update existing
        const index = suppliers.findIndex(s => s.id === idInput);
        if (index !== -1) {
            suppliers[index] = { id: idInput, name, contact, phone, address };
            alert('Data suplier berhasil diupdate!');
        }
    } else {
        // Add new
        const newId = generateId('suppliers', 'SUP');
        suppliers.push({ id: newId, name, contact, phone, address });
        alert('Suplier baru berhasil ditambahkan!');
    }

    saveData('suppliers', suppliers);
    resetForm();
    loadSuppliers();
}

function editSupplier(id) {
    const suppliers = getData('suppliers');
    const sup = suppliers.find(s => s.id === id);
    
    if (sup) {
        document.getElementById('supplierId').value = sup.id;
        document.getElementById('supName').value = sup.name;
        document.getElementById('supContact').value = sup.contact;
        document.getElementById('supPhone').value = sup.phone;
        document.getElementById('supAddress').value = sup.address;
        
        document.getElementById('btnSaveSupplier').textContent = "Update Suplier";
        
        const formCard = document.getElementById('supplierFormCard');
        if (formCard.style.display === 'none') {
            formCard.style.display = 'block';
        }
        window.scrollTo(0,0);
    }
}

function deleteSupplier(id) {
    if (confirm('Yakin ingin menghapus suplier ini?')) {
        let suppliers = getData('suppliers');
        suppliers = suppliers.filter(s => s.id !== id);
        saveData('suppliers', suppliers);
        loadSuppliers();
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
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = "";
    document.getElementById('btnSaveSupplier').textContent = "Simpan Suplier";
}
