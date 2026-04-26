import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  return (
    <div className="bg-[#0a0a0b] text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden h-[400px] mb-16"
        >
          <img 
            src="/cinema_header.png" 
            alt="Skylite 3D Cinema" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">SKYLITE 3D CINEMA</h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-body">
              The premier cinematic destination in the heart of Matara, bringing stories to life with world-class technology.
            </p>
          </div>
        </motion.div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#e50914]/50 transition-all duration-300 group"
          >
            <div className="w-14 h-14 rounded-xl bg-[#e50914]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#e50914] text-3xl">visibility</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 font-headline uppercase tracking-tight">Our Vision</h2>
            <p className="text-zinc-400 leading-relaxed font-body">
              To be the premier destination for cinematic excellence in Matara, redefining the movie-going experience through cutting-edge technology, unparalleled comfort, and artistic appreciation.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#e50914]/50 transition-all duration-300 group"
          >
            <div className="w-14 h-14 rounded-xl bg-[#e50914]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#e50914] text-3xl">rocket_launch</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 font-headline uppercase tracking-tight">Our Mission</h2>
            <p className="text-zinc-400 leading-relaxed font-body">
              To provide our community with high-quality entertainment using state-of-the-art 3D projection and immersive sound systems, while maintaining a welcoming atmosphere for movie-loving families and friends.
            </p>
          </motion.div>
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-8 font-headline uppercase tracking-tight">Experience Matara's Finest</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-6 font-body">
              Located conveniently at the Matara Bus Stand Complex, SKYLITE 3D Cinema has been a cornerstone of local entertainment. We take pride in delivering a truly immersive 3D experience that transports you into the heart of the movie.
            </p>
            <p className="text-zinc-400 text-lg leading-relaxed font-body">
              From the latest Hollywood blockbusters to heart-warming local productions, every frame is presented with crystal clarity and every sound is felt with breathtaking depth.
            </p>
          </div>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-zinc-400 text-sm">location_on</span>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-white mb-2">Location</h4>
                <p className="text-zinc-500 text-sm font-body">Matara Bus Stand Complex,<br />Matara, Sri Lanka</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-zinc-400 text-sm">schedule</span>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-white mb-2">Service Hours</h4>
                <p className="text-zinc-500 text-sm font-body">Daily 10:00 AM - 11:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-zinc-400 text-sm">videocam</span>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-white mb-2">Technology</h4>
                <p className="text-zinc-500 text-sm font-body">Active 3D Projection & Dolby Surround Sound</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Showcase (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000" alt="Cinema" className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="h-64 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=1000" alt="Popcorn" className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity duration-500" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
