// Icon generation script
// Generates PNG icons from SVG for PWA

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG for each size (as fallback if sharp is not installed)
const svgTemplate = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="50%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
    <linearGradient id="textGlow" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0fdf4"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-opacity="0.25" flood-color="#022c22"/>
    </filter>
  </defs>
  <circle cx="256" cy="220" r="140" fill="url(#textGlow)" opacity="0.08"/>
  <g filter="url(#shadow)">
    <text x="256" y="320" font-family="Arial, sans-serif" font-size="180" font-weight="900" fill="url(#textGlow)" text-anchor="middle" letter-spacing="-8">DEO</text>
  </g>
  <rect x="140" y="360" width="232" height="6" rx="3" fill="white" opacity="0.25"/>
  <rect x="180" y="372" width="152" height="4" rx="2" fill="white" opacity="0.15"/>
</svg>`;

async function generateIcons() {
  const iconsDir = path.join(__dirname, '../public/icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Attempting to generate PNG icons...');
  
  // Try to use sharp for PNG conversion
  try {
    const sharp = require('sharp');
    const svgBuffer = fs.readFileSync(path.join(iconsDir, 'icon.svg'));
    
    console.log('Using sharp to generate high-quality PNGs...');
    
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      
      console.log(`✓ Generated icon-${size}x${size}.png`);
    }
    
    // Generate favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '../public/favicon.png'));
    
    console.log('✓ Generated favicon.png');
    console.log('✅ All PNG icons generated successfully!');
    
  } catch (error) {
    console.log('⚠️  Sharp not installed. Generating SVG fallbacks...');
    console.log('For production, install sharp: npm install sharp --save-dev');
    
    // Fallback: Create SVG files for each size
    for (const size of sizes) {
      const svgContent = svgTemplate(size);
      fs.writeFileSync(
        path.join(iconsDir, `icon-${size}x${size}.svg`),
        svgContent
      );
      console.log(`✓ Generated icon-${size}x${size}.svg (fallback)`);
    }
    
    console.log('\n📝 To generate proper PNG files:');
    console.log('1. Install sharp: npm install sharp --save-dev');
    console.log('2. Run this script again: node scripts/generate-icons.js');
    console.log('\nOr use an online converter:');
    console.log('- Upload public/icons/icon.svg to https://convertio.co/svg-png/');
    console.log('- Generate sizes: 72, 96, 128, 144, 152, 192, 384, 512');
  }
}

generateIcons().catch(console.error);
