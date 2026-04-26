import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format.";
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid phone number.";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }
      setIsSuccess(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#0a0a0b] font-body selection:bg-[#e50914] selection:text-white">
      
      {/* Left Panel: Cinematic Branding (Matches Reference Image) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-16 xl:p-24 overflow-hidden border-r border-white/5">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2670&auto=format&fit=crop')" }}
        ></div>
        
        {/* Gradients to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/80 via-transparent to-transparent"></div>
        
        <div className="relative z-10 max-w-lg">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center border border-[#e9c349]/40 rounded-full px-4 py-1.5 bg-[#e9c349]/5 backdrop-blur-sm">
            <span className="text-[#e9c349] text-[10px] uppercase tracking-[0.2em] font-bold">New Member Access</span>
          </div>
          
          {/* Main Typography */}
          <h1 className="text-5xl xl:text-7xl font-light text-white tracking-tight leading-[1.1] mb-6">
            Join the <br/>
            <span className="text-[#e50914] font-medium"><b>SKYLITE</b></span> <br/>
            Elite.
          </h1>
          
          <p className="text-zinc-300 text-base xl:text-lg leading-relaxed mb-10 max-w-md font-light">
            Experience the Art of Cinema. A sanctuary for the refined viewer where every frame is a masterpiece and every seat is a throne.
          </p>
          
          {/* Footer Badge */}
          <div className="flex items-center gap-3 text-[#e9c349]">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Premium Screening Benefits</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 pt-32 lg:pt-0 lg:p-16">
        <div className="w-full max-w-[440px]">
          
          {isSuccess ? (
            // Success Verification State
            <div className="text-center space-y-6 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="material-symbols-outlined text-green-500 text-4xl">mark_email_read</span>
              </div>
              <h2 className="text-3xl font-medium text-white tracking-tight">Verification Sent</h2>
              <p className="text-zinc-400 leading-relaxed">
                Please check your email <br/>
                <b className="text-white">{formData.email}</b> <br/>
                to activate your account.
              </p>
              <div className="pt-6">
                <Link to="/login" className="block w-full py-4 bg-[#e50914] hover:bg-[#c0000c] text-white rounded-full font-medium transition-colors shadow-lg shadow-[#e50914]/20">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            // Registration Form (Matches Mockup)
            <div className="animate-in fade-in duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-medium text-white mb-3 tracking-tight">Create your account</h2>
                <p className="text-zinc-500 text-sm">Enter your details to begin your cinematic journey.</p>
              </div>

              {serverError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-400 mb-2 ml-1" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Elias Thorne"
                    className={`w-full bg-[#18181b] border ${errors.name ? 'border-red-500' : 'border-transparent'} focus:border-white/20 rounded-2xl px-5 py-4 text-white outline-none transition-colors text-sm`}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] uppercase tracking-widest mt-2 ml-1">{errors.name}</p>}
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-400 mb-2 ml-1" htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="elias@cine-noir.com"
                      className={`w-full bg-[#18181b] border ${errors.email ? 'border-red-500' : 'border-transparent'} focus:border-white/20 rounded-2xl px-5 py-4 text-white outline-none transition-colors text-sm`}
                    />
                    {errors.email && <p className="text-red-500 text-[10px] uppercase tracking-widest mt-2 ml-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-400 mb-2 ml-1" htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 77 000 0000"
                      className={`w-full bg-[#18181b] border ${errors.phone ? 'border-red-500' : 'border-transparent'} focus:border-white/20 rounded-2xl px-5 py-4 text-white outline-none transition-colors text-sm`}
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] uppercase tracking-widest mt-2 ml-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-400 mb-2 ml-1" htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full bg-[#18181b] border ${errors.password ? 'border-red-500' : 'border-transparent'} focus:border-white/20 rounded-2xl px-5 py-4 text-white outline-none transition-colors text-sm tracking-widest`}
                    />
                    {errors.password && <p className="text-red-500 text-[10px] uppercase tracking-widest mt-2 ml-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-400 mb-2 ml-1" htmlFor="confirmPassword">Confirm</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full bg-[#18181b] border ${errors.confirmPassword ? 'border-red-500' : 'border-transparent'} focus:border-white/20 rounded-2xl px-5 py-4 text-white outline-none transition-colors text-sm tracking-widest`}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-[10px] uppercase tracking-widest mt-2 ml-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    disabled={isLoading}
                    className="w-full bg-[#e50914] hover:bg-[#c0000c] text-white py-4 rounded-full font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#e50914]/20"
                  >
                    {isLoading ? "Processing..." : "Create Account"}
                  </button>
                </div>
              </form>

              {/* Social Login Separator (Visually matches mockup) */}
              <div className="mt-10 mb-8 flex items-center justify-between">
                <div className="w-full h-px bg-white/5"></div>
                <span className="px-4 text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-600 whitespace-nowrap">Or continue with</span>
                <div className="w-full h-px bg-white/5"></div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-3 bg-[#18181b] hover:bg-[#202024] border border-transparent hover:border-white/10 py-3.5 rounded-full transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="text-sm font-medium text-white">Google</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-3 bg-[#18181b] hover:bg-[#202024] border border-transparent hover:border-white/10 py-3.5 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.05.74.75 0 1.94-.78 3.48-.65 1.93.16 3.42 1.03 4.2 2.37-3.92 2.03-2.99 7.05 1.05 8.78-.65 1.48-1.55 2.92-2.73 3.73zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path>
                  </svg>
                  <span className="text-sm font-medium text-white">Apple</span>
                </button>
              </div>

              <div className="mt-10 text-center">
                <p className="text-zinc-500 text-sm">
                  Already have an account? <Link to="/login" className="text-[#e9c349] hover:text-white transition-colors ml-1 font-medium">Login</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}