// Retrieve tenant data from the JSON server
async function getTenants() {
  const response = await fetch('http://localhost:3000/tenants');
  const data = await response.json();
  return data;
}

// Add a new tenant to the JSON server
async function addTenant(tenant) {
  await fetch('http://localhost:3000/tenants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tenant),
  });
}

// Remove a tenant from the JSON server by ID
async function removeTenant(id) {
  await fetch(`http://localhost:3000/tenants/${id}`, {
    method: 'DELETE',
  });
}

// Save updated tenant data to the JSON server
async function saveTenants(tenants) {
  await fetch('http://localhost:3000/tenants', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tenants),
  });
}

// Generate and display the invoice for a specific tenant
function generateInvoice(tenant) {
  const invoiceContainer = document.getElementById('paymentDetails');
  invoiceContainer.innerHTML = '';

  const waterBill = 50; // Placeholder value for the water bill
  const garbageCollectionBill = 30; // Placeholder value for the garbage collection bill

  const totalRent = calculateTotalRent(tenant.houseType);
  const totalBill = waterBill + garbageCollectionBill;
  const totalPayment = totalRent + totalBill;
  const previousPaymentDetails = `
    <strong>Name:</strong> ${tenant.name}<br>
    <strong>House Number:</strong> ${tenant.houseNumber}<br>
    <strong>House Type:</strong> ${tenant.houseType}<br>
    <strong>Rent:</strong> $${totalRent}<br>
    <strong>Water Bill:</strong> $${waterBill}<br>
    <strong>Garbage Collection Bill:</strong> $${garbageCollectionBill}<br>
    <strong>Total Payment:</strong> $${totalPayment}`;

  const invoice = document.createElement('div');
  invoice.innerHTML = previousPaymentDetails;
  invoiceContainer.appendChild(invoice);
}

// Calculate the total rent based on the house type
function calculateTotalRent(houseType) {
  let rent;
  switch (houseType) {
    case 'One Bedroom':
      rent = 500;
      break;
    case 'Two Bedroom':
      rent = 800;
      break;
    case 'Bedsitter':
      rent = 300;
      break;
    default:
      rent = 0;
      break;
  }
  return rent;
}

// Event listeners
document.getElementById('addTenantForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const houseNumber = document.getElementById('houseNumber').value;
  const idNo = document.getElementById('idNo').value;

  const newTenant = {
    name,
    phone,
    email,
    houseNumber,
    idNo,
    houseType: '', // Add houseType field according to your requirements
  };

  await addTenant(newTenant);
  alert('Tenant added successfully.');
  e.target.reset();
});

document.getElementById('removeTenantButton').addEventListener('click', async () => {
  const tenantId = document.getElementById('removeTenantId').value;
  await removeTenant(tenantId);
  alert('Tenant removed successfully.');
  document.getElementById('removeTenantId').value = '';
});

document.getElementById('generateInvoiceButton').addEventListener('click', async () => {
  const tenants = await getTenants();
  const tenantId = Number(prompt('Enter Tenant ID No:'));
  const tenant = tenants.find(t => t.idNo === tenantId);

  if (tenant) {
    generateInvoice(tenant);
  } else {
    alert('Invalid Tenant ID.');
  }
});



