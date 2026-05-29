import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Utility to convert minutes to "Xh Ym" format
const formatDuration = (minutes) => {
 if (!minutes) return 'N/A';
 const h = Math.floor(minutes / 60);
 const m = minutes % 60;
 return `${h > 0 ? h + 'h ' : ''}${m}m`;
};

export default function Movies() {
 const [allMovies, setAllMovies] = useState([]);
 const [filteredMovies, setFilteredMovies] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 const [activeTab, setActiveTab] = useState('Now Showing');
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedGenre, setSelectedGenre] = useState('Genre');

 useEffect(() => {
 const fetchMovies = async () => {
 try {
 const response = await fetch('http://localhost:8080/api/movies');
 if (!response.ok) throw new Error('Failed to fetch movies');
 const data = await response.json();
 setAllMovies(data);
 } catch (error) {
 console.error("Error fetching movies:", error);
 } finally {
 setIsLoading(false);
 }
 };
 fetchMovies();
 }, []);

 useEffect(() => {
 let result = allMovies;
 if (activeTab === 'Now Showing') {
 result = result.filter(m => m.status === 'now_showing');
 } else if (activeTab === 'Upcoming') {
 result = result.filter(m => m.status === 'upcoming');
 }
 if (searchQuery.trim() !== '') {
 result = result.filter(m =>
 m.title.toLowerCase().includes(searchQuery.toLowerCase())
 );
 }
 if (selectedGenre !== 'Genre') {
 result = result.filter(m =>
 m.genre && m.genre.toLowerCase() === selectedGenre.toLowerCase()
 );
 }
 setFilteredMovies(result);
 }, [allMovies, activeTab, searchQuery, selectedGenre]);

 const uniqueGenres = ['Genre', ...new Set(allMovies.map(m => m.genre).filter(Boolean))];

 return (
 <main className="bg-[#131314] min-h-screen text-white w-full font-body selection:bg-primary-container selection:text-white">
 <div className="w-full px-6 md:px-12 lg:px-20 space-y-16">
 <header className="mb-12 md:mb-16">
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-black text-white mb-3 uppercase tracking-tight">Movie Catalog</h1>
 <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Explore our current and upcoming cinematic releases</p>
 </header>

 {/* Tabs */}
 <div className="flex flex-wrap gap-3.5 mb-10">
 {['Now Showing', 'Upcoming', 'Top Rated'].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`px-7 py-3 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all duration-300 ${activeTab === tab ? 'bg-gradient-to-r from-primary-container to-red-600 text-white shadow-lg shadow-primary-container/20' : 'bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white'}`}
 >
 {tab}
 </button>
 ))}
 </div>

 {/* Filter Bar */}
 <div className="flex flex-col md:flex-row gap-4 mb-14 bg-[#1c1c1e] p-4 rounded-2xl border border-white/5 shadow-xl">
 <div className="flex-1 relative flex items-center">
 <span className="material-symbols-outlined absolute left-5 text-zinc-500 text-[18px]">search</span>
 <input
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-[#131314] text-white placeholder:text-zinc-500 rounded-xl py-4 pl-12 pr-6 outline-none transition-all duration-300 text-sm font-medium focus:ring-1 focus:ring-white/10"
 placeholder="Search by title..."
 type="text"
 />
 </div>
 <div className="relative flex items-center bg-[#131314] rounded-xl border border-transparent focus-within:ring-1 focus-within:ring-white/10 transition-all">
 <select
 value={selectedGenre}
 onChange={(e) => setSelectedGenre(e.target.value)}
 className="bg-transparent text-zinc-400 font-bold text-[10px] uppercase tracking-widest pl-6 pr-12 py-4 rounded-xl outline-none cursor-pointer appearance-none"
 >
 {uniqueGenres.map(genre => (
 <option key={genre} value={genre} className="bg-[#131314]">{genre}</option>
 ))}
 </select>
 <span className="material-symbols-outlined absolute right-4 text-zinc-500 pointer-events-none">expand_more</span>
 </div>
 </div>

 {/* Grid */}
 {isLoading ? (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
 {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] bg-[#1c1c1e] animate-pulse rounded-2xl"></div>)}
 </div>
 ) : filteredMovies.length > 0 ? (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
 {filteredMovies.map((movie) => (
 <Link key={movie.movieId} to={`/movie/${movie.movieId}`} className="group flex flex-col">
 <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#1c1c1e] relative mb-4 shadow-lg border border-white/5 group-hover:border-white/10 transition-all duration-500 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
 <img
 className="w-full h-full object-cover transition-all duration-700 "
 alt={movie.title}
 src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600"}
 />
 
 {/* Technology Overlay Badge */}
 <div className="absolute top-4 left-4 z-20">
 <span className="bg-black/50 backdrop-blur-md text-[#e9c349] border border-[#e9c349]/20 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest shadow">3D / Immersive</span>
 </div>

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

 <div className="px-2 space-y-1">
 <h3 className="text-lg md:text-xl font-headline font-bold text-white uppercase tracking-tight line-clamp-1">{movie.title}</h3>
 <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
 <span className="text-[#e9c349]">{movie.genre}</span>
 <span>{formatDuration(movie.duration)}</span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 ) : (
 <div className="text-center py-24 bg-[#1c1c1e] rounded-2xl border border-white/5">
 <span className="material-symbols-outlined text-zinc-600 text-5xl mb-3">search_off</span>
 <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No matching movies found</p>
 </div>
 )}
 </div>
 </main>
 );
}