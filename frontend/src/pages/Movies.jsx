import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Utility to convert minutes to "Xh Ym" format
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? h + 'H ' : ''}${m}M`;
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
    <main className="bg-[#131314] min-h-screen text-white pb-32 px-6 lg:px-12 w-full font-body">
      <div className="max-w-7xl mx-auto w-full pt-16">
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-white mb-4 uppercase">Movies</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Explore our premium catalog</p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-16">
          {['Now Showing', 'Upcoming', 'Top Rated'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all ${activeTab === tab ? 'bg-[#e50914] text-white shadow-lg' : 'bg-[#1c1c1e] text-zinc-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-20 bg-[#1c1c1e] p-6 rounded-2xl border border-white/5">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-[#131314] text-white placeholder:text-zinc-600 rounded-xl px-6 py-4 outline-none border border-white/5 focus:border-[#e50914] transition-all text-sm font-bold tracking-widest uppercase"
            placeholder="Search by title..."
            type="text"
          />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-[#131314] text-zinc-400 font-bold text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl border border-white/5 outline-none cursor-pointer"
          >
            {uniqueGenres.map(genre => (
              <option key={genre} value={genre} className="bg-[#131314]">{genre}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] bg-[#1c1c1e] animate-pulse rounded-2xl"></div>)}
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {filteredMovies.map((movie) => (
              <Link key={movie.movieId} to={`/movie/${movie.movieId}`} className="group">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#1c1c1e] relative mb-4">
                  <img
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    alt={movie.title}
                    src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600"}
                  />
                  <div className="absolute top-4 left-4">
                     <span className="bg-[#e50914] text-white text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest">3D / 4K</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1 px-2">{movie.title}</h3>
                <div className="flex gap-4 px-2">
                    <span className="text-[10px] text-[#e9c349] font-bold uppercase tracking-widest">{movie.genre}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{formatDuration(movie.duration)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#1c1c1e] rounded-2xl border border-white/5">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No results found.</p>
          </div>
        )}
      </div>
    </main>
  );
}