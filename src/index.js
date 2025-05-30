import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.js';
import {BrowserRouter} from "react-router-dom";
import './styles/output.css';
import './styles/input.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </React.StrictMode>
);