import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Utility to convert minutes to "Xh Ym" format
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? h + 'H ' : ''}${m}M`;
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
        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Cinema...</span>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="bg-[#131314] min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-headline font-bold text-white mb-6 uppercase">Movie Not Found</h1>
        <Link to="/movies" className="text-[#e50914] font-bold uppercase tracking-widest text-xs underline">
          Back to Catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#131314] min-h-screen text-white font-body selection:bg-[#e50914]">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt={movie.title}
            className="w-full h-full object-cover"
            src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/60 to-transparent z-10"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-24">
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="bg-[#e50914] px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {movie.status === 'now_showing' ? 'Now Playing' : 'Premiering Soon'}
              </span>
              <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] self-center">
                {movie.genre || "Drama"} • {formatDuration(movie.duration)}
              </span>
            </div>
            <h1 className="text-5xl md:text-8xl font-headline font-bold text-white uppercase tracking-tight">
              {movie.title}
            </h1>
            <div className="flex gap-6 pt-6">
              <Link to={`/showtimes?movieId=${movie.movieId}`} className="bg-[#e50914] text-white px-10 py-5 rounded-xl font-bold uppercase text-xs tracking-widest shadow-xl">
                Get Tickets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-8 space-y-12">
            <h2 className="text-3xl font-headline font-bold uppercase">The Synopsis</h2>
            <p className="text-zinc-400 text-lg leading-relaxed whitespace-pre-line">
              {movie.description}
            </p>
          </div>
          <div className="md:col-span-4">
             <div className="bg-[#1c1c1e] p-10 rounded-2xl border border-white/5 space-y-8">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">Movie Info</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Release', value: formatDate(movie.releaseDate) },
                    { label: 'Language', value: movie.language || 'English' },
                    { label: 'Genre', value: movie.genre || 'Action' },
                    { label: 'Runtime', value: formatDuration(movie.duration) }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-baseline gap-4">
                      <span className="text-zinc-600 font-bold uppercase text-[9px] tracking-widest">{item.label}</span>
                      <span className="text-white font-bold text-sm tracking-wide text-right uppercase">{item.value}</span>
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