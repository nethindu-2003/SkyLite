import { useState, useEffect } from 'react';

export default function AdminShowtimes() {
    // Global State
    const [movies, setMovies] = useState([]);
    const [isLoadingMovies, setIsLoadingMovies] = useState(true);
    const [error, setError] = useState(null);

    // Modal State (Movie Context & Shows)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [isLoadingShows, setIsLoadingShows] = useState(false);

    // Form State (Add/Edit Show)
    const initialFormState = { showDate: '', startTime: '', endTime: '', hallName: 'Main Screen' };
    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [editShowId, setEditShowId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch "Now Showing" Movies on Load
    useEffect(() => {
        const fetchNowShowing = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/movies/status/now_showing');
                if (!response.ok) throw new Error('Failed to fetch currently playing movies.');
                const data = await response.json();
                setMovies(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoadingMovies(false);
            }
        };
        fetchNowShowing();
    }, []);

    // 2. Fetch Shows for a Specific Movie
    const fetchShowsForMovie = async (movieId) => {
        setIsLoadingShows(true);
        try {
            const response = await fetch(`http://localhost:8080/api/theater/shows/movie/${movieId}`);
            if (response.ok) {
                const data = await response.json();
                // Sort shows by date, then time
                const sortedData = data.sort((a, b) => {
                    if (a.showDate === b.showDate) return a.startTime.localeCompare(b.startTime);
                    return a.showDate.localeCompare(b.showDate);
                });
                setShows(sortedData || []);
            }
        } catch (err) {
            console.error("Error fetching shows:", err);
        } finally {
            setIsLoadingShows(false);
        }
    };

    // Handlers
    const handleMovieClick = (movie) => {
        setSelectedMovie(movie);
        setFormData(initialFormState);
        setIsEditing(false);
        setIsModalOpen(true);
        fetchShowsForMovie(movie.movieId);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Setup Edit Mode
    const handleEditClick = (show) => {
        setFormData({
            showDate: show.showDate,
            startTime: show.startTime.substring(0, 5), // Format HH:mm for input type="time"
            endTime: show.endTime.substring(0, 5),
            hallName: show.hallName
        });
        setEditShowId(show.showId);
        setIsEditing(true);
    };

    // Cancel Edit Mode
    const cancelEdit = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setEditShowId(null);
    };

    // Submit Add/Edit Form
    const handleShowSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const token = localStorage.getItem('token');

        // Append seconds to times for backend Time parsing (HH:mm:ss)
        const payload = {
            movieId: selectedMovie.movieId,
            showDate: formData.showDate,
            startTime: `${formData.startTime}:00`,
            endTime: `${formData.endTime}:00`,
            hallName: formData.hallName
        };

        const url = isEditing
            ? `http://localhost:8080/api/theater/shows/${editShowId}`
            : `http://localhost:8080/api/theater/shows`;

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(isEditing ? 'Failed to update showtime.' : 'Failed to add showtime.');

            // Refresh shows list and reset form
            fetchShowsForMovie(selectedMovie.movieId);
            cancelEdit();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Show
    const handleDeleteShow = async (showId) => {
        if (!window.confirm("Are you sure you want to delete this showtime? This will affect existing bookings.")) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8080/api/theater/shows/${showId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete showtime.');

            // Refresh shows list
            fetchShowsForMovie(selectedMovie.movieId);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="p-6 lg:p-10 font-body">

            {/* Page Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-headline font-black text-white tracking-tight">Showtime Management</h1>
                <p className="text-zinc-500 text-sm mt-1">Select an active movie to schedule or manage its screening times.</p>
            </div>

            {/* Movies Grid */}
            {isLoadingMovies ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(n => <div key={n} className="aspect-[3/4] bg-white/5 animate-pulse rounded-2xl"></div>)}
                </div>
            ) : error ? (
                <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">{error}</div>
            ) : movies.length === 0 ? (
                <div className="text-center py-20 bg-[#18181b] border border-white/5 rounded-2xl">
                    <span className="material-symbols-outlined text-4xl text-zinc-600 mb-3">movie_off</span>
                    <h3 className="text-xl font-bold text-white mb-2">No Active Movies</h3>
                    <p className="text-zinc-500 text-sm">Add movies and set their status to 'Now Showing' in the Movie Catalog.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {movies.map((movie) => (
                        <div
                            key={movie.movieId}
                            onClick={() => handleMovieClick(movie)}
                            className="group relative rounded-2xl overflow-hidden bg-[#18181b] border border-white/10 cursor-pointer hover:border-[#e50914] transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(229,9,20,0.3)] hover:-translate-y-2"
                        >
                            <div className="aspect-[3/4] relative">
                                <img
                                    src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"}
                                    alt={movie.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-4 w-full">
                                    <h3 className="text-sm font-black text-white line-clamp-2 leading-tight">{movie.title}</h3>
                                    <p className="text-[9px] font-bold tracking-widest uppercase text-[#e9c349] mt-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">calendar_month</span> Manage
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Showtime Management Modal */}
            {isModalOpen && selectedMovie && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div className="bg-[#18181b] border border-white/10 rounded-3xl w-full max-w-5xl relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-auto max-h-[90vh]">

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 z-20 text-zinc-500 hover:text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>

                        {/* Left Column: Movie Context */}
                        <div className="w-full md:w-1/3 bg-black relative flex flex-col min-h-[250px] md:min-h-full">
                            <img
                                src={selectedMovie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"}
                                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
                                alt="Poster"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/50 to-transparent md:bg-gradient-to-r md:from-[#18181b]/80"></div>

                            <div className="relative z-10 p-8 mt-auto md:mt-0 md:h-full flex flex-col justify-end">
                                <span className="bg-[#e50914] text-white px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest mb-3 w-fit">Selected Movie</span>
                                <h2 className="text-3xl font-headline font-black text-white leading-tight mb-2">{selectedMovie.title}</h2>
                                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{selectedMovie.duration} Mins • {selectedMovie.language}</p>
                            </div>
                        </div>

                        {/* Right Column: Management Dashboard */}
                        <div className="w-full md:w-2/3 flex flex-col h-full overflow-hidden bg-[#18181b]">

                            {/* Form Section (Add/Edit) */}
                            <div className="p-8 border-b border-white/5 bg-black/20 shrink-0">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#e50914]">{isEditing ? 'edit_calendar' : 'add_circle'}</span>
                                    {isEditing ? 'Edit Showtime' : 'Schedule New Showtime'}
                                </h3>

                                <form onSubmit={handleShowSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 pl-1">Show Date</label>
                                            <input required type="date" name="showDate" value={formData.showDate} onChange={handleFormChange} className="w-full bg-[#202024] rounded-xl px-4 py-3 text-white border border-transparent focus:border-white/20 outline-none text-sm [color-scheme:dark]" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 pl-1">Hall / Screen</label>
                                            <input required type="text" name="hallName" value={formData.hallName} onChange={handleFormChange} placeholder="e.g. Main Screen" className="w-full bg-[#202024] rounded-xl px-4 py-3 text-white border border-transparent focus:border-white/20 outline-none text-sm" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 pl-1">Start Time</label>
                                            <input required type="time" name="startTime" value={formData.startTime} onChange={handleFormChange} className="w-full bg-[#202024] rounded-xl px-4 py-3 text-white border border-transparent focus:border-white/20 outline-none text-sm [color-scheme:dark]" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 pl-1">End Time</label>
                                            <input required type="time" name="endTime" value={formData.endTime} onChange={handleFormChange} className="w-full bg-[#202024] rounded-xl px-4 py-3 text-white border border-transparent focus:border-white/20 outline-none text-sm [color-scheme:dark]" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        {isEditing && (
                                            <button type="button" onClick={cancelEdit} className="px-6 py-2.5 rounded-full text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                                                Cancel
                                            </button>
                                        )}
                                        <button disabled={isSaving} type="submit" className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-50 flex items-center gap-2">
                                            {isSaving ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : null}
                                            {isEditing ? 'Save Changes' : 'Add to Schedule'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Existing Shows List */}
                            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Existing Schedule</h3>

                                {isLoadingShows ? (
                                    <div className="text-center py-10 text-zinc-500">Loading schedule...</div>
                                ) : shows.length === 0 ? (
                                    <div className="text-center py-10 border border-dashed border-white/10 rounded-xl text-zinc-500 text-sm">
                                        No showtimes scheduled for this movie yet.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {shows.map(show => (
                                            <div key={show.showId} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${editShowId === show.showId ? 'bg-white/5 border-white/30' : 'bg-[#202024] border-transparent hover:border-white/10'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-black/50 rounded-lg flex flex-col items-center justify-center border border-white/5">
                                                        <span className="text-[10px] text-zinc-500 uppercase font-bold">{new Date(show.showDate).toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-sm font-black text-white leading-none">{show.showDate.split('-')[2]}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">
                                                            {show.startTime.substring(0, 5)} - {show.endTime.substring(0, 5)}
                                                        </p>
                                                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-1">
                                                            {show.hallName}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditClick(show)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" title="Edit">
                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteShow(show.showId)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition-colors" title="Delete">
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}