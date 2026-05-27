import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

/* ─── Simplified Input Field ─────────────────────────────────── */
function InputField({ id, value, onChange, placeholder, type = 'text', required }) {
 return (
 <div className="group relative w-full my-5">
 <input
 id={id}
 value={value}
 onChange={onChange}
 placeholder={placeholder}
 type={type}
 required={required}
 className="w-full bg-[#161618] border border-white/[0.08] hover:bg-[#202022] hover:border-white/20 focus:bg-[#161618] focus:border-white/20 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none transition-all text-sm"
 />
 </div>
 );
}

/* ─── Standard Alert ─────────────────────────────────────────── */
function Alert({ type, message }) {
 const isError = type === 'error';
 return (
 <div className={`p-4 rounded-xl border mb-6 text-sm font-bold flex items-center gap-2 ${isError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
 <span className="material-symbols-outlined text-[18px]">{isError ? 'gpp_bad' : 'check_circle'}</span>
 <span>{message}</span>
 </div>
 );
}

export default function Login() {
 const navigate = useNavigate();
 const location = useLocation();

 const [formData, setFormData] = useState({ email: '', password: '' });
 const [role, setRole] = useState('USER');
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState(null);
 const [successMsg, setSuccessMsg] = useState(null);

 const [showForgotModal, setShowForgotModal] = useState(false);
 const [forgotEmail, setForgotEmail] = useState('');
 const [forgotLoading, setForgotLoading] = useState(false);
 const [forgotMessage, setForgotMessage] = useState(null);
 const [forgotError, setForgotError] = useState(null);

 useEffect(() => {
 const params = new URLSearchParams(location.search);
 if (params.get('verified') === 'true') setSuccessMsg('Email verified. You can now login.');
 else if (params.get('error') === 'verification_failed') setError('Verification failed.');
 }, [location]);

 const handleChange = (e) => {
 setFormData({ ...formData, [e.target.id]: e.target.value });
 setError(null);
 };

 const handleLogin = async (e) => {
 e.preventDefault();
 setError(null);
 setIsLoading(true);
 try {
 const res = await fetch('http://localhost:8080/api/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ ...formData, role }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.message || 'Login failed');
 
 localStorage.setItem('token', data.token);
 localStorage.setItem('user', JSON.stringify({ id: data.userId, name: data.name, role: data.role }));
 navigate(data.role === 'ADMIN' ? '/admin/dashboard' : '/');
 } catch (err) {
 setError(err.message);
 } finally {
 setIsLoading(false);
 }
 };

 const handleForgotPassword = async (e) => {
 e.preventDefault();
 setForgotError(null); setForgotMessage(null); setForgotLoading(true);
 try {
 const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email: forgotEmail }),
 });
 if (!res.ok) throw new Error('Request failed');
 setForgotMessage('Reset link sent to your email.');
 } catch (err) {
 setForgotError(err.message);
 } finally {
 setForgotLoading(false);
 }
 };

 return (
 <main className="min-h-screen flex items-center justify-center p-6 bg-[#131314] relative overflow-hidden">
 {/* Glow Effects */}
 <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
 <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-container/5 blur-[120px] rounded-full pointer-events-none"></div>

 <div className="w-full max-w-md bg-[#1c1c1e] p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5 relative z-10">
 <div className="mb-8 text-center">
 <h1 className="text-3xl font-headline font-black text-white mb-2 uppercase tracking-tight">Login</h1>
 <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Access your SkyLite account</p>
 </div>

 {/* Role Selector */}
 <div className="flex bg-[#161618] rounded-xl p-1 mb-8 border border-white/[0.04]">
 {['USER', 'ADMIN'].map((r) => (
 <button
 key={r}
 type="button"
 onClick={() => setRole(r)}
 className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${role === r ? 'bg-gradient-to-tr from-primary-container to-red-500 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}
 >
 {r === 'USER' ? 'User' : 'Admin'}
 </button>
 ))}
 </div>

 {successMsg && <Alert message={successMsg} />}
 {error && <Alert type="error" message={error} />}

 <form onSubmit={handleLogin}>
 <InputField id="email" value={formData.email} onChange={handleChange} placeholder="Email Address" type="email" required />
 <InputField id="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" required />
 
 <div className="flex justify-end mb-6">
 <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-bold">Forgot Password?</button>
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-container to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold uppercase text-xs tracking-widest shadow-[0_4px_15px_rgba(229,9,20,0.3)] hover:shadow-[0_4px_25px_rgba(229,9,20,0.5)] transition-all duration-300 disabled:opacity-50"
 >
 {isLoading ? "Processing..." : "Sign In"}
 </button>
 </form>

 <div className="mt-8 text-center border-t border-white/5 pt-6 flex flex-col gap-4">
 <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
 Don't have an account? <Link to="/register" className="text-primary-container hover:underline ml-1">Register</Link>
 </p>
 <Link to="/" className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
 <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Home
 </Link>
 </div>
 </div>

 {showForgotModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
 <div className="w-full max-w-sm bg-[#1c1c1e] p-8 rounded-3xl border border-white/10 shadow-2xl">
 <h2 className="text-xl font-headline font-black text-white mb-2 uppercase tracking-tight">Reset Password</h2>
 <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6">Enter your registered email address</p>
 {forgotMessage && <Alert message={forgotMessage} />}
 {forgotError && <Alert type="error" message={forgotError} />}
 <form onSubmit={handleForgotPassword} className="space-y-4">
 <InputField id="forgotEmail" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Email Address" type="email" required />
 <button type="submit" disabled={forgotLoading} className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold uppercase text-xs tracking-widest transition-all">
 {forgotLoading ? "Sending..." : "Send Link"}
 </button>
 <button type="button" onClick={() => setShowForgotModal(false)} className="w-full text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest pt-2">Cancel</button>
 </form>
 </div>
 </div>
 )}
 </main>
 );
}