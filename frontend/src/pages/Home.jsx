import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Utility to convert minutes to "Xh Ym" format
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? h + 'H ' : ''}${m}M`;
};

export default function Home() {
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  return (
    <div className="bg-[#131314] min-h-screen text-white font-body">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Hero Slideshow Section */}
      <header className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#0e0e0f]">
        {isLoading ? (
          <div className="absolute inset-0 z-0 flex items-end p-8 md:p-24 animate-pulse bg-white/5"></div>
        ) : activeMovie ? (
          <>
            <div key={activeMovie.movieId} className="absolute inset-0 z-0">
              <img
                alt={activeMovie.title}
                className="w-full h-full object-cover object-center"
                src={activeMovie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop"} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/40 to-transparent z-10"></div>
            </div>

            <div key={`content-${activeMovie.movieId}`} className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-24">
              <div className="space-y-6 max-w-4xl">
                <div className="bg-[#e50914] text-white px-6 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
                  Now Showing
                </div>
                <h1 className="text-5xl md:text-8xl font-headline font-bold text-white tracking-tight leading-tight">
                  {activeMovie.title}
                </h1>
                <p className="text-lg text-[#d4d4d8] leading-relaxed max-w-2xl line-clamp-3">
                  {activeMovie.description}
                </p>
                <div className="flex gap-4 pt-4">
                  <Link to={`/movie/${activeMovie.movieId}`} className="bg-[#e50914] px-10 py-4 rounded-xl font-bold uppercase text-xs tracking-widest text-white shadow-lg">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 left-12 z-30 flex gap-2">
              {nowShowing.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${currentSlide === idx ? 'w-12 bg-[#e9c349]' : 'w-4 bg-white/20'}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="relative z-20 text-[#52525b] uppercase font-bold tracking-widest">Loading...</div>
        )}
      </header>

      {/* Search Section */}
      <section className="relative z-30 -mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="bg-[#1c1c1e] rounded-2xl p-6 shadow-2xl border border-white/5">
            <input
              className="w-full bg-[#131314] border border-white/5 rounded-xl py-5 px-8 text-white placeholder:text-[#52525b] font-bold text-sm tracking-widest uppercase outline-none focus:border-[#e50914] transition-all"
              placeholder="Search for movies..."
              type="text"
            />
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-32">
        <h2 className="text-3xl md:text-5xl font-headline font-bold mb-16 px-4">In Cinemas Now</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="aspect-[3/4] bg-[#1c1c1e] animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {nowShowing.map((movie) => (
              <Link to={`/movie/${movie.movieId}`} key={movie.movieId} className="group">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#1c1c1e] relative mb-4">
                  <img
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop"}
                  />
                </div>
                <h3 className="text-xl font-bold mb-1 px-2">{movie.title}</h3>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest px-2">{movie.genre}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}