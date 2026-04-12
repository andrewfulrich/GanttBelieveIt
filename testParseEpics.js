const fs = require('fs');
const { parseEpics } = require('./docs/parseEpics');

const csv = fs.readFileSync('data-with-start-dates.csv', 'utf8');
const epics = parseEpics(csv);

// Assertions
console.assert(epics.length === 8, `Expected 8 epics, got ${epics.length}`);

const epic23868 = epics.find(e => e.id === '23868');
console.assert(epic23868.totalDays === 282, `Expected 282 for 23868, got ${epic23868.totalDays}`);
console.assert(epic23868.percentageComplete === 91.84, `Expected 91.84% for 23868, got ${epic23868.percentageComplete}`);
console.assert(epic23868.title === 'Umbraco 17 Migration', `Title mismatch for 23868`);
console.assert(epic23868.startDate === '2026-06-08', `Start date mismatch for 23868`);

const epic23922 = epics.find(e => e.id === '23922');
console.assert(epic23922.totalDays === 461, `Expected 461 for 23922, got ${epic23922.totalDays}`);
console.assert(epic23922.percentageComplete === 58.35, `Expected 58.35% for 23922, got ${epic23922.percentageComplete}`);

const epic23925 = epics.find(e => e.id === '23925');
console.assert(epic23925.totalDays === 157, `Expected 157 for 23925, got ${epic23925.totalDays}`);
console.assert(epic23925.percentageComplete === 5.1, `Expected 5.1% for 23925, got ${epic23925.percentageComplete}`);

console.log('All tests passed!');