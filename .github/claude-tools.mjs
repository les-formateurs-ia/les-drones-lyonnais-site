// Tools Claude may use in the client request workflows, as a GitHub step output:
//   node .github/claude-tools.mjs >> "$GITHUB_OUTPUT"   →   steps.<id>.outputs.list
// WebFetch is limited to the manufacturer sites of scripts/product-sources.json.
import { readFileSync } from 'node:fs';

const { sites } = JSON.parse(readFileSync(new URL('../scripts/product-sources.json', import.meta.url), 'utf8'));

const tools = [
  'Read',
  'Edit',
  'Write',
  'Glob',
  'Grep',
  'Bash(npm run build)',
  'Bash(npm run check)',
  'Bash(ls *)',
  'Bash(node scripts/product-images.mjs *)',
  ...sites.flatMap((d) => [`WebFetch(domain:${d})`, `WebFetch(domain:*.${d})`]),
];

console.log(`list=${tools.join(',')}`);
