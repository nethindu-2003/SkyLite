import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Utilities for formatting
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? h + 'h ' : ''}${m}m`;
};

const getMonth = (dateStr) => new Date(dateStr).toLocaleString('default', { month: 'short' });
const getDayNum = (dateStr) => new Date(dateStr).getDate();
const getDayName = (dateStr) => new Date(dateStr).toLocaleString('default', { weekday: 'short' });
const formattedTime = (timeStr) => timeStr.substring(0, 5);

const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

export default function Showtimes() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const movieId = queryParams.get('movieId');

  const [movie, setMovie] = useState(null); // If a single movie is selected
  const [moviesMap, setMoviesMap] = useState({}); // If fetching all shows
  const [shows, setShows] = useState([]);
  
  const [uniqueDates, setUniqueDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShow, setSelectedShow] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Initial Load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (movieId) {
          // Fetch specific movie and its shows
          const [movieRes, showsRes] = await Promise.all([
            fetch(`http://localhost:8080/api/movies/${movieId}`),
            fetch(`http://localhost:8080/api/theater/shows/movie/${movieId}`)
          ]);

          if (!movieRes.ok) throw new Error("Movie not found");

          const movieData = await movieRes.json();
          const showsData = await showsRes.json() || [];

          setMovie(movieData);
          setShows(showsData);

          if (showsData.length > 0) {
            const todayStr = new Date().toISOString().split('T')[0];
            const dates = [...new Set(showsData.map(show => show.showDate))].sort().filter(d => d >= todayStr);
            setUniqueDates(dates);
            if(dates.length > 0) setSelectedDate(dates[0]);
          }
        } else {
          // Global Showtimes Mode
          const movieRes = await fetch(`http://localhost:8080/api/movies`);
          const moviesData = await movieRes.json();
          
          const map = {};
          moviesData.forEach(m => map[m.movieId] = m);
          setMoviesMap(map);

          const dates = generateDates();
          setUniqueDates(dates);
          setSelectedDate(dates[0]);
        }
      } catch (err) {
        console.error("Error fetching showtimes:", err);
        setError("Failed to load showtimes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [movieId]);

  // 2. Fetch shows by date if in Global Mode
  useEffect(() => {
    if (!movieId && selectedDate) {
      fetch(`http://localhost:8080/api/theater/shows/date/${selectedDate}`)
        .then(res => res.json())
        .then(data => setShows(data || []))
        .catch(console.error);
    }
  }, [movieId, selectedDate]);

  const handleContinue = () => {
    if (selectedShow) {
      navigate(`/seatselection?showId=${selectedShow.showId}`);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-[#131314] min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">progress_activity</span>
      </main>
    );
  }

  if (error || (movieId && !movie)) {
    return (
      <main className="bg-[#131314] min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
        <h1 className="text-3xl font-headline font-black text-white mb-6 uppercase tracking-tight">Schedule Not Found</h1>
        <Link to="/movies" className="bg-white/10 px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-white/20 transition-all">
          Back to Catalog
        </Link>
      </main>
    );
  }

  const availableShowsForDate = shows
    .filter(show => show.showDate === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Group shows by movie for the Global View
  const groupedShows = {};
  if (!movieId) {
      availableShowsForDate.forEach(show => {
          if (!groupedShows[show.movieId]) groupedShows[show.movieId] = [];
          groupedShows[show.movieId].push(show);
      });
  }

  return (
    <div className="bg-[#131314] min-h-screen text-white font-body selection:bg-primary-container selection:text-white pt-24">
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-20 pb-40">
        
        <header className="mb-14 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-headline font-black text-white mb-3 uppercase tracking-tight">Showtimes</h1>
          {movieId ? (
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{movie.title} • {movie.language}</p>
          ) : (
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">All Available Features</p>
          )}
        </header>

        {uniqueDates.length === 0 ? (
          <div className="text-center py-20 bg-[#1c1c1e] rounded-2xl border border-white/5">
            <span className="material-symbols-outlined text-zinc-600 text-5xl mb-3">calendar_today</span>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No shows available currently.</p>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-20">
            {/* Date Selector */}
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 ml-1">Select Date</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {uniqueDates.map((dateStr, index) => {
                  const isActive = selectedDate === dateStr;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedShow(null);
                      }}
                      className={`shrink-0 w-24 h-32 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 border ${isActive ? 'bg-gradient-to-tr from-primary-container to-red-500 border-primary-container text-white scale-105 shadow-lg shadow-primary-container/20' : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:text-white hover:bg-white/[0.05]'}`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest">{getMonth(dateStr)}</span>
                      <span className="text-3xl font-headline font-black leading-none">{getDayNum(dateStr)}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest">{getDayName(dateStr)}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Time Selector */}
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 ml-1">Select Time</h3>
              
              {availableShowsForDate.length === 0 ? (
                 <div className="bg-[#1c1c1e] p-8 rounded-2xl border border-white/5 text-center">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No shows scheduled for this date.</p>
                 </div>
              ) : (
                  movieId ? (
                    // SINGLE MOVIE VIEW
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 bg-[#1c1c1e] p-6 md:p-8 rounded-2xl border border-white/5">
                      {availableShowsForDate.map((show) => {
                        const isSelected = selectedShow?.showId === show.showId;
                        return (
                          <button
                            key={show.showId}
                            onClick={() => setSelectedShow(show)}
                            className={`py-5 rounded-xl font-headline font-black transition-all duration-300 text-xl border ${isSelected ? 'bg-gradient-to-tr from-primary-container to-red-500 border-transparent text-white shadow-lg shadow-primary-container/25 scale-105' : 'bg-[#131314] text-zinc-500 hover:text-white border-white/5 hover:bg-white/[0.02]'}`}
                          >
                            {formattedTime(show.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // ALL MOVIES VIEW
                    <div className="space-y-8">
                        {Object.entries(groupedShows).map(([mId, movieShows]) => {
                            const m = moviesMap[mId];
                            if (!m) return null;
                            return (
                                <div key={mId} className="bg-[#1c1c1e] p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8">
                                    <div className="w-24 h-36 shrink-0 rounded-xl overflow-hidden hidden md:block border border-white/10">
                                        <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-headline font-black text-white uppercase tracking-tight mb-1">{m.title}</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">{m.language} • {formatDuration(m.duration)}</p>
                                        <div className="flex flex-wrap gap-4">
                                            {movieShows.map(show => {
                                                const isSelected = selectedShow?.showId === show.showId;
                                                return (
                                                    <button
                                                        key={show.showId}
                                                        onClick={() => setSelectedShow(show)}
                                                        className={`w-28 py-4 rounded-xl font-headline font-black transition-all duration-300 text-lg border ${isSelected ? 'bg-gradient-to-tr from-primary-container to-red-500 border-transparent text-white shadow-lg shadow-primary-container/25 scale-105' : 'bg-[#131314] text-zinc-500 hover:text-white border-white/5 hover:bg-white/[0.02]'}`}
                                                    >
                                                        {formattedTime(show.startTime)}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                  )
              )}
            </section>
          </div>
        )}
      </main>

      {/* Persistent Floating Footer */}
      {selectedShow && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 bg-[#1c1c1e]/85 backdrop-blur-md p-5 rounded-2xl flex justify-between items-center shadow-2xl border border-white/10 animate-in slide-in-from-bottom-10">
          <div className="px-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Selected Showtime</p>
            <p className="text-base md:text-lg font-headline font-black text-white uppercase">
              {movieId ? movie?.title : moviesMap[selectedShow.movieId]?.title} • {formattedTime(selectedShow.startTime)}
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-[0_4px_15px_rgba(229,9,20,0.3)] hover:shadow-[0_4px_25px_rgba(229,9,20,0.5)] transition-all duration-300 "
          >
            Select Tickets
          </button>
        </div>
      )}
    </div>
  );
}