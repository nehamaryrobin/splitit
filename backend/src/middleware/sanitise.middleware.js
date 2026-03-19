// Strips leading/trailing whitespace and removes any keys starting with '$'
// (prevents NoSQL injection via MongoDB operators like $where, $gt etc.)

function sanitiseValue(val) {
  if (typeof val === 'string') return val.trim();
  if (Array.isArray(val))     return val.map(sanitiseValue);
  if (val !== null && typeof val === 'object') return sanitiseObject(val);
  return val;
}

function sanitiseObject(obj) {
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    // Drop keys that start with $ (MongoDB operator injection)
    if (key.startsWith('$')) continue;
    clean[key] = sanitiseValue(val);
  }
  return clean;
}

export function sanitise(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitiseObject(req.body);
  }
  next();
}
