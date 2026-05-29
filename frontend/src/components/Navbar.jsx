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
 <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#131314]/80 backdrop-blur-md py-4 border-b border-white/[0.06] shadow-xl' : 'bg-transparent py-7'}`}>
 <div className="w-full px-6 md:px-12 lg:px-20 flex items-center justify-between">
 
 {/* Logo Section */}
 <Link to="/" className="flex items-center gap-3 group">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-container to-red-500 flex items-center justify-center shadow-[0_4px_20px_rgba(229,9,20,0.4)] transition-transform duration-300 ">
 <span className="material-symbols-outlined text-white text-xl">movie</span>
 </div>
 <span className="font-headline text-xl font-black text-white uppercase tracking-tight transition-all duration-300 group-hover:text-primary-container">
 {cinemaName.split(' ')[0] || 'SKYLITE'}
 </span>
 </Link>

 {/* Desktop Navigation */}
 <div className="hidden md:flex items-center gap-10">
 {navLinks.map((link) => (
 <Link
 key={link.name}
 to={link.path}
 className={`text-xs font-bold uppercase tracking-widest relative py-2 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary-container after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left ${location.pathname === link.path ? 'text-primary-container after:scale-x-100' : 'text-zinc-400 hover:text-white'}`}
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
 <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary-container transition-all shadow-md">
 <span className="material-symbols-outlined text-zinc-400 group-hover:text-white text-lg">person</span>
 </div>
 <span className="hidden lg:block text-[11px] font-bold text-white uppercase tracking-wider group-hover:text-primary-container transition-colors">{userName || 'Profile'}</span>
 </Link>
 <button
 onClick={handleLogout}
 className="text-zinc-500 hover:text-primary-container transition-all duration-300"
 >
 <span className="material-symbols-outlined">logout</span>
 </button>
 </div>
 ) : (
 <Link
 to="/login"
 className="bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(229,9,20,0.3)] hover:shadow-[0_4px_25px_rgba(229,9,20,0.5)] "
 >
 Log In
 </Link>
 )}

 {/* Mobile Menu Toggle */}
 <button
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className="md:hidden text-zinc-400 hover:text-white transition-colors duration-300"
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
 className="block text-3xl font-black text-white uppercase hover:text-primary-container transition-colors duration-300"
 >
 {link.name}
 </Link>
 ))}
 <div className="w-10 h-1 bg-primary-container mx-auto opacity-30"></div>
 {isLoggedIn ? (
 <div className="space-y-6">
 <Link to="/profile" className="block text-xl font-black text-white uppercase hover:text-primary-container transition-colors">{userName}</Link>
 <button onClick={handleLogout} className="text-primary-container text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Logout</button>
 </div>
 ) : (
 <Link to="/login" className="bg-gradient-to-r from-primary-container to-red-600 text-white px-12 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">Log In</Link>
 )}
 </div>
 </div>
 </>
 );
}