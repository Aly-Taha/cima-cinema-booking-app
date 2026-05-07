import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SeatSelection.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 10;
const PRICE_PER_TICKET = 150;

function SeatSelection() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    if (!state?.movie) {
      navigate('/movies');
      return;
    }

    // Generate deterministic random reserved seats based on showtime ID or time
    // For demo purposes, we seed it with a simple hash of time string
    const seedString = `${state.cinema.id}-${state.time}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash |= 0;
    }
    
    // Pseudo-random generator using the hash
    const pseudoRandom = () => {
      hash = Math.sin(hash) * 10000;
      return hash - Math.floor(hash);
    };

    const mockReserved = [];
    ROWS.forEach(row => {
      for (let i = 1; i <= SEATS_PER_ROW; i++) {
        if (pseudoRandom() < 0.25) { // 25% chance a seat is reserved
          mockReserved.push(`${row}${i}`);
        }
      }
    });
    setReservedSeats(mockReserved);
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
