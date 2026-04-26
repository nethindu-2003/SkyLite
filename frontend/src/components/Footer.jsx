import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Footer() {
  // State for dynamic configuration data
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch configuration from API Gateway
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/config');
        if (!response.ok) throw new Error('Failed to fetch config');
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error("Error fetching cinema configuration:", error);
        // Fallback data if backend is unreachable
        setConfig({
          cinemaName: 'Sky Lite 3D Cinema',
          contactEmail: 'support@skylite.com',
          contactPhone: '+94 77 123 4567'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-white/5 pt-20 md:pt-32 pb-8 md:pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 md:gap-16 lg:gap-12 mb-16 md:mb-24">

          {/* Brand Section */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-8">
            {isLoading ? (
              // Loading Skeleton for Brand Description
              <div className="space-y-4 w-full mb-10">
                <div className="h-4 bg-white/5 animate-pulse rounded w-full"></div>
                <div className="h-4 bg-white/5 animate-pulse rounded w-5/6"></div>
                <div className="h-4 bg-white/5 animate-pulse rounded w-3/4"></div>
                <div className="pt-4 space-y-2">
                  <div className="h-3 bg-white/5 animate-pulse rounded w-1/2"></div>
                  <div className="h-3 bg-white/5 animate-pulse rounded w-1/3"></div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-on-surface-variant/80 font-body text-base leading-loose mb-6 max-w-sm">
                  Bringing the magic of the big screen to the heart of Matara. Experience cinema like never before at <span className="text-white font-bold">{config.cinemaName}</span> with our state-of-the-art 3D projection and immersive surround sound.
                </p>

                {/* Dynamic Contact Info from DB */}
                <div className="flex flex-col gap-3 mb-8 md:mb-10 text-on-surface-variant/60 font-body text-sm">
                  <a href={`mailto:${config.contactEmail}`} className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-3 group">
                    <span className="material-symbols-outlined text-[18px] group-hover:text-[#e50914] transition-colors">mail</span>
                    {config.contactEmail}
                  </a>
                  {config.contactPhone && (
                    <a href={`tel:${config.contactPhone}`} className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-3 group">
                      <span className="material-symbols-outlined text-[18px] group-hover:text-[#e50914] transition-colors">call</span>
                      {config.contactPhone}
                    </a>
                  )}
                </div>
              </>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-4 md:gap-5">
              <a className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group hover:bg-[#e50914] hover:border-[#e50914] hover:shadow-[0_10px_20px_rgba(229,9,20,0.3)] transition-all duration-500" href="#">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors duration-500 text-[18px] md:text-[24px]">campaign</span>
              </a>
              <a className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group hover:bg-[#e50914] hover:border-[#e50914] hover:shadow-[0_10px_20px_rgba(229,9,20,0.3)] transition-all duration-500" href="#">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors duration-500 text-[18px] md:text-[24px]">public</span>
              </a>
              <a className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group hover:bg-[#e50914] hover:border-[#e50914] hover:shadow-[0_10px_20px_rgba(229,9,20,0.3)] transition-all duration-500" href="#">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors duration-500 text-[18px] md:text-[24px]">play_circle</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-headline font-bold text-xs mb-6 md:mb-10 tracking-[0.2em] uppercase">Quick Links</h4>
            <ul className="space-y-4 md:space-y-6 font-body text-base text-on-surface-variant/80">
              <li>
                <Link to="/movies" className="hover:text-white transition-colors flex items-center gap-4 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4 group-hover:ml-0"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Now Showing</span>
                </Link>
              </li>
              <li>
                <Link to="/showtimes" className="hover:text-white transition-colors flex items-center gap-4 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4 group-hover:ml-0"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Coming Soon</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-4 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4 group-hover:ml-0"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-4 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4 group-hover:ml-0"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-headline font-bold text-xs mb-6 md:mb-10 tracking-[0.2em] uppercase mt-4 md:mt-0">Legal</h4>
            <ul className="space-y-4 md:space-y-6 font-body text-base text-on-surface-variant/80">
              <li>
                <a href="#" className="hover:text-white transition-colors flex items-center gap-4 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e9c349] opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4 group-hover:ml-0"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors flex items-center gap-4 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e9c349] opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4 group-hover:ml-0"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Terms of Service</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors flex items-center gap-4 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e9c349] opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4 group-hover:ml-0"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Refund Policy</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3 flex flex-col justify-start">
            <h4 className="text-white font-headline font-bold text-xs mb-6 md:mb-10 tracking-[0.2em] uppercase mt-4 lg:mt-0">Newsletter</h4>
            <p className="text-on-surface-variant/80 font-body text-base leading-loose mb-6 md:mb-8">
              Subscribe for the latest releases, events, and exclusive movie deals straight to your inbox.
            </p>
            <div className="relative group w-full mt-auto">
              <input
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 rounded-full py-4 md:py-5 pl-5 sm:pl-6 pr-[90px] sm:pr-[110px] md:pr-[120px] text-white placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-[#e50914]/50 focus:outline-none transition-all font-body text-sm shadow-sm tracking-wide"
                placeholder="Email address..."
                type="email"
              />
              <button className="absolute inset-y-2 right-2 bg-white text-background hover:bg-[#e50914] hover:text-white px-5 sm:px-6 md:px-8 rounded-full font-headline font-bold text-xs md:text-sm tracking-widest uppercase transition-all duration-300 shadow-md">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 md:pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <div className="text-on-surface-variant/60 font-body text-center md:text-left text-xs md:text-sm font-medium tracking-wide">
            {isLoading ? (
              <div className="h-4 bg-white/5 animate-pulse rounded w-48 mx-auto md:mx-0"></div>
            ) : (
              `© ${new Date().getFullYear()} ${config.cinemaName}. All Rights Reserved.`
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-on-surface-variant/80 font-body text-[10px] md:text-xs tracking-widest uppercase bg-white/5 px-5 md:px-6 py-2.5 md:py-3 rounded-full border border-white/5 shadow-sm">
              <span className="material-symbols-outlined text-[14px] md:text-[16px] text-[#e9c349]">verified_user</span>
              <span>Secure Payments</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}