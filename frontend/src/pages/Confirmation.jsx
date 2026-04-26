import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Confirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  // State Management
  const [ticketData, setTicketData] = useState({
    booking: null,
    movie: null,
    show: null,
    seatLabels: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Ticket Data
  useEffect(() => {
    const fetchTicketDetails = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);

      try {
        // 1. Fetch User's Bookings to find this specific one
        const bookingsRes = await fetch(`http://localhost:8080/api/bookings/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!bookingsRes.ok) throw new Error("Failed to authenticate booking request.");
        
        const bookings = await bookingsRes.json();
        const currentBooking = bookings.find(b => b.bookingId === parseInt(bookingId));

        if (!currentBooking) throw new Error("Booking not found or unauthorized.");

        // 2. Fetch Show Details
        const showRes = await fetch(`http://localhost:8080/api/theater/shows/${currentBooking.showId}`);
        const showData = await showRes.json();

        // 3. Fetch Movie Details
        const movieRes = await fetch(`http://localhost:8080/api/movies/${showData.movieId}`);
        const movieData = await movieRes.json();

        // 4. Fetch All Seats to map IDs to Row/Number labels
        const seatsRes = await fetch(`http://localhost:8080/api/theater/seats`);
        const allSeats = await seatsRes.json();
        
        // Map the booked seat IDs to actual labels (e.g., A1, B4)
        const bookedSeatIds = currentBooking.bookedSeats.map(bs => bs.seatId);
        const bookedSeatDetails = allSeats.filter(s => bookedSeatIds.includes(s.seatId));
        const seatLabels = bookedSeatDetails.map(s => `${s.rowLabel}${s.seatNumber}`).join(', ');

        setTicketData({
          booking: currentBooking,
          show: showData,
          movie: movieData,
          seatLabels: seatLabels
        });

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
  }, [bookingId, navigate]);

  // Handle Ticket Download (Using Browser Print to PDF)
  const handleDownload = () => {
    window.print();
  };

  // Handle Email Trigger (Mailto link with details)
  const handleEmail = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const subject = encodeURIComponent(`Your Sky Lite Cinema Ticket - ${ticketData.movie.title}`);
    const body = encodeURIComponent(`
Hi ${user.name},

Here are your booking details for Sky Lite Cinema:
Movie: ${ticketData.movie.title}
Date & Time: ${ticketData.show.showDate} at ${ticketData.show.startTime.substring(0, 5)}
Screen: ${ticketData.show.hallName || "Main Screen"}
Seats: ${ticketData.seatLabels}
Booking ID: #CNE-${ticketData.booking.bookingId}

Enjoy the movie!
    `);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0e0e0f] flex items-center justify-center text-white"><span className="material-symbols-outlined animate-spin text-4xl text-[#e50914]">progress_activity</span></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0e0e0f] flex flex-col items-center justify-center text-white">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h1 className="text-2xl font-bold mb-6">{error}</h1>
        <Link to="/movies" className="bg-white/10 px-6 py-3 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-white/20 transition-colors">Back to Movies</Link>
      </div>
    );
  }

  const { movie, show, booking, seatLabels } = ticketData;

  return (
    <div className="bg-[#131314] text-white font-body selection:bg-[#e9c349] selection:text-black min-h-screen pt-32 pb-16 px-6 flex flex-col items-center">
      
      {/* Print-specific styles: Hides UI elements so only the ticket prints */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print-hidden { display: none !important; }
          .ticket-container { box-shadow: none !important; border: 2px solid #ccc !important; margin: 0 !important; width: 100% !important; max-width: 600px !important; page-break-inside: avoid; }
          .ticket-image-container { background: #000 !important; }
        }
      `}</style>
      
      {/* Success Header (Hidden in Print) */}
      <section className="max-w-xl w-full text-center space-y-6 mb-12 print-hidden animate-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
        </div>

        <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-headline font-black text-white uppercase tracking-tight">Confirmed</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Your seats have been reserved successfully.</p>
        </div>
      </section>

      {/* Ticket Pass Container */}
      <main className="max-w-2xl w-full ticket-container animate-in fade-in zoom-in-95 duration-700 delay-200">
        <div className="bg-[#1c1c1e] rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
            
            {/* Ticket Header Image */}
            <div className="h-48 md:h-56 w-full relative ticket-image-container bg-black">
                <img 
                    className="w-full h-full object-cover opacity-40 mix-blend-luminosity" 
                    alt={movie.title} 
                    src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop"} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 p-8 pb-6">
                    <div className="inline-block px-3 py-1 mb-3 bg-[#e50914] text-white rounded font-bold text-[10px] tracking-widest uppercase">
                       Admit {booking.bookedSeats.length}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-headline font-black text-white uppercase tracking-tight drop-shadow-lg">
                      {movie.title}
                    </h2>
                </div>
            </div>

            {/* Ticket Details */}
            <div className="p-8 md:p-10 grid grid-cols-2 gap-y-8 gap-x-10 border-b border-white/5 bg-[#1a1a1c]">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Date & Time</p>
                <p className="text-sm md:text-base font-bold text-white uppercase">{show.showDate} • {show.startTime.substring(0, 5)}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Screen</p>
                <p className="text-sm md:text-base font-bold text-white uppercase">{show.hallName || "Main Screen"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Seats</p>
                <p className="text-sm md:text-base font-black text-[#e50914] uppercase tracking-wider">{seatLabels}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Booking ID</p>
                <p className="text-sm md:text-base font-bold text-white uppercase">#CNE-{booking.bookingId}</p>
              </div>
            </div>

            {/* QR Code & Actions */}
            <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-[#151516]">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-xl">
                    {/* Dynamic Real QR Code generation via free API */}
                    <img 
                        className="w-32 h-32 md:w-36 md:h-36" 
                        alt="Booking QR Code" 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SKYLITE-${booking.bookingId}`} 
                    />
                </div>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Scan at entryway</p>
              </div>
              
              <div className="flex flex-col gap-4 w-full md:w-auto flex-1 max-w-[250px] print-hidden">
                <button 
                  onClick={handleDownload}
                  className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Download PDF
                </button>
                <button 
                  onClick={handleEmail}
                  className="w-full py-4 bg-[#1e1e20] hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                    Email Ticket
                </button>
              </div>
            </div>
        </div>
      </main>

      {/* Return Home (Hidden in Print) */}
      <footer className="mt-12 text-center print-hidden">
        <Link to="/" className="text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Return to Home
        </Link>
      </footer>
    </div>
  );
}