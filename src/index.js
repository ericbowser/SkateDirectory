import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.js';
import {createBrowserRouter, RouterProvider} from "react-router";
import ParksList from "./components/ParksList";
import SkateParkForm from "./components/SkateParkForm";
import ReactDOM from "react-dom/client";

const container = document.getElementById('root');
const root = createRoot(container);
let router = createBrowserRouter([
  {
    path: "/",
    Component: <App/>
  },
  {
    path: "/parks",
    Component: <ParksList />
  },
  {
    path: "/skateparkform",
    Component: <SkateParkForm />
  },
]);

ReactDOM.createRoot(root).render(
    <RouterProvider router={router} />
);