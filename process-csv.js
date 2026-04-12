const fs = require('fs');

// Simple CSV parser for quoted fields
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

// Read the input CSV
const content = fs.readFileSync('data (3).csv', 'utf8');
const lines = content.split('\n').filter(l => l.trim());

// Parse headers
const headers = parseCSVLine(lines[0]);
const newHeaders = headers.concat(['Start Date', 'Effort']);

// Process rows
const newLines = [newHeaders.map(h => `"${h}"`).join(',')];
for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i]);
  const type = fields[1]; // Work Item Type column

  let startDate = '';
  let effort = '';

  if (type === 'Epic') {
    const now = new Date();
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    const twoMonthsFromNow = new Date(now);
    twoMonthsFromNow.setMonth(now.getMonth() + 2);
    const randomTime = twoMonthsAgo.getTime() + Math.random() * (twoMonthsFromNow.getTime() - twoMonthsAgo.getTime());
    const randomDate = new Date(randomTime);
    startDate = randomDate.toISOString().split('T')[0];
  }

  if (type === 'Product Backlog Item') {
    const efforts = [1, 2, 3, 5, 8];
    effort = efforts[Math.floor(Math.random() * efforts.length)].toString();
  }

  const newFields = fields.concat([startDate, effort]);
  newLines.push(newFields.map(f => `"${f}"`).join(','));
}

// Write output CSV
fs.writeFileSync('data-with-start-dates.csv', newLines.join('\n'));

console.log('Processed CSV written to data-with-start-dates.csv');