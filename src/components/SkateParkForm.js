import React, {useState, useEffect} from 'react';
import {FetchData, PostData} from "../../api/http";
import FormControl from "react-bootstrap/FormControl";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import FormText from "react-bootstrap/FormText";

const SkateparkForm = () => {
  const [formData, setFormData] = useState({
    parkName: '',
    parkStatus: 'Active',
    locationLatitude: '',
    locationLongitude: '',
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

  const [parks, setParks] = useState(null);
  const [message, setMessage] = useState({text: '', type: ''});
  const [loading, setLoading] = useState(false);

  const fetchParks = async () => {
    try {
      const response = await FetchData(`${process.env.BASE_URL}${process.env.REL_GET_PARK}`);
      setParks(response);
    } catch (error) {
      console.error('Error fetching features:', error);
      setMessage({
        text: 'Failed to load features. Please refresh the page.',
        type: 'error'
      });
    }
  }

  // Fetch available features from the database
  useEffect(() => {
    if (!parks) {
      fetchParks().then(parks => {
        console.log("fetched parks", parks);
      });
    }
  }, [parks]);

  // Handle form input changes
  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({text: '', type: ''});

    try {
      // Validate coordinates
      const lat = parseFloat(formData.locationLatitude);
      const lng = parseFloat(formData.locationLongitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.');
      }

      // Prepare data for API
      const skateparkData = {
        ...formData,
        locationLatitude: lat,
        locationLongitude: lng,
        LastUpdatedDate: new Date().toISOString().split('T')[0]
      };

      console.log('Skatepark Data:', skateparkData);
      // Send to API
      const response = await PostData(`${process.env.BASE_URL}${process.env.REL_ADD_PARK}`, skateparkData);

      setMessage({
        text: `Successfully added ${response.data.parkName} to the database!`,
        type: 'success'
      });

      // Reset form
      setFormData({
        parkName: '',
        ParkStatus: 'Active',
        locationLatitude: '',
        locationLongitude: '',
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

  return (
    <FormControl className={'container-sm m-8 p-lg-5'} onSubmit={handleSubmit}>
      <FormText>Basic Information</FormText>
      <FormControl type={'label'} htmlFor="parkName">Skatepark Name *</FormControl>
      <Form.Control
        className={'mb-4'}
        as={'input'}
        id="parkName"
        name="parkName"
        value={formData.parkName}
        onChange={handleChange}
      />
      <FormControl
        type={'label'}
        htmlFor="ParkDescription">
        Description *
      </FormControl>
      <Form.Control

        className={'mb-4'}
        type={'textarea'}
        id="ParkDescription"
        name="ParkDescription"
        value={formData.ParkDescription}
        onChange={handleChange}
        required
        rows="2"
      />

      <FormControl type={'label'} htmlFor="DifficultyOpinion">Difficulty Level</FormControl>
      <Form.Select
        className={'mb-4'}
        type={'select'}
        id="DifficultyOpinion"
        name="DifficultyOpinion"
        value={formData.DifficultyOpinion}
        onChange={handleChange}
      >
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
        <option value="All-Levels">All Levels</option>
      </Form.Select>
      <FormControl
        type={'label'}
        className={'mb-4'}
        htmlFor="parkStatus">Status</FormControl>
      <Form.Select
        className={'mb-4'}
        type={'select'}
        id="parkStatus"
        name="parkStatus"
        value={formData.parkStatus}
        onChange={handleChange}
      >
        <option value="Active">Active</option>
        <option value="Under Construction">Under Construction</option>
        <option value="Closed">Closed</option>
        <option value="Temporarily Closed">Temporarily Closed</option>
      </Form.Select>
      <FormControl
        type={'label'}
        className={'mb-2'}
        htmlFor="akAddress">Address
      </FormControl>
      <Form.Control
        className={'mb-4'}
        as={'input'}
        id="ParkAddress"
        name="ParkAddress"
        value={formData.ParkAddress}
        onChange={handleChange}
      />
      <FormControl type={'label'} htmlFor="locationLatitude">Latitude *</FormControl>
      <Form.Control
        className={'mb-4'}
        as={'input'}
        id="locationLatitude"
        name="locationLatitude"
        value={formData.locationLatitude}
        onChange={handleChange}
        required
        placeholder="40.7608"
      />
      <FormControl type={'label'} htmlFor="locationLongitude">Longitude *</FormControl>
      <Form.Control
        className={'mb-4'}
        as={'input'}
        id="locationLongitude"
        name="locationLongitude"
        value={formData.locationLongitude}
        onChange={handleChange}
        required
        placeholder="-111.8910"
      />
      <FormControl type={'label'} htmlFor="ParkWebsite">Website (Optional)</FormControl>
      <Form.Control
        className={'mb-4'}
        type="url"
        id="ParkWebsite"
        name="ParkWebsite"
        value={formData.ParkWebsite}
        onChange={handleChange}
        placeholder="https://example.com"
      />

      <FormText className={'mb-2'}>Hours of Operation</FormText>
      <FormControl type={'label'} htmlFor="Opens">Opens At</FormControl>
      <Form.Control
        className={'mb-4'}
        type="time"
        id="Opens"
        name="Opens"
        value={formData.Opens}
        onChange={handleChange}
      />
      <FormControl type={'label'} htmlFor="Closes">Closes At</FormControl>
      {formData.isVariableClosing ? (
        <Form.Select
          className={'mb-4'}
          type={'select'}
          id="Closes"
          name="Closes"
          value={formData.Closes}
          onChange={handleChange}
        >
          <option value="Dusk">Dusk</option>
          <option value="Sunset">Sunset</option>
        </Form.Select>
      ) : (
        <Form.Control
          className={'mb-4'}
          type={'time'}
          id="Closes"
          name="Closes"
          value={formData.Closes}
          onChange={handleChange}
        />
      )}
      {/*<Form.Control*/}
      {/*  className={'mb-4'}*/}
      {/*  type={'checkbox'}*/}
      {/*  id="isVariableClosing"*/}
      {/*  name="isVariableClosing"*/}
      {/*  checked={formData.isVariableClosing}*/}
      {/*  onChange={handleVariableClosingChange}*/}
      {/*/>*/}
      {/*<Form.Label htmlFor="isVariableClosing">Variable Closing Time (Dusk/Sunset)</Form.Label>*/}
      {/*<Form.Control*/}
      {/*  className={'mb-4'}*/}
      {/*  type={'checkbox'}*/}
      {/*  checked={formData.HasLighting}*/}
      {/*  onChange={handleChange}*/}
      {/*/>*/}
      <FormControl type={'label'} htmlFor="HasLighting">Has Lights for Night Skating</FormControl>
        <Button className={'mb-4'} type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Add Skatepark'}
        </Button>
    
    </FormControl>
    
  );
};

export default SkateparkForm;