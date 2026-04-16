import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'src/modules/admin/pages');

const replacements = [
  { search: /\btext-white\b/g, replace: 'text-zinc-900 dark:text-white' },
  { search: /\bbg-zinc-900\b/g, replace: 'bg-zinc-100 dark:bg-zinc-900' },
  { search: /\bbg-zinc-950\b/g, replace: 'bg-zinc-50 dark:bg-zinc-950' },
  { search: /\bbg-slate-900\b/g, replace: 'bg-zinc-100 dark:bg-slate-900' },
  { search: /\bbg-slate-950\b/g, replace: 'bg-zinc-50 dark:bg-slate-950' },
  { search: /\bborder-zinc-900\b/g, replace: 'border-zinc-200 dark:border-zinc-900' },
  { search: /\bborder-zinc-800\b/g, replace: 'border-zinc-200 dark:border-zinc-800' },
  { search: /\bborder-slate-800\b/g, replace: 'border-zinc-200 dark:border-slate-800' },
  { search: /\bborder-slate-900\b/g, replace: 'border-zinc-200 dark:border-slate-900' },
  { search: /\btext-slate-500\b/g, replace: 'text-zinc-500 dark:text-slate-500' },
  { search: /\bbg-slate-900\/50\b/g, replace: 'bg-zinc-100/80 dark:bg-slate-900/50' },
  { search: /\bbg-slate-900\/40\b/g, replace: 'bg-zinc-100/60 dark:bg-slate-900/40' },
  { search: /\bbg-slate-900\/30\b/g, replace: 'bg-zinc-100/50 dark:bg-slate-900/30' },
  { search: /\bbg-slate-950\/20\b/g, replace: 'bg-zinc-50/50 dark:bg-slate-950/20' },
  // Reverse double matches if the replacement got duplicated earlier
  { search: /text-zinc-900 dark:text-zinc-900 dark:text-white/g, replace: 'text-zinc-900 dark:text-white' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Skip already perfectly responsive dash
      if (fullPath.includes('Dashboard.jsx') || fullPath.includes('Sidebar.jsx') || fullPath.includes('TopHeader.jsx') || fullPath.includes('StatCard.jsx') || fullPath.includes('DataTable.jsx')) {
          continue;
      }

      let original = content;
      replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
      });

      if (original !== content) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('✅ Theme fix completed.');
