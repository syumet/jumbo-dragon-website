#!/usr/bin/env node

// Simple CSV -> JSON converter
// Usage:
//   node scripts/csv-to-json.js [input.csv] [output.json]
//   If output is omitted, JSON is written to stdout.
//   Options:
//     --no-coerce   Don't convert numeric-looking values to numbers
// Example:
//   node scripts/csv-to-json.js public/assets/menu.csv public/assets/menu.json

const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node scripts/csv-to-json.js [input.csv] [output.json] [--no-coerce]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) usage();

let input = args[0];
let output = args[1];
const noCoerce = args.includes('--no-coerce');

if (!input) {
  input = path.join(__dirname, '..', 'public', 'assets', 'menu.csv');
}

if (!fs.existsSync(input)) {
  console.error('Input file not found:', input);
  process.exit(2);
}

let text = fs.readFileSync(input, 'utf8');
// Remove BOM if present
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
// Normalize CRLF to LF
text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

function parseCSV(s) {
  const rows = [];
  let i = 0;
  let cell = '';
  let row = [];
  let inQuotes = false;

  while (i < s.length) {
    const ch = s[i];

    if (ch === '"') {
      // If we're in quotes and the next char is also a quote, it's an escaped quote
      if (inQuotes && s[i + 1] === '"') {
        cell += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      i++;
      continue;
    }

    if (ch === '\n' && !inQuotes) {
      row.push(cell);
      cell = '';
      rows.push(row);
      row = [];
      i++;
      continue;
    }

    // Regular character (including newline inside quoted field)
    cell += ch;
    i++;
  }

  // Push last cell/row if any
  if (inQuotes) throw new Error('Malformed CSV: unterminated quoted field');
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

let parsed;
try {
  parsed = parseCSV(text);
} catch (err) {
  console.error('Failed to parse CSV:', err.message);
  process.exit(3);
}

if (!parsed || parsed.length === 0) {
  console.error('No rows parsed from CSV');
  process.exit(4);
}

const headers = parsed[0].map(h => h.trim());
const dataRows = parsed.slice(1);

function allEmpty(row) {
  return row.every(c => c === undefined || c === null || String(c).trim() === '');
}

function coerceValue(v) {
  if (v === '') return '';
  // Integer or float
  if (!noCoerce && /^-?\d+(?:\.\d+)?$/.test(v)) {
    // keep integers as integers
    return v.indexOf('.') === -1 ? parseInt(v, 10) : parseFloat(v);
  }
  return v;
}

const result = [];
for (const r of dataRows) {
  if (allEmpty(r)) continue;
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i] || `col${i}`;
    const raw = r[i] === undefined ? '' : r[i];
    obj[key] = coerceValue(raw);
  }
  result.push(obj);
}

const outJson = JSON.stringify(result, null, 2);

if (output) {
  fs.writeFileSync(output, outJson, 'utf8');
  console.log('Wrote JSON to', output);
} else {
  process.stdout.write(outJson + '\n');
}
