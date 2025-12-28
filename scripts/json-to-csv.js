#!/usr/bin/env node

// Simple JSON -> CSV converter
// Usage:
//   node scripts/json-to-csv.js [input.json] [output.csv]
//   If output is omitted, CSV is written to stdout.
//   You can also pass --fields "col1,col2,..." to choose fields/order.

const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node scripts/json-to-csv.js [input.json] [output.csv] [--fields "col1,col2,..."]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) usage();

let input = args[0];
let output = args[1];
let fieldsFlagIndex = args.findIndex(a => a === '--fields');
let fieldsList = null;
if (fieldsFlagIndex !== -1) {
  fieldsList = args[fieldsFlagIndex + 1];
  if (!fieldsList) usage();
  fieldsList = fieldsList.split(',').map(s => s.trim()).filter(Boolean);
}

if (!input) {
  input = path.join(__dirname, '..', 'public', 'assets', 'menu.json');
}

if (!fs.existsSync(input)) {
  console.error('Input file not found:', input);
  process.exit(2);
}

const raw = fs.readFileSync(input, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error('Failed to parse JSON:', err.message);
  process.exit(3);
}
if (!Array.isArray(data)) {
  console.error('Expected a JSON array (top-level).');
  process.exit(4);
}

// Determine headers (fields). If provided, use that order; otherwise, use union of keys in first-seen order.
let headers;
if (fieldsList && fieldsList.length) {
  headers = fieldsList;
} else {
  const seen = new Set();
  headers = [];
  for (const row of data) {
    if (row && typeof row === 'object') {
      for (const k of Object.keys(row)) {
        if (!seen.has(k)) {
          seen.add(k);
          headers.push(k);
        }
      }
    }
  }
}

function escapeCell(v) {
  if (v === null || v === undefined) return '';
  // Convert objects/arrays to JSON string
  let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  // Normalize newlines
  s = s.replace(/\r\n/g, '\n');
  // Escape double quotes by doubling them
  s = s.replace(/"/g, '""');
  // Wrap in double quotes if it contains comma, newline or double quote
  if (s.indexOf(',') !== -1 || s.indexOf('\n') !== -1 || s.indexOf('"') !== -1) {
    return '"' + s + '"';
  }
  return s;
}

const lines = [];
lines.push(headers.join(','));
for (const row of data) {
  const cells = headers.map(h => escapeCell(row[h]));
  lines.push(cells.join(','));
}

const csv = lines.join('\n');

if (output) {
  fs.writeFileSync(output, csv, 'utf8');
  console.log('Wrote CSV to', output);
} else {
  process.stdout.write(csv);
}
