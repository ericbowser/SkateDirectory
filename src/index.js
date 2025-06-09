import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { createBrowserRouter, RouterProvider } from "react-router";
import ParksList from "./components/ParksList";
import SkateParkForm from "./components/SkateParkForm";
import Map from "./components/Map";
import Features from "./components/Features";
import 'bootstrap/dist/css/bootstrap.min.css';

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
    path: "/addpark",
    Component: SkateParkForm
  },
  {
    path: "/map",
    Component: Map
  },
  {
    path: "/features",
    Component: Features
  },
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);