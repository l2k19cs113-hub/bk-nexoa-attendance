const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\ad835539-7535-4b35-8cc9-c455dfe988e6\\bk_nexora_official_brand_v6_512_1774646391244.png';
const targets = [
  'e:\\attence\\assets\\app_brand_v6.png',
  'e:\\attence\\assets\\logo.png',
  'e:\\attence\\assets\\icon.png',
  'e:\\attence\\assets\\splash.png',
  'e:\\attence\\assets\\adaptive-icon.png',
  'e:\\attence\\assets\\favicon.png'
];

targets.forEach(target => {
  try {
    fs.copyFileSync(src, target);
    console.log(`Copied to ${target}`);
    const stats = fs.statSync(target);
    console.log(`Size: ${stats.size}`);
  } catch (err) {
    console.error(`Error copying to ${target}:`, err.message);
  }
});
