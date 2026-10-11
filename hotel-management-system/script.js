const API_URL = 'http://localhost:5000/api';

// Room data for demo (will be replaced by API calls)
const roomData = [
  { _id: '1', name: 'Standard Room', type: 'Standard', price: 120, status: 'Available' },
  { _id: '2', name: 'Deluxe Room', type: 'Deluxe', price: 180, status: 'Occupied' },
  { _id: '3', name: 'Suite', type: 'Suite', price: 260, status: 'Available' },
];

// Check authentication on page load
window.addEventListener('load', () => {
  checkAuth();
  renderRooms();
  setMinDate();
});

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navActions = document.getElementById('navActions');
  const userNav = document.getElementById('userNav');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutUserBtn = document.getElementById('logoutUserBtn');
  const userWelcome = document.getElementById('userWelcome');

  if (token && user.name) {
    // User is logged in
    navActions.style.display = 'none';
    userNav.style.display = 'flex';
    userWelcome.textContent = `Welcome, ${user.name.split(' ')[0]}!`;

    logoutUserBtn.addEventListener('click', logout);
  } else {
    // User is not logged in
    navActions.style.display = 'flex';
    userNav.style.display = 'none';

    loginBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });

    signupBtn.addEventListener('click', () => {
      window.location.href = 'signup.html';
    });
  }
}

// Logout function
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Set minimum date to today
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('arrivalDate').setAttribute('min', today);
  document.getElementById('departureDate').setAttribute('min', today);
}

// Fetch rooms from API
async function fetchRooms() {
  try {
    const response = await fetch(`${API_URL}/rooms`);
    if (response.ok) {
      const rooms = await response.json();
      return rooms;
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
  }
  return roomData; // Fallback to demo data
}

// Render rooms
async function renderRooms() {
  const rooms = await fetchRooms();
  const roomGrid = document.getElementById('roomGrid');

  roomGrid.innerHTML = rooms.slice(0, 6)
    .map(
      (room) => `
        <article class="room-card">
          <div class="room-image"></div>
          <div class="room-content">
            <div class="room-top">
              <h3>${room.name || room.roomNumber}</h3>
              <span class="room-badge">${room.status}</span>
            </div>
            <div class="room-meta">
              <span>${room.type}</span>
              <span>${room.capacity || 2} Guests</span>
            </div>
            <div class="room-price">
              <strong>$${room.pricePerNight || room.price}</strong>
              <span>/ night</span>
            </div>
            <button class="btn btn-primary" onclick="selectRoom('${room._id}')">Book now</button>
          </div>
        </article>
      `
    )
    .join('');
}

// Select room for booking
function selectRoom(roomId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to book a room');
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('roomType').value = 'Deluxe';
  document.getElementById('arrivalDate').focus();
}

// Booking form submit
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    alert('Please login to make a booking');
    window.location.href = 'login.html';
    return;
  }

  const arrival = document.getElementById('arrivalDate').value;
  const departure = document.getElementById('departureDate').value;
  const guests = document.getElementById('guestCount').value;
  const roomType = document.getElementById('roomType').value;

  if (!arrival || !departure) {
    alert('Please select check-in and check-out dates');
    return;
  }

  try {
    // For now, show booking summary
    const nights = Math.ceil((new Date(departure) - new Date(arrival)) / (1000 * 60 * 60 * 24));
    const roomPrice = roomType === 'Standard' ? 120 : roomType === 'Deluxe' ? 180 : 260;
    const total = roomPrice * nights;

    const summary = `
      Room Type: ${roomType}
      Check-in: ${arrival}
      Check-out: ${departure}
      Number of Nights: ${nights}
      Guests: ${guests}
      Total Price: $${total}

      Click OK to proceed with booking (API integration coming next)
    `;

    alert(summary);
  } catch (error) {
    console.error('Error processing booking:', error);
    alert('Error processing booking');
  }
});

// Update summary when dates change
document.getElementById('arrivalDate').addEventListener('change', updateSummary);
document.getElementById('departureDate').addEventListener('change', updateSummary);
document.getElementById('guestCount').addEventListener('change', updateSummary);
document.getElementById('roomType').addEventListener('change', updateSummary);

function updateSummary() {
  const arrival = document.getElementById('arrivalDate').value;
  const departure = document.getElementById('departureDate').value;
  const guests = document.getElementById('guestCount').value;
  const roomType = document.getElementById('roomType').value;

  if (!arrival || !departure) return;

  const nights = Math.ceil((new Date(departure) - new Date(arrival)) / (1000 * 60 * 60 * 24));
  const roomPrice = roomType === 'Standard' ? 120 : roomType === 'Deluxe' ? 180 : 260;
  const total = roomPrice * nights;

  if (nights > 0) {
    // Summary would be displayed here
    console.log(`Booking: ${nights} nights, $${total} total`);
  }
}
