const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(require.resolve('sharp', { paths: [path.dirname(require.resolve('next/package.json'))] }));

async function main() {
  const sources = process.argv.slice(2);
  if (sources.length !== 2) throw new Error('Pass the original Pop PNG and Dark PNG paths.');
  const output = path.resolve('public/images');
  await fs.mkdir(output, { recursive: true });
  for (const [index, name] of ['pop-sculpture', 'dark-sculpture'].entries()) {
    await sharp(sources[index]).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 86 }).toFile(path.join(output, `${name}.webp`));
    await sharp(sources[index]).resize({ width: 1024, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(output, `${name}-mobile.webp`));
    for (const suffix of ['', '-mobile']) {
      const filename = `${name}${suffix}.webp`;
      console.log(`${filename}: ${Math.round((await fs.stat(path.join(output, filename))).size / 1024)} KB`);
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
