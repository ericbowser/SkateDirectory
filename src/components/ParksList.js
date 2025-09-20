import React, {useEffect, useState} from 'react';
import {FetchData} from "../../api/http";
import {AgGridReact} from 'ag-grid-react';
import myTheme from "../styles/ag-grid-theme-builder";
import config from '../../env.json';

const WebsiteLinkRenderer = params => {
    if (params.value) {
        return <a href={params.value} target="_blank" rel="noopener noreferrer">{params.value}</a>
    }
    return null;
}

const ParksList = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [colDefs] = useState([
    { field: "parkName", headerName: "Name", filter: true, sortable: true, flex: 1 },
    { field: "parkAddress", headerName: "Address", filter: true, sortable: true, flex: 1.5 },
    { field: "parkStatus", headerName: "Status", filter: true, sortable: true, flex: 1 },
    { field: "hasLighting", headerName: "Lighting", filter: true, sortable: true, flex: 0.5, valueFormatter: p => p.value ? 'Yes' : 'No' },
    { field: "opens", headerName: "Opens", sortable: true, flex: 0.5 },
    { field: "closes", headerName: "Closes", sortable: true, flex: 0.5 },
    { field: "parkWebsite", headerName: "Website", flex: 1, cellRenderer: WebsiteLinkRenderer },
  ]);
  
  const fetchParks = async () => {
    setLoading(true);
    try {
      const response = await FetchData(`${config.BASE_URL}${config.REL_GET_PARK}`);
      setParks(response);
    } catch (err) {
      setError('Failed to load skatepark data. Please try again later.');
      console.error('Error fetching skateparks:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchParks().then(r => console.log(r));
  }, []);

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
    <div>
      <h1 className="text-3xl font-bold mb-6">All Skateparks</h1>
      <div style={{width: '100%', height: '600px'}}>
        <AgGridReact
          className="ag-theme-custom"
          theme={myTheme}
          rowData={parks}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
        />
      </div>
    </div>
  );
};

export default ParksList;
