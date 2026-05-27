import { useState, useEffect } from 'react';

export default function AdminFooter() {
 const [cinemaName, setCinemaName] = useState('Loading...');

 // Fetch Configuration for Copyright Brand Name
 useEffect(() => {
 const fetchConfig = async () => {
 try {
 const response = await fetch('http://localhost:8080/api/config');
 if (response.ok) {
 const data = await response.json();
 setCinemaName(data.cinemaName);
 }
 } catch (error) {
 setCinemaName('Sky Lite');
 }
 };
 fetchConfig();
 }, []);

 return (
 <footer className="w-full bg-[#0e0e0f] border-t border-white/5 mt-auto py-4 md:py-6">
 <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">

 {/* Copyright */}
 <div className="text-zinc-600 font-body text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-center md:text-left">
 © {new Date().getFullYear()} {cinemaName} <span className="mx-2 text-white/5">•</span> Admin Portal
 </div>
 </div>
 </footer>
 );
}