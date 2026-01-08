const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputIcon = path.join(__dirname, 'public', 'icon.png');
const appDir = path.join(__dirname, 'app');
const localeDir = path.join(appDir, '[locale]');

async function generateIcons() {
    console.log('Generating SEO icons from brand logo...');

    // Read the source icon
    const iconBuffer = await sharp(inputIcon)
        .png()
        .toBuffer();

    // 1. Generate favicon.ico (32x32)
    console.log('Creating favicon...');
    await sharp(iconBuffer)
        .resize(32, 32)
        .toFile(path.join(appDir, 'icon.ico'));

    // Also create a PNG favicon for modern browsers  
    await sharp(iconBuffer)
        .resize(32, 32)
        .toFile(path.join(appDir, 'icon.png'));

    // 2. Generate apple-icon.png (180x180)
    console.log('Creating apple-icon.png...');
    await sharp(iconBuffer)
        .resize(180, 180)
        .toFile(path.join(appDir, 'apple-icon.png'));

    // 3. Generate OG image (1200x630) with logo centered
    console.log('Creating opengraph-image.png...');

    // Create a gradient background
    const width = 1200;
    const height = 630;

    // SVG for gradient background with brand colors
    const svgBackground = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fff7ed;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffedd5;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
    </svg>
  `;

    // Create background
    const background = await sharp(Buffer.from(svgBackground))
        .png()
        .toBuffer();

    // Resize logo for OG image (300x300)
    const logo = await sharp(iconBuffer)
        .resize(250, 250)
        .toBuffer();

    // Create text SVG
    const textSvg = `
    <svg width="${width}" height="${height}">
      <style>
        .title { fill: #f97316; font-size: 72px; font-family: Arial, sans-serif; font-weight: bold; }
        .subtitle { fill: #78716c; font-size: 36px; font-family: Arial, sans-serif; }
      </style>
      <text x="${width / 2 + 100}" y="${height / 2 - 30}" text-anchor="middle" class="title">LexiVocab</text>
      <text x="${width / 2 + 100}" y="${height / 2 + 40}" text-anchor="middle" class="subtitle">Learn Vocabulary While Browsing</text>
    </svg>
  `;

    const textBuffer = await sharp(Buffer.from(textSvg))
        .png()
        .toBuffer();

    // Composite logo and text on background
    await sharp(background)
        .composite([
            { input: logo, left: 150, top: (height - 250) / 2 },
            { input: textBuffer, left: 0, top: 0 }
        ])
        .toFile(path.join(localeDir, 'opengraph-image.png'));

    // Also create Twitter image
    await sharp(background)
        .composite([
            { input: logo, left: 150, top: (height - 250) / 2 },
            { input: textBuffer, left: 0, top: 0 }
        ])
        .toFile(path.join(localeDir, 'twitter-image.png'));

    console.log('✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
