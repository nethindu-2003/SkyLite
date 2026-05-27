import { useState, useEffect } from 'react';

export default function AdminSettings() {
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [message, setMessage] = useState({ type: '', text: '' });

 const [formData, setFormData] = useState({
 cinemaName: '',
 cinemaAddress: '',
 contactEmail: '',
 contactPhone: '',
 bookingNormalPrice: 0,
 bookingVipPrice: 0,
 gateNormalPrice: 0,
 gateVipPrice: 0
 });

 // Fetch Current Configuration
 useEffect(() => {
 const fetchConfig = async () => {
 try {
 const response = await fetch('http://localhost:8080/api/config');
 if (!response.ok) throw new Error('Failed to load system configuration.');
 const data = await response.json();

 // Map backend snake_case or camelCase to our form state
 setFormData({
 cinemaName: data.cinemaName || '',
 cinemaAddress: data.cinemaAddress || '',
 contactEmail: data.contactEmail || '',
 contactPhone: data.contactPhone || '',
 bookingNormalPrice: data.bookingNormalPrice || 0,
 bookingVipPrice: data.bookingVipPrice || 0,
 gateNormalPrice: data.gateNormalPrice || 0,
 gateVipPrice: data.gateVipPrice || 0
 });
 } catch (err) {
 setMessage({ type: 'error', text: err.message });
 } finally {
 setIsLoading(false);
 }
 };

 fetchConfig();
 }, []);

 const handleChange = (e) => {
 const { name, value, type } = e.target;
 // Ensure number fields are parsed correctly, otherwise keep as string
 const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
 setFormData({ ...formData, [name]: parsedValue });
 };

 const handleSave = async (e) => {
 e.preventDefault();
 setIsSaving(true);
 setMessage({ type: '', text: '' });

 const token = localStorage.getItem('token');

 try {
 const response = await fetch('http://localhost:8080/api/config', {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(formData)
 });

 if (!response.ok) throw new Error('Failed to update system configuration.');

 setMessage({ type: 'success', text: 'Configuration updated successfully! Changes are now live.' });

 // Optional: Dispatch event so Navbar updates the Cinema Name instantly without reload
 window.dispatchEvent(new Event('config-updated'));

 } catch (err) {
 setMessage({ type: 'error', text: err.message });
 } finally {
 setIsSaving(false);
 // Auto-hide success message after 4 seconds
 setTimeout(() => setMessage({ type: '', text: '' }), 4000);
 }
 };

 if (isLoading) {
 return <div className="p-10 flex justify-center"><span className="material-symbols-outlined animate-spin text-[#e50914] text-4xl">progress_activity</span></div>;
 }

 return (
 <div className="p-6 lg:p-10 font-body">

 {/* Page Header */}
 <div className="mb-10">
 <h1 className="text-3xl font-headline font-black text-white tracking-tight uppercase">System Settings</h1>
 <p className="text-zinc-500 text-sm mt-1">Configure global cinema parameters, contact details, and pricing rules.</p>
 </div>

 {message.text && (
 <div className={`mb-8 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border animate-in fade-in ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
 <span className="material-symbols-outlined text-[20px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
 {message.text}
 </div>
 )}

 <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-2 gap-8">

 {/* Left Column: Cinema Identity */}
 <div className="bg-[#18181b] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl h-fit">
 <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
 <span className="material-symbols-outlined text-[#e9c349] text-2xl">storefront</span>
 <h2 className="text-xl font-headline font-bold text-white uppercase tracking-widest">Cinema Identity</h2>
 </div>

 <div className="space-y-6">
 <div>
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 pl-1">Brand Name</label>
 <div className="relative group">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white">movie</span>
 <input
 required name="cinemaName" value={formData.cinemaName} onChange={handleChange}
 className="w-full bg-[#202024] rounded-xl py-4 pl-12 pr-4 text-white font-bold outline-none border border-transparent focus:border-white/20 transition-all text-sm"
 />
 </div>
 </div>

 <div>
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 pl-1">Physical Address</label>
 <div className="relative group">
 <span className="material-symbols-outlined absolute left-4 top-5 text-zinc-500 transition-colors group-focus-within:text-white">location_on</span>
 <textarea
 required name="cinemaAddress" value={formData.cinemaAddress} onChange={handleChange} rows="3"
 className="w-full bg-[#202024] rounded-xl py-4 pl-12 pr-4 text-white outline-none border border-transparent focus:border-white/20 transition-all text-sm resize-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 pl-1">Support Email</label>
 <div className="relative group">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white">alternate_email</span>
 <input
 required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
 className="w-full bg-[#202024] rounded-xl py-4 pl-12 pr-4 text-white outline-none border border-transparent focus:border-white/20 transition-all text-sm"
 />
 </div>
 </div>
 <div>
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 pl-1">Contact Number</label>
 <div className="relative group">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white">call</span>
 <input
 required type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange}
 className="w-full bg-[#202024] rounded-xl py-4 pl-12 pr-4 text-white outline-none border border-transparent focus:border-white/20 transition-all text-sm"
 />
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Right Column: Pricing Engine */}
 <div className="space-y-8">
 <div className="bg-[#18181b] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
 <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
 <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-[#e50914] text-2xl">payments</span>
 <h2 className="text-xl font-headline font-bold text-white uppercase tracking-widest">Revenue & Pricing</h2>
 </div>
 <span className="px-3 py-1 bg-white/5 rounded text-[10px] font-bold tracking-widest uppercase text-zinc-400">LKR (Rs)</span>
 </div>

 <div className="space-y-8">

 {/* Online Booking Prices */}
 <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
 <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
 <span className="material-symbols-outlined text-[16px]">language</span> Online Booking Rates
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 pl-1">Standard Seat</label>
 <input
 required type="number" min="0" step="0.01" name="bookingNormalPrice" value={formData.bookingNormalPrice} onChange={handleChange}
 className="w-full bg-[#202024] rounded-xl py-3 px-4 text-white outline-none focus:ring-1 focus:ring-[#e50914]/50 font-mono text-sm"
 />
 </div>
 <div>
 <label className="block text-[10px] uppercase tracking-widest font-bold text-[#e9c349] mb-2 pl-1">VIP Box Seat</label>
 <input
 required type="number" min="0" step="0.01" name="bookingVipPrice" value={formData.bookingVipPrice} onChange={handleChange}
 className="w-full bg-[#202024] rounded-xl py-3 px-4 text-[#e9c349] font-bold outline-none focus:ring-1 focus:ring-[#e9c349]/50 font-mono text-sm border border-[#e9c349]/20"
 />
 </div>
 </div>
 </div>

 {/* Physical Gate Prices */}
 <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
 <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
 <span className="material-symbols-outlined text-[16px]">confirmation_number</span> Physical Gate Rates
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 pl-1">Standard Seat</label>
 <input
 required type="number" min="0" step="0.01" name="gateNormalPrice" value={formData.gateNormalPrice} onChange={handleChange}
 className="w-full bg-[#202024] rounded-xl py-3 px-4 text-white outline-none focus:ring-1 focus:ring-[#e50914]/50 font-mono text-sm"
 />
 </div>
 <div>
 <label className="block text-[10px] uppercase tracking-widest font-bold text-[#e9c349] mb-2 pl-1">VIP Box Seat</label>
 <input
 required type="number" min="0" step="0.01" name="gateVipPrice" value={formData.gateVipPrice} onChange={handleChange}
 className="w-full bg-[#202024] rounded-xl py-3 px-4 text-[#e9c349] font-bold outline-none focus:ring-1 focus:ring-[#e9c349]/50 font-mono text-sm border border-[#e9c349]/20"
 />
 </div>
 </div>
 </div>

 </div>
 </div>

 {/* Action Button */}
 <div className="bg-[#18181b] border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
 <p className="text-xs text-zinc-500 hidden sm:block">Double check values before saving.</p>
 <button
 disabled={isSaving}
 type="submit"
 className="w-full sm:w-auto bg-[#e50914] hover:bg-[#c0000c] text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(229,9,20,0.3)] flex justify-center items-center gap-2"
 >
 {isSaving ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
 Save Configuration
 </button>
 </div>
 </div>

 </form>
 </div>
 );
}