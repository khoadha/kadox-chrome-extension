// Run this script to download and set up the Kadox icon
// Usage: node download-icon.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const iconUrl = 'https://blobcuakhoa.blob.core.windows.net/files/black.png';
const iconsDir = path.join(__dirname, 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

https.get(iconUrl, (response) => {
  const filePath = path.join(iconsDir, 'icon128.png');
  const fileStream = fs.createWriteStream(filePath);
  
  response.pipe(fileStream);
  
  fileStream.on('finish', () => {
    fileStream.close();
  });
}).on('error', (err) => {
  console.error('Error downloading icon:', err.message);
});
