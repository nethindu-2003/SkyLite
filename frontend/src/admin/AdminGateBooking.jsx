import { useState, useEffect, useMemo } from 'react';

export default function AdminGateBooking() {
 // Global Data State
 const [movies, setMovies] = useState([]);
 const [shows, setShows] = useState([]);
 const [config, setConfig] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);

 // POS Flow State
 const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
 const [activeStep, setActiveStep] = useState('select_show'); // 'select_show', 'select_seats', 'checkout', 'success'

 // Transaction State
 const [selectedShow, setSelectedShow] = useState(null);
 const [selectedMovie, setSelectedMovie] = useState(null);
 const [seats, setSeats] = useState([]);
 const [bookedSeatIds, setBookedSeatIds] = useState([]);
 const [selectedSeats, setSelectedSeats] = useState([]);
 const [isProcessing, setIsProcessing] = useState(false);
 const [lastBookingId, setLastBookingId] = useState(null);

 // 1. Initial Data Fetch (Movies, Shows, Config)
 useEffect(() => {
 const fetchInitialData = async () => {
 setIsLoading(true);
 try {
 const [moviesRes, showsRes, configRes] = await Promise.all([
 fetch('http://localhost:8080/api/movies/status/now_showing'),
 fetch('http://localhost:8080/api/theater/shows'), // Assuming fetching all active shows
 fetch('http://localhost:8080/api/config')
 ]);

 if (!moviesRes.ok || !showsRes.ok || !configRes.ok) throw new Error("Failed to load POS data.");

 setMovies(await moviesRes.json());
 setShows(await showsRes.json());
 setConfig(await configRes.json());
 } catch (err) {
 setError(err.message);
 } finally {
 setIsLoading(false);
 }
 };
 fetchInitialData();
 }, []);

 // 2. Filter & Group Shows for Selected Date
 const moviesWithShows = useMemo(() => {
 const showsOnDate = shows.filter(s => s.showDate === selectedDate);

 return movies.map(movie => {
 return {
 ...movie,
 dailyShows: showsOnDate
 .filter(s => s.movieId === movie.movieId)
 .sort((a, b) => a.startTime.localeCompare(b.startTime))
 };
 }).filter(m => m.dailyShows.length > 0); // Only show movies that have shows today
 }, [movies, shows, selectedDate]);

 // Check if a showtime is in the past
 const isPastShow = (showDate, startTime) => {
 const now = new Date();
 const showTime = new Date(`${showDate}T${startTime}`);
 return showTime < now;
 };

 // 3. Handle Show Selection & Fetch Seats
 const handleSelectShow = async (movie, show) => {
 setSelectedMovie(movie);
 setSelectedShow(show);
 setIsLoading(true);

 try {
 const [seatsRes, bookedRes] = await Promise.all([
 fetch('http://localhost:8080/api/theater/seats'),
 fetch(`http://localhost:8080/api/bookings/shows/${show.showId}/booked-seats`)
 ]);

 if (!seatsRes.ok) throw new Error("Failed to load seat layout.");

 setSeats(await seatsRes.json());
 setBookedSeatIds(await bookedRes.json() || []);
 setSelectedSeats([]);
 setActiveStep('select_seats');
 } catch (err) {
 alert(err.message);
 } finally {
 setIsLoading(false);
 }
 };

 // 4. Seat Grid Logic
 const groupedSeats = useMemo(() => {
 const groups = {};
 seats.forEach(seat => {
 if (!groups[seat.rowLabel]) groups[seat.rowLabel] = [];
 groups[seat.rowLabel].push(seat);
 });
 Object.keys(groups).forEach(row => groups[row].sort((a, b) => a.seatNumber - b.seatNumber));
 return groups;
 }, [seats]);

 const toggleSeat = (seat) => {
 if (bookedSeatIds.includes(seat.seatId)) return;
 setSelectedSeats(prev => {
 const exists = prev.find(s => s.seatId === seat.seatId);
 return exists ? prev.filter(s => s.seatId !== seat.seatId) : [...prev, seat];
 });
 };

 // Calculate Totals
 const totalAmount = useMemo(() => {
 if (!config) return 0;
 return selectedSeats.reduce((total, seat) => {
 return total + (seat.seatType === 'VIP' ? config.gateVipPrice : config.gateNormalPrice);
 }, 0);
 }, [selectedSeats, config]);

 // 5. Process Cash Transaction
 const handleCashTransaction = async () => {
 setIsProcessing(true);
 const token = localStorage.getItem('token');
 const user = JSON.parse(localStorage.getItem('user')); // Using Admin's ID as the issuer

 try {
 // Step A: Create Booking
 const bookingRes = await fetch('http://localhost:8080/api/bookings', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 body: JSON.stringify({
 userId: user.id, // Records which admin issued the ticket
 showId: selectedShow.showId,
 seatIds: selectedSeats.map(s => s.seatId),
 totalAmount: totalAmount
 })
 });

 if (!bookingRes.ok) {
 if (bookingRes.status === 409) throw new Error("Seat conflict. Please re-select seats.");
 throw new Error("Failed to create booking.");
 }

 const savedBooking = await bookingRes.json();

 // Step B: Process Payment (Tagged as CASH for revenue separation)
 const paymentRes = await fetch('http://localhost:8080/api/payments/process', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 body: JSON.stringify({
 bookingId: savedBooking.bookingId,
 amount: totalAmount,
 paymentMethod: 'CASH', // Critical for separating physical vs online revenue
 cardNumber: 'GATE-SALES',
 expiryDate: '12/99',
 cvv: '000'
 })
 });

 if (!paymentRes.ok) throw new Error("Failed to log payment transaction.");

 setLastBookingId(savedBooking.bookingId);
 setActiveStep('success');

 } catch (err) {
 alert(err.message);
 // If conflict, refresh booked seats
 const bookedRes = await fetch(`http://localhost:8080/api/bookings/shows/${selectedShow.showId}/booked-seats`);
 if (bookedRes.ok) setBookedSeatIds(await bookedRes.json());
 } finally {
 setIsProcessing(false);
 }
 };

 // Reset POS for next customer
 const resetPOS = () => {
 setSelectedShow(null);
 setSelectedMovie(null);
 setSelectedSeats([]);
 setActiveStep('select_show');
 };

 if (isLoading && activeStep === 'select_show') {
 return <div className="p-10 flex justify-center"><span className="material-symbols-outlined animate-spin text-[#e50914] text-4xl">progress_activity</span></div>;
 }

 return (
 <div className="p-6 lg:p-10 font-body flex flex-col h-[calc(100vh-80px)]">

 {/* Header & Date Picker */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
 <div>
 <h1 className="text-3xl font-headline font-black text-white tracking-tight">Gate Ticketing (POS)</h1>
 <p className="text-zinc-500 text-sm mt-1">Issue physical tickets and process cash payments.</p>
 </div>

 {activeStep === 'select_show' && (
 <div className="bg-[#18181b] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
 <span className="material-symbols-outlined text-zinc-500">calendar_month</span>
 <input
 type="date"
 value={selectedDate}
 onChange={(e) => setSelectedDate(e.target.value)}
 className="bg-transparent text-white outline-none text-sm font-bold uppercase tracking-widest [color-scheme:dark]"
 />
 </div>
 )}
 </div>

 {error && <div className="p-4 mb-6 bg-red-500/10 text-red-500 rounded-xl font-bold">{error}</div>}

 {/* --- STEP 1: SELECT MOVIE & SHOWTIME --- */}
 {activeStep === 'select_show' && (
 <div className="flex-1 overflow-y-auto no-scrollbar">
 {moviesWithShows.length === 0 ? (
 <div className="text-center py-20 bg-[#18181b] rounded-2xl border border-white/5">
 <span className="material-symbols-outlined text-5xl text-zinc-600 mb-4">event_busy</span>
 <h3 className="text-xl font-bold text-white mb-2">No Shows Scheduled</h3>
 <p className="text-zinc-500">There are no screenings scheduled for {selectedDate}.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
 {moviesWithShows.map(movie => (
 <div key={movie.movieId} className="bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col">
 <div className="h-32 relative">
 <img src={movie.posterUrl} className="w-full h-full object-cover opacity-50" alt="" />
 <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent"></div>
 <div className="absolute bottom-0 left-0 p-4">
 <h3 className="text-lg font-black text-white leading-tight line-clamp-1">{movie.title}</h3>
 <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{movie.duration} Mins</p>
 </div>
 </div>

 <div className="p-4 flex-1 flex flex-col gap-2">
 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Select Showtime</p>
 <div className="grid grid-cols-2 gap-2">
 {movie.dailyShows.map(show => {
 const isPast = isPastShow(show.showDate, show.startTime);
 return (
 <button
 key={show.showId}
 disabled={isPast}
 onClick={() => handleSelectShow(movie, show)}
 className={`py-3 rounded-lg text-sm font-bold tracking-widest flex flex-col items-center justify-center transition-colors border ${isPast
 ? 'bg-white/5 border-transparent text-zinc-600 cursor-not-allowed'
 : 'bg-[#252528] border-white/10 text-white hover:border-[#e50914] hover:bg-[#e50914]/10 '
 }`}
 >
 <span>{show.startTime.substring(0, 5)}</span>
 {isPast && <span className="text-[8px] text-red-500/50 uppercase mt-0.5">Ended</span>}
 </button>
 );
 })}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* --- STEP 2: SELECT SEATS --- */}
 {activeStep === 'select_seats' && (
 <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

 {/* Seating Grid */}
 <div className="flex-1 bg-[#18181b] border border-white/5 rounded-2xl p-6 flex flex-col overflow-hidden">
 <div className="flex justify-between items-center mb-6 shrink-0">
 <button onClick={resetPOS} className="text-zinc-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
 <span className="material-symbols-outlined text-[16px]">arrow_back</span> Change Show
 </button>
 <div className="text-right">
 <h2 className="text-lg font-black text-white">{selectedMovie?.title}</h2>
 <p className="text-[#e50914] text-[10px] font-bold uppercase tracking-widest">{selectedShow?.startTime.substring(0, 5)} • {selectedShow?.hallName}</p>
 </div>
 </div>

 <div className="flex-1 overflow-auto no-scrollbar flex flex-col items-center pb-10">
 <div className="w-full max-w-md h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full mb-10"></div>

 {isLoading ? (
 <div className="flex-1 flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-[#e50914] text-4xl">progress_activity</span></div>
 ) : (
 <div className="flex flex-col gap-3 min-w-max mx-auto">
 {Object.keys(groupedSeats).sort().map((rowLabel) => (
 <div key={rowLabel} className="flex gap-3 items-center">
 <span className="w-4 text-center text-[10px] font-bold text-zinc-600">{rowLabel}</span>
 <div className="flex gap-1.5">
 {groupedSeats[rowLabel].map((seat) => {
 const isBooked = bookedSeatIds.includes(seat.seatId);
 const isSelected = selectedSeats.some(s => s.seatId === seat.seatId);
 const isVIP = seat.seatType === 'VIP';

 let classes = "w-8 h-9 rounded flex items-center justify-center text-[9px] font-bold transition-all border ";
 if (isBooked) classes += "bg-white/5 border-transparent text-zinc-700 cursor-not-allowed";
 else if (isSelected) classes += "bg-[#e50914] border-[#e50914] text-white scale-110 shadow-lg";
 else if (isVIP) classes += "bg-[#252528] border-[#e9c349]/50 text-[#e9c349] hover:bg-[#e9c349]/20";
 else classes += "bg-[#252528] border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white";

 return (
 <button key={seat.seatId} disabled={isBooked} onClick={() => toggleSeat(seat)} className={classes}>
 {seat.seatNumber}
 </button>
 );
 })}
 </div>
 <span className="w-4 text-center text-[10px] font-bold text-zinc-600">{rowLabel}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* POS Cart Sidebar */}
 <div className="w-full lg:w-[350px] bg-[#18181b] border border-white/5 rounded-2xl p-6 flex flex-col shrink-0">
 <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-4 mb-4">Cart Summary</h3>

 <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-4">
 {selectedSeats.length === 0 ? (
 <p className="text-zinc-600 text-xs italic text-center mt-10">Select seats to build order.</p>
 ) : (
 selectedSeats.map(seat => (
 <div key={seat.seatId} className="flex justify-between items-center bg-[#252528] p-3 rounded-lg border border-white/5">
 <div>
 <p className="text-white font-black text-sm">{seat.rowLabel}{seat.seatNumber}</p>
 <p className={`text-[8px] font-bold uppercase tracking-widest ${seat.seatType === 'VIP' ? 'text-[#e9c349]' : 'text-zinc-500'}`}>{seat.seatType}</p>
 </div>
 <p className="text-white text-xs font-bold">
 {config ? (seat.seatType === 'VIP' ? config.gateVipPrice : config.gateNormalPrice).toFixed(2) : '...'}
 </p>
 </div>
 ))
 )}
 </div>

 <div className="border-t border-white/5 pt-4">
 <div className="flex justify-between items-end mb-6">
 <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Total Due</p>
 <p className="text-3xl font-headline font-black text-white">{totalAmount.toFixed(2)} <span className="text-sm text-zinc-500">LKR</span></p>
 </div>
 <button
 disabled={selectedSeats.length === 0}
 onClick={() => setActiveStep('checkout')}
 className="w-full bg-white text-black hover:bg-zinc-200 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50"
 >
 Proceed to Checkout
 </button>
 </div>
 </div>
 </div>
 )}

 {/* --- STEP 3: CASH CHECKOUT MODAL --- */}
 {activeStep === 'checkout' && (
 <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
 <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
 <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
 <span className="material-symbols-outlined text-[#e9c349] text-3xl">payments</span> Cash Transaction
 </h2>

 <div className="bg-black/50 border border-white/5 rounded-xl p-6 mb-8 text-center">
 <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-2">Amount to Collect</p>
 <p className="text-5xl font-headline font-black text-[#e9c349]">{totalAmount.toFixed(2)}</p>
 <p className="text-zinc-500 text-sm font-bold mt-1">LKR</p>
 </div>

 <div className="flex flex-col gap-3">
 <button
 disabled={isProcessing}
 onClick={handleCashTransaction}
 className="w-full bg-gradient-to-r from-[#e50914] to-[#c0000c] text-white py-4.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isProcessing ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">receipt_long</span>}
 Confirm Cash Received
 </button>
 <button
 disabled={isProcessing}
 onClick={() => setActiveStep('select_seats')}
 className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}

 {/* --- STEP 4: SUCCESS --- */}
 {activeStep === 'success' && (
 <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
 <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
 <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
 </div>
 <h2 className="text-4xl font-headline font-black text-white uppercase tracking-tight mb-2">Payment Complete</h2>
 <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-8">Booking ID: #CNE-{lastBookingId}</p>

 <div className="flex gap-4">
 <button onClick={() => window.print()} className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2">
 <span className="material-symbols-outlined text-[18px]">print</span> Print Tickets
 </button>
 <button onClick={resetPOS} className="bg-[#e50914] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#c0000c] transition-colors flex items-center gap-2">
 <span className="material-symbols-outlined text-[18px]">add_circle</span> New Sale
 </button>
 </div>
 </div>
 )}

 </div>
 );
}