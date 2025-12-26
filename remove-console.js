// Script to remove all console statements
const fs = require('fs');
const path = require('path');

const files = [
  'background.js',
  'content.js',
  'popup.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/\s*console\.(log|error|warn|info|debug)\([^)]*\);?\s*/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
});