import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ParksList from "./components/ParksList";
import SkateParkForm from "./components/SkateParkForm";
import Map from "./components/Map";
import './styles/output.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ AllCommunityModule ]);

let router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: ParksList
      },
      {
        path: "parks",
        Component: ParksList
      },
      {
        path: "skatepark-form",
        Component: SkateParkForm
      },
      {
        path: "map",
        Component: Map
      }
    ]
  }
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);