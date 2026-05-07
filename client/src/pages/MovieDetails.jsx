import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MovieDetails.css';

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    api.movies.getById(id)
      .then(data => {
        if (!cancelled) setMovie(data.movie);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="movie-details-loading">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="empty-state" style={{ marginTop: '20vh' }}>
        <div className="empty-icon">⚠️</div>
        <h3>Oops!</h3>
        <p>{error || 'Movie not found'}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="movie-details-page slide-up">
      {/* Hero Backdrop Section */}
      <div className="md-hero">
        <div 
          className="md-backdrop" 
          style={{ backgroundImage: `url(${movie.backdrop})` }} 
        />
        <div className="md-hero-overlay" />
        
        <div className="md-hero-content">
          <div className="md-poster-wrapper">
            <img src={movie.poster} alt={movie.title} className="md-poster" />
          </div>
          
          <div className="md-info">
            <h1 className="md-title">{movie.title}</h1>
            <div className="md-meta">
              <span className="md-badge">HD</span>
              <span>{movie.year}</span>
              <span>•</span>
              <span>{movie.duration} min</span>
              <span>•</span>
              <span className="md-rating">★ {movie.rating.toFixed(1)}</span>
            </div>
            
            <div className="md-genres">
              {movie.genres.map(g => (
                <span key={g} className="md-genre-chip">{g}</span>
              ))}
            </div>
            
            <p className="md-synopsis">
              Experience the cinematic event of the year. Grab your popcorn and enjoy the show! (Synopsis coming soon when attached to real database)
            </p>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="md-showtimes-section">
        <h2>🎟️ Available Showtimes</h2>
        <p className="md-subtitle">Select a time to book your tickets</p>
        
        {movie.showtimes && movie.showtimes.length > 0 && (
          <div className="md-location-filter">
            <label htmlFor="loc-filter">Filter by Location: </label>
            <select 
              id="loc-filter"
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="md-location-select"
            >
              <option value="">All Locations</option>
              {Array.from(new Set(movie.showtimes.map(c => c.location))).sort().map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        )}

        <div className="cinemas-list">
          {movie.showtimes && movie.showtimes.length > 0 ? (
            movie.showtimes
              .filter(c => selectedLocation ? c.location === selectedLocation : true)
              .length > 0 ? (
                movie.showtimes
                  .filter(c => selectedLocation ? c.location === selectedLocation : true)
                  .map((cinema, idx) => (
                    <div key={idx} className="md-cinema-card slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                      <div className="md-cinema-info">
                        <h3 
                          onClick={() => navigate(`/cinemas/${cinema.cinemaId}`)}
                          className="md-cinema-link"
                          title={`View movies playing at ${cinema.name}`}
                        >
                          {cinema.name}
                        </h3>
                        <p>📍 {cinema.location}</p>
                      </div>
                      <div className="md-times-grid">
                        {cinema.times.map((time, tIdx) => (
                         <button 
                         key={tIdx} 
                         className="md-time-slot"
                         onClick={() => navigate('/seat-selection', { 
                           state: { movie, cinema, time } 
                         })}
                       >
                         {time}
                       </button>
                        ))}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="empty-state">
                  <p>No cinemas found in this location.</p>
                </div>
              )
          ) : (
            <div className="empty-state">
              <p>No showtimes available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
