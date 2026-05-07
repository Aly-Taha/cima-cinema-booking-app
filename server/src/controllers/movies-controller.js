const prisma = require('../config/db');

// GET /api/movies
const getMovies = async (req, res) => {
  try {
    const { genres } = req.query;
    
    const query = {
      where: {},
      orderBy: { rating: 'desc' }
    };

    if (genres) {
      const genreList = genres.split(',').map(g => g.trim());
      query.where.genres = { hasSome: genreList };
    }

    const movies = await prisma.movie.findMany(query);
    res.json({ movies });
  } catch (error) {
    console.error('Fetch movies error:', error);
    res.status(500).json({ message: 'Error fetching movies' });
  }
};

// GET /api/movies/genres
const getGenres = async (req, res) => {
  try {
    const GENRES = [
      "Action", "Adventure", "Animation", "Comedy", "Crime", "Drama", 
      "Family", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", 
      "Thriller", "Western"
    ];
    res.json({ genres: GENRES });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching genres' });
  }
};

// GET /api/movies/:id
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const movie = await prisma.movie.findFirst({
      where: {
        OR: [
          { id: id },
          { tmdbId: parseInt(id) || -1 }
        ]
      },
      include: {
        showtimes: {
          include: {
            cinema: true
          }
        }
      }
    });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Transform showtimes into the grouped format the frontend expects
    const groupedShowtimes = [];
    const cinemaMap = {};

    movie.showtimes.forEach(st => {
      if (!cinemaMap[st.cinemaId]) {
        cinemaMap[st.cinemaId] = {
          cinemaId: st.cinemaId,
          name: st.cinema.name,
          location: st.cinema.location,
          times: []
        };
        groupedShowtimes.push(cinemaMap[st.cinemaId]);
      }
      cinemaMap[st.cinemaId].times.push(st.time);
    });

    res.json({ 
      movie: {
        ...movie,
        showtimes: groupedShowtimes
      }
    });

  } catch (error) {
    console.error('Fetch movie details error:', error);
    res.status(500).json({ message: 'Error fetching movie details' });
  }
};

module.exports = { getMovies, getGenres, getMovieById };
