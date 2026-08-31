import React from 'react';

import { Outlet, Link, useLocation } from 'react-router-dom';

import { parkAdminEnabled } from './config/env';

import AnimatedPageBackground from './components/AnimatedPageBackground';



export default function App() {

  const { pathname } = useLocation();

  const isMapHome = pathname === '/' || pathname === '/map';



  return (

    <div className="relative flex h-dvh w-full flex-col overflow-hidden overflow-x-hidden bg-black">

      <AnimatedPageBackground />



      <div className="relative z-10 flex min-h-0 flex-1 flex-col">

        <header className="z-50 shrink-0 border-b border-slate-800/80 bg-black/80 backdrop-blur-md">

          <div className="mx-auto max-w-7xl px-3 sm:px-4">

            <div className="flex h-11 items-center justify-between sm:h-12">

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

                      to="/suggest-park"

                      className="text-sm font-medium text-slate-400 transition-colors hover:text-amber-400"

                    >

                      Suggest a park

                    </Link>

                  </li>

                  {parkAdminEnabled && (

                    <li>

                      <Link

                        to="/skatepark-form"

                        className="text-sm font-medium text-slate-500 transition-colors hover:text-amber-400"

                      >

                        Admin

                      </Link>

                    </li>

                  )}

                </ul>

              </nav>

            </div>

          </div>

        </header>



        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">

          <div

            className={`mx-auto flex min-h-0 w-full max-w-[96rem] flex-1 flex-col ${

              isMapHome

                ? 'min-h-0 min-w-0 px-3 pb-4 pt-2 sm:px-4 sm:pb-5'

                : 'overflow-y-auto px-3 pb-6 pt-2 sm:px-4 sm:pb-8'

            }`}

          >

            <Outlet />

          </div>

        </main>



        <footer className="shrink-0 border-t border-slate-700/80 bg-black/80 py-2.5 backdrop-blur-md">

          <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:text-sm">

            <p>&copy; {new Date().getFullYear()} SLC Skate Directory</p>

          </div>

        </footer>

      </div>

    </div>

  );

}

