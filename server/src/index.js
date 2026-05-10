const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth-routes');
const moviesRoutes = require('./routes/movies-routes');
const cinemasRoutes = require('./routes/cinemas-routes');
const paymentsRoutes = require('./routes/payments-routes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/cinemas', cinemasRoutes);
app.use('/api/payments', paymentsRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Cima API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 Cima server running on http://0.0.0.0:${PORT}`);
});
setInterval(() => {}, 1000 * 60 * 60);
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
}); 