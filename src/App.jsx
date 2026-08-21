import React from 'react';
import { Outlet, Link } from 'react-router-dom';
export default function App() {
  return (
    <div className="w-full h-screen flex flex-col bg-slate-900">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <span className="text-lg font-semibold text-slate-100">
                SLC <span className="text-amber-400">Skate Directory</span>
              </span>
              <span className="hidden lg:block text-xs text-slate-500 border-l border-slate-700 pl-3">
                Salt Lake City &middot; Find Your Next Session
              </span>
            </Link>
            <nav>
              <ul className="flex items-center gap-6">
                <li><Link to="/" className="text-slate-400 hover:text-amber-400 transition-colors text-sm font-medium">Map</Link></li>
                <li><Link to="/parks" className="text-slate-400 hover:text-amber-400 transition-colors text-sm font-medium">Parks</Link></li>
                <li><Link to="/skatepark-form" className="text-slate-400 hover:text-amber-400 transition-colors text-sm font-medium">Add Park</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} SLC Skate Directory</p>
        </div>
      </footer>
    </div>
  );
}