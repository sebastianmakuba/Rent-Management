async function getTenants() {
  const response = await fetch('http://localhost:3000/tenants');
  const data = await response.json();
  return data;
}

// Retrieve owner data from the JSON server
async function getOwners() {
  const response = await fetch('http://localhost:3000/owners');
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

// Remove a tenant from the JSON server
async function removeTenant(tenantId) {
  await fetch(`http://localhost:3000/tenants/${tenantId}`, {
    method: 'DELETE',
  });
}
/////INVOICE
// Generate invoice for the tenant
function generateInvoice() {
  const idNo = document.getElementById('password').value;
  const houseNumber = document.getElementById('username').value;

  // Retrieve tenant data and find the matching tenant
  getTenants().then(tenants => {
    const tenant = tenants.find(t => t.idNo === idNo && t.houseNumber === houseNumber);

    // If tenant found, generate the invoice
    if (tenant) {
      const currentRent = tenant.rentAmount;
      const bills = tenant.bills.reduce((total, bill) => total + bill.amount, 0);
      const previousBalances = tenant.previousBalances;
      const previousPayments = tenant.previousPayments.reduce((total, payment) => total + payment.amount, 0);

      const pendingBalance = currentRent + bills + previousBalances - previousPayments;

      const invoice = {
        tenantidNo: tenant.idNo,
        houseNumber: tenant.houseNumber,
        paymentAmount: pendingBalance,
        dueDate: new Date().toLocaleDateString(),
        previousBalances: previousBalances,
        previousPayments: previousPayments
      };

      const paymentDetails = document.getElementById('paymentDetails');
      paymentDetails.innerHTML = `
        <p>Invoice Generated:</p>
        <p>Tenant ID: ${invoice.tenantidNo}</p>
        <p>House Number: ${invoice.houseNumber}</p>
        <p>Current Rent: ${currentRent}</p>
        <p>Bills: ${bills}</p>
        <p>Previous Balances: ${previousBalances}</p>
        <p>Previous Payments: ${previousPayments}</p>
        <p>Pending Balance: ${pendingBalance}</p>
        <p>Due Date: ${invoice.dueDate}</p>`;

    } else {
      alert('Invalid credentials. Tenant not found.');
    }
  });
}



// Check login credentials and show the relevant section
function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Retrieve owner data and find the matching owner
  getOwners().then(owners => {
    const owner = owners.find(o => o.name === username && o.idNo === password);

    if (owner) {
      document.getElementById('ownerSection').style.display = 'block';
      document.getElementById('tenantSection').style.display = 'none';
      document.getElementById('loginSection').style.display = 'none';
    } else {
      // Retrieve tenant data and find the matching tenant
      getTenants().then(tenants => {
        const tenant = tenants.find(t => t.idNo === password && t.houseNumber === username);

        if (tenant) {
          document.getElementById('tenantSection').style.display = 'block';
          document.getElementById('ownerSection').style.display = 'none';
          document.getElementById('loginSection').style.display = 'none';
        } else {
          alert('Invalid login credentials.');
        }
      });
    }
  });
}

// Add event listeners
document.getElementById('addTenantForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const houseNumber = document.getElementById('houseNumber').value;
  const houseType = document.getElementById('houseType').value;
  const idNo = document.getElementById('idNo').value;

  const tenant = {
    name: name,
    phone: phone,
    email: email,
    houseNumber: houseNumber,
    houseType: houseType,
    id: idNo,
  };

  addTenant(tenant)
    .then(() => alert('Tenant added successfully.'))
    .catch(error => console.error('Error:', error));

  this.reset();
});

document.getElementById('removeTenantButton').addEventListener('click', function(event) {
  const tenantId = parseInt(document.getElementById('removeTenantId').value);

  removeTenant(tenantId)
    .then(() => {
      alert('Tenant removed successfully.');
      document.getElementById('removeTenantId').value = '';
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('generateInvoiceButton').addEventListener('click', generateInvoice);
document.getElementById('loginForm').addEventListener('submit', login)
  