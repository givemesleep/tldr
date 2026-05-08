import { execFile } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { LRUCache } = require('lru-cache');
import { parseMan, parseHelp, parseTldr, tldrIndex, tldrReady } from './parsers.js';

const cache = new LRUCache({ max: 100 });

function execMan(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('man', [name], { shell: false }, (err, stdout) => {
      if (err) return reject(err);
      const col = execFile('col', ['-bx'], { shell: false }, (err2, stdout2) => {
        if (err2) return reject(err2);
        resolve(stdout2);
      });
      if (col.stdin) {
        col.stdin.write(stdout);
        col.stdin.end();
      } else {
        resolve(stdout);
      }
    });
  });
}

function execHelp(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(name, ['--help'], { shell: false }, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

export async function getCommandInfo(name: string) {
  if (cache.has(name)) return cache.get(name);
  let manText = '';
  let helpText = '';
  let tldr = tldrIndex[name] || null;
  let sources = { man: false, tldr: !!tldr, help: false };
  try {
    manText = await execMan(name);
    sources.man = true;
  } catch {}
  if (!manText) {
    try {
      helpText = await execHelp(name);
      sources.help = true;
    } catch {}
  }
  const manParsed = manText ? { ...parseMan(manText), examples: parseMan(manText).examples ?? [] } : { meaning: '', synopsis: '', options: [], examples: [] };
  const helpParsed = helpText ? { ...parseHelp(helpText), examples: [] } : { meaning: '', synopsis: '', options: [], examples: [] };
  const tldrParsed = tldr ? parseTldr(tldr) : null;
  const meaning = tldrParsed?.meaning || manParsed.meaning || helpParsed.meaning || '';
  const synopsis = manParsed.synopsis || helpParsed.synopsis || '';
  const options = (manParsed.options || helpParsed.options || []).slice(0, 30);
  let examples = tldrParsed?.examples || manParsed.examples || helpParsed.examples || [];
  if (!examples.length && synopsis && options.length) {
    examples = options.slice(0, 5).map(opt => ({
      cmd: `${name} ${opt.flag}`.trim(),
      description: opt.description
    }));
  }
  const result = {
    command: name,
    meaning,
    synopsis,
    options,
    examples,
    seeAlso: tldrParsed?.seeAlso ?? [],
    sources
  };
  cache.set(name, result);
  return result;
}

export { tldrReady };
