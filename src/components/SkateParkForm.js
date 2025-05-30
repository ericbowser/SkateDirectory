import React, { useState, useEffect } from 'react';
import {FetchData, PostData} from "../../api/http";
import ParksList from './ParksList';

const SkateparkForm = () => {
  const [formData, setFormData] = useState({
    ParkName: '',
    ParkStatus: 'Active',
    LocationLatitude: '',
    LocationLongitude: '',
    ParkAddress: '',
    DifficultyOpinion: 'Intermediate',
    HasLighting: false,
    ParkDescription: '',
    Opens: '08:00',
    Closes: 'Dusk', // Default value, can be either a time or "Dusk"
    CreatedDate: new Date().toISOString().split('T')[0],
    LastUpdatedDate: new Date().toISOString().split('T')[0],
    ParkWebsite: '',
    SelectedFeatures: [], // Array of feature IDs
    isVariableClosing: true // Flag for variable closing time (dusk)
  });

  const [availableFeatures, setAvailableFeatures] = useState([{}]);
  const [parks, setParks] = useState([{}]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState({
    FeatureName: '',
    FeatureType: 'Obstacle',
    FeatureCategory: 'Street'
  });
  const [showNewFeatureForm, setShowNewFeatureForm] = useState(false);
  
  const fetchParks = async () => {
    try {
      const response = await FetchData(`${process.env.BASE_URL}${process.env.REL_GET_PARK}`);
      setParks(response.data);
    } catch (error) {
      console.error('Error fetching features:', error);
      setMessage({
        text: 'Failed to load features. Please refresh the page.',
        type: 'error'
      });
    }
  }
  
  // // Fetch available features from the database
  // useEffect(() => {
  //   fetchParks().then(parks => {
  //     console.log("fetched parks", parks);
  //   });
  // }, [parks]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Toggle variable closing time
  const handleVariableClosingChange = (e) => {
    const isVariable = e.target.checked;
    setFormData(prev => ({
      ...prev,
      isVariableClosing: isVariable,
      Closes: isVariable ? 'Dusk' : '21:00'
    }));
  };

  // Toggle feature selection
  const toggleFeature = (featureId) => {
    setFormData(prev => {
      // Check if feature is already selected
      if (prev.SelectedFeatures.includes(featureId)) {
        // Remove feature
        return {
          ...prev,
          SelectedFeatures: prev.SelectedFeatures.filter(id => id !== featureId)
        };
      } else {
        // Add feature
        return {
          ...prev,
          SelectedFeatures: [...prev.SelectedFeatures, featureId]
        };
      }
    });
  };

  // Handle new feature input
  const handleNewFeatureChange = (e) => {
    const { name, value } = e.target;
    setNewFeature(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new feature to database
  const addNewFeature = async (e) => {
    e.preventDefault();

    if (!newFeature.FeatureName.trim()) {
      setMessage({
        text: 'Feature name is required',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await PostData(`${process.env.BASE_URL}${process.env.REL_GET_FEATURE}`, newFeature);

      // Add new feature to available features
      setAvailableFeatures(prev => [...prev, response.data]);

      // Reset new feature form
      setNewFeature({
        FeatureName: '',
        FeatureType: 'Obstacle',
        FeatureCategory: 'Street'
      });

      setShowNewFeatureForm(false);
      setMessage({
        text: `Added new feature: ${response.data.FeatureName}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding new feature:', error);
      setMessage({
        text: error.response?.data?.message || 'Error adding feature',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
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
        LastUpdatedDate: new Date().toISOString().split('T')[0]
      };

      console.log('Skatepark Data:', skateparkData);
      // Send to API
      const response = await PostData(`${process.env.BASE_URL}${process.env.REL_ADD_PARK}`, skateparkData);

      setMessage({
        text: `Successfully added ${response.data.ParkName} to the database!`,
        type: 'success'
      });

      // Reset form
      setFormData({
        ParkName: '',
        ParkStatus: 'Active',
        LocationLatitude: '',
        LocationLongitude: '',
        ParkAddress: '',
        DifficultyOpinion: 'Intermediate',
        HasLighting: false,
        ParkDescription: '',
        Opens: '08:00',
        Closes: 'Dusk',
        CreatedDate: new Date().toISOString().split('T')[0],
        LastUpdatedDate: new Date().toISOString().split('T')[0],
        ParkWebsite: '',
        SelectedFeatures: [],
        isVariableClosing: true
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

  // Group features by category for better organization
  const groupedFeatures = availableFeatures.reduce((acc, feature) => {
    const category = feature.FeatureCategory || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {});

  return (
    <div className="container mt-8">
      <h2>Add New Skatepark</h2>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <h3>Basic Information</h3>

          <div>
            <label htmlFor="ParkName">Skatepark Name *</label>
            <input
              type="text"
              id="ParkName"
              name="ParkName"
              value={formData.ParkName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="ParkDescription">Description *</label>
            <textarea
              id="ParkDescription"
              name="ParkDescription"
              value={formData.ParkDescription}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>

          <div>
            <div>
              <label htmlFor="DifficultyOpinion">Difficulty Level</label>
              <select
                id="DifficultyOpinion"
                name="DifficultyOpinion"
                value={formData.DifficultyOpinion}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All-Levels">All Levels</option>
              </select>
            </div>

            <div>
              <label htmlFor="ParkStatus">Status</label>
              <select
                id="ParkStatus"
                name="ParkStatus"
                value={formData.ParkStatus}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Closed">Closed</option>
                <option value="Temporarily Closed">Temporarily Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3>Location</h3>

          <div>
            <label htmlFor="ParkAddress">Address</label>
            <input
              type="text"
              id="ParkAddress"
              name="ParkAddress"
              value={formData.ParkAddress}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="LocationLatitude">Latitude *</label>
              <input
                type="text"
                id="LocationLatitude"
                name="LocationLatitude"
                value={formData.LocationLatitude}
                onChange={handleChange}
                required
                placeholder="40.7608"
              />
            </div>

            <div>
              <label htmlFor="LocationLongitude">Longitude *</label>
              <input
                type="text"
                id="LocationLongitude"
                name="LocationLongitude"
                value={formData.LocationLongitude}
                onChange={handleChange}
                required
                placeholder="-111.8910"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ParkWebsite">Website (Optional)</label>
            <input
              type="url"
              id="ParkWebsite"
              name="ParkWebsite"
              value={formData.ParkWebsite}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <h3>Features</h3>

          {Object.entries(groupedFeatures).map(([category, features]) => (
            <div key={category}>
              <h4>{category}</h4>
              <div>
                {features.map(feature => (
                  <div key={feature.Id}>
                    <input
                      type="checkbox"
                      id={`feature-${feature.Id}`}
                      checked={formData.SelectedFeatures.includes(feature.Id)}
                      onChange={() => toggleFeature(feature.Id)}
                    />
                    <label htmlFor={`feature-${feature.Id}`}>
                      {feature.FeatureName}
                      {feature.FeatureType && ` (${feature.FeatureType})`}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            {showNewFeatureForm ? (
              <div>
                <h4>Add New Feature</h4>
                <div>
                  <div>
                    <label htmlFor="FeatureName">Feature Name *</label>
                    <input
                      type="text"
                      id="FeatureName"
                      name="FeatureName"
                      value={newFeature.FeatureName}
                      onChange={handleNewFeatureChange}
                      required
                    />
                  </div>

                  <div >
                    <label htmlFor="FeatureType">Feature Type</label>
                    <select
                      id="FeatureType"
                      name="FeatureType"
                      value={newFeature.FeatureType}
                      onChange={handleNewFeatureChange}
                    >
                      <option value="Obstacle">Obstacle</option>
                      <option value="Ramp">Ramp</option>
                      <option value="Rail">Rail</option>
                      <option value="Bowl">Bowl</option>
                      <option value="Pool">Pool</option>
                      <option value="Amenity">Amenity</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="FeatureCategory">Category</label>
                    <select
                      id="FeatureCategory"
                      name="FeatureCategory"
                      value={newFeature.FeatureCategory}
                      onChange={handleNewFeatureChange}
                    >
                      <option value="Street">Street</option>
                      <option value="Vert">Vert</option>
                      <option value="Transition">Transition</option>
                      <option value="Facility">Facility</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={addNewFeature}
                    disabled={loading || !newFeature.FeatureName.trim()}
                  >
                    {loading ? 'Adding...' : 'Add Feature'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewFeatureForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewFeatureForm(true)}
              >
                + Add New Feature
              </button>
            )}
          </div>
        </div>

        <div >
          <h3>Hours of Operation</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Opens">Opens At</label>
              <input
                type="time"
                id="Opens"
                name="Opens"
                value={formData.Opens}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="Closes">Closes At</label>
              {formData.isVariableClosing ? (
                <select
                  id="Closes"
                  name="Closes"
                  value={formData.Closes}
                  onChange={handleChange}
                >
                  <option value="Dusk">Dusk</option>
                  <option value="Sunset">Sunset</option>
                </select>
              ) : (
                <input
                  type="time"
                  id="Closes"
                  name="Closes"
                  value={formData.Closes}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>

          <div>
            <input
              type="checkbox"
              id="isVariableClosing"
              name="isVariableClosing"
              checked={formData.isVariableClosing}
              onChange={handleVariableClosingChange}
            />
            <label htmlFor="isVariableClosing">Variable Closing Time (Dusk/Sunset)</label>
          </div>

          <div>
            <input
              type="checkbox"
              id="HasLighting"
              name="HasLighting"
              checked={formData.HasLighting}
              onChange={handleChange}
            />
            <label htmlFor="HasLighting">Has Lights for Night Skating</label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Add Skatepark'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SkateparkForm;