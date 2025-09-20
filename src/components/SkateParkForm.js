import React, { useState, useEffect } from 'react';
import { FetchData, PostData } from "../../api/http";
import config from '../../env.json';

const SkateparkForm = () => {
  const [formData, setFormData] = useState({
    ParkName: '',
    ParkStatus: 'Active',
    LocationLatitude: '',
    LocationLongitude: '',
    ParkAddress: '',
    HasLighting: false,
    ParkDescription: '',
    Opens: '08:00',
    Closes: 'Dusk',
    ParkWebsite: '',
    HasVariableHours: true, // Simplified from isVariableClosing
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Validate coordinates
      const lat = parseFloat(formData.LocationLatitude);
      const lng = parseFloat(formData.LocationLongitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.');
      }

      // Prepare data for API
      const skateparkData = {
        ...formData,
        LocationLatitude: lat,
        LocationLongitude: lng,
        LastUpdatedDate: new Date().toISOString()
      };

      const response = await PostData(`${config.BASE_URL}${config.REL_ADD_PARK}`, skateparkData);

      setMessage({
        text: `Successfully added ${response.ParkName} to the database!`,
        type: 'success'
      });

      // Reset form
      setFormData({
        ParkName: '',
        ParkStatus: 'Active',
        LocationLatitude: '',
        LocationLongitude: '',
        ParkAddress: '',
        HasLighting: false,
        ParkDescription: '',
        Opens: '08:00',
        Closes: 'Dusk',
        ParkWebsite: '',
        HasVariableHours: true,
      });

    } catch (error) {
      console.error('Error submitting skatepark:', error);
      setMessage({
        text: error.response?.data?.message || error.message || 'Error adding skatepark',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="skatepark-form-container max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add New Skatepark</h2>

      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ParkName" className="block text-sm font-medium text-gray-700">Skatepark Name *</label>
              <input type="text" id="ParkName" name="ParkName" value={formData.ParkName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="ParkStatus" className="block text-sm font-medium text-gray-700">Status</label>
              <select id="ParkStatus" name="ParkStatus" value={formData.ParkStatus} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Active</option>
                <option>Under Construction</option>
                <option>Closed</option>
                <option>Temporarily Closed</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="ParkDescription" className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea id="ParkDescription" name="ParkDescription" value={formData.ParkDescription} onChange={handleChange} required rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        {/* Location Information */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="LocationLatitude" className="block text-sm font-medium text-gray-700">Latitude *</label>
              <input type="text" id="LocationLatitude" name="LocationLatitude" value={formData.LocationLatitude} onChange={handleChange} required placeholder="40.7608" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="LocationLongitude" className="block text-sm font-medium text-gray-700">Longitude *</label>
              <input type="text" id="LocationLongitude" name="LocationLongitude" value={formData.LocationLongitude} onChange={handleChange} required placeholder="-111.8910" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="ParkAddress" className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" id="ParkAddress" name="ParkAddress" value={formData.ParkAddress} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="mt-4">
            <label htmlFor="ParkWebsite" className="block text-sm font-medium text-gray-700">Website (Optional)</label>
            <input type="url" id="ParkWebsite" name="ParkWebsite" value={formData.ParkWebsite} onChange={handleChange} placeholder="https://example.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        {/* Hours and Lighting */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Hours and Lighting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="Opens" className="block text-sm font-medium text-gray-700">Opens At</label>
              <input type="time" id="Opens" name="Opens" value={formData.Opens} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="Closes" className="block text-sm font-medium text-gray-700">Closes At</label>
              <input type="time" id="Closes" name="Closes" value={formData.Closes} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <input id="HasLighting" name="HasLighting" type="checkbox" checked={formData.HasLighting} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label htmlFor="HasLighting" className="ml-2 block text-sm text-gray-900">Has Lights for Night Skating</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Add Skatepark'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SkateparkForm;