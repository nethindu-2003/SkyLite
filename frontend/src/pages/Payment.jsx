import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Payment() {
 const location = useLocation();
 const navigate = useNavigate();
 
 // Extract data passed from SeatSelection.jsx
 const bookingData = location.state;

 // State Management
 const [movie, setMovie] = useState(null);
 const [show, setShow] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isProcessing, setIsProcessing] = useState(false);
 const [error, setError] = useState(null);

 // Form State
 // Removed card details state

 // 1. Initial Load & Hydration
 useEffect(() => {
 if (!bookingData || !bookingData.showId || !bookingData.seatIds) {
 navigate('/movies');
 return;
 }

 const fetchShowAndMovie = async () => {
 try {
 const showRes = await fetch(`http://localhost:8080/api/theater/shows/${bookingData.showId}`);
 if (!showRes.ok) throw new Error("Failed to load show details.");
 const showData = await showRes.json();
 setShow(showData);

 const movieRes = await fetch(`http://localhost:8080/api/movies/${showData.movieId}`);
 if (!movieRes.ok) throw new Error("Failed to load movie details.");
 const movieData = await movieRes.json();
 setMovie(movieData);

 } catch (err) {
 console.error(err);
 setError("Unable to load booking details. Please try again.");
 } finally {
 setIsLoading(false);
 }
 };

 fetchShowAndMovie();
 }, [bookingData, navigate]);

 // Removed formatting logic

 // 2. Transaction Processing Logic
 const handlePaymentSubmit = async (e) => {
 e.preventDefault();
 setError(null);
 setIsProcessing(true);

 const token = localStorage.getItem('token');
 const userStr = localStorage.getItem('user');
 
 if (!token || !userStr) {
 setError("Authentication required. Please log in to complete your booking.");
 setIsProcessing(false);
 return;
 }
 
 const user = JSON.parse(userStr);

 try {
 // --- STEP 1: CREATE BOOKING ---
 const bookingPayload = {
 userId: user.id,
 showId: bookingData.showId,
 seatIds: bookingData.seatIds,
 totalAmount: bookingData.totalAmount
 };

 const bookingRes = await fetch('http://localhost:8080/api/bookings', {
 method: 'POST',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(bookingPayload)
 });

 if (!bookingRes.ok) {
 if (bookingRes.status === 409) throw new Error("Seat conflict! One or more selected seats were just taken.");
 throw new Error("Failed to secure booking. Please try again.");
 }

 const savedBooking = await bookingRes.json();

 // --- STEP 2: PROCESS PAYMENT AUTOMATICALLY IN BACKGROUND ---
 // The user wants to skip the card details UI but still record the payment in the database.
 // We send a dummy successful card to the backend to create the payment record.
 const paymentPayload = {
 bookingId: savedBooking.bookingId,
 amount: bookingData.totalAmount,
 paymentMethod: 'CREDIT_CARD',
 cardNumber: '4111111111111111', // Dummy Visa card
 expiryDate: '12/30',
 cvv: '123'
 };

 const paymentRes = await fetch('http://localhost:8080/api/payments/process', {
 method: 'POST',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(paymentPayload)
 });

 if (!paymentRes.ok) {
 const errorText = await paymentRes.text();
 throw new Error(errorText || "Background payment recording failed.");
 }

 // SUCCESS! Navigate to homepage
 navigate('/');

 } catch (err) {
 console.error("Transaction Error:", err);
 setError(err.message);
 } finally {
 setIsProcessing(false);
 }
 };

 if (isLoading) {
 return (
 <main className="bg-[#131314] min-h-screen flex items-center justify-center">
 <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">progress_activity</span>
 </main>
 );
 }

 if (error && !movie) {
 return (
 <main className="bg-[#131314] min-h-screen flex flex-col items-center justify-center px-6 text-center">
 <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
 <h1 className="text-3xl font-headline font-black text-white mb-6 uppercase tracking-tight">{error}</h1>
 <Link to="/movies" className="bg-white/10 px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-white/20 transition-all">
 Back to Catalog
 </Link>
 </main>
 );
 }

 return (
 <div className="bg-[#131314] text-white selection:bg-primary-container selection:text-white min-h-screen pt-24 md:pt-28 pb-32">
 
 {/* Hero Header */}
 <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-10 text-center md:text-left">
 <h1 className="text-4xl md:text-5xl font-headline font-black text-white uppercase tracking-tight mb-2">Secure Checkout</h1>
 <p className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Secure Payment Protocol</p>
 </section>

 <main className="max-w-7xl mx-auto px-6 lg:px-12">
 {error && (
 <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in">
 <span className="material-symbols-outlined text-[20px]">gpp_bad</span>
 {error}
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
 
 {/* Left Column: Summary Panel */}
 <div className="lg:col-span-5 space-y-6">
 {/* Dynamic Movie Poster */}
 <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl border border-white/5 bg-[#0e0e0f]">
 <img 
 className="w-full h-full object-cover opacity-80" 
 alt={movie?.title} 
 src={movie?.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800"} 
 />
 <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/30 to-transparent"></div>
 <div className="absolute bottom-0 left-0 p-6 md:p-8">
 <h2 className="text-2xl md:text-3xl font-headline font-black text-white uppercase tracking-tight">
 {movie?.title}
 </h2>
 </div>
 </div>

 {/* Dynamic Booking Details */}
 <div className="bg-[#1c1c1e] p-8 md:p-10 rounded-3xl border border-white/5 space-y-8 shadow-xl">
 <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-4">Order Summary</h3>
 
 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-1">
 <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">Showtime</p>
 <p className="font-bold text-white text-sm">
 {show?.showDate} • {show?.startTime?.substring(0, 5)}
 </p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">Venue</p>
 <p className="font-bold text-white text-sm">{show?.hallName || "Main Screen"}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">Seats</p>
 <p className="font-black text-primary-container tracking-wider text-sm">
 {bookingData?.selectedSeatLabels?.join(', ')}
 </p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">Quantity</p>
 <p className="font-bold text-white text-sm">{bookingData?.seatIds?.length} Tickets</p>
 </div>
 </div>

 <div className="pt-6 border-t border-white/5 flex justify-between items-end">
 <div className="space-y-1">
 <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">Total Payable</p>
 <p className="text-3xl md:text-4xl font-headline font-black text-white">
 {bookingData?.totalAmount?.toFixed(2)} <span className="text-sm text-zinc-500 font-bold uppercase">LKR</span>
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Right Column: Confirmation Panel */}
 <div className="lg:col-span-7 flex flex-col justify-center h-full">
 <div className="bg-[#1c1c1e] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
 
 <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center mb-6">
 <span className="material-symbols-outlined text-4xl text-primary-container">check_circle</span>
 </div>
 
 <h3 className="text-2xl font-headline font-black text-white uppercase tracking-tight mb-2">Ready to Complete?</h3>
 <p className="text-zinc-500 text-sm mb-8 max-w-sm">Please review your ticket details carefully before confirming your booking. Tickets are non-refundable.</p>

 <button 
 onClick={handlePaymentSubmit}
 disabled={isProcessing}
 className="w-full max-w-sm bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4.5 rounded-xl font-headline font-black uppercase tracking-widest text-xs shadow-[0_4px_15px_rgba(229,9,20,0.3)] hover:shadow-[0_4px_25px_rgba(229,9,20,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3" 
 >
 {isProcessing ? (
 <>
 <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
 Processing Booking...
 </>
 ) : (
 <>
 <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
 Confirm Booking
 </>
 )}
 </button>
 </div>

 <button onClick={() => navigate(-1)} className="mt-6 flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-all text-[9px] tracking-widest font-bold uppercase w-full">
 <span className="material-symbols-outlined text-sm">arrow_back</span>
 Cancel & Return to Seats
 </button>
 </div>

 </div>
 </main>
 </div>
 );
}