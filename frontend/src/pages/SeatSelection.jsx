import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';

export default function SeatSelection() {
 const location = useLocation();
 const navigate = useNavigate();
 const queryParams = new URLSearchParams(location.search);
 const showId = queryParams.get('showId');

 // State Management
 const [seats, setSeats] = useState([]);
 const [bookedSeatIds, setBookedSeatIds] = useState([]);
 const [selectedSeats, setSelectedSeats] = useState([]);
 const [config, setConfig] = useState(null);
 
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 if (!showId) {
 setError("No showtime selected.");
 setIsLoading(false);
 return;
 }

 const fetchSeatData = async () => {
 try {
 const [seatsRes, bookedRes, configRes] = await Promise.all([
 fetch('http://localhost:8080/api/theater/seats'),
 fetch(`http://localhost:8080/api/bookings/shows/${showId}/booked-seats`),
 fetch('http://localhost:8080/api/config')
 ]);

 if (!seatsRes.ok || !configRes.ok) throw new Error("Failed to load theater configuration.");

 const seatsData = await seatsRes.json();
 const bookedData = await bookedRes.json() || [];
 const configData = await configRes.json();

 setSeats(seatsData);
 setBookedSeatIds(bookedData);
 setConfig(configData);
 } catch (err) {
 console.error("Error fetching seat layout:", err);
 setError("Unable to load seating chart. Please try again.");
 } finally {
 setIsLoading(false);
 }
 };

 fetchSeatData();
 }, [showId]);

 // Group seats by row label
 const groupedSeats = useMemo(() => {
 const groups = {};
 seats.forEach(seat => {
 if (!groups[seat.rowLabel]) groups[seat.rowLabel] = [];
 groups[seat.rowLabel].push(seat);
 });
 
 Object.keys(groups).forEach(row => {
 groups[row].sort((a, b) => a.seatNumber - b.seatNumber);
 });
 
 return groups;
 }, [seats]);

 // Handle clicking a seat
 const toggleSeat = (seat) => {
 if (bookedSeatIds.includes(seat.seatId)) return;

 setSelectedSeats(prev => {
 const isAlreadySelected = prev.some(s => s.seatId === seat.seatId);
 if (isAlreadySelected) {
 return prev.filter(s => s.seatId !== seat.seatId);
 } else {
 return [...prev, seat];
 }
 });
 };

 // Calculate dynamic total price
 const totalAmount = useMemo(() => {
 if (!config) return 0;
 return selectedSeats.reduce((total, seat) => {
 const price = seat.seatType === 'VIP' 
 ? config.bookingVipPrice 
 : config.bookingNormalPrice;
 return total + price;
 }, 0);
 }, [selectedSeats, config]);

 // Proceed to Payment
 const handleConfirm = () => {
 if (selectedSeats.length === 0) return;
 
 navigate('/payment', { 
 state: { 
 showId, 
 seatIds: selectedSeats.map(s => s.seatId),
 totalAmount,
 selectedSeatLabels: selectedSeats.map(s => `${s.rowLabel}${s.seatNumber}`)
 } 
 });
 };

 if (isLoading) {
 return (
 <main className="bg-[#131314] min-h-screen flex items-center justify-center">
 <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">progress_activity</span>
 </main>
 );
 }

 if (error) {
 return (
 <main className="bg-[#131314] min-h-screen flex flex-col items-center justify-center px-6 text-center">
 <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
 <h1 className="text-3xl font-headline font-black text-white mb-6 uppercase tracking-tight">{error}</h1>
 <Link to="/" className="bg-white/10 px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-white/20 transition-all">
 Back to Catalog
 </Link>
 </main>
 );
 }

 return (
 <div className="bg-[#0e0e0f] text-white font-body min-h-screen flex selection:bg-primary-container selection:text-white">
 
 {/* Sidebar Navigation */}
 <aside className="fixed left-0 top-0 h-full z-50 flex flex-col items-center py-10 bg-[#131314] w-24 border-r border-white/[0.06] shadow-2xl">
 <div className="mb-12">
 <Link to="/" className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container to-red-600 flex items-center justify-center shadow-[0_4px_15px_rgba(229,9,20,0.3)] transition-transform">
 <span className="material-symbols-outlined text-white text-2xl">movie</span>
 </Link>
 </div>
 
 <nav className="flex flex-col gap-4 w-full">
 <div className="flex flex-col items-center justify-center py-6 text-[#e9c349]">
 <span className="material-symbols-outlined mb-1 text-2xl">event_seat</span>
 <span className="font-bold uppercase tracking-widest text-[8px]">Seats</span>
 </div>
 <div className="flex flex-col items-center justify-center py-6 text-zinc-600">
 <span className="material-symbols-outlined mb-1 text-2xl">payments</span>
 <span className="font-bold uppercase tracking-widest text-[8px]">Payment</span>
 </div>
 </nav>
 </aside>

 {/* Main Content */}
 <main className="flex-1 ml-24 flex flex-col lg:flex-row h-screen overflow-hidden">
 
 {/* Seating Area */}
 <section className="flex-1 flex flex-col items-center justify-start py-12 px-8 overflow-y-auto no-scrollbar relative bg-[#0e0e0f]">
 
 {/* Subtle Ambient Glow behind screen */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-primary-container/10 blur-[100px] pointer-events-none"></div>

 {/* Screen Area */}
 <div className="w-full max-w-2xl mb-20 relative pt-8">
 <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary-container to-transparent rounded-full shadow-[0_10px_35px_rgba(229,9,20,0.5)]"></div>
 <div className="h-8 w-full bg-gradient-to-b from-primary-container/10 to-transparent opacity-30 transform perspective-[100px] rotateX-12"></div>
 <p className="text-center mt-4 text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">Cinema Screen</p>
 </div>

 {/* Seat Grid */}
 <div className="flex flex-col gap-4 md:gap-5 pb-32">
 {Object.keys(groupedSeats).length === 0 ? (
 <p className="text-zinc-500 italic">No seat layout configured for this hall.</p>
 ) : (
 Object.keys(groupedSeats).sort().map((rowLabel) => (
 <div key={rowLabel} className="flex gap-4 md:gap-6 items-center">
 <span className="w-6 text-[10px] text-zinc-600 font-bold text-right">{rowLabel}</span>
 <div className="flex gap-2 md:gap-3">
 {groupedSeats[rowLabel].map((seat) => {
 const isBooked = bookedSeatIds.includes(seat.seatId);
 const isSelected = selectedSeats.some(s => s.seatId === seat.seatId);
 const isVIP = seat.seatType === 'VIP';

 // Determine classes based on status
 let seatClasses = "w-8 h-9 md:w-10 md:h-11 rounded-lg flex items-center justify-center transition-all duration-200 group relative border ";
 
 if (isBooked) {
 seatClasses += "bg-white/5 border-transparent opacity-20 cursor-not-allowed";
 } else if (isSelected) {
 seatClasses += "bg-gradient-to-tr from-primary-container to-red-500 border-transparent shadow-[0_0_15px_rgba(229,9,20,0.5)] transform scale-110";
 } else if (isVIP) {
 seatClasses += "bg-[#161618] border-[#e9c349]/30 hover:border-[#e9c349] hover:bg-[#e9c349]/10 cursor-pointer";
 } else {
 seatClasses += "bg-[#161618] border-white/[0.08] hover:border-white/40 hover:bg-white/[0.04] cursor-pointer";
 }

 return (
 <button 
 key={seat.seatId}
 disabled={isBooked}
 onClick={() => toggleSeat(seat)}
 className={seatClasses}
 title={isVIP ? "VIP Seat" : "Standard Seat"}
 >
 <span className={`text-[9px] font-bold ${isSelected ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
 {seat.seatNumber}
 </span>
 {/* VIP Star Indicator */}
 {isVIP && !isBooked && !isSelected && (
 <span className="absolute -top-1 -right-1 text-[#e9c349]">
 <span className="material-symbols-outlined text-[9px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
 </span>
 )}
 </button>
 );
 })}
 </div>
 <span className="w-6 text-[10px] text-zinc-600 font-bold text-left">{rowLabel}</span>
 </div>
 ))
 )}
 </div>

 {/* Fixed Legend at bottom of seating area */}
 <div className="fixed bottom-8 flex gap-6 md:gap-8 p-3.5 px-6 bg-[#131314]/90 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
 <div className="flex items-center gap-2">
 <div className="w-3.5 h-3.5 bg-[#161618] border border-white/[0.08] rounded"></div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Available</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3.5 h-3.5 bg-[#161618] border border-[#e9c349]/30 rounded flex items-center justify-center"><span className="material-symbols-outlined text-[#e9c349] text-[9px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span></div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-[#e9c349]">VIP</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3.5 h-3.5 bg-gradient-to-tr from-primary-container to-red-500 rounded shadow-[0_0_10px_rgba(229,9,20,0.4)]"></div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-white">Selected</span>
 </div>
 <div className="flex items-center gap-2 opacity-50">
 <div className="w-3.5 h-3.5 bg-white/10 rounded"></div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Booked</span>
 </div>
 </div>
 </section>

 {/* Sidebar Order Summary */}
 <aside className="w-full lg:max-w-[400px] bg-[#131314] p-8 lg:p-10 flex flex-col border-l border-white/[0.06] shadow-2xl z-20">
 <div className="mb-10 border-b border-white/[0.06] pb-6">
 <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight mb-1.5">Order Summary</h2>
 <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em]">Transaction ID: #PENDING</p>
 </div>

 <div className="space-y-8 flex-1">
 
 {/* Selected Seats Area */}
 <div className="space-y-3">
 <div className="flex justify-between items-center">
 <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-[0.2em]">Selected Seats ({selectedSeats.length})</p>
 </div>
 
 <div className="min-h-[120px] max-h-[200px] overflow-y-auto no-scrollbar pr-2 flex flex-wrap gap-2 content-start">
 {selectedSeats.length === 0 ? (
 <p className="text-zinc-600 text-xs italic">No seats selected yet. Click on the map to begin.</p>
 ) : (
 selectedSeats.map(seat => (
 <div key={seat.seatId} className={`px-4 py-2.5 bg-black/40 rounded-xl border flex flex-col gap-1 ${seat.seatType === 'VIP' ? 'border-[#e9c349]/30' : 'border-white/5'}`}>
 <span className="text-sm font-black text-white">{seat.rowLabel}{seat.seatNumber}</span>
 <span className={`text-[8px] font-bold uppercase tracking-widest ${seat.seatType === 'VIP' ? 'text-[#e9c349]' : 'text-zinc-500'}`}>
 {seat.seatType}
 </span>
 </div>
 ))
 )}
 </div>
 </div>

 {/* Pricing Breakdown */}
 <div className="space-y-3 pt-6 border-t border-white/[0.06]">
 <div className="flex justify-between text-xs text-zinc-400">
 <span>Standard Tickets</span>
 <span>{config ? `${config.bookingNormalPrice.toFixed(2)} LKR x ${selectedSeats.filter(s => s.seatType !== 'VIP').length}` : '...'}</span>
 </div>
 <div className="flex justify-between text-xs text-[#e9c349]">
 <span>VIP Tickets</span>
 <span>{config ? `${config.bookingVipPrice.toFixed(2)} LKR x ${selectedSeats.filter(s => s.seatType === 'VIP').length}` : '...'}</span>
 </div>
 </div>

 {/* Total Area */}
 <div className="pt-6 border-t border-white/[0.06] flex justify-between items-end">
 <div>
 <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-[0.2em] mb-1">Total Payable</p>
 <p className="text-3xl md:text-4xl font-headline font-black text-white">
 {config ? `${totalAmount.toFixed(2)}` : '0.00'} <span className="text-sm text-zinc-500 font-bold uppercase">LKR</span>
 </p>
 </div>
 </div>
 </div>

 <button 
 disabled={selectedSeats.length === 0}
 onClick={handleConfirm}
 className="w-full py-4.5 bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs text-center shadow-[0_4px_15px_rgba(229,9,20,0.3)] hover:shadow-[0_4px_25px_rgba(229,9,20,0.5)] transition-all mt-8 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
 >
 Proceed to Payment
 <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
 </button>
 </aside>
 </main>
 </div>
 );
}