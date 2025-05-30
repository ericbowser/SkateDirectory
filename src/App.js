import React, {useState} from 'react';
import {Outlet, Link} from 'react-router';
import SkateParkForm from "./components/SkateParkForm";
import Map from "./components/Map";


export default function AppLayout() {
  return (
    <div className="app-container">
      {/*<header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 shadow-md">*/}
      {/*  <div className="container mx-auto flex justify-between items-center">*/}
      {/*    <h1 className="text-2xl font-bold">SLC Skate Directory</h1>*/}
      {/*    <nav>*/}
      {/*      <Map/>*/}
      {/*      <ul className="flex space-x-6">*/}
      {/*        <li><Link to="/" className="hover:text-blue-200 transition-colors">Map</Link></li>*/}
      {/*        <li><Link to="/parks" className="hover:text-blue-200 transition-colors">Parks</Link></li>*/}
      {/*        <li><Link to="/add-park" className="hover:text-blue-200 transition-colors">Add Park</Link></li>*/}
      {/*        <li><Link to="/about" className="hover:text-blue-200 transition-colors">About</Link></li>*/}
      {/*      </ul>*/}
      {/*    </nav>*/}
      {/*  </div>*/}
      {/*</header>*/}

      <main className="container mx-auto p-4">
        <SkateParkForm/>
      </main>
      {/*<footer className="bg-gray-200 p-4 mt-8">*/}
      {/*  <div className="container mx-auto text-center text-gray-600">*/}
      {/*    <p>&copy; {new Date().getFullYear()} SLC Skate Directory</p>*/}
      {/*  </div>*/}
      {/*</footer>*/}
    </div>
  );
}