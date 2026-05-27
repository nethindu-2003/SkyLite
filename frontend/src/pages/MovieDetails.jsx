import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Utility to convert minutes to "Xh Ym" format
const formatDuration = (minutes) => {
 if (!minutes) return 'N/A';
 const h = Math.floor(minutes / 60);
 const m = minutes % 60;
 return `${h > 0 ? h + 'h ' : ''}${m}m`;
};

// Utility to format dates elegantly
const formatDate = (dateString) => {
 if (!dateString) return 'TBA';
 const options = { year: 'numeric', month: 'long', day: 'numeric' };
 return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function MovieDetails() {
 const { movieId } = useParams();
 const [movie, setMovie] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 const fetchMovieDetails = async () => {
 try {
 const response = await fetch(`http://localhost:8080/api/movies/${movieId}`);
 if (!response.ok) throw new Error('Movie not found');
 const data = await response.json();
 setMovie(data);
 } catch (err) {
 console.error("Error fetching movie:", err);
 setError(err.message);
 } finally {
 setIsLoading(false);
 }
 };
 fetchMovieDetails();
 }, [movieId]);

 if (isLoading) {
 return (
 <main className="bg-[#131314] min-h-screen flex items-center justify-center">
 <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">progress_activity</span>
 </main>
 );
 }

 if (error || !movie) {
 return (
 <main className="bg-[#131314] min-h-screen flex flex-col items-center justify-center px-6 text-center">
 <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
 <h1 className="text-3xl font-headline font-black text-white mb-6 uppercase tracking-tight">Movie Not Found</h1>
 <Link to="/movies" className="bg-white/10 px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-white/20 transition-all">
 Back to Catalog
 </Link>
 </main>
 );
 }

 return (
 <main className="bg-[#131314] min-h-screen text-white font-body selection:bg-primary-container selection:text-white">
 {/* Hero Section */}
 <section className="relative w-full h-[85vh] min-h-[500px] overflow-hidden bg-[#0e0e0f]">
 <div className="absolute inset-0 z-0">
 <img
 alt={movie.title}
 className="w-full h-full object-cover opacity-80"
 src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop"}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/60 to-transparent z-10"></div>
 <div className="absolute inset-0 bg-gradient-to-r from-[#131314]/80 via-transparent to-transparent z-10"></div>
 </div>

 <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16 md:pb-24 pt-32">
 <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700">
 <div className="flex flex-wrap items-center gap-3">
 <span className="bg-primary-container px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary-container/20">
 {movie.status === 'now_showing' ? 'Now Playing' : 'Upcoming'}
 </span>
 <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
 {movie.genre || "Drama"} • {formatDuration(movie.duration)}
 </span>
 </div>
 <h1 className="text-4xl md:text-7xl lg:text-8xl font-headline font-black text-white uppercase tracking-tight leading-none">
 {movie.title}
 </h1>
 <div className="flex flex-wrap gap-4 pt-4">
 <Link 
 to={`/showtimes?movieId=${movie.movieId}`} 
 className="bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-4.5 rounded-xl font-bold uppercase text-xs tracking-widest shadow-[0_4px_15px_rgba(229,9,20,0.3)] hover:shadow-[0_4px_25px_rgba(229,9,20,0.5)] transition-all duration-300"
 >
 Get Tickets
 </Link>
 {movie.trailerUrl && (
 <a 
 href={movie.trailerUrl} 
 target="_blank" 
 rel="noreferrer" 
 className="bg-white/5 hover:bg-white/10 text-white px-8 py-4.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-all duration-300 flex items-center gap-2 border border-white/10 hover:border-white/20"
 >
 <span className="material-symbols-outlined text-[18px]">play_circle</span> Watch Trailer
 </a>
 )}
 </div>
 </div>
 </div>
 </section>

 {/* Content */}
 <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
 
 {/* Synopsis */}
 <div className="lg:col-span-8 space-y-8">
 <h2 className="text-2xl md:text-3xl font-headline font-black uppercase tracking-tight border-b border-white/5 pb-4">The Synopsis</h2>
 <p className="text-zinc-400 text-base md:text-lg leading-relaxed whitespace-pre-line font-light">
 {movie.description}
 </p>
 </div>
 
 {/* Metadata Info Panel */}
 <div className="lg:col-span-4">
 <div className="bg-gradient-to-br from-[#1c1c1e] to-[#151516] p-8 md:p-10 rounded-3xl border border-white/5 space-y-8 shadow-2xl">
 <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-4">Movie Details</h3>
 <div className="space-y-6">
 {[
 { label: 'Release Date', value: formatDate(movie.releaseDate) },
 { label: 'Language', value: movie.language || 'English' },
 { label: 'Genre', value: movie.genre || 'Action' },
 { label: 'Runtime', value: formatDuration(movie.duration) }
 ].map((item, idx) => (
 <div key={idx} className="flex justify-between items-baseline gap-4">
 <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">{item.label}</span>
 <span className="text-white font-bold text-xs md:text-sm tracking-wide text-right uppercase">{item.value}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>
 </div>
 </main>
 );
}