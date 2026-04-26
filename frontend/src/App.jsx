import { Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import Showtimes from './pages/Showtimes'
import SeatSelection from './pages/SeatSelection'
import Payment from './pages/Payment'
import Confirmation from './pages/Confirmation'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import UserProfile from './pages/UserProfile'
import AboutUs from './pages/AboutUs'

// Layouts
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

// Admin Pages
import AdminMovies from './admin/AdminMovies'
import AdminShowtimes from './admin/AdminShowtimes'
import AdminSeatLayout from './admin/AdminSeatLayout'
import AdminUsers from './admin/AdminUsers'
import AdminGateBooking from './admin/AdminGateBooking'
import AdminSettings from './admin/AdminSettings'
import AdminDashboard from './admin/AdminDashboard'

function App() {
  return (
    <Routes>
      {/* User Facing Routes wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movie/:movieId" element={<MovieDetails />} />
        <Route path="/showtimes" element={<Showtimes />} />
        <Route path="/about" element={<AboutUs />} />

        {/* Protected User Routes */}
        <Route path="/seatselection" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      </Route>

      {/* Admin Protected Routes wrapped in AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="movies" element={<AdminMovies />} />
        <Route path="showtimes" element={<AdminShowtimes />} />
        <Route path="seats" element={<AdminSeatLayout />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="bookings" element={<AdminGateBooking />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Auth Routes (No layout or specific layout if needed) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
