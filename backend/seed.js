const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Room = require('./models/Room');
const Guest = require('./models/Guest');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management')
  .then(() => console.log('✓ MongoDB connected for seeding'))
  .catch(err => {
    console.error('✗ MongoDB connection failed:', err);
    process.exit(1);
  });

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Guest.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // 1. Create Admin Users
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@harborhaven.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 123-4567',
      isActive: true
    });
    await adminUser.save();
    console.log('✓ Admin user created');

    const receptionistUser = new User({
      name: 'John Receptionist',
      email: 'receptionist@harborhaven.com',
      password: 'receptionist123',
      role: 'receptionist',
      phone: '+1 (555) 234-5678',
      isActive: true
    });
    await receptionistUser.save();
    console.log('✓ Receptionist user created');

    // 2. Create Rooms
    const rooms = [
      {
        roomNumber: '101',
        type: 'Standard',
        floor: 1,
        capacity: 2,
        pricePerNight: 120,
        status: 'Available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
        description: 'Cozy standard room perfect for couples'
      },
      {
        roomNumber: '102',
        type: 'Standard',
        floor: 1,
        capacity: 2,
        pricePerNight: 120,
        status: 'Available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
        description: 'Cozy standard room perfect for couples'
      },
      {
        roomNumber: '103',
        type: 'Standard',
        floor: 1,
        capacity: 2,
        pricePerNight: 120,
        status: 'Occupied',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
        description: 'Cozy standard room perfect for couples'
      },
      {
        roomNumber: '201',
        type: 'Deluxe',
        floor: 2,
        capacity: 3,
        pricePerNight: 180,
        status: 'Available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Bathrobe', 'Mini Bar', 'Work Desk'],
        description: 'Spacious deluxe room with premium amenities'
      },
      {
        roomNumber: '202',
        type: 'Deluxe',
        floor: 2,
        capacity: 3,
        pricePerNight: 180,
        status: 'Available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Bathrobe', 'Mini Bar', 'Work Desk'],
        description: 'Spacious deluxe room with premium amenities'
      },
      {
        roomNumber: '203',
        type: 'Deluxe',
        floor: 2,
        capacity: 3,
        pricePerNight: 180,
        status: 'Cleaning',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Bathrobe', 'Mini Bar', 'Work Desk'],
        description: 'Spacious deluxe room with premium amenities'
      },
      {
        roomNumber: '301',
        type: 'Suite',
        floor: 3,
        capacity: 4,
        pricePerNight: 260,
        status: 'Available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Jacuzzi', 'Mini Bar', 'Work Desk', 'Living Area'],
        description: 'Luxury suite with separate living area'
      },
      {
        roomNumber: '302',
        type: 'Suite',
        floor: 3,
        capacity: 4,
        pricePerNight: 260,
        status: 'Occupied',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Jacuzzi', 'Mini Bar', 'Work Desk', 'Living Area'],
        description: 'Luxury suite with separate living area'
      },
      {
        roomNumber: '303',
        type: 'Suite',
        floor: 3,
        capacity: 4,
        pricePerNight: 260,
        status: 'Available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Jacuzzi', 'Mini Bar', 'Work Desk', 'Living Area'],
        description: 'Luxury suite with separate living area'
      }
    ];

    const createdRooms = await Room.insertMany(rooms);
    console.log(`✓ ${createdRooms.length} rooms created`);

    // 3. Create Guests
    const guests = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 111-2222',
        address: '123 Main Street',
        city: 'New York',
        country: 'USA',
        idType: 'Passport',
        idNumber: 'US123456',
        numberOfVisits: 3,
        totalSpent: 1200,
        loyaltyPoints: 1200
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 222-3333',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        country: 'USA',
        idType: 'Driving License',
        idNumber: 'DL987654',
        numberOfVisits: 1,
        totalSpent: 360,
        loyaltyPoints: 360
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com',
        phone: '+1 (555) 333-4444',
        address: '789 Pine Road',
        city: 'Chicago',
        country: 'USA',
        idType: 'National ID',
        idNumber: 'NID456789',
        numberOfVisits: 2,
        totalSpent: 540,
        loyaltyPoints: 540
      },
      {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@example.com',
        phone: '+1 (555) 444-5555',
        address: '321 Elm Street',
        city: 'Boston',
        country: 'USA',
        idType: 'Passport',
        idNumber: 'US234567',
        numberOfVisits: 0,
        totalSpent: 0,
        loyaltyPoints: 0
      }
    ];

    const createdGuests = await Guest.insertMany(guests);
    console.log(`✓ ${createdGuests.length} guests created`);

    // 4. Create Bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 30);

    const bookings = [
      {
        guest: createdGuests[0]._id,
        room: createdRooms[0]._id,
        checkInDate: today,
        checkOutDate: tomorrow,
        numberOfGuests: 2,
        numberOfNights: 1,
        totalPrice: 120,
        status: 'Confirmed',
        specialRequests: 'High floor preferred',
        paymentStatus: 'Paid',
        createdBy: adminUser._id
      },
      {
        guest: createdGuests[1]._id,
        room: createdRooms[4]._id,
        checkInDate: tomorrow,
        checkOutDate: nextWeek,
        numberOfGuests: 2,
        numberOfNights: 5,
        totalPrice: 900,
        status: 'Confirmed',
        specialRequests: 'Anniversary celebration',
        paymentStatus: 'Partial',
        createdBy: receptionistUser._id
      },
      {
        guest: createdGuests[2]._id,
        room: createdRooms[6]._id,
        checkInDate: nextWeek,
        checkOutDate: nextMonth,
        numberOfGuests: 4,
        numberOfNights: 21,
        totalPrice: 5460,
        status: 'Pending',
        specialRequests: 'Business stay, need conference room',
        paymentStatus: 'Pending',
        createdBy: adminUser._id
      },
      {
        guest: createdGuests[3]._id,
        room: createdRooms[2]._id,
        checkInDate: today,
        checkOutDate: tomorrow,
        numberOfGuests: 2,
        numberOfNights: 1,
        totalPrice: 120,
        status: 'Checked-In',
        specialRequests: 'Early breakfast',
        paymentStatus: 'Paid',
        createdBy: receptionistUser._id
      }
    ];

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`✓ ${createdBookings.length} bookings created`);

    // 5. Create Payments
    const payments = [
      {
        booking: createdBookings[0]._id,
        guest: createdGuests[0]._id,
        amount: 120,
        paymentMethod: 'Credit Card',
        status: 'Completed',
        transactionId: 'TXN001',
        description: 'Payment for booking 1 night',
        processedBy: receptionistUser._id
      },
      {
        booking: createdBookings[1]._id,
        guest: createdGuests[1]._id,
        amount: 450,
        paymentMethod: 'Online Transfer',
        status: 'Completed',
        transactionId: 'TXN002',
        description: 'Partial payment for 5 nights',
        processedBy: receptionistUser._id
      },
      {
        booking: createdBookings[3]._id,
        guest: createdGuests[3]._id,
        amount: 120,
        paymentMethod: 'Debit Card',
        status: 'Completed',
        transactionId: 'TXN003',
        description: 'Payment for 1 night stay',
        processedBy: receptionistUser._id
      }
    ];

    const createdPayments = await Payment.insertMany(payments);
    console.log(`✓ ${createdPayments.length} payments created`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Sample Credentials:');
    console.log('Admin: admin@harborhaven.com / admin123');
    console.log('Receptionist: receptionist@harborhaven.com / receptionist123');
    console.log('Guest: john.smith@example.com (use signup for new guest account)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
