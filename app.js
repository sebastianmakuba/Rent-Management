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
function generateInvoice(event) {
  event.preventDefault();

  const idNo = document.getElementById('password').value;
  const houseNumber = document.getElementById('username').value;

  getTenants().then(tenants => {
    const tenant = tenants.find(t => t.idNo === idNo && t.houseNumber === houseNumber);

    if (tenant) {
      const currentRent = tenant.rentAmount ;
      
    const upcomingRent = `This month's Bills + ${currentRent}`
      

      const invoice = {
        tenantidNo: tenant.idNo,
        houseNumber: tenant.houseNumber,
        currentRent: currentRent,
        bills: tenant.bills,
        previousPayments: tenant.previousPayments,
        upcomingRent: upcomingRent,
        dueDate: new Date().toLocaleDateString()
      };
      

      const paymentDetails = document.getElementById('paymentDetails');
      paymentDetails.innerHTML = `
        <p>Invoice Generated:</p>
        <p>Tenant ID: ${invoice.tenantidNo}</p>
        <p>House Number: ${invoice.houseNumber}</p>
        <p>Current Rent: ${invoice.currentRent}</p>
        <p>Bills:</p>
        ${invoice.bills.map(bill => `<p>Date: ${bill.month}, Amount: ${bill.amount}</p>`).join('')}
        <p>Previous Payments:</p>
        ${invoice.previousPayments.map(payment => `<p>Date: ${payment.date}, Amount: ${payment.amount}</p>`).join('')}
        <p>Upcoming Rent: ${invoice.upcomingRent}</p>
        <p>Due Date: ${invoice.dueDate}</p>
        <button id="payButton">Pay Balance</button
        <label for="amount">Amount you want to pay:</label>
        <input type="text" id="inputAmount" required>
        `;

      const payButton = document.getElementById('payButton');
      payButton.addEventListener('click', () => {
        const amountToPay = parseInt(document.getElementById('inputAmount').value)
        if (!isNaN(amountToPay) && amountToPay > 0) {
          const paymentDate = new Date().toISOString().split('T')[0];

          // Update the server with the payment details
          const payment = {
            date: paymentDate,
            amount: amountToPay
          };
          tenant.previousPayments.push(payment);

          const updatedTenant = {
            ...tenant,
            previousPayments: tenant.previousPayments
          };

          fetch(`http://localhost:3000/tenants/${tenant.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTenant),
          })
          .then(() => {
            alert(`Payment of ${amountToPay} successfully recorded.`);
          })
          
        } else {
          alert('Invalid amount. Please enter a valid positive number.');
        }
      });

    } else {
      alert('Invalid credentials. Tenant not found.');
    }
  });
} 

document.getElementById('uploadBillForm').addEventListener('submit', uploadBill);

function uploadBill(event) {
  event.preventDefault();

  const tenantId = parseInt(document.getElementById('billTenantId').value);
  const month = document.getElementById('billMonth').value;
  const amount = parseInt(document.getElementById('billAmount').value);

  const bill = {
    latestMonthBill: month,
    amount: amount
  };

  // Fetch the tenant by ID and update their bills
  fetch(`http://localhost:3000/tenants/${tenantId}`)
    .then(response => response.json())
    .then(tenant => {
      tenant.bills.push(bill);

      const updatedTenant = {
        ...tenant,
        bills: tenant.bills
      };

      // Update the server with the new bill
      fetch(`http://localhost:3000/tenants/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTenant),
      })
        .then(() => {
          alert('Bill uploaded successfully.');
          document.getElementById('uploadBillForm').reset();
        })
       
    })
   
}


async function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const owners = await getOwners();
  const owner = owners.find(o => o.username === username && o.idNo === password);

  if (owner) {
    document.getElementById('ownerSection').style.display = 'block';
    document.getElementById('tenantSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'none';
    const ownerImage = document.getElementById('ownerImage');
    ownerImage.src = owner.imageURL;

  } else {
    const tenants = await getTenants();
    const tenant = tenants.find(t => t.idNo === password && t.houseNumber === username);

    if (tenant) {
      document.getElementById('tenantSection').style.display = 'block';
      document.getElementById('ownerSection').style.display = 'none';
      document.getElementById('loginSection').style.display = 'none';

      const tenantImage = document.getElementById('tenantImage');
      tenantImage.src = tenant.imageURL;
    } else {
      alert('Invalid login credentials.');
    }
  }
}


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
    
  this.reset();
});

document.getElementById('removeTenantButton').addEventListener('click', function(event) {
  const tenantId = parseInt(document.getElementById('removeTenantId').value);

  removeTenant(tenantId)
    .then(() => {
      alert('Tenant removed successfully.');
      document.getElementById('removeTenantId').value = '';
    })
   
});

document.getElementById('generateInvoiceButton').addEventListener('click', generateInvoice);
document.getElementById('loginForm').addEventListener('submit', login)
  