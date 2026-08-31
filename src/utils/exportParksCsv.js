function csvCell(value) {
  if (value == null || value === '') return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function parkRow(park) {
  return {
    id: park.id ?? '',
    parkName: park.parkName ?? park.ParkName ?? '',
    parkStatus: park.parkStatus ?? park.ParkStatus ?? '',
    parkAddress: park.parkAddress ?? park.ParkAddress ?? '',
    locationLatitude: park.locationLatitude ?? park.LocationLatitude ?? '',
    locationLongitude: park.locationLongitude ?? park.LocationLongitude ?? '',
    hasLighting: park.hasLighting ?? park.HasLighting ?? false,
    opens: park.opens ?? park.Opens ?? '',
    closes: park.closes ?? park.Closes ?? '',
    isOpen24Hours: park.isOpen24Hours ?? park.IsOpen24Hours ?? false,
    parkWebsite: park.parkWebsite ?? park.ParkWebsite ?? '',
    parkDescription: park.parkDescription ?? park.ParkDescription ?? '',
  };
}

const CSV_COLUMNS = [
  'id',
  'parkName',
  'parkStatus',
  'parkAddress',
  'locationLatitude',
  'locationLongitude',
  'hasLighting',
  'opens',
  'closes',
  'isOpen24Hours',
  'parkWebsite',
  'parkDescription',
];

/**
 * Download the currently loaded park list as CSV (same data shown on the map).
 */
export function downloadParksCsv(parks, filename) {
  const list = Array.isArray(parks) ? parks : [];
  const header = CSV_COLUMNS.join(',');
  const body = list
    .map((park) => {
      const row = parkRow(park);
      return CSV_COLUMNS.map((col) => csvCell(row[col])).join(',');
    })
    .join('\n');

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download =
    filename || `skateparks-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export { CSV_COLUMNS, parkRow };
