const fs = require('fs');
const { parseEpics } = require('./parseEpics');
const { parseFeatures } = require('./parseFeatures');

const csv = fs.readFileSync('data-with-start-dates.csv', 'utf8');
const epics = parseEpics(csv);
const features = parseFeatures(csv);

// Summary
const totalEpicDays = epics.reduce((sum, e) => sum + e.totalDays, 0);
const totalFeatureDays = features.reduce((sum, f) => sum + f.totalDays, 0);

console.log('=== Summary ===');
console.log(`Epics: ${epics.length} total, ${totalEpicDays} total days`);
console.log(`Features: ${features.length} total, ${totalFeatureDays} total days`);
console.log(`Grand total days: ${totalEpicDays + totalFeatureDays}`);
console.log('\n=== Epics ===');
console.log(JSON.stringify(epics, null, 2));
console.log('\n=== Features ===');
console.log(JSON.stringify(features, null, 2));
