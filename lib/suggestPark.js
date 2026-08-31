const fs = require('fs');
const path = require('path');

const SUGGESTIONS_DIR = path.join(__dirname, '..', 'data');
const SUGGESTIONS_FILE = path.join(SUGGESTIONS_DIR, 'park-suggestions.jsonl');

function validateSuggestion(body) {
  const parkName = String(body.parkName ?? body.ParkName ?? '').trim();
  const address = String(body.address ?? body.Address ?? '').trim();
  const description = String(body.description ?? body.Description ?? '').trim();

  if (!parkName || !address || !description) {
    const err = new Error('Park name, address, and description are required.');
    err.status = 400;
    throw err;
  }

  return {
    parkName,
    address,
    description,
    website: String(body.website ?? body.Website ?? '').trim() || null,
    contactEmail: String(body.contactEmail ?? body.ContactEmail ?? '').trim() || null,
    submittedAt: new Date().toISOString(),
  };
}

function saveSuggestion(entry) {
  fs.mkdirSync(SUGGESTIONS_DIR, { recursive: true });
  fs.appendFileSync(SUGGESTIONS_FILE, `${JSON.stringify(entry)}\n`, 'utf8');
}

module.exports = { validateSuggestion, saveSuggestion, SUGGESTIONS_FILE };
