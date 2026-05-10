const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    // Expect showtimeId and selectedSeats from frontend
    const { amount, currency = 'egp', bookingId, showtimeId, selectedSeats } = req.body;

    if (!amount || !showtimeId || !selectedSeats?.length) {
      return res.status(400).json({ message: 'Invalid payment details.' });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60000); // 10 minutes from now

    // 1. Release expired seats for this showtime (NFR: expired seats released)
    await prisma.seatHold.deleteMany({
      where: {
        showtimeId,
        expiresAt: { lte: now }
      }
    });

    // 2. Check if any of the requested seats are currently held by someone else
    const existingHolds = await prisma.seatHold.findMany({
      where: {
        showtimeId,
        seatNumber: { in: selectedSeats }
      }
    });

    if (existingHolds.length > 0) {
      return res.status(409).json({ message: 'One or more of your selected seats were just taken. Please select different seats.' });
    }

    // 3. Lock the seats (NFR: prevent concurrent double booking)
    try {
      await prisma.seatHold.createMany({
        data: selectedSeats.map(seat => ({
          showtimeId,
          seatNumber: seat,
          expiresAt
        }))
      });
    } catch (error) {
      // Prisma throws P2002 if a concurrent request beat us (race condition safety net)
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'One or more of your selected seats were just taken. Please select different seats.' });
      }
      throw error;
    }

    // 3. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency,
      metadata: { bookingId },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.log('Seat hold/Stripe error:', error.message, error.stack);
    res.status(500).json({ message: 'Payment gateway error. Please try again.', details: error.message, stack: error.stack });
  }
};

// GET /api/payments/held-seats/:showtimeId
const getHeldSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;
    const now = new Date();

    // Clean up expired holds first
    await prisma.seatHold.deleteMany({
      where: {
        showtimeId,
        expiresAt: { lte: now }
      }
    });

    // Fetch all active holds for this showtime
    const holds = await prisma.seatHold.findMany({
      where: { showtimeId },
      select: { seatNumber: true }
    });

    const heldSeats = holds.map(h => h.seatNumber);
    res.json({ heldSeats });
  } catch (error) {
    console.error('Fetch held seats error:', error);
    res.status(500).json({ message: 'Error fetching held seats.' });
  }
};

// Mock database for bookings/seat holds
let bookings = [];

// POST /api/payments/confirm
const confirmBooking = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body; 
    
    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({ message: 'Missing payment or booking ID.' });
    }

    console.log(`[Stripe] Confirmed order ${paymentIntentId} for booking ${bookingId}`);

    bookings.push({ id: bookingId, paid: true, transactionId: paymentIntentId });

    res.json({ message: 'Payment successful! Booking confirmed.' });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Failed to verify payment.' });
  }
};

module.exports = { createPaymentIntent, confirmBooking, getHeldSeats };