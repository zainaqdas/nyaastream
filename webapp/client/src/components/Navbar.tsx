import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Play } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <Play size={20} fill="white" className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NyaaStream
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/browse" className="hover:text-primary transition-colors">Browse</Link>
              <Link to="/trending" className="hover:text-primary transition-colors">Trending</Link>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search anime..."
                className="w-full bg-slate-800/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button className="hidden sm:block text-sm font-semibold bg-white text-slate-900 px-5 py-2 rounded-full hover:bg-slate-200 transition-colors">
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10 px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search anime..."
              className="w-full bg-slate-800 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </form>
          <div className="flex flex-col gap-4 text-slate-300 font-medium">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/browse" onClick={() => setIsMenuOpen(false)}>Browse</Link>
            <Link to="/trending" onClick={() => setIsMenuOpen(false)}>Trending</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
