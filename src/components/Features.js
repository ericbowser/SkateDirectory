import React, {useEffect, useState} from "react";
import {FetchData, PostData} from "../../api/http";

const Features = () => {
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFeature, setNewFeature] = useState(null);
  const [showNewFeatureForm, setShowNewFeatureForm] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState([{}]);
  const [message, setMessage] = useState({ text: '', type: '' });


  // Group features by category for better organization
  const groupedFeatures = availableFeatures.reduce((acc, feature) => {
    const category = feature.FeatureCategory || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {});

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
  async function getFeatures() {
    const features = await FetchData(`${process.env.BASE_URL}${process.env.REL_GET_FEATURE}`);
    if (features && features.length > 0) {
      setFeatures(features);
      setLoading(false);
    } else {
      setLoading(false);
      setError("Couldn't fetch park features...");
    }
  }

  useEffect(() => {
    if (!features) {
      getFeatures().then(features => console.log("features", features));
    }
  }, [features])

  if (error) return (
    <alert className={'alert alert-danger'}>
      {error}
    </alert>
  )

  return (
    <div>
      {features && features.length > 0 ?
        <table className={'table table-striped'}>
          <tbody className={'p-4'}>
          <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Feature Name</th>
            <th className="border border-gray-300 px-4 py-2">Feature Type</th>
            <th className="border border-gray-300 px-4 py-2">Feature Category</th>
          </tr>
          </thead>
          {features.map(feature => (
            <tr key={`${feature.featureId}${feature.featureName}`}>
              <td>
                {feature.featureName}
              </td>
              <td>
                {feature.featureType}
              </td>
              <td>
                {feature.featureCategory}
              </td>
            </tr>
          ))}
          </tbody>
        </table> : null}

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
  )
};

export default Features;