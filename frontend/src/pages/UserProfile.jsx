import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function UserProfile() {
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'tickets'
 const [isLoading, setIsLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState(false);
 const [message, setMessage] = useState({ type: '', text: '' });

 // States
 const [userAuth, setUserAuth] = useState(null);
 const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
 const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
 const [bookings, setBookings] = useState({ upcoming: [], past: [] });
 const [seatMap, setSeatMap] = useState({});

 // Initial Data Fetch
 useEffect(() => {
 const token = localStorage.getItem('token');
 const userStr = localStorage.getItem('user');

 if (!token || !userStr) {
 navigate('/login');
 return;
 }

 const user = JSON.parse(userStr);
 setUserAuth({ token, id: user.id });

 const fetchDashboardData = async () => {
 try {
 // 1. Fetch User Profile
 const userRes = await fetch(`http://localhost:8080/api/users/${user.id}`, {
 headers: { 'Authorization': `Bearer ${token}` }
 });
 if (userRes.ok) {
 const uData = await userRes.json();
 setUserData({ name: uData.name || '', email: uData.email || '', phone: uData.phone || '' });
 }

 // 2. Fetch User Bookings
 const bookingsRes = await fetch(`http://localhost:8080/api/bookings/user/${user.id}`, {
 headers: { 'Authorization': `Bearer ${token}` }
 });
 
 if (bookingsRes.ok) {
 const bData = await bookingsRes.json();
 
 // Categorize Bookings (Assuming booking has a showDate or we compare bookingDate)
 // In a real app, you'd compare with the actual showDate. Using a simple mock split for demo based on status.
 const upcoming = bData.filter(b => b.status === 'confirmed');
 const past = bData.filter(b => b.status === 'cancelled' || b.status === 'completed' || b.status === 'expired');
 
 setBookings({ upcoming, past });
 }

 // 3. Fetch Theater Layout to map Seat IDs to Labels (A1, B3, etc.)
 const seatsRes = await fetch('http://localhost:8080/api/theater/seats');
 if (seatsRes.ok) {
   const seatsData = await seatsRes.json();
   const map = {};
   seatsData.forEach(seat => {
     map[seat.seatId] = `${seat.rowLabel}${seat.seatNumber}`;
   });
   setSeatMap(map);
 }
 } catch (err) {
 console.error("Error fetching profile data:", err);
 } finally {
 setIsLoading(false);
 }
 };

 fetchDashboardData();
 }, [navigate]);

  // --- PDF Ticket Generation ---
  const downloadPDF = async (ticket) => {
    try {
      // Create new jsPDF instance
      const doc = new jsPDF();
      
      // Theme colors
      const primaryColor = [229, 9, 20]; // #e50914 (Red)
      const textColor = [255, 255, 255];
      const darkBg = [19, 19, 20]; // #131314
      
      // Header Background
      doc.setFillColor(...darkBg);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Header Text
      doc.setTextColor(...primaryColor);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("SKYLITE CINEMA", 105, 20, { align: "center" });
      
      doc.setTextColor(...textColor);
      doc.setFontSize(12);
      doc.text("OFFICIAL MOVIE PASS", 105, 28, { align: "center" });

      // Ticket Information
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Booking Reference: CNE-${ticket.bookingId}`, 15, 55);
      
      // Main Body
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      autoTable(doc, {
        startY: 65,
        headStyles: { fillColor: primaryColor, textColor: 255 },
        bodyStyles: { textColor: 40 },
        head: [['Detail', 'Value']],
        body: [
          ['Movie Show ID', ticket.showId.toString()],
          ['Booking Status', ticket.status.toUpperCase()],
          ['Number of Seats', ticket.bookedSeats ? ticket.bookedSeats.length.toString() : '0'],
          ['Seat Numbers', ticket.bookedSeats ? ticket.bookedSeats.map(s => seatMap[s.seatId] || s.seatId).join(', ') : 'N/A'],
          ['Total Paid', `$${ticket.totalAmount ? ticket.totalAmount.toFixed(2) : '0.00'}`],
          ['Booking Date', new Date(ticket.bookingDate).toLocaleString()]
        ],
        theme: 'grid',
      });

      // Footer
      const finalY = doc.lastAutoTable.finalY || 150;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Present this digital pass at the cinema entrance.", 105, finalY + 20, { align: "center" });
      doc.text("Tickets are non-refundable. Please arrive 15 minutes before showtime.", 105, finalY + 28, { align: "center" });

      // Save
      doc.save(`Skylite_Ticket_CNE-${ticket.bookingId}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setMessage({ type: 'error', text: 'Could not generate ticket PDF.' });
    }
  };

 // --- Profile Update ---
 const handleProfileUpdate = async (e) => {
 e.preventDefault();
 setMessage({ type: '', text: '' });
 
 if (!userData.name.trim()) return setMessage({ type: 'error', text: 'Name is required.' });
 if (userData.phone && !/^\+?[\d\s-]{10,}$/.test(userData.phone)) return setMessage({ type: 'error', text: 'Invalid phone format.' });

 setActionLoading(true);
 try {
 const response = await fetch(`http://localhost:8080/api/users/${userAuth.id}`, {
 method: 'PUT',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${userAuth.token}` 
 },
 body: JSON.stringify({ name: userData.name, phone: userData.phone }) // Email omitted intentionally
 });

 if (!response.ok) throw new Error("Failed to update profile.");
 
 // Update LocalStorage
 const currentUserStr = localStorage.getItem('user');
 if (currentUserStr) {
 const u = JSON.parse(currentUserStr);
 u.name = userData.name;
 localStorage.setItem('user', JSON.stringify(u));
 window.dispatchEvent(new Event('user-updated'));
 }

 setMessage({ type: 'success', text: 'Profile updated successfully.' });
 } catch (err) {
 setMessage({ type: 'error', text: err.message });
 } finally {
 setActionLoading(false);
 }
 };

 // --- Password Update ---
 const passwordCriteria = {
 length: passwordData.newPassword.length >= 8,
 uppercase: /[A-Z]/.test(passwordData.newPassword),
 lowercase: /[a-z]/.test(passwordData.newPassword),
 number: /[0-9]/.test(passwordData.newPassword),
 special: /[@#$%^&+=!]/.test(passwordData.newPassword)
 };

 const handlePasswordUpdate = async (e) => {
 e.preventDefault();
 setMessage({ type: '', text: '' });

 if (!passwordData.currentPassword) return setMessage({ type: 'error', text: 'Current password required.' });
 const isValid = Object.values(passwordCriteria).every(Boolean);
 if (!isValid) return setMessage({ type: 'error', text: 'New password does not meet requirements.' });
 if (passwordData.newPassword !== passwordData.confirmPassword) return setMessage({ type: 'error', text: 'Passwords do not match.' });

 setActionLoading(true);
 try {
 const response = await fetch(`http://localhost:8080/api/users/${userAuth.id}/password`, {
 method: 'PUT',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${userAuth.token}` 
 },
 body: JSON.stringify({ 
 currentPassword: passwordData.currentPassword, 
 newPassword: passwordData.newPassword 
 })
 });

 if (!response.ok) {
 const errText = await response.text();
 throw new Error(errText || "Failed to update password.");
 }

 setMessage({ type: 'success', text: 'Password changed successfully.' });
 setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
 } catch (err) {
 setMessage({ type: 'error', text: err.message });
 } finally {
 setActionLoading(false);
 }
 };

 if (isLoading) {
 return <div className="min-h-screen bg-[#131314] flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-[#e50914] text-4xl">progress_activity</span></div>;
 }

 return (
 <main className="bg-[#131314] min-h-screen text-white w-full font-body">
 <style>{`
 .glass-card {
 background: rgba(30, 30, 32, 0.4);
 backdrop-filter: blur(24px);
 -webkit-backdrop-filter: blur(24px);
 border: 1px solid rgba(255, 255, 255, 0.08);
 }
 `}</style>

 <div className="w-full px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
 
 {/* Left Sidebar */}
 <aside className="lg:col-span-4 space-y-8">
 
 {/* User ID Card */}
 <div className="glass-card p-8 rounded-3xl text-center flex flex-col items-center border-t-4 border-t-[#e50914] shadow-2xl">
 <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#e50914] to-[#c0000c] flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(229,9,20,0.4)] border-4 border-[#131314]">
 <span className="font-headline font-black text-4xl text-white">
 {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
 </span>
 </div>
 <h1 className="text-2xl font-headline font-black tracking-tight">{userData.name}</h1>
 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">{userData.email}</p>
 <div className="mt-6 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
 Elite Member
 </div>
 </div>

 {/* Navigation Menu */}
 <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
 <button onClick={() => { setActiveTab('profile'); setMessage({}); }} className={`w-full flex items-center gap-4 px-8 py-5 text-sm font-bold uppercase tracking-widest transition-colors border-b border-white/5 ${activeTab === 'profile' ? 'bg-[#e50914] text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
 <span className="material-symbols-outlined text-[20px]">person</span> Profile Details
 </button>
 <button onClick={() => { setActiveTab('security'); setMessage({}); }} className={`w-full flex items-center gap-4 px-8 py-5 text-sm font-bold uppercase tracking-widest transition-colors border-b border-white/5 ${activeTab === 'security' ? 'bg-[#e50914] text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
 <span className="material-symbols-outlined text-[20px]">lock</span> Security
 </button>
 <button onClick={() => { setActiveTab('tickets'); setMessage({}); }} className={`w-full flex items-center gap-4 px-8 py-5 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'tickets' ? 'bg-[#e50914] text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
 <span className="material-symbols-outlined text-[20px]">confirmation_number</span> My Tickets
 </button>
 </div>
 </aside>

 {/* Right Content Area */}
 <section className="lg:col-span-8">
 <div className="glass-card p-8 md:p-12 rounded-3xl shadow-2xl min-h-[500px]">
 
 {/* Global Messages */}
 {message.text && (
 <div className={`mb-8 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
 <span className="material-symbols-outlined text-[18px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
 {message.text}
 </div>
 )}

 {/* TAB: PROFILE */}
 {activeTab === 'profile' && (
 <div className="animate-in fade-in duration-500">
 <div className="mb-10">
 <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">Profile Details</h2>
 <p className="text-zinc-500 text-sm">Update your personal information.</p>
 </div>
 
 <form onSubmit={handleProfileUpdate} className="space-y-6">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1">Full Name</label>
 <div className="relative group">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">person</span>
 <input className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-black/60 focus:border-[#e50914]/50 outline-none transition-all text-sm" id="name" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} type="text" required />
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1 flex justify-between">
 Email Address <span className="text-[#e50914]">Non-Editable</span>
 </label>
 <div className="relative">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">mail</span>
 <input className="w-full bg-black/20 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-zinc-500 outline-none text-sm cursor-not-allowed" value={userData.email} type="email" disabled />
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1">Phone Number</label>
 <div className="relative group">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">call</span>
 <input className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-black/60 focus:border-[#e50914]/50 outline-none transition-all text-sm" id="phone" value={userData.phone} onChange={(e) => setUserData({...userData, phone: e.target.value})} placeholder="+94 77 000 0000" type="tel" />
 </div>
 </div>

 <div className="pt-6">
 <button disabled={actionLoading} type="submit" className="w-full sm:w-auto bg-[#e50914] text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#c0000c] transition-colors shadow-lg disabled:opacity-50">
 {actionLoading ? 'Saving...' : 'Save Changes'}
 </button>
 </div>
 </form>
 </div>
 )}

 {/* TAB: SECURITY */}
 {activeTab === 'security' && (
 <div className="animate-in fade-in duration-500">
 <div className="mb-10">
 <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">Change Password</h2>
 <p className="text-zinc-500 text-sm">Ensure your account stays secure.</p>
 </div>
 
 <form onSubmit={handlePasswordUpdate} className="space-y-6">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1">Current Password</label>
 <div className="relative group">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">key</span>
 <input className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-black/60 focus:border-[#e50914]/50 outline-none transition-all text-sm" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} type="password" required />
 </div>
 </div>

 <div className="border-t border-white/5 pt-6">
 <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1">New Password</label>
 <div className="relative group mb-3">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">lock</span>
 <input className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-black/60 focus:border-[#e50914]/50 outline-none transition-all text-sm" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} type="password" required />
 </div>
 
 {/* Dynamic Checklist */}
 <div className="bg-black/20 rounded-xl p-4 border border-white/5 grid grid-cols-2 gap-2 text-[9px] tracking-widest uppercase font-bold mb-4">
 <div className={`flex items-center gap-2 ${passwordCriteria.length ? 'text-green-500' : 'text-zinc-600'}`}><span className="material-symbols-outlined text-[14px]">check_circle</span>8+ Chars</div>
 <div className={`flex items-center gap-2 ${passwordCriteria.uppercase ? 'text-green-500' : 'text-zinc-600'}`}><span className="material-symbols-outlined text-[14px]">check_circle</span>1 Uppercase</div>
 <div className={`flex items-center gap-2 ${passwordCriteria.lowercase ? 'text-green-500' : 'text-zinc-600'}`}><span className="material-symbols-outlined text-[14px]">check_circle</span>1 Lowercase</div>
 <div className={`flex items-center gap-2 ${passwordCriteria.number ? 'text-green-500' : 'text-zinc-600'}`}><span className="material-symbols-outlined text-[14px]">check_circle</span>1 Number</div>
 <div className={`flex items-center gap-2 col-span-2 ${passwordCriteria.special ? 'text-green-500' : 'text-zinc-600'}`}><span className="material-symbols-outlined text-[14px]">check_circle</span>1 Symbol (@, #, etc)</div>
 </div>

 <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1">Confirm New Password</label>
 <div className="relative group">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">lock_reset</span>
 <input className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-black/60 focus:border-[#e50914]/50 outline-none transition-all text-sm" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} type="password" required />
 </div>
 </div>

 <div className="pt-6">
 <button disabled={actionLoading} type="submit" className="w-full sm:w-auto bg-[#e9c349] text-black px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#d4ac31] transition-colors shadow-lg disabled:opacity-50">
 {actionLoading ? 'Updating...' : 'Update Password'}
 </button>
 </div>
 </form>
 </div>
 )}

 {/* TAB: TICKETS */}
 {activeTab === 'tickets' && (
 <div className="animate-in fade-in duration-500">
 <div className="mb-10 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
 <div>
 <h2 className="text-2xl md:text-3xl font-headline font-bold text-white uppercase tracking-wider mb-2">My Tickets</h2>
 <p className="text-zinc-500 text-sm">Access your digital passes.</p>
 </div>
 </div>

 {/* Upcoming */}
 <div className="mb-12">
 <h3 className="text-[#e50914] font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
 <span className="material-symbols-outlined text-[16px]">event_available</span> Upcoming Screenings
 </h3>
 
 <div className="grid grid-cols-1 gap-4">
 {bookings.upcoming.length === 0 ? (
 <p className="text-zinc-600 italic text-sm py-4 bg-black/20 rounded-xl px-6 border border-white/5">No upcoming tickets.</p>
 ) : (
 bookings.upcoming.map(ticket => (
 <button 
 onClick={() => downloadPDF(ticket)}
 key={ticket.bookingId}
 className="w-full text-left group bg-black/40 hover:bg-black/60 border border-white/10 hover:border-[#e50914]/50 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all duration-300"
 >
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/10 group-hover:bg-[#e50914]/10 group-hover:border-[#e50914]/30 transition-colors">
 <span className="material-symbols-outlined text-white">qr_code_scanner</span>
 </div>
 <div>
 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Order #CNE-{ticket.bookingId}</span>
 <h4 className="text-xl font-black text-white uppercase tracking-tight mt-1">Ticket Pass</h4>
 <p className="text-xs text-zinc-400 mt-1 font-bold uppercase tracking-wider">{ticket.bookedSeats?.length || 0} Seats • Confirmed</p>
 </div>
 </div>
 <div className="bg-[#e50914] text-white px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-transform shadow-lg">
 Get Ticket <span className="material-symbols-outlined text-[14px]">download</span>
 </div>
 </button>
 ))
 )}
 </div>
 </div>

 {/* History */}
 <div>
 <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
 <span className="material-symbols-outlined text-[16px]">history</span> Past & Expired
 </h3>
 
 <div className="grid grid-cols-1 gap-4">
 {bookings.past.length === 0 ? (
 <p className="text-zinc-600 italic text-sm py-4 bg-black/20 rounded-xl px-6 border border-white/5">No history available.</p>
 ) : (
 bookings.past.map(ticket => (
 <div key={ticket.bookingId} className="bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 opacity-60">
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
 <span className="material-symbols-outlined text-zinc-500">block</span>
 </div>
 <div>
 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Order #CNE-{ticket.bookingId}</span>
 <h4 className="text-xl font-black text-zinc-400 uppercase tracking-tight mt-1">Expired Pass</h4>
 <p className="text-xs text-zinc-500 mt-1 font-bold uppercase tracking-wider">Status: {ticket.status}</p>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}
 
 </div>
 </section>
 </div>
 </main>
 );
}