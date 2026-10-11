# Hotel Management System - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel-management
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
mongod
```

### 4. Run Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout

### Rooms
- `GET /api/rooms` - Get all rooms (with filters)
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)
- `PATCH /api/rooms/:id/status` - Update room status

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `PATCH /api/bookings/:id/check-in` - Check-in guest
- `PATCH /api/bookings/:id/check-out` - Check-out guest
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Guests
- `GET /api/guests` - Get all guests
- `GET /api/guests/:id` - Get single guest
- `POST /api/guests` - Create guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest
- `GET /api/guests/search/by-email` - Search by email

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get single payment
- `POST /api/payments` - Create payment
- `GET /api/payments/booking/:bookingId` - Get payments by booking

### Staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get single staff
- `POST /api/staff` - Add staff
- `PUT /api/staff/:id` - Update staff
- `PATCH /api/staff/:id/assign-rooms` - Assign rooms to staff
- `DELETE /api/staff/:id` - Delete staff

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-bookings` - Get recent bookings
- `GET /api/dashboard/revenue/:startDate/:endDate` - Get revenue by date range
- `GET /api/dashboard/occupancy` - Get occupancy status

## User Roles
- **admin** - Full access to all features
- **receptionist** - Manage bookings, guests, check-in/out
- **housekeeping** - View assigned rooms and tasks
- **guest** - View own bookings

## Database Models

### User
- name, email, password, role, phone, isActive

### Room
- roomNumber, type, floor, capacity, pricePerNight, status, amenities, description, images

### Guest
- firstName, lastName, email, phone, address, city, country, idType, idNumber, dateOfBirth, numberOfVisits, totalSpent, loyaltyPoints

### Booking
- bookingNumber, guest, room, checkInDate, checkOutDate, numberOfGuests, numberOfNights, totalPrice, status, specialRequests, paymentStatus

### Payment
- booking, guest, amount, paymentMethod, status, transactionId, paymentDate

### Staff
- user, department, position, salary, joinDate, assignedRooms, performance

### Invoice
- invoiceNumber, booking, guest, roomCharges, additionalCharges, discount, tax, totalAmount, paidAmount, status

### HousekeepingTask
- room, assignedTo, taskType, description, status, priority, dueDate, completedDate

## Testing the API

You can test the API using:
- Postman
- Thunder Client
- cURL

Example:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123456","role":"guest"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'

# Get rooms with auth
curl -X GET http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Deployment
To deploy:
1. Set environment variables in production
2. Use a process manager like PM2
3. Set up MongoDB in cloud (MongoDB Atlas)
4. Deploy on Heroku, AWS, DigitalOcean, etc.

## License
ISC
