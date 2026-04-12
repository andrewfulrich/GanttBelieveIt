function parseLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
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

function parseFeatures(csvString) {
  const lines = csvString.trim().split('\n');
  const headers = parseLine(lines[0]);
  const data = lines.slice(1).map(line => {
    const fields = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => obj[h] = fields[i] || '');
    return obj;
  });

  const itemMap = new Map();
  data.forEach(d => itemMap.set(d.ID, d));

  function getEffort(id) {
    const item = itemMap.get(id);
    if (!item) return { total: 0, completed: 0 };
    if (item['Work Item Type'] === 'Product Backlog Item') {
      const effort = parseInt(item.Effort || '0', 10);
      const completed = item.State === 'Done' ? effort : 0;
      return { total: effort, completed };
    }
    let total = 0;
    let completed = 0;
    const children = data.filter(d => d.Parent === id);
    for (const child of children) {
      const childEffort = getEffort(child.ID);
      total += childEffort.total;
      completed += childEffort.completed;
    }
    return { total, completed };
  }

  const features = data.filter(d => d['Work Item Type'] === 'Feature');
  const result = [];
  for (const feature of features) {
    const featureId = feature.ID;
    const effort = getEffort(featureId);
    const totalDays = effort.total;
    const percentageComplete = effort.total > 0 ? (effort.completed / effort.total * 100).toFixed(2) : 0;
    result.push({
      id: featureId,
      title: feature.Title,
      totalDays,
      percentageComplete: parseFloat(percentageComplete),
      startDate: feature['Start Date']
    });
  }
  return result;
}

module.exports = { parseFeatures };