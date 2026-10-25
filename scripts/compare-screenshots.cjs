const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(require.resolve('sharp', { paths: [path.dirname(require.resolve('next/package.json'))] }));

async function main() {
  const left = await sharp('review/pop-1920-v2.jpg').resize(1200, 675, { fit: 'contain', background: '#f5f3eb' }).toBuffer();
  const right = await sharp('review/dark-1920-v2.jpg').resize(1200, 675, { fit: 'contain', background: '#080a0c' }).toBuffer();
  const labels = Buffer.from('<svg width="2416" height="48"><rect width="2416" height="48" fill="#181b1c"/><g fill="#f5f3eb" font-family="Arial,sans-serif" font-size="17" letter-spacing="2"><text x="24" y="31">MILKSHAKE POP / 1920</text><text x="1240" y="31">AFTER DARK / 1920</text></g></svg>');
  await fs.mkdir('review', { recursive: true });
  await sharp({ create: { width: 2416, height: 723, channels: 3, background: '#181b1c' } })
    .composite([{ input: labels, top: 0, left: 0 }, { input: left, top: 48, left: 0 }, { input: right, top: 48, left: 1216 }])
    .webp({ quality: 90 }).toFile('review/theme-comparison-v2.webp');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
