const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/types/db.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find all Tables blocks (there is only one)
const tablesMatch = content.match(/Tables:\s*{([\s\S]*?)}\s*Enums:/);
if (!tablesMatch) {
  console.log('Tables block not found, trying another regex');
  const tablesMatch2 = content.match(/Tables:\s*{([\s\S]*?)(?:}\s*Enums:|$)/);
  if (!tablesMatch2) {
      console.log('Still not found');
      process.exit(1);
  }
}

// Another approach: Just use replace over the whole file
const tableRegex = /(\w+):\s*{\s*Row:\s*{([\s\S]*?)}([\s\S]*?)(?=,\n\s*\w+:\s*{\s*Row:|\n\s*}\n\s*Enums:|$)/g;

let newContent = content.replace(tableRegex, (match, tableName, rowContent, rest) => {
  if (!rest.includes('Omit<Database') && !rest.includes('never')) {
    return match; // Keep as is if already fixed
  }
  
  // Parse omitted fields for Insert
  let insertOmitted = [];
  const insertOmitMatch = rest.match(/Insert:\s*Omit<[^>]+,\s*'([^']+)'(?:\s*\|\s*'([^']+)')?(?:\s*\|\s*'([^']+)')?(?:\s*\|\s*'([^']+)')?(?:\s*\|\s*'([^']+)')?>/);
  if (insertOmitMatch) {
    insertOmitted = insertOmitMatch.slice(1).filter(Boolean);
  }

  // Parse row fields
  const fields = rowContent.split('\n').filter(l => l.trim()).map(l => l.trim());
  
  // Construct Insert
  let insertLines = [];
  let updateLines = [];
  
  for (const field of fields) {
    const colonIdx = field.indexOf(':');
    if (colonIdx === -1) continue;
    let name = field.slice(0, colonIdx).trim();
    // remove trailing ? if any
    name = name.replace(/\?$/, '');
    let type = field.slice(colonIdx + 1).trim();
    
    // For Update, everything is optional
    updateLines.push(`          ${name}?: ${type}`);
    
    // For Insert
    if (insertOmitted.includes(name)) {
      insertLines.push(`          ${name}?: ${type}`);
    } else {
      if (type.includes('null')) {
        insertLines.push(`          ${name}?: ${type}`);
      } else {
        insertLines.push(`          ${name}: ${type}`);
      }
    }
  }

  return `${tableName}: {
        Row: {
${rowContent}}
        Insert: {
${insertLines.join('\n')}
        }
        Update: {
${updateLines.join('\n')}
        }
      }`;
});

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully refactored db.ts');
