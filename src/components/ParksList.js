import React, {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {FetchData, PostData} from "../../api/http";

const ParksList = () => {
  const [parks, setParks] = useState([]);
  const [filteredParks, setFilteredParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const fetchParks = async () => {
    setLoading(true);
    try {
      const response = await FetchData(`${process.env.BASE_URL}${process.env.REL_GET_PARK}`);
      setParks(response);
      setFilteredParks(response);
      setLoading(false);
      return response;
    } catch (err) {
      setError('Failed to load skatepark data. Please try again later.');
      setLoading(false);
      console.error('Error fetching skateparks:', err);
    }
  };

  useEffect(() => {
    if (parks.length === 0) {
      fetchParks().then(response => console.log(response));
    } else if (parks.length > 0) {
      filterAndSortParks();
    }
  }, [parks]);


  const filterAndSortParks = () => {
    // Apply search filter
    console.log("search", search);
    let result = parks.filter(park => {
      const searchLower = search.toLowerCase();
      return (
        park.parkName.toLowerCase().includes(searchLower) ||
        park.parkDescription.toLowerCase().includes(searchLower) ||
        park.parkAddress.toLowerCase().includes(searchLower)
      );
    });

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter(park => park.DifficultyOpinion === difficultyFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'name') {
        aValue = a.ParkName;
        bValue = b.ParkName;
      } else if (sortBy === 'difficulty') {
        // Custom difficulty order: Beginner, Intermediate, Advanced, All-Levels
        const difficultyOrder = {
          'Beginner': 1,
          'Intermediate': 2,
          'Advanced': 3,
          'All-Levels': 4
        };
        aValue = difficultyOrder[a.DifficultyOpinion] || 999;
        bValue = difficultyOrder[b.DifficultyOpinion] || 999;
      } else if (sortBy === 'status') {
        // Custom status order: Active, Under Construction, Temporarily Closed, Closed
        const statusOrder = {
          'Active': 1,
          'Under Construction': 2,
          'Temporarily Closed': 3,
          'Closed': 4
        };
        aValue = statusOrder[a.ParkStatus] || 999;
        bValue = statusOrder[b.ParkStatus] || 999;
      }

      // Apply sort order
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredParks(result);
  };

  const handleSearchChange = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  const handleSortChange = async (e) => {
    e.preventDefault();
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = async () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDifficultyFilterChange = async (e) => {
    e.preventDefault();
    setDifficultyFilter(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="parks-list">
      <h1 className="text-3xl font-bold mb-6">All Skateparks</h1>
      {filteredParks.length > 0 ? (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Difficulty</th>
            <th className="border border-gray-300 px-4 py-2">Address</th>
            <th className="border border-gray-300 px-4 py-2">Lighting</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Latitude</th>
            <th className="border border-gray-300 px-4 py-2">Longitude</th>
            <th className="border border-gray-300 px-4 py-2">Opens</th>
            <th className="border border-gray-300 px-4 py-2">Closes</th>
            <th className="border border-gray-300 px-4 py-2">Last Updated</th>
            <th className="border border-gray-300 px-4 py-2">Website</th>
            <th className="border border-gray-300 px-4 py-2">Variable Hours</th>
          </tr>
          </thead>
          <tbody>
          {filteredParks.map((park, index) => (
            <tr key={`${park.Id}${index}`} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{park.parkName}</td>
              <td className="border border-gray-300 px-4 py-2">{park.parkStatus}</td>
              <td className="border border-gray-300 px-4 py-2">{park.difficultyOpinion}</td>
              <td className="border border-gray-300 px-4 py-2">{park.parkAddress}</td>
              <td className="border border-gray-300 px-4 py-2">{park.hasLighting ? 'Yes' : 'No'}</td>
              <td className="border border-gray-300 px-4 py-2">{park.parkDescription}</td>
              <td className="border border-gray-300 px-4 py-2">{park.locationLatitude}</td>
              <td className="border border-gray-300 px-4 py-2">{park.locationLongitude}</td>
              <td className="border border-gray-300 px-4 py-2">{park.opens}</td>
              <td className="border border-gray-300 px-4 py-2">{park.closes}</td>
              <td className="border border-gray-300 px-4 py-2">{park.lastUpdatedDate}</td>
              <td className="border border-gray-300 px-4 py-2">
                {park.parkWebsite ? (
                  <a href={park.parkWebsite} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    Link
                  </a>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">{park.hasVariableHours ? 'Yes' : 'No'}</td>
            </tr>
          ))}
          </tbody>
        </table>
      ) : null}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search parks by name, description, or address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex gap-2 items-center">
          <label htmlFor="sortBy" className="whitespace-nowrap">Sort by:</label>
          <select
            id="sortBy"
            className="px-3 py-2 border rounded-lg"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="name">Name</option>
            <option value="difficulty">Difficulty</option>
            <option value="status">Status</option>
          </select>

          <button
            onClick={handleSortOrderChange}
            className="px-3 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ParksList;