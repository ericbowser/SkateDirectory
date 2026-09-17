import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './styles/input.css';

const Map = lazy(() => import('./components/Map'));
const SuggestPark = lazy(() => import('./components/SuggestPark'));
const SkateParkForm = lazy(() => import('./components/SkateParkForm'));

function RouteFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-16 text-sm text-slate-500">
      Loading…
    </div>
  );
}

function LazyPage({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        element: (
          <LazyPage>
            <Map />
          </LazyPage>
        ),
      },
      {
        path: 'suggest-park',
        element: (
          <LazyPage>
            <SuggestPark />
          </LazyPage>
        ),
      },
      {
        path: 'skatepark-form',
        element: (
          <LazyPage>
            <SkateParkForm />
          </LazyPage>
        ),
      },
      {
        path: 'map',
        element: (
          <LazyPage>
            <Map />
          </LazyPage>
        ),
      },
    ],
  },
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
