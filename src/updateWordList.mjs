import fs from 'fs';
import path from 'path';

// ---------------- Settings ----------------
const repoUser = 'audvix-source';
const repoName = 'preschooler-speller-new';
const branch = 'master';
const assetsPath = 'src/assets';

// ---------------- Paths ----------------
const wordListPath = path.join(process.cwd(), 'src', 'wordList.js');
const outputPath = path.join(process.cwd(), 'src', 'wordList-updated.js');

// Read wordList.js as text
let content = fs.readFileSync(wordListPath, 'utf8');

// ---------------- Replace single image strings ----------------
content = content.replace(/'([\w-]+\.png)'/g, (match, filename) => {
  return `'https://raw.githubusercontent.com/${repoUser}/${repoName}/${branch}/${assetsPath}/${filename}'`;
});

// ---------------- Replace boy/girl objects ----------------
content = content.replace(/(boy|girl):\s*'([\w-]+\.png)'/g, (match, gender, filename) => {
  return `${gender}: 'https://raw.githubusercontent.com/${repoUser}/${repoName}/${branch}/${assetsPath}/${filename}'`;
});

// Write the updated content to a new file
fs.writeFileSync(outputPath, content, 'utf8');

console.log('wordList-updated.js created with GitHub raw URLs!');
