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

    // 2. Lock the seats (NFR: prevent concurrent double booking)
    try {
      await prisma.seatHold.createMany({
        data: selectedSeats.map(seat => ({
          showtimeId,
          seatNumber: seat,
          expiresAt
        }))
      });
    } catch (error) {
      // Prisma throws P2002 if the unique constraint fails (someone else locked it first)
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
    console.error('Seat hold/Stripe error:', error);
    res.status(500).json({ message: 'Payment gateway error. Please try again.' });
  }
};