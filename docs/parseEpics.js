function parseDate(dateStr) {
  if (!dateStr) return '';
  // Check if it's MM/DD/YYYY format (possibly with time)
  if (dateStr.includes('/')) {
    const datePart = dateStr.split(' ')[0]; // Ignore time part
    const parts = datePart.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  // Assume it's already in YYYY-MM-DD format
  return dateStr;
}

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

function parseEpics(csvString) {
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

  const epics = data.filter(d => d['Work Item Type'] === 'Epic');
  const result = [];
  for (const epic of epics) {
    const epicId = epic.ID;
    const effort = getEffort(epicId);
    const totalDays = effort.total;
    const percentageComplete = effort.total > 0 ? (effort.completed / effort.total * 100).toFixed(2) : 0;
    result.push({
      id: epicId,
      title: epic.Title,
      totalDays,
      percentageComplete: parseFloat(percentageComplete),
      startDate: parseDate(epic['Start Date'])
    });
  }
  return result;
}

export { parseEpics };
