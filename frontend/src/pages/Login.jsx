import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

/* ─── Simplified Input Field ─────────────────────────────────── */
function InputField({ id, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div className="group relative w-full my-6">
      <input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        required={required}
        className="w-full bg-[#1e1e20] border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-zinc-500 focus:border-[#e50914] outline-none transition-all"
      />
    </div>
  );
}

/* ─── Standard Alert ─────────────────────────────────────────── */
function Alert({ type, message }) {
  const isError = type === 'error';
  return (
    <div className={`p-4 rounded-xl border mb-6 text-sm ${isError ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
      {message}
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
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#131314]">
      <div className="w-full max-w-md bg-[#1c1c1e] p-10 rounded-2xl shadow-xl border border-white/5">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-headline font-bold text-white mb-2">Login</h1>
          <p className="text-zinc-500 text-sm">Access your Skylite account</p>
        </div>

        {/* Role Selector */}
        <div className="flex bg-[#252528] rounded-xl p-1 mb-8">
          {['USER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${role === r ? 'bg-[#e50914] text-white' : 'text-zinc-500 hover:text-white'}`}
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
          
          <div className="flex justify-end mb-8">
            <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-zinc-500 hover:text-white transition-colors">Forgot Password?</button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-[#e50914] hover:bg-[#c0000c] text-white font-bold transition-all flex items-center justify-center"
          >
            {isLoading ? "Processing..." : "Sign In"}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-white/5 pt-8">
          <p className="text-zinc-500 text-sm">
            Don't have an account? <Link to="/register" className="text-[#e50914] hover:underline ml-1">Register</Link>
          </p>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1c1c1e] p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Reset Password</h2>
            {forgotMessage && <Alert message={forgotMessage} />}
            {forgotError && <Alert type="error" message={forgotError} />}
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <InputField id="forgotEmail" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Email Address" type="email" required />
              <button type="submit" className="w-full py-4 rounded-xl bg-white text-black font-bold">Send Link</button>
              <button type="button" onClick={() => setShowForgotModal(false)} className="w-full text-zinc-500 text-sm">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}