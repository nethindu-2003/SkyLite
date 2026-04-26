import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminName, setAdminName] = useState('');

    // Dashboard Data State
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeMovies: 0,
        totalUsers: 0,
        todayBookings: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        // Get Admin Name for Greeting
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userStr) {
            setAdminName(JSON.parse(userStr).name);
        }

        const fetchDashboardData = async () => {
            try {
                // In a production enterprise app, you would have a single dedicated `/api/admin/stats` endpoint.
                // For this architecture, we will aggregate the data from our existing microservices.
                const [moviesRes, usersRes, bookingsRes] = await Promise.all([
                    fetch('http://localhost:8080/api/movies'),
                    fetch('http://localhost:8080/api/users', { headers: { 'Authorization': `Bearer ${token}` } }),
                    // Assuming an admin endpoint that fetches ALL bookings across the system
                    fetch('http://localhost:8080/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!moviesRes.ok || !usersRes.ok || !bookingsRes.ok) {
                    throw new Error('Failed to fetch dashboard metrics.');
                }

                const movies = await moviesRes.json();
                const users = await usersRes.json();
                const bookings = await bookingsRes.json() || [];

                // --- Calculate KPIs ---
                const activeMoviesCount = movies.filter(m => m.status === 'now_showing').length;
                const totalUsersCount = users.length;

                // Calculate Total Revenue
                const revenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

                // Calculate Today's Bookings
                const today = new Date().toISOString().split('T')[0];
                const todayBookingsCount = bookings.filter(b => {
                    if (!b.bookingDate) return false;
                    return b.bookingDate.split('T')[0] === today;
                }).length;

                setStats({
                    totalRevenue: revenue,
                    activeMovies: activeMoviesCount,
                    totalUsers: totalUsersCount,
                    todayBookings: todayBookingsCount
                });

                // --- Get 5 Most Recent Bookings for the Activity Feed ---
                // Sort by bookingId descending (newest first)
                const sortedBookings = bookings.sort((a, b) => b.bookingId - a.bookingId).slice(0, 5);
                setRecentBookings(sortedBookings);

            } catch (err) {
                console.error(err);
                setError("Unable to load real-time metrics. Please check connection to API Gateway.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Formatter for Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
                <span className="material-symbols-outlined animate-spin text-[#e50914] text-5xl mb-4">progress_activity</span>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Aggregating System Data...</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 font-body space-y-10">

            {/* Header & Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-headline font-black text-white tracking-tight uppercase mb-1">
                        Welcome, {adminName.split(' ')[0]}
                    </h1>
                    <p className="text-zinc-500 text-sm">Here is what is happening across your cinema today.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xl font-headline font-bold text-white">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#e9c349]">System Status: Online</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-bold text-sm flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span> {error}
                </div>
            )}

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-[#18181b] to-[#131314] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <span className="material-symbols-outlined text-green-500">payments</span>
                        </div>
                    </div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 relative z-10">Total Revenue</h3>
                    <p className="text-3xl font-headline font-black text-white relative z-10">{formatCurrency(stats.totalRevenue)}</p>
                </div>

                {/* Today's Bookings Card */}
                <div className="bg-gradient-to-br from-[#18181b] to-[#131314] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#e50914]/10 rounded-full blur-2xl group-hover:bg-[#e50914]/20 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-[#e50914]/10 flex items-center justify-center border border-[#e50914]/20">
                            <span className="material-symbols-outlined text-[#e50914]">confirmation_number</span>
                        </div>
                    </div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 relative z-10">Today's Tickets</h3>
                    <p className="text-3xl font-headline font-black text-white relative z-10">{stats.todayBookings}</p>
                </div>

                {/* Active Movies Card */}
                <div className="bg-gradient-to-br from-[#18181b] to-[#131314] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#e9c349]/10 rounded-full blur-2xl group-hover:bg-[#e9c349]/20 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-[#e9c349]/10 flex items-center justify-center border border-[#e9c349]/20">
                            <span className="material-symbols-outlined text-[#e9c349]">movie</span>
                        </div>
                    </div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 relative z-10">Now Showing</h3>
                    <p className="text-3xl font-headline font-black text-white relative z-10">{stats.activeMovies} <span className="text-sm text-zinc-600 font-normal">Movies</span></p>
                </div>

                {/* Total Users Card */}
                <div className="bg-gradient-to-br from-[#18181b] to-[#131314] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="material-symbols-outlined text-blue-500">group</span>
                        </div>
                    </div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 relative z-10">Registered Users</h3>
                    <p className="text-3xl font-headline font-black text-white relative z-10">{stats.totalUsers}</p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Quick Actions Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-lg font-headline font-bold text-white uppercase tracking-widest">Quick Actions</h2>

                    <div className="grid grid-cols-1 gap-4">
                        <Link to="/admin/gate-booking" className="bg-[#e50914] hover:bg-[#c0000c] text-white p-6 rounded-2xl flex items-center justify-between group transition-all shadow-[0_10px_30px_rgba(229,9,20,0.2)] hover:-translate-y-1">
                            <div>
                                <h3 className="font-bold text-lg mb-1">Gate Ticketing</h3>
                                <p className="text-xs text-white/70 font-medium">Issue physical tickets instantly</p>
                            </div>
                            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">point_of_sale</span>
                        </Link>

                        <Link to="/admin/showtimes" className="bg-[#18181b] hover:bg-[#202024] border border-white/5 hover:border-white/20 text-white p-6 rounded-2xl flex items-center justify-between group transition-all">
                            <div>
                                <h3 className="font-bold text-base mb-1">Schedule Show</h3>
                                <p className="text-xs text-zinc-500">Assign movies to halls</p>
                            </div>
                            <span className="material-symbols-outlined text-2xl text-zinc-600 group-hover:text-white transition-colors">calendar_add_on</span>
                        </Link>

                        <Link to="/admin/movies" className="bg-[#18181b] hover:bg-[#202024] border border-white/5 hover:border-white/20 text-white p-6 rounded-2xl flex items-center justify-between group transition-all">
                            <div>
                                <h3 className="font-bold text-base mb-1">Add Movie</h3>
                                <p className="text-xs text-zinc-500">Upload new cinematic assets</p>
                            </div>
                            <span className="material-symbols-outlined text-2xl text-zinc-600 group-hover:text-white transition-colors">movie_edit</span>
                        </Link>

                        <Link to="/admin/users" className="bg-[#18181b] hover:bg-[#202024] border border-white/5 hover:border-white/20 text-white p-6 rounded-2xl flex items-center justify-between group transition-all">
                            <div>
                                <h3 className="font-bold text-base mb-1">Manage Users</h3>
                                <p className="text-xs text-zinc-500">View or block accounts</p>
                            </div>
                            <span className="material-symbols-outlined text-2xl text-zinc-600 group-hover:text-white transition-colors">manage_accounts</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Transactions / Bookings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-headline font-bold text-white uppercase tracking-widest">Recent Transactions</h2>
                        <Link to="/admin/bookings" className="text-[10px] font-bold uppercase tracking-widest text-[#e50914] hover:text-white transition-colors">View All</Link>
                    </div>

                    <div className="bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        {recentBookings.length === 0 ? (
                            <div className="p-10 text-center text-zinc-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                                <p className="text-sm font-bold uppercase tracking-widest">No recent bookings found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-black/40 border-b border-white/5 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                                            <th className="p-5 font-medium">Order ID</th>
                                            <th className="p-5 font-medium">Date</th>
                                            <th className="p-5 font-medium">Amount</th>
                                            <th className="p-5 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {recentBookings.map((booking) => (
                                            <tr key={booking.bookingId} className="hover:bg-white/5 transition-colors">
                                                <td className="p-5">
                                                    <p className="text-white font-bold text-sm">#CNE-{booking.bookingId}</p>
                                                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">User ID: {booking.userId}</p>
                                                </td>
                                                <td className="p-5 text-zinc-400 text-sm">
                                                    {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-5 text-white font-bold text-sm">
                                                    {formatCurrency(booking.totalAmount)}
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                            booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                                'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                                        }`}>
                                                        {booking.status || 'Confirmed'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}