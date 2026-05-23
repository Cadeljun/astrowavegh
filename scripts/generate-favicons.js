const sharp = require('sharp');

const svgBuffer = Buffer.from(`
<svg width="512" height="512" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#020B18"/>
  <path d="M4 20 C7 14, 11 14, 14 18 C17 22, 21 22, 24 16 C27 10, 29 12, 30 14" stroke="#00FF87" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M4 24 C7 18, 11 18, 14 22 C17 26, 21 26, 24 20 C27 14, 29 16, 30 18" stroke="#0EA5E9" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.7"/>
</svg>
`);

// Generate all sizes
async function generate() {
  try {
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile('public/icon-192.png');

    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile('public/icon-512.png');

    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile('public/apple-touch-icon.png');

    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile('public/favicon-32.png');

    console.log('✅ Favicons generated');
  } catch (err) {
    console.error('Error generating favicons:', err);
  }
}

generate();
