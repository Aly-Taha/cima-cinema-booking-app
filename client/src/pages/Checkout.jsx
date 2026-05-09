import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

import './Checkout.css';

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  // If someone manually types /checkout in the URL without selecting a movie, kick them back
  useEffect(() => {
    if (!state?.movie) navigate('/movies');
  }, [state, navigate]);
  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Your seat hold has expired! The seats have been released.");
      navigate('/movies');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
  const selectedSeatsCount = state?.selectedSeats?.length || 1;
  const pricePerTicket = 150;
  const totalAmount = selectedSeatsCount * pricePerTicket;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create a Payment Intent with a random booking ID
      const bookingId = `BKG-${Math.floor(Math.random() * 10000)}`;
      const intentResponse = await api.payments.createIntent(totalAmount, bookingId, state.showtimeId, state.selectedSeats);
      
      // 2. Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Confirm the payment
      await api.payments.confirm(intentResponse.clientSecret, bookingId);
      
      setSuccess(true);
      // Kick to home after showing success message
      setTimeout(() => navigate('/'), 3000); 
    } catch (err) {
      setError(err.message || 'Payment was declined. Please check your details and retry.');
    } finally {
      setLoading(false);
    }
  };

  if (!state?.movie) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h2>Secure Checkout 🔒</h2>
        <div className="hold-timer" style={{ color: timeLeft < 60 ? 'red' : 'orange', fontWeight: 'bold' }}>
  ⏳ Seats held for: {formatTime(timeLeft)}
</div>
        <p className="checkout-security-note">
           Your data is encrypted and processed via Stripe Secure Gateway.
        </p>
      </div>

      {success ? (
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h3 className="success-title">Payment Successful!</h3>
          <p className="success-msg">Your booking is confirmed. We're redirecting you home...</p>
        </div>
      ) : (
        <>
          <div className="checkout-summary">
            <h3>{state.movie.title}</h3>
            <div className="summary-details">
              <span>📍 {state.cinema.name} ({state.cinema.location})</span>
              <span>⏰ {state.time} — {selectedSeatsCount} Ticket{selectedSeatsCount > 1 ? 's' : ''} {state?.selectedSeats ? `(${state.selectedSeats.join(', ')})` : ''}</span>
            </div>
            <div className="summary-total">
              <span>Total to Pay:</span>
              <span className="total-amount">{totalAmount} EGP</span>
            </div>
          </div>

          <form onSubmit={handlePayment} className="checkout-form">
            {error && <div className="alert-error">⚠️ {error}</div>}
            
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" placeholder="1234 5678 9101 1121" maxLength="19" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="text" placeholder="MM/YY" maxLength="5" required />
              </div>
              <div className="form-group">
                <label>CVC</label>
                <input type="password" placeholder="123" maxLength="3" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="pay-button">
              {loading ? 'Processing Payment...' : `Pay ${totalAmount} EGP Securely`}
            </button>
            
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
              By clicking "Pay", you agree to our terms of service.
            </p>
          </form>
        </>
      )}
    </div>
  );
}

export default Checkout;