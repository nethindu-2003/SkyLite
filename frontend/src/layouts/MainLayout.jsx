import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  // We define the raw CSS as a string here
  const pageStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@500;700;800&display=swap');
    
    body { 
      font-family: 'Inter', sans-serif; 
      background-color: #131314;
      color: #e5e2e3;
    }
    
    h1, h2, h3, .headline { 
      font-family: 'Manrope', sans-serif; 
    }
    
    .material-symbols-outlined { 
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; 
    }
    
    .glass-panel { 
      backdrop-filter: blur(20px); 
      -webkit-backdrop-filter: blur(20px); 
    }
    
    .no-scrollbar::-webkit-scrollbar { 
      display: none; 
    }
    
    .no-scrollbar { 
      -ms-overflow-style: none; 
      scrollbar-width: none; 
    }
  `;

  return (
    <div className="min-h-screen flex flex-col bg-[#131314] text-[#e5e2e3] selection:bg-[#e50914] selection:text-white">
      {/* Injecting the styles directly into the DOM */}
      <style>{pageStyles}</style>

      <Navbar />
      
      {/* Page content (like Home.jsx) injected here */}
      <div className="flex-grow pt-20"> 
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}