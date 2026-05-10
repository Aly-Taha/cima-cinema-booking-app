const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmBooking, getHeldSeats } = require('../controllers/payments-controller');
const { authMiddleware } = require('../middleware/auth-middleware');

// Public route - anyone can check which seats are held
router.get('/held-seats/:showtimeId', getHeldSeats);

// Protected routes - user must be logged in to pay
router.post('/create-intent', authMiddleware, createPaymentIntent);
router.post('/confirm', authMiddleware, confirmBooking);

module.exports = router;