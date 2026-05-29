import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AdminNavbar() {
 const location = useLocation();
 const navigate = useNavigate();
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [cinemaName, setCinemaName] = useState('Loading...');

 // Fetch Cinema Configuration
 useEffect(() => {
 const fetchConfig = async () => {
 try {
 const response = await fetch('http://localhost:8080/api/config');
 if (response.ok) {
 const data = await response.json();
 setCinemaName(data.cinemaName);
 }
 } catch (error) {
 setCinemaName('SkyLite'); // Fallback
 }
 };
 fetchConfig();
 }, []);

 // Secure Logout
 const handleLogout = () => {
 localStorage.removeItem('token');
 localStorage.removeItem('user');
 navigate('/login');
 };

 const adminLinks = [
 { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
 { name: 'Movies', path: '/admin/movies', icon: 'movie' },
 { name: 'Showtimes', path: '/admin/showtimes', icon: 'calendar_month' },
 { name: 'Seat Layout', path: '/admin/seats', icon: 'event_seat' },
 { name: 'Bookings', path: '/admin/bookings', icon: 'receipt_long' },
 { name: 'Users', path: '/admin/users', icon: 'group' },
 { name: 'Settings', path: '/admin/settings', icon: 'settings' },
 ];

 return (
 <>
 {/* Full-width Glass Topbar */}
 <header className="fixed top-0 w-full z-50 bg-[#131314]/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
 <div className="w-full px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">

 {/* Brand & Admin Badge */}
 <div className="flex items-center gap-3 md:gap-4">
 <Link to="/admin/dashboard" className="flex items-center gap-2 md:gap-3 group">
 <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary-container to-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-transform">
 <span className="material-symbols-outlined text-white text-base md:text-xl">admin_panel_settings</span>
 </div>
 <div className="flex flex-col">
 <span className="font-headline text-sm md:text-lg font-black text-white uppercase tracking-widest leading-none group-hover:text-primary-container transition-colors">
 {cinemaName.split('3D')[0] || cinemaName}
 </span>
 <span className="font-body text-[8px] md:text-[9px] text-[#e9c349] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase mt-0.5 md:mt-1">
 Control Center
 </span>
 </div>
 </Link>
 </div>

 {/* Desktop Navigation */}
 <nav className="hidden lg:flex items-center gap-2">
 {adminLinks.map((link) => {
 const isActive = location.pathname === link.path;
 return (
 <Link
 key={link.name}
 to={link.path}
 className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${isActive
 ? 'bg-white/10 text-white shadow-inner border border-white/5'
 : 'text-zinc-500 hover:text-white hover:bg-white/5'
 }`}
 >
 <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
 {link.name}
 </Link>
 );
 })}
 </nav>

 {/* Right Actions */}
 <div className="flex items-center gap-2 md:gap-4">
 <button
 onClick={handleLogout}
 className="hidden lg:flex items-center gap-2 text-zinc-500 hover:text-primary-container transition-colors text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-transparent hover:border-primary-container/30 hover:bg-primary-container/10 duration-200"
 >
 <span className="material-symbols-outlined text-[18px]">logout</span>
 Logout
 </button>

 {/* Mobile Menu Toggle */}
 <button
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className="lg:hidden flex items-center justify-center w-10 h-10 text-zinc-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10"
 >
 <span className="material-symbols-outlined text-2xl">
 {isMobileMenuOpen ? 'close' : 'menu'}
 </span>
 </button>
 </div>
 </div>
 </header>

 {/* Mobile Menu Overlay */}
 {isMobileMenuOpen && (
 <div className="fixed inset-0 z-40 bg-[#0e0e0f] lg:hidden flex flex-col pt-20 overflow-y-auto">
 <div className="flex flex-col p-6 gap-2">
 <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 px-4">Navigation</div>
 {adminLinks.map((link) => {
 const isActive = location.pathname === link.path;
 return (
 <Link
 key={link.name}
 to={link.path}
 onClick={() => setIsMobileMenuOpen(false)}
 className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isActive 
 ? 'bg-primary-container/10 text-primary-container border border-primary-container/20' 
 : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
 }`}
 >
 <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary-container text-white' : 'bg-white/5 text-zinc-500'}`}>
 <span className="material-symbols-outlined text-xl">{link.icon}</span>
 </div>
 <span className="font-headline text-lg font-black uppercase tracking-widest leading-none">
 {link.name}
 </span>
 </Link>
 );
 })}
 </div>
 
 <div className="mt-auto p-6 border-t border-white/5 bg-[#131314]">
 <button
 onClick={handleLogout}
 className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-container to-red-600 text-white p-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg shadow-primary-container/20"
 >
 <span className="material-symbols-outlined">logout</span>
 Secure Logout
 </button>
 </div>
 </div>
 )}
 </>
 );
}