import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import https from 'https';
import os from 'node:os';

const TLDR_URL = 'https://github.com/tldr-pages/tldr/archive/refs/heads/main.zip';
const DATA_DIR = join(process.cwd(), 'data', 'tldr');
const ZIP_PATH = join(DATA_DIR, 'tldr.zip');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const follow = (u) => {
      https.get(u, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          return follow(response.headers.location);
        }
        if (response.statusCode !== 200) return reject(new Error(`HTTP ${response.statusCode}`));
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', reject);
    };
    follow(url);
  });
}

function extract(zip, dest) {
  if (os.platform() === 'win32') {
    const result = spawnSync('powershell', [
      '-Command',
      `Expand-Archive -Force -Path "${zip}" -DestinationPath "${dest}"`
    ], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error('Extraction failed (PowerShell)');
  } else {
    // Linux / macOS / Termux (Android)
    const result = spawnSync('unzip', ['-o', zip, '-d', dest], { stdio: 'inherit' });
    if (result.status !== 0 || result.error) {
      throw new Error(
        'Extraction failed. Make sure `unzip` is installed.\n' +
        '  Termux (Android): pkg install unzip\n' +
        '  Debian/Ubuntu:    sudo apt install unzip\n' +
        '  macOS:            brew install unzip'
      );
    }
  }
}

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

console.log('Downloading tldr pages from GitHub...');
download(TLDR_URL, ZIP_PATH).then(() => {
  console.log('Extracting...');
  extract(ZIP_PATH, DATA_DIR);
  console.log('Done. TLDR pages are ready.');
}).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
