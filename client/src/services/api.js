const API_BASE = import.meta.env.PROD 
  ? 'https://cima-production-e342.up.railway.app/api' 
  : '/api';

const api = {
  // Generic fetch wrapper with auth header
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('cima_token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    let response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, config);
    } catch (err) {
      throw new Error('Unable to connect to server. Make sure the backend is running.');
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Server returned an invalid response.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  },

  // Auth endpoints
  auth: {
    register(name, email, password) {
      return api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    },

    login(email, password) {
      return api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    getMe() {
      return api.request('/auth/me');
    },
  },

  // Movies endpoints (SCRUM-42)
  movies: {
    // genres: optional array of genre names
    list(genres = []) {
      const qs = genres.length > 0
        ? `?genres=${encodeURIComponent(genres.join(','))}`
        : '';
      return api.request(`/movies${qs}`);
    },
    genres() {
      return api.request('/movies/genres');
    },
    getById(id) {
      return api.request(`/movies/${id}`);
    },
  },

  // Cinemas endpoints (SCRUM-41)
  cinemas: {
    list(location = '') {
      const qs = location ? `?location=${encodeURIComponent(location)}` : '';
      return api.request(`/cinemas${qs}`);
    },
    locations() {
      return api.request('/cinemas/locations');
    },
    getById(id) {
      return api.request(`/cinemas/${id}`);
    },
    addMovie(cinemaId, { movieId, times }) {
      return api.request(`/cinemas/${cinemaId}/movies`, {
        method: 'POST',
        body: JSON.stringify({ movieId, times })
      });
    },
    removeMovie(cinemaId, movieId) {
      return api.request(`/cinemas/${cinemaId}/movies/${movieId}`, {
        method: 'DELETE'
      });
    }
  },

  // Payments endpoints (SCRUM-51)
  payments: {
    getHeldSeats(showtimeId) {
      return api.request(`/payments/held-seats/${showtimeId}`);
    },
    createIntent(amount, bookingId, showtimeId, selectedSeats) {
      return api.request('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ amount, bookingId, showtimeId, selectedSeats }),
      });
    },
    confirm(paymentIntentId, bookingId) {
      return api.request('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId, bookingId }),
      });
    }
  }
};
export default api;
