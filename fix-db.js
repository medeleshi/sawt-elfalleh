const fs = require('fs');

let file = fs.readFileSync('src/types/db.ts', 'utf8');

// First, insert PublicRowTypes before Database
const tablesMatch = file.match(/Tables: {([\s\S]*?)}\n    Enums:/);
if (!tablesMatch) {
  console.log('Tables block not found');
  process.exit(1);
}

const tablesStr = tablesMatch[1];
const tableRegex = /([a-z_]+):\s*{\s*Row:\s*{([^}]+)}/g;

let publicRowTypes = `export interface PublicRowTypes {\n`;
let match;
while ((match = tableRegex.exec(tablesStr)) !== null) {
  const [_, tableName, rowFields] = match;
  publicRowTypes += `  ${tableName}: {\n${rowFields}  }\n`;
}
publicRowTypes += `}\n\n`;

file = file.replace('export type Database = {', publicRowTypes + 'export type Database = {');

// Now, replace all Row: { ... } with Row: PublicRowTypes['tableName']
// and replace Database['public']['Tables']['tableName']['Row'] with PublicRowTypes['tableName']

file = file.replace(/Row: {([^}]+)}/g, (m, p1) => {
  // Let's not replace all Row: { ... } to avoid messing up. 
  return m;
});

// Actually, we just need to replace the Omit and Partial references.
file = file.replace(/Database\['public'\]\['Tables'\]\['([a-z_]+)'\]\['Row'\]/g, "PublicRowTypes['$1']");
file = file.replace(/Database\['public'\]\['Tables'\]\['([a-z_]+)'\]\['Insert'\]/g, "Omit<PublicRowTypes['$1'], 'id' | 'created_at'>"); // Approximation for Update Partial

fs.writeFileSync('src/types/db.ts', file);
console.log('Successfully fixed db.ts');
