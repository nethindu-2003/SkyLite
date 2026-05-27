import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Footer() {
 // State for dynamic configuration data
 const [config, setConfig] = useState(null);
 const [isLoading, setIsLoading] = useState(true);

 // Fetch configuration from API Gateway
 useEffect(() => {
 const fetchConfig = async () => {
 try {
 const response = await fetch('http://localhost:8080/api/config');
 if (!response.ok) throw new Error('Failed to fetch config');
 const data = await response.json();
 setConfig(data);
 } catch (error) {
 console.error("Error fetching cinema configuration:", error);
 // Fallback data if backend is unreachable
 setConfig({
 cinemaName: 'Sky Lite 3D Cinema',
 contactEmail: 'support@skylite.com',
 contactPhone: '+94 77 123 4567'
 });
 } finally {
 setIsLoading(false);
 }
 };

 fetchConfig();
 }, []);

 return (
 <footer className="w-full bg-[#0a0a0b] border-t border-white/[0.06] pt-20 md:pt-28 pb-8 md:pb-12 mt-auto">
 <div className="max-w-7xl mx-auto px-6 lg:px-8">

 {/* Main Footer Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 md:mb-20">

 {/* Brand Section */}
 <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-8">
 {isLoading ? (
 // Loading Skeleton for Brand Description
 <div className="space-y-4 w-full mb-10">
 <div className="h-4 bg-white/5 animate-pulse rounded w-full"></div>
 <div className="h-4 bg-white/5 animate-pulse rounded w-5/6"></div>
 <div className="h-4 bg-white/5 animate-pulse rounded w-3/4"></div>
 <div className="pt-4 space-y-2">
 <div className="h-3 bg-white/5 animate-pulse rounded w-1/2"></div>
 <div className="h-3 bg-white/5 animate-pulse rounded w-1/3"></div>
 </div>
 </div>
 ) : (
 <>
 <p className="text-zinc-400 font-body text-sm leading-relaxed mb-6 max-w-sm">
 Bringing the magic of the big screen to the heart of Matara. Experience cinema like never before at <span className="text-white font-bold">{config.cinemaName}</span> with our state-of-the-art 3D projection and immersive surround sound.
 </p>

 {/* Dynamic Contact Info from DB */}
 <div className="flex flex-col gap-3 mb-8 md:mb-10 text-zinc-500 font-body text-sm">
 <a href={`mailto:${config.contactEmail}`} className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-3 group">
 <span className="material-symbols-outlined text-[18px] group-hover:text-primary-container transition-colors">mail</span>
 {config.contactEmail}
 </a>
 {config.contactPhone && (
 <a href={`tel:${config.contactPhone}`} className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-3 group">
 <span className="material-symbols-outlined text-[18px] group-hover:text-primary-container transition-colors">call</span>
 {config.contactPhone}
 </a>
 )}
 </div>
 </>
 )}

 {/* Social Icons */}
 <div className="flex items-center gap-4">
 <a className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group hover:bg-primary-container hover:border-primary-container hover:shadow-[0_4px_15px_rgba(229,9,20,0.3)] transition-all duration-300" href="#">
 <span className="material-symbols-outlined text-zinc-400 group-hover:text-white transition-colors text-[20px]">campaign</span>
 </a>
 <a className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group hover:bg-primary-container hover:border-primary-container hover:shadow-[0_4px_15px_rgba(229,9,20,0.3)] transition-all duration-300" href="#">
 <span className="material-symbols-outlined text-zinc-400 group-hover:text-white transition-colors text-[20px]">public</span>
 </a>
 <a className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group hover:bg-primary-container hover:border-primary-container hover:shadow-[0_4px_15px_rgba(229,9,20,0.3)] transition-all duration-300" href="#">
 <span className="material-symbols-outlined text-zinc-400 group-hover:text-white transition-colors text-[20px]">play_circle</span>
 </a>
 </div>
 </div>

 {/* Quick Links */}
 <div className="lg:col-span-2 lg:col-start-6">
 <h4 className="text-white font-headline font-bold text-xs mb-6 md:mb-8 tracking-[0.25em] uppercase">Quick Links</h4>
 <ul className="space-y-4 font-body text-sm text-zinc-400">
 <li>
 <Link to="/movies" className="hover:text-white transition-colors flex items-center gap-2 group">
 <span className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-2 group-hover:ml-0"></span>
 <span className="group-hover:translate-x-1 transition-transform duration-300">Now Showing</span>
 </Link>
 </li>
 <li>
 <Link to="/showtimes" className="hover:text-white transition-colors flex items-center gap-2 group">
 <span className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-2 group-hover:ml-0"></span>
 <span className="group-hover:translate-x-1 transition-transform duration-300">Coming Soon</span>
 </Link>
 </li>
 <li>
 <Link to="/about" className="hover:text-white transition-colors flex items-center gap-2 group">
 <span className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-2 group-hover:ml-0"></span>
 <span className="group-hover:translate-x-1 transition-transform duration-300">About Us</span>
 </Link>
 </li>
 <li>
 <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-2 group">
 <span className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-2 group-hover:ml-0"></span>
 <span className="group-hover:translate-x-1 transition-transform duration-300">Contact</span>
 </Link>
 </li>
 </ul>
 </div>

 {/* Legal */}
 <div className="lg:col-span-2">
 <h4 className="text-white font-headline font-bold text-xs mb-6 md:mb-8 tracking-[0.25em] uppercase">Legal</h4>
 <ul className="space-y-4 font-body text-sm text-zinc-400">
 <li>
 <a href="#" className="hover:text-white transition-colors flex items-center gap-2 group">
 <span className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-2 group-hover:ml-0"></span>
 <span className="group-hover:translate-x-1 transition-transform duration-300">Privacy Policy</span>
 </a>
 </li>
 <li>
 <a href="#" className="hover:text-white transition-colors flex items-center gap-2 group">
 <span className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-2 group-hover:ml-0"></span>
 <span className="group-hover:translate-x-1 transition-transform duration-300">Terms of Service</span>
 </a>
 </li>
 <li>
 <a href="#" className="hover:text-white transition-colors flex items-center gap-2 group">
 <span className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-2 group-hover:ml-0"></span>
 <span className="group-hover:translate-x-1 transition-transform duration-300">Refund Policy</span>
 </a>
 </li>
 </ul>
 </div>

 {/* Newsletter */}
 <div className="lg:col-span-3 flex flex-col justify-start">
 <h4 className="text-white font-headline font-bold text-xs mb-6 md:mb-8 tracking-[0.25em] uppercase">Newsletter</h4>
 <p className="text-zinc-400 font-body text-sm leading-relaxed mb-6">
 Subscribe for the latest releases, events, and exclusive movie deals straight to your inbox.
 </p>
 <div className="relative group w-full mt-auto">
 <input
 className="w-full bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] focus:bg-white/[0.05] rounded-xl py-4 pl-5 pr-28 text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-primary-container/30 focus:border-primary-container/30 focus:outline-none transition-all font-body text-sm"
 placeholder="Email address..."
 type="email"
 />
 <button className="absolute right-2 top-1.5 bottom-1.5 bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 rounded-lg font-headline font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-md">
 Join
 </button>
 </div>
 </div>
 </div>

 {/* Bottom Bar */}
 <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-6">
 <div className="text-zinc-500 font-body text-xs font-medium tracking-wide">
 {isLoading ? (
 <div className="h-4 bg-white/5 animate-pulse rounded w-48"></div>
 ) : (
 `© ${new Date().getFullYear()} ${config.cinemaName}. All Rights Reserved.`
 )}
 </div>
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-3 text-zinc-400 font-body text-[10px] tracking-widest uppercase bg-white/[0.03] px-5 py-2.5 rounded-xl border border-white/5 shadow-sm">
 <span className="material-symbols-outlined text-[15px] text-[#e9c349]">verified_user</span>
 <span>Secure Payments</span>
 </div>
 </div>
 </div>

 </div>
 </footer>
 );
}