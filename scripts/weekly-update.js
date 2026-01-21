#!/usr/bin/env node

/**
 * Weekly Update Script
 *
 * Interactive script to update current.json with:
 * - New findings and sources
 * - Score adjustments
 * - Auto-recalculated domain/overall scores
 *
 * Usage: node scripts/weekly-update.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const CURRENT_PATH = path.join(ROOT, 'data/current.json');

const CATEGORIES = [
  'elections',
  'rule-of-law',
  'national-security',
  'regulatory-stability',
  'trade-policy',
  'government-contracts',
  'fiscal-policy',
  'media-freedom',
  'civil-discourse',
  'institutional-integrity'
];

const CATEGORY_NAMES = {
  'elections': 'Elections',
  'rule-of-law': 'Rule of Law',
  'national-security': 'National Security',
  'regulatory-stability': 'Regulatory Stability',
  'trade-policy': 'Trade Policy',
  'government-contracts': 'Government Contracts',
  'fiscal-policy': 'Fiscal Policy',
  'media-freedom': 'Media Freedom',
  'civil-discourse': 'Civil Discourse',
  'institutional-integrity': 'Institutional Integrity'
};

const DOMAINS = {
  'rule-of-law': ['elections', 'rule-of-law', 'national-security'],
  'operating-economic': ['regulatory-stability', 'trade-policy', 'government-contracts', 'fiscal-policy'],
  'societal-institutional': ['media-freedom', 'civil-discourse', 'institutional-integrity']
};

function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateDomainScores(scores) {
  const domainScores = {};
  for (const [domain, categories] of Object.entries(DOMAINS)) {
    const sum = categories.reduce((acc, cat) => acc + scores[cat].score, 0);
    domainScores[domain] = Math.round((sum / categories.length) * 100) / 100;
  }
  return domainScores;
}

function calculateOverallScore(scores) {
  const sum = CATEGORIES.reduce((acc, cat) => acc + scores[cat].score, 0);
  return Math.round((sum / CATEGORIES.length) * 10) / 10;
}

function getRiskLevel(score) {
  if (score < 3) return 'Low';
  if (score < 5) return 'Moderate';
  if (score < 7) return 'Elevated';
  if (score < 9) return 'High';
  return 'Severe';
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(rl, prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function selectCategories(rl) {
  console.log('\nCategories:');
  CATEGORIES.forEach((cat, i) => {
    console.log(`  ${i + 1}. ${CATEGORY_NAMES[cat]}`);
  });
  console.log('  0. All categories');
  console.log('  q. Done selecting\n');

  const selected = new Set();
  while (true) {
    const input = await question(rl, 'Select category (number, 0 for all, q to finish): ');
    if (input.toLowerCase() === 'q') break;
    const num = parseInt(input);
    if (num === 0) {
      CATEGORIES.forEach(cat => selected.add(cat));
      console.log('  Selected all categories');
      break;
    }
    if (num >= 1 && num <= CATEGORIES.length) {
      selected.add(CATEGORIES[num - 1]);
      console.log(`  Added: ${CATEGORY_NAMES[CATEGORIES[num - 1]]}`);
    }
  }
  return Array.from(selected);
}

async function updateCategory(rl, current, categoryId) {
  const cat = current.scores[categoryId];
  console.log(`\n=== ${CATEGORY_NAMES[categoryId]} ===`);
  console.log(`Current score: ${cat.score}, Trend: ${cat.trend}`);
  console.log(`Last updated: ${cat.lastUpdated}\n`);

  // Update score
  const newScore = await question(rl, `New score (1-10, Enter to keep ${cat.score}): `);
  if (newScore && !isNaN(parseInt(newScore))) {
    const score = Math.max(1, Math.min(10, parseInt(newScore)));
    cat.score = score;
    console.log(`  Score updated to: ${score}`);
  }

  // Update trend
  const trendInput = await question(rl, `Trend [i]ncreasing/[s]table/[d]ecreasing (Enter to keep ${cat.trend}): `);
  if (trendInput) {
    const trendMap = { 'i': 'increasing', 's': 'stable', 'd': 'decreasing' };
    const trend = trendMap[trendInput.toLowerCase()] || trendMap[trendInput.toLowerCase()[0]];
    if (trend) {
      cat.trend = trend;
      console.log(`  Trend updated to: ${trend}`);
    }
  }

  // Update findings
  console.log('\nCurrent findings:');
  cat.keyFindings.forEach((f, i) => console.log(`  ${i + 1}. ${f.substring(0, 80)}...`));

  const updateFindings = await question(rl, '\nUpdate findings? [y/N]: ');
  if (updateFindings.toLowerCase() === 'y') {
    const newFindings = [];
    console.log('Enter new findings (empty line to finish):');
    let i = 1;
    while (true) {
      const finding = await question(rl, `  Finding ${i}: `);
      if (!finding.trim()) break;
      newFindings.push(finding.trim());
      i++;
    }
    if (newFindings.length > 0) {
      cat.keyFindings = newFindings;
      console.log(`  Updated ${newFindings.length} findings`);
    }
  }

  // Update sources
  console.log('\nCurrent sources:');
  cat.sources.forEach((s, i) => console.log(`  ${i + 1}. ${s.substring(0, 60)}...`));

  const updateSources = await question(rl, '\nUpdate sources? [y/N]: ');
  if (updateSources.toLowerCase() === 'y') {
    const newSources = [];
    console.log('Enter new source URLs (empty line to finish):');
    let i = 1;
    while (true) {
      const source = await question(rl, `  Source ${i}: `);
      if (!source.trim()) break;
      newSources.push(source.trim());
      i++;
    }
    if (newSources.length > 0) {
      cat.sources = newSources;
      console.log(`  Updated ${newSources.length} sources`);
    }
  }

  // Update lastUpdated
  cat.lastUpdated = getDateString();
  console.log(`  Last updated set to: ${cat.lastUpdated}`);
}

async function main() {
  console.log('\n=== Weekly Update Script ===\n');

  const rl = createInterface();
  const current = JSON.parse(fs.readFileSync(CURRENT_PATH, 'utf8'));

  console.log(`Current overall score: ${current.overallScore} (${current.riskLevel})`);
  console.log(`Assessment date: ${current.assessmentDate}\n`);

  // Select categories to update
  const selectedCategories = await selectCategories(rl);

  if (selectedCategories.length === 0) {
    console.log('\nNo categories selected. Exiting.');
    rl.close();
    return;
  }

  console.log(`\nUpdating ${selectedCategories.length} categories...`);

  // Update each selected category
  for (const categoryId of selectedCategories) {
    await updateCategory(rl, current, categoryId);
  }

  // Recalculate aggregate scores
  console.log('\n=== Recalculating Scores ===\n');

  const oldOverall = current.overallScore;
  current.domainScores = calculateDomainScores(current.scores);
  current.overallScore = calculateOverallScore(current.scores);
  current.riskLevel = getRiskLevel(current.overallScore);
  current.assessmentDate = getDateString();

  console.log('Domain Scores:');
  for (const [domain, score] of Object.entries(current.domainScores)) {
    console.log(`  ${domain}: ${score}`);
  }
  console.log(`\nOverall Score: ${oldOverall} -> ${current.overallScore}`);
  console.log(`Risk Level: ${current.riskLevel}`);

  // Confirm and save
  const confirm = await question(rl, '\nSave changes? [Y/n]: ');
  if (confirm.toLowerCase() !== 'n') {
    fs.writeFileSync(CURRENT_PATH, JSON.stringify(current, null, 2) + '\n');
    console.log('\n[OK] Saved to data/current.json');
    console.log('\nNext steps:');
    console.log('  1. Review changes: git diff data/current.json');
    console.log('  2. Test locally: npm run dev');
    console.log('  3. Build: npm run build');
  } else {
    console.log('\nChanges discarded.');
  }

  rl.close();
}

main().catch(console.error);
