import { mkdirSync, existsSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import https from 'https';
import AdmZip from 'adm-zip';

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
  // Pure JS extraction — works on Windows, Linux, macOS, and Termux (Android)
  // No system tools (unzip / powershell) required
  const archive = new AdmZip(zip);
  archive.extractAllTo(dest, /* overwrite */ true);
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
