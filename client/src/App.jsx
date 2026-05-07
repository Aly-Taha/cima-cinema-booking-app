import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/auth-context';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import Cinemas from './pages/Cinemas';
import CinemaDetails from './pages/CinemaDetails';
import './styles/global.css';
import Checkout from './pages/Checkout'; 
import SeatSelection from './pages/SeatSelection';
import AdminDashboard from './pages/AdminDashboard';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Layout with sidebar for authenticated pages
function AppLayout({ children }) {
  return (
    <>
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout><Home /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/movies" element={
        <ProtectedRoute>
          <AppLayout><Movies /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/movies/:id" element={
        <ProtectedRoute>
          <AppLayout><MovieDetails /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/cinemas" element={
        <ProtectedRoute>
          <AppLayout><Cinemas /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/cinemas/:id" element={
        <ProtectedRoute>
          <AppLayout><CinemaDetails /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/seat-selection" element={
        <ProtectedRoute>
          <AppLayout><SeatSelection /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <AppLayout><Checkout /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <div style={{ padding: 32 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>👤 Profile</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Coming soon...</p>
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
