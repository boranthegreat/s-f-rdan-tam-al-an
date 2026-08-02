import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const log = (message) => console.log(`[BTG premium refresh] ${message}`);

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const write = (relativePath, content) => {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.replace(/\r\n/g, '\n'), 'utf8');
};

function walk(relativeDir, extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css'])) {
  const start = path.join(root, relativeDir);
  if (!fs.existsSync(start)) return [];
  const output = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (extensions.has(path.extname(entry.name))) output.push(path.relative(root, full));
    }
  }
  return output;
}

const templateDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'premium-redesign-templates');
const componentSource = fs.readFileSync(path.join(templateDir, 'BtgPremiumRefresh.tsx'), 'utf8');
const cssSource = fs.readFileSync(path.join(templateDir, 'btg-premium-refresh.css'), 'utf8');

write('components/BtgPremiumRefresh.tsx', componentSource);
write('app/btg-premium-refresh.css', cssSource);
log('Premium refresh component and styles created.');

const sourceFiles = [...walk('app'), ...walk('components'), ...walk('data'), ...walk('lib')];
const literalReplacements = new Map([
  ['Canli veri izleme', 'Canlı piyasa takibi'],
  ['Canlı veri izleme', 'Canlı piyasa takibi'],
  ['Küresel piyasalar ve hava radarını tek koyu panelde izle.', 'Piyasaları tek ekrandan takip et.'],
  ['Döviz kurları, kripto piyasa sinyalleri, altın kuru, 7 günlük dünya hava tahmini ve favori listesi tek premium panelde birleşir.', 'Döviz, kripto, altın, portföy ve önemli piyasa gelişmelerini tek kontrol merkezinden izle.'],
  ['Döviz takip', 'Piyasaları aç'],
  ['Coin panelini aç', 'Takip listemi oluştur'],
  ['Hava radarını aç', 'Hava durumunu gör'],
  ['Hazir', 'Hazır'],
]);

let textChanges = 0;
for (const relativePath of sourceFiles) {
  if (relativePath.endsWith('BtgPremiumRefresh.tsx')) continue;
  let content = read(relativePath);
  const original = content;
  for (const [from, to] of literalReplacements) content = content.split(from).join(to);
  if (content !== original) {
    write(relativePath, content);
    textChanges += 1;
  }
}
log(`Updated visible copy in ${textChanges} source file(s).`);

const componentFiles = walk('components', new Set(['.tsx', '.jsx', '.ts', '.js']));
const entranceFiles = componentFiles.filter((relativePath) => {
  const name = path.basename(relativePath).toLowerCase();
  const content = read(relativePath).toLowerCase();
  if (/worm|solucan/.test(name)) return true;
  if (/splash|preloader/.test(name) && /(fixed|inset-0|100vh|fullscreen|overlay)/.test(content)) return true;
  return false;
});
const entranceNames = entranceFiles.map((relativePath) => path.basename(relativePath).replace(/\.[^.]+$/, ''));
if (entranceNames.length) {
  let usageChanges = 0;
  for (const relativePath of [...walk('app', new Set(['.tsx', '.jsx'])), ...componentFiles]) {
    if (entranceFiles.includes(relativePath)) continue;
    let content = read(relativePath);
    const original = content;
    for (const name of entranceNames) {
      content = content.replace(new RegExp(`^.*import\\s+${name}\\s+from\\s+["'][^"']+["'];?\\s*$`, 'gm'), '');
      content = content.replace(new RegExp(`<${name}\\b[^>]*/>`, 'g'), '');
      content = content.replace(new RegExp(`<${name}\\b[^>]*>[\\s\\S]*?</${name}>`, 'g'), '');
    }
    if (content !== original) {
      write(relativePath, content);
      usageChanges += 1;
    }
  }
  log(`Removed entrance animation usage from ${usageChanges} file(s): ${entranceNames.join(', ')}`);
} else {
  log('No named worm component found; runtime protection will remove the entrance overlay safely.');
}

const rootLayout = walk('app', new Set(['.tsx', '.jsx'])).find((relativePath) => path.basename(relativePath).startsWith('layout.') && read(relativePath).includes('<body'));
if (!rootLayout) throw new Error('Root App Router layout containing <body> was not found.');
let layout = read(rootLayout);
if (!layout.includes('BtgPremiumRefresh')) {
  const importLine = 'import BtgPremiumRefresh from "@/components/BtgPremiumRefresh";\n';
  const importMatches = [...layout.matchAll(/^import .*;\s*$/gm)];
  if (importMatches.length) {
    const last = importMatches[importMatches.length - 1];
    const insertion = (last.index ?? 0) + last[0].length;
    layout = layout.slice(0, insertion) + '\n' + importLine + layout.slice(insertion);
  } else {
    layout = importLine + layout;
  }
  layout = layout.replace('</body>', '  <BtgPremiumRefresh />\n      </body>');
}
const cssImport = 'import "./btg-premium-refresh.css";';
if (!layout.includes(cssImport)) {
  const importMatches = [...layout.matchAll(/^import .*;\s*$/gm)];
  const last = importMatches[importMatches.length - 1];
  if (last) {
    const insertion = (last.index ?? 0) + last[0].length;
    layout = layout.slice(0, insertion) + `\n${cssImport}` + layout.slice(insertion);
  } else {
    layout = `${cssImport}\n${layout}`;
  }
}
write(rootLayout, layout);
log(`Integrated premium refresh into ${rootLayout}.`);

const report = `# BoranTheGreat Premium Refresh\n\nApplied automatically by \`scripts/apply-premium-redesign.mjs\`.\n\n## Changes\n\n- Removed the entrance worm/overlay, with source-level and runtime protection.\n- Simplified the desktop navigation and added a compact More menu.\n- Added a five-item mobile bottom navigation.\n- Replaced developer-facing labels with user-friendly copy.\n- Removed duplicate status cards and technical optimization panels from the visible interface.\n- Added a live market overview for USD/TRY, EUR/TRY, Bitcoin, Ethereum, and approximate gram-gold pricing.\n- Added Boran Brief and improved empty portfolio guidance.\n- Consolidated the visual system around a premium navy/mint design.\n- Improved spacing, cards, focus states, mobile behavior, and reduced-motion accessibility.\n\nThe existing multilingual, portfolio, alert, news, PWA, cloud-sync, and API architecture remains in place.\n`;
write('PREMIUM_REFRESH_REPORT.md', report);
log('Premium redesign patch completed.');
