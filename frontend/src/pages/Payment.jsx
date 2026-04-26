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
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // 1. Initial Load & Hydration
  useEffect(() => {
    // If user refreshes the page and loses state, send them back
    if (!bookingData || !bookingData.showId || !bookingData.seatIds) {
      navigate('/movies');
      return;
    }

    const fetchShowAndMovie = async () => {
      try {
        // Fetch Show Details (Assuming your backend has a GET /shows/{id} endpoint)
        const showRes = await fetch(`http://localhost:8080/api/theater/shows/${bookingData.showId}`);
        if (!showRes.ok) throw new Error("Failed to load show details.");
        const showData = await showRes.json();
        setShow(showData);

        // Fetch Movie Details using the movieId from the show
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

  // Format Card Number input (add spaces)
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    if (formattedValue.length <= 19) setCardNumber(formattedValue); // 16 digits + 3 spaces
  };

  // Format Expiry input (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    if (value.length <= 5) setExpiry(value);
  };

  // 2. Transaction Processing Logic
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    // Get User Auth
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

      // --- STEP 2: PROCESS PAYMENT ---
      const paymentPayload = {
        bookingId: savedBooking.bookingId,
        amount: bookingData.totalAmount,
        paymentMethod: 'CREDIT_CARD',
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryDate: expiry,
        cvv: cvv
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
        throw new Error(errorText || "Payment failed. Card declined.");
      }

      // SUCCESS! Navigate to confirmation page
      navigate(`/booking-confirmation/${savedBooking.bookingId}`);

    } catch (err) {
      console.error("Transaction Error:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0e0e0f] flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-[#e50914] text-4xl">progress_activity</span></div>;
  }

  if (error && !movie) {
    return <div className="min-h-screen bg-[#0e0e0f] flex flex-col items-center justify-center text-white"><h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1><Link to="/movies" className="bg-white/10 px-6 py-2 rounded-xl">Back to Movies</Link></div>;
  }

  return (
    <div className="bg-[#131314] text-white selection:bg-[#e50914] min-h-screen pt-28 pb-32">
      <style>{`
        .glass-card {
           background: rgba(30, 30, 32, 0.6);
           backdrop-filter: blur(20px);
           -webkit-backdrop-filter: blur(20px);
           border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .cinematic-gradient {
           background: linear-gradient(to top, #131314 0%, rgba(19, 19, 20, 0.4) 50%, rgba(19, 19, 20, 0) 100%);
        }
      `}</style>

      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-headline font-black text-white uppercase tracking-tight mb-2">Checkout</h1>
        <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Secure Payment Protocol</p>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-12">
        {error && (
           <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in">
             <span className="material-symbols-outlined text-[20px]">gpp_bad</span>
             {error}
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Summary Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Dynamic Movie Poster */}
            <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl border border-white/5">
              <img 
                className="w-full h-full object-cover" 
                alt={movie?.title} 
                src={movie?.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800"} 
              />
              <div className="absolute inset-0 cinematic-gradient"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <h2 className="text-2xl md:text-3xl font-headline font-black text-white uppercase tracking-tight drop-shadow-lg">
                  {movie?.title}
                </h2>
              </div>
            </div>

            {/* Dynamic Booking Details */}
            <div className="glass-card p-8 md:p-10 rounded-2xl space-y-8 shadow-xl">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-white/5 pb-4">Order Summary</h3>
              
              <div className="grid grid-cols-2 gap-8">
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
                  <p className="font-black text-[#e50914] tracking-wider">
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
                  <p className="text-4xl font-headline font-black text-white">
                    {bookingData?.totalAmount?.toFixed(2)} <span className="text-lg text-zinc-500">LKR</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Secure Form Panel */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden">
              
              {/* Security Badge overlay */}
              <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-6xl">shield_lock</span>
              </div>

              <form className="space-y-8 relative z-10" onSubmit={handlePaymentSubmit}>
                
                {/* Cardholder Name */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">Cardholder Name</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">person</span>
                    <input 
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white placeholder:text-zinc-600 focus:bg-black/60 focus:border-[#e50914]/50 outline-none transition-all text-sm uppercase" 
                      placeholder="FULL NAME AS ON CARD" 
                      type="text" 
                    />
                  </div>
                </div>
                
                {/* Card Number */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">Card Number</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">credit_card</span>
                    <input 
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white placeholder:text-zinc-600 focus:bg-black/60 focus:border-[#e50914]/50 outline-none transition-all tracking-[0.2em] font-mono text-sm" 
                      placeholder="0000 0000 0000 0000" 
                      type="text" 
                    />
                  </div>
                </div>

                {/* Expiry & CVV Grid */}
                <div className="grid grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">Expiry Date</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">calendar_month</span>
                      <input 
                        required
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-black/60 focus:border-[#e50914]/50 outline-none transition-all font-mono text-sm" 
                        placeholder="MM/YY" 
                        type="text" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">CVV</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">pin</span>
                      <input 
                        required
                        maxLength="4"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-black/60 focus:border-[#e50914]/50 outline-none transition-all font-mono text-sm" 
                        placeholder="***" 
                        type="password" 
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button 
                    disabled={isProcessing || !cardNumber || !expiry || !cvv}
                    className="w-full bg-gradient-to-r from-[#e50914] to-[#c0000c] text-white py-5 rounded-xl font-headline font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(229,9,20,0.3)] hover:shadow-[0_10px_40px_rgba(229,9,20,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3" 
                    type="submit"
                  >
                    {isProcessing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">lock</span>
                        Confirm Payment
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Supported Networks */}
              <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-8 md:gap-12 opacity-40">
                <span className="font-bold text-[10px] uppercase tracking-[0.2em] italic flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">credit_card</span> VISA</span>
                <span className="font-bold text-[10px] uppercase tracking-[0.2em] italic flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">credit_card</span> MASTERCARD</span>
                <span className="font-bold text-[10px] uppercase tracking-[0.2em] italic flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">credit_score</span> AMEX</span>
              </div>
            </div>

            <button onClick={() => navigate(-1)} className="mt-8 flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] tracking-widest font-bold uppercase w-full">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Cancel & Return to Seats
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}