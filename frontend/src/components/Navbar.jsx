import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // Dynamic Data States
  const [cinemaName, setCinemaName] = useState('Skylite');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      
      if (token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setUserName(user.name);
          } catch (e) {
            console.error("Error parsing user data");
          }
        }
      } else {
        setUserName('');
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('user-updated', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('user-updated', checkAuth);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/config');
        if (response.ok) {
          const data = await response.json();
          setCinemaName(data.cinemaName);
        }
      } catch (error) {
        console.error("Error fetching config");
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Showtimes', path: '/showtimes' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#131314]/90 backdrop-blur-lg py-4 shadow-lg' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#e50914] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">movie</span>
              </div>
              <span className="font-headline text-xl font-bold text-white uppercase tracking-tight">
                  {cinemaName.split(' ')[0] || 'SKYLITE'}
              </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${location.pathname === link.path ? 'text-[#e50914]' : 'text-zinc-400 hover:text-white'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <div className="flex items-center gap-6">
                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#e50914] transition-all">
                    <span className="material-symbols-outlined text-zinc-400 group-hover:text-white text-lg">person</span>
                  </div>
                  <span className="hidden lg:block text-[11px] font-bold text-white uppercase">{userName || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-zinc-500 hover:text-[#e50914] transition-colors"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#e50914] hover:bg-[#c0000c] text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
              >
                Log In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-[#0e0e0f]/95 backdrop-blur-xl transition-all duration-300 md:hidden flex flex-col justify-center items-center ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="space-y-10 text-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block text-3xl font-bold text-white uppercase hover:text-[#e50914] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="w-10 h-1 bg-[#e50914] mx-auto opacity-30"></div>
          {isLoggedIn ? (
              <div className="space-y-6">
                  <Link to="/profile" className="block text-xl font-bold text-white uppercase">{userName}</Link>
                  <button onClick={handleLogout} className="text-[#e50914] text-xs font-bold uppercase tracking-widest">Logout</button>
              </div>
          ) : (
              <Link to="/login" className="bg-[#e50914] text-white px-12 py-4 rounded-lg font-bold text-xs uppercase tracking-widest">Log In</Link>
          )}
        </div>
      </div>
    </>
  );
}