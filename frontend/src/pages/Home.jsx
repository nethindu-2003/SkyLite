import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Utility to convert minutes to "Xh Ym" format
const formatDuration = (minutes) => {
 if (!minutes) return 'N/A';
 const h = Math.floor(minutes / 60);
 const m = minutes % 60;
 return `${h > 0 ? h + 'h ' : ''}${m}m`;
};

export default function Home() {
 const [nowShowing, setNowShowing] = useState([]);
 const [upcoming, setUpcoming] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [currentSlide, setCurrentSlide] = useState(0);
 const [searchQuery, setSearchQuery] = useState('');

 // Fetch movies from the database via API Gateway
 useEffect(() => {
 const fetchMovies = async () => {
 try {
 const [nowShowingRes, upcomingRes] = await Promise.all([
 fetch('http://localhost:8080/api/movies/status/now_showing'),
 fetch('http://localhost:8080/api/movies/status/upcoming')
 ]);

 if (nowShowingRes.ok && upcomingRes.ok) {
 const nowData = await nowShowingRes.json();
 const upData = await upcomingRes.json();
 setNowShowing(nowData);
 setUpcoming(upData);
 }
 } catch (error) {
 console.error("Failed to fetch movies:", error);
 } finally {
 setIsLoading(false);
 }
 };

 fetchMovies();
 }, []);

 // Hero Slider Auto-Play Logic
 useEffect(() => {
 if (nowShowing.length <= 1) return;
 const maxSlides = Math.min(nowShowing.length, 5);
 const interval = setInterval(() => {
 setCurrentSlide((prev) => (prev + 1) % maxSlides);
 }, 8000);

 return () => clearInterval(interval);
 }, [nowShowing]);

 const activeMovie = nowShowing[currentSlide];

 // Filtering Logic
 const filteredNowShowing = nowShowing.filter(m => 
 m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
 m.genre.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const filteredUpcoming = upcoming.filter(m => 
 m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
 m.genre.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div className="bg-[#131314] min-h-screen text-white font-body selection:bg-primary-container selection:text-white">
 
 {/* Hero Slideshow Section */}
 <header className="relative w-full h-[85vh] md:h-screen flex items-center justify-center overflow-hidden bg-[#0e0e0f]">
 {isLoading ? (
 <div className="absolute inset-0 z-0 flex items-center justify-center bg-white/[0.02]">
 <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">progress_activity</span>
 </div>
 ) : activeMovie ? (
 <>
 <div key={activeMovie.movieId} className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out">
 <img
 alt={activeMovie.title}
 className="w-full h-full object-cover object-center scale-105 animate-[zoom_20s_infinite_alternate]"
 src={activeMovie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop"} 
 />
 <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/50 to-transparent z-10"></div>
 <div className="absolute inset-0 bg-gradient-to-r from-[#131314]/80 via-transparent to-transparent z-10"></div>
 </div>

 <div key={`content-${activeMovie.movieId}`} className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-20 md:pt-32">
 <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-700">
 <div className="bg-primary-container text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit shadow-lg shadow-primary-container/20">
 Now Showing
 </div>
 <h1 className="text-4xl md:text-7xl font-headline font-black text-white tracking-tight leading-tight uppercase">
 {activeMovie.title}
 </h1>
 <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-xl line-clamp-3">
 {activeMovie.description}
 </p>
 <div className="flex gap-4 pt-2">
 <Link 
 to={`/movie/${activeMovie.movieId}`} 
 className="bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-[0_4px_15px_rgba(229,9,20,0.3)] hover:shadow-[0_4px_25px_rgba(229,9,20,0.5)] "
 >
 Book Tickets
 </Link>
 </div>
 </div>
 </div>

 {/* Slider Dots indicators */}
 <div className="absolute bottom-12 left-6 md:left-12 z-30 flex gap-2.5 bg-black/35 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/5">
 {nowShowing.slice(0, 5).map((_, idx) => (
 <button
 key={idx}
 onClick={() => setCurrentSlide(idx)}
 className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-[#e9c349]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
 />
 ))}
 </div>
 </>
 ) : (
 <div className="relative z-20 text-zinc-600 uppercase font-bold tracking-widest text-xs">No active movies in cinema.</div>
 )}
 </header>

 {/* Dynamic Search/Filter Input Banner */}
 <section className="relative z-30 -mt-10 md:-mt-14 max-w-7xl mx-auto px-6 lg:px-12">
 <div className="bg-[#1c1c1e] rounded-2xl p-4 shadow-2xl border border-white/5">
 <div className="relative flex items-center">
 <span className="material-symbols-outlined absolute left-5 text-zinc-500 text-[20px]">search</span>
 <input
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-[#131314] border border-transparent focus:border-white/10 rounded-xl py-4 pl-14 pr-6 text-white placeholder:text-zinc-500 font-medium text-sm outline-none transition-all duration-300"
 placeholder="Search by title, genre, language..."
 type="text"
 />
 </div>
 </div>
 </section>

 {/* Movie Section Grids */}
 <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32 space-y-24">
 
 {/* Now Showing Grid */}
 <section className="space-y-12">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
 <div>
 <h2 className="text-2xl md:text-4xl font-headline font-black text-white uppercase tracking-tight">Now Showing</h2>
 <p className="text-zinc-500 text-xs mt-1">Select a movie below to choose showtimes and book your seats.</p>
 </div>
 <div className="h-[2px] bg-white/5 flex-grow hidden sm:block mx-8 mb-2"></div>
 <span className="text-[10px] font-bold uppercase tracking-widest text-primary-container bg-primary-container/10 px-3 py-1 rounded-full">{filteredNowShowing.length} Movies</span>
 </div>

 {isLoading ? (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
 {[1, 2, 3, 4].map(n => (
 <div key={n} className="aspect-[3/4] bg-[#1c1c1e] animate-pulse rounded-2xl"></div>
 ))}
 </div>
 ) : filteredNowShowing.length === 0 ? (
 <div className="text-center py-20 bg-[#1c1c1e] rounded-2xl border border-white/5">
 <span className="material-symbols-outlined text-zinc-600 text-5xl mb-3">search_off</span>
 <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">No matching movies found</p>
 </div>
 ) : (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
 {filteredNowShowing.map((movie) => (
 <Link to={`/movie/${movie.movieId}`} key={movie.movieId} className="group flex flex-col">
 <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#1c1c1e] relative mb-4 shadow-lg transition-all duration-500 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] border border-white/5 group-hover:border-white/10">
 <img
 alt={movie.title}
 className="w-full h-full object-cover transition-all duration-700 "
 src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop"}
 />
 
 {/* Hover detail overlay for premium look */}
 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
 <span className="text-[10px] font-bold text-primary-container uppercase tracking-wider mb-1">{movie.genre}</span>
 <h4 className="text-white font-headline font-black text-sm uppercase tracking-tight leading-snug">{movie.title}</h4>
 <div className="flex items-center gap-2 mt-2 text-zinc-400 text-[10px] font-bold tracking-wider uppercase">
 <span className="material-symbols-outlined text-sm">schedule</span>
 <span>{formatDuration(movie.duration)}</span>
 </div>
 </div>
 </div>
 
 {/* Default info below poster */}
 <div className="px-2 space-y-1">
 <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-tight group-hover:text-primary-container transition-colors line-clamp-1">{movie.title}</h3>
 <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
 <span>{movie.genre}</span>
 <span>{movie.language}</span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 )}
 </section>

 {/* Upcoming Releases Grid */}
 <section className="space-y-12">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
 <div>
 <h2 className="text-2xl md:text-4xl font-headline font-black text-white uppercase tracking-tight">Upcoming Releases</h2>
 <p className="text-zinc-500 text-xs mt-1">Get ready for these blockbusters coming soon to Matara.</p>
 </div>
 <div className="h-[2px] bg-white/5 flex-grow hidden sm:block mx-8 mb-2"></div>
 <span className="text-[10px] font-bold uppercase tracking-widest text-[#e9c349] bg-[#e9c349]/10 px-3 py-1 rounded-full">{filteredUpcoming.length} Expected</span>
 </div>

 {isLoading ? (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
 {[1, 2, 3, 4].map(n => (
 <div key={n} className="aspect-[3/4] bg-[#1c1c1e] animate-pulse rounded-2xl"></div>
 ))}
 </div>
 ) : filteredUpcoming.length === 0 ? (
 <div className="text-center py-20 bg-[#1c1c1e] rounded-2xl border border-white/5">
 <span className="material-symbols-outlined text-zinc-600 text-5xl mb-3">auto_awesome</span>
 <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">No upcoming releases scheduled</p>
 </div>
 ) : (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
 {filteredUpcoming.map((movie) => (
 <div key={movie.movieId} className="group flex flex-col">
 <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#1c1c1e] relative mb-4 shadow-lg border border-white/5 transition-all duration-500 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
 <img
 alt={movie.title}
 className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 "
 src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop"}
 />
 
 {/* Visual Coming Soon Badge */}
 <div className="absolute top-4 left-4 bg-[#e9c349] text-black text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow">
 Coming Soon
 </div>
 </div>
 
 {/* Text Details */}
 <div className="px-2 space-y-1">
 <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-tight line-clamp-1">{movie.title}</h3>
 <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
 <span>{movie.genre}</span>
 <span>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'TBA'}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </section>

 </main>
 </div>
 );
}