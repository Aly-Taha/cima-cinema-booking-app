import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './SeatSelection.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 10;
const PRICE_PER_TICKET = 150;

function SeatSelection() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(true);

  useEffect(() => {
    if (!state?.movie || !state?.showtimeId) {
      navigate('/movies');
      return;
    }

    let isMounted = true;
    setLoadingSeats(true);

    api.payments.getHeldSeats(state.showtimeId)
      .then(data => {
        if (isMounted) setReservedSeats(data.heldSeats || []);
      })
      .catch(err => {
        console.error('Failed to fetch held seats:', err);
        // Fall back to empty — user can still select seats
        if (isMounted) setReservedSeats([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSeats(false);
      });

    return () => { isMounted = false; };
  }, [state, navigate]);

  if (!state?.movie) return null;

  const handleSeatClick = (seatId) => {
    if (reservedSeats.includes(seatId)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(s => s !== seatId);
      } else {
        if (prev.length >= 8) {
          alert('You can only select up to 8 seats per booking.');
          return prev;
        }
        return [...prev, seatId].sort();
      }
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    navigate('/checkout', {
      state: {
        movie: state.movie,
        cinema: state.cinema,
        time: state.time,
        showtimeId: state.showtimeId,
        selectedSeats
      }
    });
  };

  const totalPrice = selectedSeats.length * PRICE_PER_TICKET;

  return (
    <div className="seat-selection-page slide-up">
      <div className="ss-header">
        <h2>Select Your Seats</h2>
        <p>{state.movie.title} • {state.cinema.name} • {state.time}</p>
      </div>

      <div className="ss-screen-container">
        <div className="ss-screen">SCREEN</div>
        
        {loadingSeats ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></div>
          </div>
        ) : (
        <div className="ss-grid">
          {ROWS.map(row => (
            <div key={row} className="ss-row">
              <span className="ss-row-label">{row}</span>
              {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map(num => {
                const seatId = `${row}${num}`;
                const isReserved = reservedSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                
                let className = 'ss-seat';
                if (isReserved) className += ' reserved';
                else if (isSelected) className += ' selected';
                else className += ' available';

                if (num === 2 || num === 8) className += ' aisle-right';

                return (
                  <div
                    key={seatId}
                    className={className}
                    onClick={() => handleSeatClick(seatId)}
                    title={isReserved ? 'Reserved' : `Seat ${seatId}`}
                  >
                    {num}
                  </div>
                );
              })}
              <span className="ss-row-label">{row}</span>
            </div>
          ))}
        </div>
        )}
      </div>

      <div className="ss-legend">
        <div className="ss-legend-item">
          <div className="ss-legend-box available"></div>
          <span>Available</span>
        </div>
        <div className="ss-legend-item">
          <div className="ss-legend-box selected"></div>
          <span>Selected</span>
        </div>
        <div className="ss-legend-item">
          <div className="ss-legend-box reserved"></div>
          <span>Reserved</span>
        </div>
      </div>

      <div className="ss-footer">
        <div className="ss-summary">
          <span>{selectedSeats.length} Tickets Selected</span>
          <span className="ss-total-price">{totalPrice} EGP</span>
        </div>
        
        <button 
          className="btn-checkout" 
          disabled={selectedSeats.length === 0}
          onClick={handleContinue}
        >
          {selectedSeats.length === 0 ? 'Select seats to continue' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  );
}

export default SeatSelection;
