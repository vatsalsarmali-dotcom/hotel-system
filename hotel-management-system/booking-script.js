const API_URL = 'http://localhost:5000/api';
const bookingForm = document.getElementById('bookingForm');
const arrivalDateInput = document.getElementById('arrivalDate');
const departureDateInput = document.getElementById('departureDate');
const guestCountSelect = document.getElementById('guestCount');
const roomTypeSelect = document.getElementById('roomType');

// Set minimum date to today
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  arrivalDateInput.setAttribute('min', today);
  departureDateInput.setAttribute('min', today);
}

// Calculate booking summary
function calculateSummary() {
  const arrival = arrivalDateInput.value;
  const departure = departureDateInput.value;
  const roomType = roomTypeSelect.value;

  if (!arrival || !departure) return null;

  const nights = Math.ceil((new Date(departure) - new Date(arrival)) / (1000 * 60 * 60 * 24));
  const roomPrice = roomType === 'Standard' ? 120 : roomType === 'Deluxe' ? 180 : 260;
  const total = roomPrice * nights;

  return {
    nights: nights > 0 ? nights : 0,
    roomPrice,
    total: nights > 0 ? total : 0
  };
}

// Booking form submit
bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    alert('Please login to make a booking');
    window.location.href = 'login.html';
    return;
  }

  const arrival = arrivalDateInput.value;
  const departure = departureDateInput.value;
  const guests = guestCountSelect.value;
  const roomType = roomTypeSelect.value;

  if (!arrival || !departure) {
    alert('Please select check-in and check-out dates');
    return;
  }

  const summary = calculateSummary();
  if (!summary || summary.nights <= 0) {
    alert('Invalid dates. Check-out must be after check-in.');
    return;
  }

  try {
    // Show booking confirmation
    const confirmMessage = `
📋 Booking Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Room Type: ${roomType}
Check-in: ${arrival}
Check-out: ${departure}
Nights: ${summary.nights}
Guests: ${guests}
Price per night: $${summary.roomPrice}
Total: $${summary.total}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click OK to confirm booking`;

    if (confirm(confirmMessage)) {
      // Get available room for this type
      const roomsResponse = await fetch(`${API_URL}/rooms?type=${roomType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rooms = await roomsResponse.json();

      if (!rooms || rooms.length === 0) {
        alert('No rooms available for selected type');
        return;
      }

      const selectedRoom = rooms[0]; // Pick first available

      // Create booking
      const bookingResponse = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          guest: user.id, // Guest ID from auth
          room: selectedRoom._id,
          checkInDate: arrival,
          checkOutDate: departure,
          numberOfGuests: guests,
          specialRequests: '',
          paymentStatus: 'Pending'
        })
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        alert('Booking failed: ' + (bookingData.error || 'Unknown error'));
        return;
      }

      alert('✅ Booking created successfully!\nBooking #: ' + bookingData.booking.bookingNumber);
      bookingForm.reset();
      setMinDate();
    }
  } catch (error) {
    console.error('Error processing booking:', error);
    alert('Error: ' + error.message);
  }
});

// Update summary when dates change
arrayInput(arrivalDateInput, 'change', calculateSummary);
arrayInput(departureDateInput, 'change', calculateSummary);
arrayInput(roomTypeSelect, 'change', calculateSummary);

function arrayInput(element, event, callback) {
  element.addEventListener(event, callback);
}

// Initialize on page load
window.addEventListener('load', setMinDate);
