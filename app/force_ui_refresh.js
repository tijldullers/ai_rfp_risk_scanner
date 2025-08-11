
const fs = require('fs');
const path = require('path');

console.log('🔄 Forcing UI refresh to show updated risk scores...');

// Clear browser cache by updating component timestamp
const componentPath = path.join(__dirname, 'components/analysis-results.tsx');

// Add a comment with current timestamp to force recompilation
fs.readFile(componentPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Remove any existing timestamp comments
  const cleanedData = data.replace(/\/\* Cache refresh: \d+ \*\/\n?/g, '');
  
  // Add new timestamp comment at the top
  const timestampComment = `/* Cache refresh: ${Date.now()} */\n`;
  const updatedData = timestampComment + cleanedData;

  fs.writeFile(componentPath, updatedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('✅ Component updated with cache refresh timestamp');
    console.log('🌐 Please refresh the browser page to see updated risk scores');
    console.log('📍 The risk score should now show: 14.1/25 (EXTREME)');
  });
});
