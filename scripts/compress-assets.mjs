#!/usr/bin/env node
/**
 * Compresses repo media for smaller git pushes and faster page loads.
 * Run: node scripts/compress-assets.mjs
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const TESTIMONIALS = join(ROOT, 'assets/testimonials');
const POSTERS = join(ROOT, 'assets/testimonial-posters');
const MEN = join(ROOT, 'assets/men');
const WOMEN = join(ROOT, 'assets/women');
const BRANDING = join(ROOT, 'assets/branding');
const POST_BOOKING = join(ROOT, 'assets/post-booking');
const PUBLIC = join(ROOT, 'public');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function sizeMb(path) {
  return (statSync(path).size / (1024 * 1024)).toFixed(2);
}

function compressVideo(input, output) {
  run(
    `ffmpeg -y -i "${input}" -c:v libx264 -crf 28 -preset medium -movflags +faststart -c:a aac -b:a 64k -ac 1 -vf "scale='min(720,iw)':-2" "${output}"`
  );
}

function compressPhoto(input, output, maxWidth = 1200) {
  run(
    `ffmpeg -y -i "${input}" -q:v 4 -vf "scale='min(${maxWidth},iw)':-2" "${output}"`
  );
}

function compressPoster(input, output) {
  run(
    `ffmpeg -y -ss 3 -i "${input}" -frames:v 1 -update 1 -q:v 5 -vf "scale='min(540,iw)':-2" "${output}"`
  );
}

function compressPngToWebp(input, output) {
  run(`ffmpeg -y -i "${input}" -quality 82 "${output}"`);
}

console.log('Compressing testimonial videos...');
mkdirSync(POSTERS, { recursive: true });
for (const file of readdirSync(TESTIMONIALS).filter((f) => f.endsWith('.mp4'))) {
  const input = join(TESTIMONIALS, file);
  const temp = join(TESTIMONIALS, `.tmp-${file}`);
  const before = sizeMb(input);
  compressVideo(input, temp);
  run(`mv "${temp}" "${input}"`);
  const name = basename(file, '.mp4');
  compressPoster(input, join(POSTERS, `${name}.jpg`));
  console.log(`  ${file}: ${before}MB -> ${sizeMb(input)}MB`);
}

console.log('Compressing banner photos...');
for (const dir of [MEN, WOMEN]) {
  for (const file of readdirSync(dir)) {
    if (!/\.(jpe?g|JPG|png)$/i.test(file)) continue;
    const input = join(dir, file);
    const temp = join(dir, `.tmp-${file}`);
    const ext = extname(file).toLowerCase();
    const output = join(dir, `${basename(file, extname(file))}${ext === '.png' ? '.png' : '.jpg'}`);
    compressPhoto(input, temp, ext === '.png' ? 800 : 1000);
    run(`mv "${temp}" "${output}"`);
    console.log(`  ${file}: ${sizeMb(input)}MB -> ${sizeMb(output)}MB`);
  }
}

console.log('Compressing branding to WebP...');
for (const file of ['ari_header.png', 'ari_comp.png', 'ari_mom.png']) {
  const input = join(BRANDING, file);
  if (!existsSync(input)) continue;
  const output = join(BRANDING, file.replace('.png', '.webp'));
  const before = sizeMb(input);
  compressPngToWebp(input, output);
  console.log(`  ${file}: ${before}MB -> ${sizeMb(output)}MB (webp)`);
}

const logoIn = join(BRANDING, 'swolekolLogo.png');
if (existsSync(logoIn)) {
  mkdirSync(join(PUBLIC), { recursive: true });
  run(`ffmpeg -y -i "${logoIn}" -vf "scale=192:-1" -q:v 5 "${join(PUBLIC, 'favicon.png')}"`);
}

if (existsSync(join(POST_BOOKING, 'meeting_confirm.png'))) {
  for (const file of readdirSync(POST_BOOKING).filter((f) => f.endsWith('.png'))) {
    const input = join(POST_BOOKING, file);
    const temp = join(POST_BOOKING, `.tmp-${file}`);
    compressPhoto(input, temp, 900);
    run(`mv "${temp}" "${input}"`);
  }
}

console.log('Done.');
