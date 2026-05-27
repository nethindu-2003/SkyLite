import { useState, useEffect } from 'react';

export default function AdminSeatLayout() {
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [message, setMessage] = useState(null);

 // Grid Dimensions State
 const [gridConfig, setGridConfig] = useState({ rows: 12, cols: 12 });

 // Layout State: Object mapping "rowIndex-colIndex" to seat type ('NORMAL', 'VIP', 'EMPTY')
 const [layout, setLayout] = useState({});

 // Convert number to Alphabet (0 -> A, 1 -> B)
 const numToLetter = (num) => String.fromCharCode(65 + num);
 // Convert Alphabet to number (A -> 0, B -> 1)
 const letterToNum = (letter) => letter.charCodeAt(0) - 65;

 // 1. Fetch Existing Layout on Load
 useEffect(() => {
 const fetchExistingLayout = async () => {
 try {
 const response = await fetch('http://localhost:8080/api/theater/seats');
 if (response.ok) {
 const seats = await response.json();

 if (seats.length > 0) {
 let maxRow = 0;
 let maxCol = 0;
 const newLayout = {};

 seats.forEach(seat => {
 const rIdx = letterToNum(seat.rowLabel);
 // Backend seat_number is 1-indexed, so we subtract 1 for 0-indexed grid
 const cIdx = seat.seatNumber - 1;

 if (rIdx > maxRow) maxRow = rIdx;
 if (cIdx > maxCol) maxCol = cIdx;

 newLayout[`${rIdx}-${cIdx}`] = seat.seatType.toUpperCase();
 });

 // Set dimensions based on existing data (+1 because indices are 0-based)
 setGridConfig({ rows: maxRow + 1, cols: maxCol + 1 });
 setLayout(newLayout);
 } else {
 // Initialize blank grid if database is empty
 initializeGrid(12, 12);
 }
 }
 } catch (err) {
 console.error("Failed to fetch seats:", err);
 } finally {
 setIsLoading(false);
 }
 };

 fetchExistingLayout();
 }, []);

 // Initialize a default grid
 const initializeGrid = (rows, cols) => {
 const newLayout = {};
 for (let r = 0; r < rows; r++) {
 for (let c = 0; c < cols; c++) {
 newLayout[`${r}-${c}`] = 'NORMAL';
 }
 }
 setLayout(newLayout);
 };

 // Handle Dimension Changes
 const handleDimensionChange = (e) => {
 const { name, value } = e.target;
 const val = parseInt(value, 10) || 1;
 const newConfig = { ...gridConfig, [name]: val > 26 ? 26 : val }; // Max 26 rows (A-Z)
 setGridConfig(newConfig);

 // Preserve existing layout, just add missing cells as Normal
 const newLayout = { ...layout };
 for (let r = 0; r < newConfig.rows; r++) {
 for (let c = 0; c < newConfig.cols; c++) {
 if (!newLayout[`${r}-${c}`]) {
 newLayout[`${r}-${c}`] = 'NORMAL';
 }
 }
 }
 setLayout(newLayout);
 };

 // Cycle cell state: NORMAL -> VIP -> EMPTY -> NORMAL
 const toggleSeat = (r, c) => {
 const key = `${r}-${c}`;
 setLayout(prev => {
 const currentState = prev[key] || 'NORMAL';
 let nextState;
 if (currentState === 'NORMAL') nextState = 'VIP';
 else if (currentState === 'VIP') nextState = 'EMPTY';
 else nextState = 'NORMAL';

 return { ...prev, [key]: nextState };
 });
 };

 // 2. Save Layout to Database
 const handleSaveLayout = async () => {
 setIsSaving(true);
 setMessage(null);
 const token = localStorage.getItem('token');

 // Transform grid state into flat array of Seat objects matching your DB schema
 const payload = [];

 for (let r = 0; r < gridConfig.rows; r++) {
 for (let c = 0; c < gridConfig.cols; c++) {
 const state = layout[`${r}-${c}`];
 if (state !== 'EMPTY') {
 payload.push({
 rowLabel: numToLetter(r),
 seatNumber: c + 1, // DB uses 1-based indexing for physical seat numbers
 seatType: state === 'VIP' ? 'VIP' : 'Normal'
 });
 }
 }
 }

 try {
 // Assuming you have a backend endpoint to bulk save/overwrite the layout
 // POST /api/theater/seats/layout
 const response = await fetch('http://localhost:8080/api/theater/seats/layout', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(payload)
 });

 if (!response.ok) throw new Error('Failed to save layout. Ensure bulk save endpoint is configured.');

 setMessage({ type: 'success', text: `Layout saved successfully! (${payload.length} active seats)` });
 } catch (err) {
 setMessage({ type: 'error', text: err.message });
 } finally {
 setIsSaving(false);
 }
 };

 if (isLoading) {
 return <div className="p-10 flex justify-center"><span className="material-symbols-outlined animate-spin text-[#e50914] text-4xl">progress_activity</span></div>;
 }

 return (
 <div className="p-6 lg:p-10 font-body">

 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
 <div>
 <h1 className="text-3xl font-headline font-black text-white tracking-tight">Seat Layout Builder</h1>
 <p className="text-zinc-500 text-sm mt-1">Configure physical seating arrangement for the Main Screen.</p>
 </div>

 <div className="flex gap-4 bg-[#18181b] p-2 border border-white/5 rounded-2xl">
 <div className="flex items-center gap-3 px-4">
 <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Rows</label>
 <input type="number" name="rows" value={gridConfig.rows} onChange={handleDimensionChange} min="1" max="26" className="w-16 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white text-center outline-none" />
 </div>
 <div className="flex items-center gap-3 px-4 border-l border-white/5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Columns</label>
 <input type="number" name="cols" value={gridConfig.cols} onChange={handleDimensionChange} min="1" max="40" className="w-16 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white text-center outline-none" />
 </div>
 </div>
 </div>

 {message && (
 <div className={`mb-8 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
 <span className="material-symbols-outlined text-[18px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
 {message.text}
 </div>
 )}

 {/* Main Builder Area */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

 {/* Interactive Grid */}
 <div className="lg:col-span-3 bg-[#18181b] border border-white/5 rounded-3xl p-8 shadow-2xl overflow-x-auto">

 {/* Screen Visual Indicator */}
 <div className="w-full max-w-2xl mx-auto mb-16 relative pt-4">
 <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.1)]"></div>
 <div className="h-8 w-full bg-gradient-to-b from-white/10 to-transparent opacity-30 transform perspective-[100px] rotateX-12"></div>
 <p className="text-center mt-2 text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">STAGE / SCREEN</p>
 </div>

 <div className="flex flex-col gap-3 min-w-max mx-auto pb-10">
 {Array.from({ length: gridConfig.rows }).map((_, rIdx) => {
 const rowLetter = numToLetter(rIdx);
 return (
 <div key={`row-${rIdx}`} className="flex items-center gap-4">
 {/* Row Label Left */}
 <span className="w-8 text-center text-xs font-bold text-zinc-600">{rowLetter}</span>

 <div className="flex gap-2">
 {Array.from({ length: gridConfig.cols }).map((_, cIdx) => {
 const state = layout[`${rIdx}-${cIdx}`] || 'NORMAL';
 const seatNum = cIdx + 1; // Physical col index

 // Determine Styles based on cell state
 let cellClass = "h-10 transition-all duration-200 rounded-lg flex items-center justify-center cursor-pointer select-none text-[10px] font-bold ";

 if (state === 'NORMAL') {
 cellClass += "w-10 bg-[#252528] border border-white/10 text-zinc-400 hover:border-white/50 hover:bg-[#303035]";
 } else if (state === 'VIP') {
 cellClass += "w-16 bg-gradient-to-b from-[#e9c349]/20 to-[#e9c349]/5 border border-[#e9c349] text-[#e9c349] shadow-[0_0_15px_rgba(233,195,73,0.1)]";
 } else if (state === 'EMPTY') {
 cellClass += "w-10 border border-dashed border-white/10 bg-transparent text-transparent hover:bg-white/5";
 }

 return (
 <div
 key={`cell-${rIdx}-${cIdx}`}
 onClick={() => toggleSeat(rIdx, cIdx)}
 className={cellClass}
 title={`Row ${rowLetter}, Col ${seatNum}`}
 >
 {state === 'EMPTY' ? '+' : seatNum}
 </div>
 );
 })}
 </div>

 {/* Row Label Right */}
 <span className="w-8 text-center text-xs font-bold text-zinc-600">{rowLetter}</span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Sidebar Controls */}
 <div className="space-y-6">

 <div className="bg-[#18181b] border border-white/5 rounded-3xl p-8 shadow-2xl">
 <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-4 mb-6">Instructions</h3>
 <ul className="space-y-4 text-xs text-zinc-400 leading-relaxed">
 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[16px] text-zinc-600">pan_tool_alt</span> Click any seat to cycle its type.</li>
 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[16px] text-zinc-600">view_column</span> Create aisles by changing seats to 'Empty'. The column numbers will naturally skip forming the gap.</li>
 <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[16px] text-[#e9c349]">star</span> VIP "Box" seats automatically render wider to denote dual-capacity.</li>
 </ul>
 </div>

 <div className="bg-[#18181b] border border-white/5 rounded-3xl p-8 shadow-2xl">
 <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-4 mb-6">Legend</h3>

 <div className="space-y-4">
 <div className="flex items-center gap-4">
 <div className="w-8 h-8 rounded bg-[#252528] border border-white/10"></div>
 <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Standard Seat</span>
 </div>
 <div className="flex items-center gap-4">
 <div className="w-12 h-8 rounded bg-[#e9c349]/10 border border-[#e9c349]"></div>
 <span className="text-xs text-[#e9c349] font-bold uppercase tracking-widest">VIP Box</span>
 </div>
 <div className="flex items-center gap-4">
 <div className="w-8 h-8 rounded border border-dashed border-white/20 flex items-center justify-center"><span className="text-zinc-600 text-xs">+</span></div>
 <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Empty / Aisle</span>
 </div>
 </div>

 <div className="pt-8 mt-8 border-t border-white/5">
 <button
 disabled={isSaving}
 onClick={handleSaveLayout}
 className="w-full bg-[#e50914] hover:bg-[#c0000c] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(229,9,20,0.3)]"
 >
 {isSaving ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">save</span>}
 Publish Layout
 </button>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
}