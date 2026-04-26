import { useState, useEffect } from 'react';

export default function AdminUsers() {
    // State Management
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userBookings, setUserBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);

    // Fetch All Users
    const fetchUsers = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            // Assuming your backend has a GET /api/users endpoint for admins
            const response = await fetch('http://localhost:8080/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
            // Fallback for demonstration if endpoint is missing
            console.warn("Ensure GET /api/users exists in backend.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle Block / Unblock User
    const handleToggleBlock = async (userId, currentStatus, e) => {
        e.stopPropagation(); // Prevent opening the modal
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        const actionText = newStatus === 'blocked' ? 'block' : 'unblock';

        if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;

        const token = localStorage.getItem('token');
        try {
            // Assuming your backend has an endpoint to update user status
            const response = await fetch(`http://localhost:8080/api/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error(`Failed to ${actionText} user`);

            // Update local state to reflect change instantly
            setUsers(users.map(u => u.userId === userId ? { ...u, status: newStatus } : u));
        } catch (err) {
            alert(err.message);
        }
    };

    // View User Details & Booking History
    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        setIsLoadingBookings(true);
        setUserBookings([]);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8080/api/bookings/user/${user.userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUserBookings(data);
            }
        } catch (err) {
            console.error("Error fetching user bookings:", err);
        } finally {
            setIsLoadingBookings(false);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || user.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    // Calculate Metrics
    const totalActive = users.filter(u => u.status === 'active').length;
    const totalBlocked = users.filter(u => u.status === 'blocked').length;
    const totalPending = users.filter(u => u.status === 'pending').length;

    return (
        <div className="p-6 lg:p-10 font-body">

            {/* Page Header */}
            <div className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-headline font-black text-white tracking-tight uppercase">User Management</h1>
                <p className="text-zinc-500 text-sm mt-1">Oversee your cinematic community and manage account access.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 bg-[#18181b] border border-white/5 rounded-xl px-5 py-3 flex items-center focus-within:border-white/20 transition-colors">
                    <span className="material-symbols-outlined text-zinc-500 mr-3">search</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Filter by name or email..."
                        className="w-full bg-transparent text-white outline-none placeholder:text-zinc-600 text-sm"
                    />
                </div>

                <div className="bg-[#18181b] border border-white/5 rounded-xl px-5 py-3 flex items-center min-w-[200px] relative">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mr-3">Status</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-transparent text-white outline-none appearance-none text-sm cursor-pointer font-bold"
                    >
                        <option value="All" className="bg-[#18181b]">All Status</option>
                        <option value="active" className="bg-[#18181b]">Active</option>
                        <option value="pending" className="bg-[#18181b]">Pending</option>
                        <option value="blocked" className="bg-[#18181b]">Blocked</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 text-zinc-500 pointer-events-none">expand_more</span>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mb-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 border-b border-white/5 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                                <th className="p-6 font-medium">User</th>
                                <th className="p-6 font-medium">Contact</th>
                                <th className="p-6 font-medium">Status</th>
                                <th className="p-6 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan="4" className="p-10 text-center text-zinc-500"><span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span></td></tr>
                            ) : error ? (
                                <tr><td colSpan="4" className="p-10 text-center text-red-500">{error}</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="4" className="p-10 text-center text-zinc-500">No users found matching your criteria.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.userId}
                                        onClick={() => handleViewUser(user)}
                                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-6 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-white font-headline font-bold uppercase shadow-lg">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{user.name}</p>
                                                <p className="text-zinc-600 text-[10px] uppercase tracking-widest">ID: CN-{user.userId.toString().padStart(5, '0')}</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-zinc-300 text-sm">{user.email}</p>
                                            <p className="text-zinc-600 text-[10px] tracking-widest mt-1">{user.phone || 'No Phone'}</p>
                                        </td>
                                        <td className="p-6">
                                            <span className={`flex items-center gap-2 text-xs font-bold ${user.status === 'active' ? 'text-green-500' :
                                                    user.status === 'blocked' ? 'text-red-500' : 'text-[#e9c349]'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                                                        user.status === 'blocked' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-[#e9c349]'
                                                    }`}></span>
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewUser(user); }}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="View Details"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                </button>

                                                {/* Block/Unblock Toggle */}
                                                <button
                                                    onClick={(e) => handleToggleBlock(user.userId, user.status, e)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${user.status === 'blocked'
                                                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                        }`}
                                                    title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        {user.status === 'blocked' ? 'check_circle' : 'block'}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div className="p-4 border-t border-white/5 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><span className="material-symbols-outlined text-6xl">group</span></div>
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-green-500 text-[20px]">how_to_reg</span></div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Members</h3>
                    <p className="text-3xl font-headline font-black text-white">{totalActive}</p>
                </div>

                <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><span className="material-symbols-outlined text-6xl">hourglass_empty</span></div>
                    <div className="w-10 h-10 rounded-full bg-[#e9c349]/10 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[#e9c349] text-[20px]">pending_actions</span></div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Pending Verification</h3>
                    <p className="text-3xl font-headline font-black text-white">{totalPending}</p>
                </div>

                <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><span className="material-symbols-outlined text-6xl">block</span></div>
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-red-500 text-[20px]">gpp_bad</span></div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Restricted Accounts</h3>
                    <p className="text-3xl font-headline font-black text-white">{totalBlocked}</p>
                </div>
            </div>

            {/* User Details & Booking History Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div className="bg-[#18181b] border border-white/10 rounded-3xl w-full max-w-4xl relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[80vh]">

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 z-20 text-zinc-500 hover:text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>

                        {/* Left Sidebar: User Info */}
                        <div className="w-full md:w-1/3 bg-black/40 border-r border-white/5 p-8 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#e50914] to-[#c0000c] flex items-center justify-center text-white font-headline font-black text-4xl shadow-[0_0_20px_rgba(229,9,20,0.4)] mb-6 border-4 border-[#18181b]">
                                {selectedUser.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-headline font-black text-white mb-1">{selectedUser.name}</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">{selectedUser.email}</p>

                            <div className="w-full space-y-4 text-left">
                                <div className="bg-[#202024] p-4 rounded-xl border border-white/5">
                                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Phone</p>
                                    <p className="text-sm text-white">{selectedUser.phone || 'Not Provided'}</p>
                                </div>
                                <div className="bg-[#202024] p-4 rounded-xl border border-white/5">
                                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Account Status</p>
                                    <p className={`text-sm font-bold uppercase tracking-wider ${selectedUser.status === 'active' ? 'text-green-500' : selectedUser.status === 'blocked' ? 'text-red-500' : 'text-[#e9c349]'}`}>
                                        {selectedUser.status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Booking History */}
                        <div className="w-full md:w-2/3 flex flex-col h-full bg-[#18181b]">
                            <div className="p-8 border-b border-white/5 bg-black/20 shrink-0">
                                <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#e50914]">receipt_long</span>
                                    Booking History
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                                {isLoadingBookings ? (
                                    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                        <span className="material-symbols-outlined animate-spin text-3xl mb-4">progress_activity</span>
                                        <p className="text-sm uppercase tracking-widest font-bold">Loading records...</p>
                                    </div>
                                ) : userBookings.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                                        <span className="material-symbols-outlined text-5xl mb-4 opacity-50">event_busy</span>
                                        <p className="text-sm uppercase tracking-widest font-bold">No bookings found for this user.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userBookings.map(booking => (
                                            <div key={booking.bookingId} className="bg-[#202024] border border-white/5 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-white font-bold">Order #CNE-{booking.bookingId}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-zinc-400 text-xs mt-1">
                                                        {booking.bookedSeats?.length || 0} Tickets • Total: {booking.totalAmount?.toFixed(2)} LKR
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Booked On</p>
                                                    <p className="text-white text-sm">{new Date(booking.bookingDate).toLocaleDateString()}</p>
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