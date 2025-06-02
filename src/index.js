import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { createBrowserRouter, RouterProvider } from "react-router";
import ParksList from "./components/ParksList";
import SkateParkForm from "./components/SkateParkForm";

let router = createBrowserRouter([
  {
    path: "/",
    Component: App
  },
  {
    path: "/parks",
    Component: ParksList
  },
  {
    path: "/skateparkform",
    Component: SkateParkForm
  },
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);