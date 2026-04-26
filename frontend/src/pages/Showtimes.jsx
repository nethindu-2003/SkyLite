import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Utilities for formatting
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? h + 'H ' : ''}${m}M`;
};

const getMonth = (dateStr) => new Date(dateStr).toLocaleString('default', { month: 'short' });
const getDayNum = (dateStr) => new Date(dateStr).getDate();
const getDayName = (dateStr) => new Date(dateStr).toLocaleString('default', { weekday: 'short' });
const formattedTime = (timeStr) => timeStr.substring(0, 5);

export default function Showtimes() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const movieId = queryParams.get('movieId');

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShow, setSelectedShow] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) {
      setError("No movie selected.");
      setIsLoading(false);
      return;
    }

    const fetchShowData = async () => {
      try {
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
          const dates = [...new Set(showsData.map(show => show.showDate))].sort();
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

    fetchShowData();
  }, [movieId]);

  const availableShowsForDate = shows
    .filter(show => show.showDate === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleContinue = () => {
    if (selectedShow) {
      navigate(`/seatselection?showId=${selectedShow.showId}`);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-[#131314] min-h-screen flex items-center justify-center">
        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Fetching Showtimes...</span>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="bg-[#131314] min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-headline font-bold text-white mb-6 uppercase">Schedule Not Found</h1>
        <Link to="/movies" className="text-[#e50914] font-bold uppercase tracking-widest text-xs underline">
          Back to Catalog
        </Link>
      </main>
    );
  }

  return (
    <div className="bg-[#131314] min-h-screen text-white font-body selection:bg-[#e50914] pt-24">
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-20 pb-40">
        
        <header className="mb-20">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-white mb-4 uppercase">Showtimes</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{movie.title}</p>
        </header>

        {uniqueDates.length === 0 ? (
          <div className="text-center py-20 bg-[#1c1c1e] rounded-2xl border border-white/5">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No shows available for this feature.</p>
          </div>
        ) : (
          <div className="space-y-24">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-10 px-2 italic">Select Date</h3>
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
                      className={`shrink-0 w-24 h-32 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${isActive ? 'bg-[#e50914] text-white' : 'bg-[#1c1c1e] text-zinc-500 hover:text-white'}`}
                    >
                      <span className="text-[10px] font-bold uppercase">{getMonth(dateStr)}</span>
                      <span className="text-3xl font-headline font-bold">{getDayNum(dateStr)}</span>
                      <span className="text-[10px] font-bold uppercase">{getDayName(dateStr)}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-10 px-2 italic">Select Time</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6 bg-[#1c1c1e] p-8 rounded-2xl border border-white/5">
                {availableShowsForDate.map((show) => {
                  const isSelected = selectedShow?.showId === show.showId;
                  return (
                    <button
                      key={show.showId}
                      onClick={() => setSelectedShow(show)}
                      className={`py-6 rounded-xl font-bold transition-all text-xl ${isSelected ? 'bg-[#e50914] text-white shadow-lg' : 'bg-[#131314] text-zinc-500 hover:text-white border border-white/5'}`}
                    >
                      {formattedTime(show.startTime)}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Persistent Footer */}
      {selectedShow && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 bg-[#1c1c1e] p-4 rounded-xl flex justify-between items-center shadow-2xl border border-white/5 animate-in slide-in-from-bottom-10">
          <div className="px-4">
             <p className="text-[10px] font-bold uppercase text-zinc-500">Selected Show</p>
             <p className="text-lg font-bold text-white uppercase">{formattedTime(selectedShow.startTime)} • {getDayNum(selectedDate)} {getMonth(selectedDate)}</p>
          </div>
          <button
            onClick={handleContinue}
            className="bg-[#e50914] hover:bg-[#c0000c] text-white px-10 py-4 rounded-lg font-bold text-xs uppercase tracking-widest shadow-xl transition-all"
          >
            Select Tickets
          </button>
        </div>
      )}
    </div>
  );
}