const prisma = require('../config/db');

// GET /api/cinemas?location=Cairo
const getCinemas = async (req, res) => {
  try {
    const { location } = req.query;
    
    const query = {
      where: {}
    };

    if (location && location.trim()) {
      query.where.location = {
        equals: location.trim(),
        mode: 'insensitive' // case-insensitive match
      };
    }

    const cinemas = await prisma.cinema.findMany(query);
    res.json({ cinemas, total: cinemas.length });
  } catch (error) {
    console.error('Fetch cinemas error:', error);
    res.status(500).json({ message: 'Error fetching cinemas' });
  }
};

// GET /api/locations
const getLocations = async (req, res) => {
  try {
    const cinemas = await prisma.cinema.findMany({
      select: { location: true },
      distinct: ['location']
    });
    const locations = cinemas.map(c => c.location).sort();
    res.json({ locations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations' });
  }
};

// GET /api/cinemas/:id
const getCinemaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cinema = await prisma.cinema.findUnique({
      where: { id },
      include: {
        showtimes: {
          include: {
            movie: true
          }
        }
      }
    });

    if (!cinema) {
      return res.status(404).json({ message: 'Cinema not found' });
    }

    // Group showtimes by movie for the frontend
    const moviesMap = {};
    const moviesPlaying = [];

    cinema.showtimes.forEach(st => {
      if (!moviesMap[st.movieId]) {
        moviesMap[st.movieId] = {
          ...st.movie,
          times: []
        };
        moviesPlaying.push(moviesMap[st.movieId]);
      }
      moviesMap[st.movieId].times.push({ id: st.id, time: st.time });
    });

    res.json({ cinema, moviesPlaying });
  } catch (error) {
    console.error('Fetch cinema details error:', error);
    res.status(500).json({ message: 'Error fetching cinema details' });
  }
};

// POST /api/cinemas/:id/movies
const addMovieToShowtime = async (req, res) => {
  try {
    const { id: cinemaId } = req.params;
    const { movieId, times } = req.body; // times: ["7:00 PM", "9:00 PM"]

    if (!movieId || !times || !Array.isArray(times)) {
      return res.status(400).json({ message: 'Missing movieId or times array.' });
    }

    // Create showtime records for each time slot
    const data = times.map(t => ({
      cinemaId,
      movieId,
      time: t
    }));

    await prisma.showtime.createMany({ data });

    res.status(201).json({ message: 'Movie added to cinema showtimes successfully.' });
  } catch (error) {
    console.error('Add movie showtime error:', error);
    res.status(500).json({ message: 'Error adding movie to showtimes.' });
  }
};

// DELETE /api/cinemas/:id/movies/:movieId
const removeMovieFromShowtime = async (req, res) => {
  try {
    const { id: cinemaId, movieId } = req.params;

    await prisma.showtime.deleteMany({
      where: {
        cinemaId,
        movieId
      }
    });

    res.json({ message: 'Movie removed from cinema showtimes.' });
  } catch (error) {
    console.error('Remove movie showtime error:', error);
    res.status(500).json({ message: 'Error removing movie from showtimes.' });
  }
};

module.exports = { 
  getCinemas, 
  getLocations, 
  getCinemaById, 
  addMovieToShowtime, 
  removeMovieFromShowtime 
};
