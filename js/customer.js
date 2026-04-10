// customer.js - Customer Management

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    document.getElementById('customerForm').addEventListener('submit', saveCustomer);
});

function loadCustomers() {
    const customers = getData('customers');
    const tbody = document.querySelector('#customerTable tbody');
    tbody.innerHTML = '';

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada data pelanggan.</td></tr>';
        return;
    }

    customers.forEach((cust, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${cust.name}</td>
            <td>${cust.owner}</td>
            <td>${cust.phone}</td>
            <td>${cust.address}</td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editCustomer('${cust.id}')">Edit</button>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteCustomer('${cust.id}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveCustomer(e) {
    e.preventDefault();
    
    const idInput = document.getElementById('customerId').value;
    const name = document.getElementById('custName').value;
    const owner = document.getElementById('custOwner').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;

    let customers = getData('customers');

    if (idInput) {
        // Update existing
        const index = customers.findIndex(c => c.id === idInput);
        if (index !== -1) {
            customers[index] = { id: idInput, name, owner, phone, address };
            alert('Data pelanggan berhasil diupdate!');
        }
    } else {
        // Add new
        const newId = generateId('customers', 'C');
        customers.push({ id: newId, name, owner, phone, address });
        alert('Pelanggan baru berhasil ditambahkan!');
    }

    saveData('customers', customers);
    resetForm();
    loadCustomers();
}

function editCustomer(id) {
    const customers = getData('customers');
    const cust = customers.find(c => c.id === id);
    
    if (cust) {
        document.getElementById('customerId').value = cust.id;
        document.getElementById('custName').value = cust.name;
        document.getElementById('custOwner').value = cust.owner;
        document.getElementById('custPhone').value = cust.phone;
        document.getElementById('custAddress').value = cust.address;
        
        document.getElementById('btnSaveCustomer').textContent = "Update Pelanggan";
        
        const formCard = document.getElementById('customerFormCard');
        if (formCard.style.display === 'none') {
            formCard.style.display = 'block';
        }
        window.scrollTo(0,0);
    }
}

function deleteCustomer(id) {
    if (confirm('Yakin ingin menghapus pelanggan ini?')) {
        let customers = getData('customers');
        customers = customers.filter(c => c.id !== id);
        saveData('customers', customers);
        loadCustomers();
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
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = "";
    document.getElementById('btnSaveCustomer').textContent = "Simpan Pelanggan";
}
