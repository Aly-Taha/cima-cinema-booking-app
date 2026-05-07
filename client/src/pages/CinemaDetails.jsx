import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CinemaDetails.css';

function CinemaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cinema, setCinema] = useState(null);
  const [moviesPlaying, setMoviesPlaying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    api.cinemas.getById(id)
      .then(data => {
        if (!cancelled) {
            setCinema(data.cinema);
            setMoviesPlaying(data.moviesPlaying || []);
        }
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
      <div className="cd-loading">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></div>
      </div>
    );
  }

  if (error || !cinema) {
    return (
      <div className="empty-state" style={{ marginTop: '20vh' }}>
        <div className="empty-icon">⚠️</div>
        <h3>Oops!</h3>
        <p>{error || 'Cinema not found'}</p>
        <button className="btn-primary" onClick={() => navigate('/cinemas')}>View All Cinemas</button>
      </div>
    );
  }

  return (
    <div className="cinema-details-page slide-up">
      {/* Hero Section */}
      <div className="cd-hero">
        <div 
          className="cd-backdrop" 
          style={{ backgroundImage: `url(${cinema.image})` }} 
        />
        <div className="cd-hero-overlay" />
        
        <div className="cd-hero-content">
          <div className="cd-info">
            <span className="cd-badge">Cima Partner Theater</span>
            <h1 className="cd-title">{cinema.name}</h1>
            <div className="cd-meta">
              <span>📍 {cinema.location}</span>
              <span>•</span>
              <span>{cinema.screens} Screens</span>
              {cinema.imax && (
                <>
                  <span>•</span>
                  <span className="cd-badge-imax">IMAX</span>
                </>
              )}
            </div>
            <p className="cd-address">{cinema.address}</p>
          </div>
        </div>
      </div>

      {/* Now Playing Section */}
      <div className="cd-now-playing-section">
        <h2>🎬 Now Playing Here</h2>
        <p className="cd-subtitle">Grab your tickets for today's showings at {cinema.name}</p>
        
        <div className="cd-movies-list">
          {moviesPlaying && moviesPlaying.length > 0 ? (
            moviesPlaying.map((movie, idx) => (
              <div key={idx} className="cd-movie-card slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                
                {/* Poster & Info */}
                <div className="cd-movie-info-group">
                  <img src={movie.poster} alt={movie.title} className="cd-movie-poster" onClick={() => navigate(`/movies/${movie.id}`)} />
                  <div className="cd-movie-text">
                    <h3 className="cd-movie-title" onClick={() => navigate(`/movies/${movie.id}`)}>{movie.title}</h3>
                    <div className="cd-movie-meta-small">
                      <span className="cd-movie-rating">★ {movie.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{movie.duration} min</span>
                      <span>•</span>
                      <span>{movie.year}</span>
                    </div>
                    <div className="cd-movie-genres">
                      {movie.genres.slice(0, 3).map(g => (
                        <span key={g} className="cd-movie-genre">{g}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Showtimes for this movie at this cinema */}
                <div className="cd-showtimes-group">
                  <h4>Available Times</h4>
                  <div className="cd-times-grid">
                    {movie.times.map((time, tIdx) => (
                      <button 
                        key={tIdx} 
                        className="cd-time-slot"
                        onClick={() => navigate('/seat-selection', { state: { movie, cinema, time } })}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No movies are playing here today anymore.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CinemaDetails;
