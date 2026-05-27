import { useState, useEffect } from 'react';

export default function AdminMovies() {
 // State Management
 const [movies, setMovies] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);

 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [modalMode, setModalMode] = useState('view'); // 'add', 'edit', 'view'
 const [isSaving, setIsSaving] = useState(false);

 // Form State
 const initialFormState = {
 title: '', description: '', genre: '', duration: '',
 language: 'English', releaseDate: '', posterUrl: '',
 trailerUrl: '', status: 'now_showing'
 };
 const [formData, setFormData] = useState(initialFormState);
 const [selectedMovieId, setSelectedMovieId] = useState(null);

 // Fetch Movies
 const fetchMovies = async () => {
 setIsLoading(true);
 try {
 const response = await fetch('http://localhost:8080/api/movies');
 if (!response.ok) throw new Error('Failed to fetch movies');
 const data = await response.json();
 setMovies(data);
 } catch (err) {
 setError(err.message);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchMovies();
 }, []);

 // Handlers
 const handleOpenAdd = () => {
 setFormData(initialFormState);
 setModalMode('add');
 setIsModalOpen(true);
 };

 const handleOpenEdit = (movie, e) => {
 e.stopPropagation(); // Prevent row click
 setFormData({
 title: movie.title || '',
 description: movie.description || '',
 genre: movie.genre || '',
 duration: movie.duration || '',
 language: movie.language || 'English',
 releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '', // Format for input type="date"
 posterUrl: movie.posterUrl || '',
 trailerUrl: movie.trailerUrl || '',
 status: movie.status || 'now_showing'
 });
 setSelectedMovieId(movie.movieId);
 setModalMode('edit');
 setIsModalOpen(true);
 };

 const handleRowClick = (movie) => {
 setFormData(movie);
 setSelectedMovieId(movie.movieId);
 setModalMode('view');
 setIsModalOpen(true);
 };

 const handleDelete = async (id, e) => {
 e.stopPropagation();
 if (!window.confirm("Are you sure you want to delete this movie?")) return;

 const token = localStorage.getItem('token');
 try {
 const response = await fetch(`http://localhost:8080/api/movies/${id}`, {
 method: 'DELETE',
 headers: { 'Authorization': `Bearer ${token}` }
 });
 if (!response.ok) throw new Error('Failed to delete movie');
 fetchMovies(); // Refresh list
 } catch (err) {
 alert(err.message);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setIsSaving(true);
 const token = localStorage.getItem('token');

 const url = modalMode === 'edit'
 ? `http://localhost:8080/api/movies/${selectedMovieId}`
 : 'http://localhost:8080/api/movies';

 const method = modalMode === 'edit' ? 'PUT' : 'POST';

 try {
 const response = await fetch(url, {
 method: method,
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(formData)
 });

 if (!response.ok) throw new Error(`Failed to ${modalMode} movie`);

 setIsModalOpen(false);
 fetchMovies(); // Refresh list
 } catch (err) {
 alert(err.message);
 } finally {
 setIsSaving(false);
 }
 };

 const handleChange = (e) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 return (
 <div className="p-6 lg:p-10 font-body">

 {/* Page Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
 <div>
 <h1 className="text-3xl font-headline font-black text-white tracking-tight uppercase">Movie Catalog</h1>
 <p className="text-zinc-500 text-sm mt-1">Manage and configure all cinematic assets in the system.</p>
 </div>
 <button
 onClick={handleOpenAdd}
 className="bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all shadow-[0_4px_15px_rgba(229,9,20,0.3)] hover:shadow-[0_4px_25px_rgba(229,9,20,0.5)] flex items-center gap-2 "
 >
 <span className="material-symbols-outlined text-[18px]">add</span> Add Movie
 </button>
 </div>

 {/* Data Table */}
 <div className="bg-[#1c1c1e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-black/40 border-b border-white/5 text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
 <th className="p-5 font-bold">Poster</th>
 <th className="p-5 font-bold">Title</th>
 <th className="p-5 font-bold">Status</th>
 <th className="p-5 font-bold">Duration</th>
 <th className="p-5 font-bold">Release Date</th>
 <th className="p-5 font-bold text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {isLoading ? (
 <tr>
 <td colSpan="6" className="p-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
 <span className="material-symbols-outlined animate-spin text-primary-container text-2xl mr-2 align-middle">progress_activity</span>
 Loading catalog...
 </td>
 </tr>
 ) : error ? (
 <tr><td colSpan="6" className="p-10 text-center text-red-400 font-bold text-sm">{error}</td></tr>
 ) : movies.length === 0 ? (
 <tr><td colSpan="6" className="p-10 text-center text-zinc-500 font-bold text-xs uppercase tracking-widest">No movies found. Add one to begin.</td></tr>
 ) : (
 movies.map((movie) => (
 <tr
 key={movie.movieId}
 onClick={() => handleRowClick(movie)}
 className="hover:bg-white/5 transition-colors cursor-pointer group"
 >
 <td className="p-4">
 <div className="w-12 h-16 rounded-lg bg-black border border-white/10 overflow-hidden shadow-md">
 {movie.posterUrl ? (
 <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-zinc-600 text-sm">movie</span></div>
 )}
 </div>
 </td>
 <td className="p-4">
 <p className="text-white font-bold text-sm group-hover:text-primary-container transition-colors">{movie.title}</p>
 <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{movie.genre}</p>
 </td>
 <td className="p-4">
 <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${movie.status === 'now_showing' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
 }`}>
 {movie.status === 'now_showing' ? 'Now Showing' : 'Upcoming'}
 </span>
 </td>
 <td className="p-4 text-zinc-400 text-sm font-semibold">{movie.duration} min</td>
 <td className="p-4 text-zinc-400 text-sm font-semibold">{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'TBA'}</td>
 <td className="p-4 text-right">
 <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
 <button onClick={(e) => handleOpenEdit(movie, e)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
 <span className="material-symbols-outlined text-[16px]">edit</span>
 </button>
 <button onClick={(e) => handleDelete(movie.movieId, e)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors">
 <span className="material-symbols-outlined text-[16px]">delete</span>
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modal Overlay */}
 {isModalOpen && (
 <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">

 {modalMode === 'view' ? (
 /* --- VIEW DETAILS MODAL --- */
 <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl w-full max-w-2xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300">
 <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-20 text-zinc-400 hover:text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>

 <div className="h-64 w-full relative">
 <img src={formData.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"} className="w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="Poster" />
 <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-[#1c1c1e]/40 to-transparent"></div>
 <div className="absolute bottom-0 left-0 p-8">
 <span className="bg-primary-container text-white px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest mb-3 inline-block">
 {formData.status === 'now_showing' ? 'Now Showing' : 'Upcoming'}
 </span>
 <h2 className="text-3xl md:text-4xl font-headline font-black text-white uppercase tracking-tight">{formData.title}</h2>
 </div>
 </div>

 <div className="p-8 grid grid-cols-2 gap-8 bg-[#1c1c1e]">
 <div className="col-span-2 text-zinc-400 text-sm leading-relaxed border-b border-white/5 pb-6">
 {formData.description || "No description available."}
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Genre</p>
 <p className="text-white text-sm font-bold">{formData.genre}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Duration</p>
 <p className="text-white text-sm font-bold">{formData.duration} Minutes</p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Language</p>
 <p className="text-white text-sm font-bold">{formData.language}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Release Date</p>
 <p className="text-white text-sm font-bold">{formData.releaseDate ? new Date(formData.releaseDate).toLocaleDateString() : 'TBA'}</p>
 </div>
 {formData.trailerUrl && (
 <div className="col-span-2 pt-4">
 <a href={formData.trailerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary-container hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
 <span className="material-symbols-outlined text-[18px]">play_circle</span> Watch Trailer
 </a>
 </div>
 )}
 </div>
 </div>
 ) : (
 /* --- ADD / EDIT MODAL --- */
 <div className="bg-[#1c1c1e] rounded-3xl w-full max-w-4xl p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 border border-white/10">
 <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>

 <div className="mb-8">
 <h2 className="font-headline text-2xl font-black text-white tracking-tight uppercase">
 {modalMode === 'add' ? 'Add New Cinematic Asset' : 'Edit Cinematic Asset'}
 </h2>
 <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">Configure movie metadata and visual assets for the catalog.</p>
 </div>

 <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

 {/* Left Column: Visual Assets */}
 <div className="lg:col-span-4 flex flex-col gap-4">
 <div>
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3 ml-1">Movie Poster URL</label>

 {/* Visual Poster Preview Area */}
 <div className="aspect-[2/3] w-full rounded-2xl border-2 border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group transition-colors hover:border-white/20">
 {formData.posterUrl ? (
 <>
 <img src={formData.posterUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
 <span className="text-white text-xs font-bold uppercase tracking-widest">Update URL Below</span>
 </div>
 </>
 ) : (
 <>
 <span className="material-symbols-outlined text-4xl text-zinc-700 mb-3">image</span>
 <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Poster Preview</p>
 <p className="text-zinc-600 text-[9px] uppercase tracking-wider font-bold">Enter URL below to load image</p>
 </>
 )}
 </div>
 </div>

 <input
 name="posterUrl"
 value={formData.posterUrl}
 onChange={handleChange}
 placeholder="https://example.com/poster.jpg"
 className="w-full bg-[#161618] border border-white/[0.08] hover:border-white/20 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none text-sm"
 />

 {/* Premium Feature Box */}
 <div className="bg-black/20 rounded-xl p-5 border border-white/5 mt-2">
 <div className="flex items-center gap-2 text-[#e9c349] mb-2">
 <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
 <span className="text-[10px] uppercase font-bold tracking-widest">Teaser Auto-Snippet</span>
 </div>
 <p className="text-zinc-600 text-[10px] uppercase tracking-wider font-bold leading-normal">
 System will automatically generate teaser snippets and trailer background blurs for the user-facing app.
 </p>
 </div>
 </div>

 {/* Right Column: Metadata */}
 <div className="lg:col-span-8 flex flex-col gap-5">

 <div className="space-y-2">
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Movie Title</label>
 <input
 required
 name="title"
 value={formData.title}
 onChange={handleChange}
 placeholder="Enter title..."
 className="w-full bg-[#161618] border border-white/[0.08] hover:border-white/20 focus:border-white/20 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none text-sm font-semibold"
 />
 </div>

 <div className="space-y-2">
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Description</label>
 <textarea
 required
 name="description"
 value={formData.description}
 onChange={handleChange}
 placeholder="Craft a compelling synopsis..."
 rows="4"
 className="w-full bg-[#161618] border border-white/[0.08] hover:border-white/20 focus:border-white/20 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none text-sm resize-none"
 />
 </div>

 <div className="grid grid-cols-2 gap-5">
 <div className="space-y-2">
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Genre</label>
 <div className="relative">
 <select
 required
 name="genre"
 value={formData.genre}
 onChange={handleChange}
 className="w-full bg-[#161618] border border-white/[0.08] hover:border-white/20 focus:border-white/20 rounded-xl px-5 py-4 text-white outline-none text-sm appearance-none cursor-pointer font-semibold"
 >
 <option value="" disabled>Select Genre</option>
 <option value="Action">Action</option>
 <option value="Drama">Drama</option>
 <option value="Sci-Fi">Sci-Fi</option>
 <option value="Comedy">Comedy</option>
 <option value="Horror">Horror</option>
 <option value="Thriller">Thriller</option>
 <option value="Animation">Animation</option>
 </select>
 <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">expand_more</span>
 </div>
 </div>
 <div className="space-y-2">
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Duration (Min)</label>
 <input
 required
 name="duration"
 type="number"
 value={formData.duration}
 onChange={handleChange}
 placeholder="e.g. 120"
 className="w-full bg-[#161618] border border-white/[0.08] hover:border-white/20 focus:border-white/20 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none text-sm font-semibold"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-5">
 <div className="space-y-2">
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Language</label>
 <div className="relative">
 <select
 required
 name="language"
 value={formData.language}
 onChange={handleChange}
 className="w-full bg-[#161618] border border-white/[0.08] hover:border-white/20 focus:border-white/20 rounded-xl px-5 py-4 text-white outline-none text-sm appearance-none cursor-pointer font-semibold"
 >
 <option value="English">English</option>
 <option value="Sinhala">Sinhala</option>
 <option value="Tamil">Tamil</option>
 <option value="Hindi">Hindi</option>
 </select>
 <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">expand_more</span>
 </div>
 </div>
 <div className="space-y-2">
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Release Date</label>
 <input
 name="releaseDate"
 type="date"
 value={formData.releaseDate}
 onChange={handleChange}
 className="w-full bg-[#161618] border border-white/[0.08] hover:border-white/20 focus:border-white/20 rounded-xl px-5 py-4 text-white outline-none text-sm [color-scheme:dark] font-semibold"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Trailer Youtube/Vimeo Link</label>
 <div className="relative flex items-center bg-[#161618] border border-white/[0.08] rounded-xl focus-within:border-white/20 transition-all overflow-hidden">
 <span className="material-symbols-outlined text-zinc-500 ml-4 text-[20px]">link</span>
 <input
 name="trailerUrl"
 value={formData.trailerUrl}
 onChange={handleChange}
 placeholder="https://..."
 className="w-full bg-transparent px-3 py-4 text-white placeholder:text-zinc-600 outline-none text-sm font-semibold"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Current Status</label>
 <div className="flex gap-4 p-1 bg-[#161618] border border-white/[0.08] rounded-xl">
 <button
 type="button"
 onClick={() => setFormData({ ...formData, status: 'now_showing' })}
 className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${formData.status === 'now_showing' ? 'bg-primary-container text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
 >
 Now Showing
 </button>
 <button
 type="button"
 onClick={() => setFormData({ ...formData, status: 'upcoming' })}
 className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${formData.status === 'upcoming' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
 >
 Upcoming
 </button>
 </div>
 </div>

 {/* Form Actions */}
 <div className="flex justify-end items-center gap-4 mt-4 pt-6 border-t border-white/5">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest px-4 transition-colors"
 >
 Cancel
 </button>
 <button
 disabled={isSaving}
 type="submit"
 className="bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-primary-container/20 flex items-center gap-2"
 >
 {isSaving ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : null}
 Save Cinematic Entry
 </button>
 </div>

 </div>
 </form>
 </div>
 )}
 </div>
 )}
 </div>
 );
}