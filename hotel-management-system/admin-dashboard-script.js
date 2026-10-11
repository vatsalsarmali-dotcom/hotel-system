const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || '{}');

// Check authentication
window.addEventListener('load', () => {
  if (!token || !user.name) {
    window.location.href = 'login.html';
    return;
  }

  // Check if user is admin or receptionist
  if (!['admin', 'receptionist'].includes(user.role)) {
    alert('Access denied. Admin access required.');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('userDisplay').textContent = `${user.name} (${user.role})`;
  loadDashboardStats();
});

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    if (link.id === 'logoutBtn') {
      e.preventDefault();
      logout();
      return;
    }
    e.preventDefault();
    const page = link.dataset.page;
    showPage(page);
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(page + 'Page').style.display = 'block';

  if (page === 'dashboard') {
    loadDashboardStats();
  } else if (page === 'bookings') {
    loadBookings();
  } else if (page === 'rooms') {
    loadRooms();
  } else if (page === 'guests') {
    loadGuests();
  } else if (page === 'payments') {
    loadPayments();
  } else if (page === 'staff') {
    loadStaff();
  }
}

// Load dashboard stats
async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    document.getElementById('totalRevenue').textContent = `$${data.totalRevenue.toLocaleString()}`;
    document.getElementById('totalBookings').textContent = data.totalBookings;
    document.getElementById('occupancyRate').textContent = `${data.occupancyRate}%`;
    document.getElementById('todayCheckouts').textContent = data.todayCheckouts;

    // Load recent bookings
    const bookingsRes = await fetch(`${API_URL}/dashboard/recent-bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const bookings = await bookingsRes.json();
    displayRecentBookings(bookings);

    // Load room status
    const roomsRes = await fetch(`${API_URL}/dashboard/occupancy`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const roomStatus = await roomsRes.json();
    displayRoomStatus(roomStatus);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.getElementById('recentBookingsTable').innerHTML = `<p>Error loading data. Backend may not be running.</p>`;
  }
}

function displayRecentBookings(bookings) {
  let html = `
    <table>
      <thead>
        <tr>
          <th>Booking #</th>
          <th>Guest</th>
          <th>Room</th>
          <th>Check-in</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (bookings.length === 0) {
    html += `<tr><td colspan="5">No bookings found</td></tr>`;
  } else {
    bookings.slice(0, 5).forEach(b => {
      html += `
        <tr>
          <td>${b.bookingNumber || 'N/A'}</td>
          <td>${b.guest?.firstName || 'N/A'} ${b.guest?.lastName || ''}</td>
          <td>${b.room?.roomNumber || 'N/A'}</td>
          <td>${b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : 'N/A'}</td>
          <td><span class="status-badge ${b.status === 'Checked-In' ? 'status-occupied' : 'status-available'}">${b.status}</span></td>
        </tr>
      `;
    });
  }

  html += `</tbody></table>`;
  document.getElementById('recentBookingsTable').innerHTML = html;
}

function displayRoomStatus(roomStatus) {
  let html = '';
  if (roomStatus.length === 0) {
    html = '<p>No room data available</p>';
  } else {
    roomStatus.forEach(status => {
      html += `<div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span>${status._id || 'Unknown'}</span>
        <strong style="color: var(--primary);">${status.count}</strong>
      </div>`;
    });
  }
  document.getElementById('roomStatusChart').innerHTML = html;
}

async function loadBookings() {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const bookings = await response.json();

    let html = `
      <table>
        <thead>
          <tr>
            <th>Booking #</th>
            <th>Guest</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (bookings.length === 0) {
      html += `<tr><td colspan="7">No bookings found</td></tr>`;
    } else {
      bookings.forEach(b => {
        html += `
          <tr>
            <td>${b.bookingNumber || 'N/A'}</td>
            <td>${b.guest?.firstName || 'N/A'}</td>
            <td>${b.room?.roomNumber || 'N/A'}</td>
            <td>${b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : 'N/A'}</td>
            <td>${b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : 'N/A'}</td>
            <td><span class="status-badge ${b.status === 'Checked-In' ? 'status-occupied' : 'status-available'}">${b.status}</span></td>
            <td>$${b.totalPrice}</td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    document.getElementById('bookingsTable').innerHTML = html;
  } catch (error) {
    console.error('Error loading bookings:', error);
    document.getElementById('bookingsTable').innerHTML = `<p>Error loading bookings</p>`;
  }
}

async function loadRooms() {
  try {
    const response = await fetch(`${API_URL}/rooms`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const rooms = await response.json();

    let html = `
      <table>
        <thead>
          <tr>
            <th>Room #</th>
            <th>Type</th>
            <th>Floor</th>
            <th>Capacity</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (rooms.length === 0) {
      html += `<tr><td colspan="6">No rooms found</td></tr>`;
    } else {
      rooms.forEach(r => {
        html += `
          <tr>
            <td>${r.roomNumber || 'N/A'}</td>
            <td>${r.type || 'N/A'}</td>
            <td>${r.floor || 'N/A'}</td>
            <td>${r.capacity || 'N/A'}</td>
            <td>$${r.pricePerNight || 'N/A'}</td>
            <td><span class="status-badge ${r.status === 'Available' ? 'status-available' : 'status-occupied'}">${r.status}</span></td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    document.getElementById('roomsTable').innerHTML = html;
  } catch (error) {
    console.error('Error loading rooms:', error);
    document.getElementById('roomsTable').innerHTML = `<p>Error loading rooms</p>`;
  }
}

async function loadGuests() {
  try {
    const response = await fetch(`${API_URL}/guests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const guests = await response.json();

    let html = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Visits</th>
            <th>Total Spent</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (guests.length === 0) {
      html += `<tr><td colspan="5">No guests found</td></tr>`;
    } else {
      guests.forEach(g => {
        html += `
          <tr>
            <td>${g.firstName || 'N/A'} ${g.lastName || ''}</td>
            <td>${g.email || 'N/A'}</td>
            <td>${g.phone || 'N/A'}</td>
            <td>${g.numberOfVisits || 0}</td>
            <td>$${g.totalSpent || 0}</td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    document.getElementById('guestsTable').innerHTML = html;
  } catch (error) {
    console.error('Error loading guests:', error);
    document.getElementById('guestsTable').innerHTML = `<p>Error loading guests</p>`;
  }
}

async function loadPayments() {
  try {
    const response = await fetch(`${API_URL}/payments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const payments = await response.json();

    let html = `
      <table>
        <thead>
          <tr>
            <th>Booking #</th>
            <th>Guest</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (payments.length === 0) {
      html += `<tr><td colspan="6">No payments found</td></tr>`;
    } else {
      payments.forEach(p => {
        html += `
          <tr>
            <td>${p.booking?.bookingNumber || 'N/A'}</td>
            <td>${p.guest?.firstName || 'N/A'}</td>
            <td>$${p.amount || 0}</td>
            <td>${p.paymentMethod || 'N/A'}</td>
            <td><span class="status-badge status-available">${p.status}</span></td>
            <td>${p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'}</td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    document.getElementById('paymentsTable').innerHTML = html;
  } catch (error) {
    console.error('Error loading payments:', error);
    document.getElementById('paymentsTable').innerHTML = `<p>Error loading payments</p>`;
  }
}

async function loadStaff() {
  try {
    const response = await fetch(`${API_URL}/staff`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const staff = await response.json();

    let html = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (staff.length === 0) {
      html += `<tr><td colspan="4">No staff found</td></tr>`;
    } else {
      staff.forEach(s => {
        html += `
          <tr>
            <td>${s.user?.name || 'N/A'}</td>
            <td>${s.department || 'N/A'}</td>
            <td>${s.position || 'N/A'}</td>
            <td><span class="status-badge ${s.isActive ? 'status-available' : 'status-occupied'}">Active</span></td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    document.getElementById('staffTable').innerHTML = html;
  } catch (error) {
    console.error('Error loading staff:', error);
    document.getElementById('staffTable').innerHTML = `<p>Error loading staff</p>`;
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}
