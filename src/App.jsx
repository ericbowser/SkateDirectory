import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-slate-900">
      <header className="z-50 shrink-0 border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between sm:h-14">
            <Link to="/" className="flex items-center gap-3">
              <span className="text-base font-semibold text-slate-100 sm:text-lg">
                SLC <span className="text-amber-400">Skate Directory</span>
              </span>
              <span className="hidden border-l border-slate-700 pl-3 text-xs text-slate-500 lg:block">
                Salt Lake City &middot; Find Your Next Session
              </span>
            </Link>
            <nav>
              <ul className="flex items-center gap-5 sm:gap-6">
                <li>
                  <Link
                    to="/"
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-amber-400"
                  >
                    Map
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parks"
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-amber-400"
                  >
                    Parks
                  </Link>
                </li>
                <li>
                  <Link
                    to="/skatepark-form"
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-amber-400"
                  >
                    Add Park
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex min-h-0 w-full max-w-[96rem] flex-1 flex-col px-3 py-2 sm:px-4">
          <Outlet />
        </div>
      </main>

      <footer className="shrink-0 border-t border-slate-700 bg-slate-800 py-2">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:text-sm">
          <p>&copy; {new Date().getFullYear()} SLC Skate Directory</p>
        </div>
      </footer>
    </div>
  );
}
