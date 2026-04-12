const { parseEpics } = require('./docs/parseEpics');

const csv = `ID,Work Item Type,Title,Start Date
1,Epic,Test Epic,2/5/2026 12:00:00 AM`;

const result = parseEpics(csv);
console.log('Parsed startDate:', result[0].startDate);
console.assert(result[0].startDate === '2026-02-05', `Expected '2026-02-05', got '${result[0].startDate}'`);
console.log('Test passed!');