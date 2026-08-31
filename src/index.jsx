import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SkateParkForm from "./components/SkateParkForm";
import SuggestPark from "./components/SuggestPark";
import Map from "./components/Map";
import './styles/input.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ AllCommunityModule ]);

let router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: Map
      },
      {
        path: "suggest-park",
        Component: SuggestPark
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