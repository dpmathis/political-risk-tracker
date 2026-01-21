#!/usr/bin/env node

/**
 * Monthly Archive Script
 *
 * Run on the 20th of each month to:
 * 1. Archive current scores to data/history/YYYY-MM-DD.json
 * 2. Update app/history/page.tsx with new import
 * 3. Generate template for historical-changes.json entry
 *
 * Usage: node scripts/monthly-archive.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CURRENT_PATH = path.join(ROOT, 'data/current.json');
const HISTORY_DIR = path.join(ROOT, 'data/history');
const HISTORY_PAGE_PATH = path.join(ROOT, 'app/history/page.tsx');
const CHANGES_PATH = path.join(ROOT, 'data/historical-changes.json');

function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = '20'; // Always use 20th for consistency
  return `${year}-${month}-${day}`;
}

function getMonthYear() {
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getImportName(dateStr) {
  // 2026-02-20 -> history202602
  const [year, month] = dateStr.split('-');
  return `history${year}${month}`;
}

function createHistorySnapshot(current, dateStr) {
  const snapshot = {
    date: dateStr,
    scores: {},
    domainScores: current.domainScores,
    overallScore: current.overallScore,
    riskLevel: current.riskLevel
  };

  // Extract just the numeric scores
  for (const [categoryId, categoryData] of Object.entries(current.scores)) {
    snapshot.scores[categoryId] = categoryData.score;
  }

  return snapshot;
}

function updateHistoryPage(dateStr) {
  const importName = getImportName(dateStr);
  let content = fs.readFileSync(HISTORY_PAGE_PATH, 'utf8');

  // Check if already imported
  if (content.includes(importName)) {
    console.log(`  Import ${importName} already exists in history/page.tsx`);
    return false;
  }

  // Find the last history import line and add new one after it
  const importRegex = /(import history\d+ from '@\/data\/history\/[\d-]+\.json';)\n/g;
  let lastMatch;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    lastMatch = match;
  }

  if (lastMatch) {
    const insertPos = lastMatch.index + lastMatch[0].length;
    const newImport = `import ${importName} from '@/data/history/${dateStr}.json';\n`;
    content = content.slice(0, insertPos) + newImport + content.slice(insertPos);
  }

  // Find historicalSnapshots array and add new entry
  const arrayRegex = /(const historicalSnapshots: HistoricalSnapshot\[\] = \[[\s\S]*?)(  \];)/;
  const arrayMatch = content.match(arrayRegex);

  if (arrayMatch) {
    const newEntry = `    ${importName} as HistoricalSnapshot,\n`;
    content = content.replace(arrayRegex, `$1${newEntry}$2`);
  }

  fs.writeFileSync(HISTORY_PAGE_PATH, content);
  return true;
}

function getPreviousMonthData() {
  const changesData = JSON.parse(fs.readFileSync(CHANGES_PATH, 'utf8'));
  if (changesData.changes.length > 0) {
    return changesData.changes[changesData.changes.length - 1];
  }
  return null;
}

function generateChangesTemplate(current, dateStr, monthYear) {
  const prevMonth = getPreviousMonthData();
  const prevScore = prevMonth ? prevMonth.overallScore : current.overallScore;
  const overallChange = Math.round((current.overallScore - prevScore) * 10) / 10;

  const template = {
    period: monthYear,
    date: dateStr,
    overallScore: current.overallScore,
    overallChange: overallChange,
    summary: "UPDATE: Brief summary of the month's key developments",
    keyDevelopments: [
      "UPDATE: Key development 1",
      "UPDATE: Key development 2",
      "UPDATE: Key development 3"
    ],
    categoryChanges: []
  };

  // Detect score changes from previous snapshot
  if (prevMonth) {
    const historyFiles = fs.readdirSync(HISTORY_DIR).sort();
    const lastHistoryFile = historyFiles[historyFiles.length - 1];
    const lastSnapshot = JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, lastHistoryFile), 'utf8'));

    for (const [categoryId, categoryData] of Object.entries(current.scores)) {
      const oldScore = lastSnapshot.scores[categoryId];
      const newScore = categoryData.score;
      if (oldScore !== newScore) {
        template.categoryChanges.push({
          category: categoryId,
          from: oldScore,
          to: newScore,
          rationale: `UPDATE: Explain why ${categoryId} changed from ${oldScore} to ${newScore}`
        });
      }
    }
  }

  return template;
}

function main() {
  console.log('\n=== Monthly Archive Script ===\n');

  // Read current data
  const current = JSON.parse(fs.readFileSync(CURRENT_PATH, 'utf8'));
  const dateStr = getDateString();
  const monthYear = getMonthYear();

  console.log(`Creating archive for: ${monthYear} (${dateStr})\n`);

  // Step 1: Create history snapshot
  const snapshotPath = path.join(HISTORY_DIR, `${dateStr}.json`);
  if (fs.existsSync(snapshotPath)) {
    console.log(`[SKIP] History snapshot already exists: ${snapshotPath}`);
  } else {
    const snapshot = createHistorySnapshot(current, dateStr);
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n');
    console.log(`[OK] Created history snapshot: data/history/${dateStr}.json`);
  }

  // Step 2: Update history page
  const updated = updateHistoryPage(dateStr);
  if (updated) {
    console.log(`[OK] Updated app/history/page.tsx with new import`);
  } else {
    console.log(`[SKIP] app/history/page.tsx already up to date`);
  }

  // Step 3: Generate changes template
  const template = generateChangesTemplate(current, dateStr, monthYear);

  console.log('\n--- historical-changes.json Entry Template ---');
  console.log('Add this to the "changes" array in data/historical-changes.json:\n');
  console.log(JSON.stringify(template, null, 2));
  console.log('\n(Replace all "UPDATE:" placeholders with actual content)\n');

  // Step 4: Remind to run build
  console.log('=== Next Steps ===');
  console.log('1. Edit data/historical-changes.json with the template above');
  console.log('2. Run: npm run build');
  console.log('3. Test locally: npm run dev');
  console.log('');
}

main();
