// data.js - Sample data for cinema hall
// Cinema hall with mixed states for testing
const seats = [
  // Already booked seats
  { id: "A1", row: "A", number: 1, status: "booked", bookedBy: "9876543210", bookingId: "booking123", lockedBy: null, lockExpiry: null },
  { id: "A2", row: "A", number: 2, status: "booked", bookedBy: "9876543210", bookingId: "booking123", lockedBy: null, lockExpiry: null },
  
  // Currently locked seats (in someone's cart)
  { id: "B3", row: "B", number: 3, status: "locked", lockedBy: "session_abc123", lockExpiry: Date.now() + 300000, bookedBy: null, bookingId: null },
  { id: "B4", row: "B", number: 4, status: "locked", lockedBy: "session_abc123", lockExpiry: Date.now() + 300000, bookedBy: null, bookingId: null },
  
  // Available seats
  { id: "C5", row: "C", number: 5, status: "available", lockedBy: null, lockExpiry: null, bookedBy: null, bookingId: null },
  { id: "C6", row: "C", number: 6, status: "available", lockedBy: null, lockExpiry: null, bookedBy: null, bookingId: null },
  
  // Expired lock (for testing cleanup)
  { id: "D7", row: "D", number: 7, status: "locked", lockedBy: "session_old", lockExpiry: Date.now() - 60000, bookedBy: null, bookingId: null }
];
// Optional: Helper functions to reset data for testing
function resetToInitialState() {
  seats.forEach(seat => {
    seat.status = "available";
    seat.lockedBy = null;
    seat.lockExpiry = null;
    seat.bookedBy = null;
    seat.bookingId = null;
  });
}

module.exports = { seats, resetToInitialState };
