const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmBooking, getHeldSeats } = require('../controllers/payments-controller');

// Public routes
router.get('/held-seats/:showtimeId', getHeldSeats);
router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmBooking);

module.exports = router;