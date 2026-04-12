const fs = require('fs');
const { parseFeatures } = require('./docs/parseFeatures');

const csv = fs.readFileSync('data-with-start-dates.csv', 'utf8');
const features = parseFeatures(csv);

// Assertions
console.assert(features.length === 20, `Expected 20 features, got ${features.length}`);

const feature24374 = features.find(f => f.id === '24374');
console.assert(feature24374.totalDays === 58, `Expected 58 for 24374, got ${feature24374.totalDays}`);
console.assert(feature24374.percentageComplete === 100, `Expected 100% for 24374, got ${feature24374.percentageComplete}`);
console.assert(feature24374.title === 'Hotel Data', `Title mismatch for 24374`);

const feature24376 = features.find(f => f.id === '24376');
console.assert(feature24376.totalDays === 7, `Expected 7 for 24376, got ${feature24376.totalDays}`);
console.assert(feature24376.percentageComplete === 0, `Expected 0% for 24376, got ${feature24376.percentageComplete}`);

console.log('All feature tests passed!');