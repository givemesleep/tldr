import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TLDR_BASE = join(process.cwd(), 'data', 'tldr', 'tldr-main');
export const tldrIndex: Record<string, string> = {};
export const tldrReady = (async () => {
  if (!existsSync(TLDR_BASE)) return;
  for (const entry of readdirSync(TLDR_BASE)) {
    // Include 'pages' (English canonical) and 'pages.en', skip others that aren't English
    const isEnglish = entry === 'pages' || entry === 'pages.en';
    if (!isEnglish) continue;
    const pagesDir = join(TLDR_BASE, entry);
    let stat: ReturnType<typeof statSync>;
    try { stat = statSync(pagesDir); } catch { continue; }
    if (!stat.isDirectory()) continue;
    for (const section of readdirSync(pagesDir)) {
      const sectionDir = join(pagesDir, section);
      try { if (!statSync(sectionDir).isDirectory()) continue; } catch { continue; }
      for (const file of readdirSync(sectionDir)) {
        if (!file.endsWith('.md')) continue;
        const cmd = file.replace(/\.md$/, '');
        if (!tldrIndex[cmd]) {
          tldrIndex[cmd] = readFileSync(join(sectionDir, file), 'utf8');
        }
      }
    }
  }
  // Fallback: if no English pages found, scan all pages.* dirs
  if (Object.keys(tldrIndex).length === 0) {
    for (const entry of readdirSync(TLDR_BASE)) {
      if (!entry.startsWith('pages')) continue;
      const pagesDir = join(TLDR_BASE, entry);
      try { if (!statSync(pagesDir).isDirectory()) continue; } catch { continue; }
      for (const section of readdirSync(pagesDir)) {
        const sectionDir = join(pagesDir, section);
        try { if (!statSync(sectionDir).isDirectory()) continue; } catch { continue; }
        for (const file of readdirSync(sectionDir)) {
          if (!file.endsWith('.md')) continue;
          const cmd = file.replace(/\.md$/, '');
          if (!tldrIndex[cmd]) {
            tldrIndex[cmd] = readFileSync(join(sectionDir, file), 'utf8');
          }
        }
      }
    }
  }
})();

export function parseTldr(md: string) {
  const lines = md.split('\n');
  let meaning = '';
  const examples = [];
  let desc = '';
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    if (line.startsWith('# ')) continue;
    if (line.startsWith('>')) {
      if (!meaning) meaning = line.replace(/^>\s*/, '');
      continue;
    }
    if (line.startsWith('- ')) {
      desc = line.slice(2).replace(/:$/, '').trim();
      // Look ahead past blank lines for the backtick command
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      if (j < lines.length && lines[j].startsWith('`')) {
        const raw = lines[j].replace(/^`|`$/g, '').replace(/{{(.*?)}}/g, '<$1>');
        examples.push({ cmd: raw, description: desc });
      }
    }
  }
  return { meaning, examples };
}

export function parseMan(txt: string) {
  const lines = txt.split('\n');
  let meaning = '';
  let synopsis = '';
  let options: Array<{flag: string, description: string}> = [];
  let examples: Array<{cmd: string, description: string}> = [];
  let section = '';
  let optFlag = '';
  let optDesc = '';
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    if (/^([A-Z][A-Z0-9 ]+)$/.test(line.trim())) section = line.trim();
    if (section === 'NAME' && !meaning && line.includes(' - ')) {
      meaning = line.split(' - ').slice(1).join(' - ').trim();
    }
    if (section === 'SYNOPSIS') {
      if (line.trim()) synopsis += line + '\n';
    }
    if (section === 'OPTIONS' && /^\s*-/.test(line)) {
      if (optFlag) options.push({ flag: optFlag, description: optDesc.trim() });
      const m = line.match(/^(\s*-[-\w, ]+)/);
      optFlag = m ? m[1].trim() : '';
      optDesc = line.replace(optFlag, '').trim();
    } else if (section === 'OPTIONS' && optFlag) {
      optDesc += ' ' + line.trim();
    }
    if (section === 'EXAMPLES' && line.trim()) {
      const m = line.match(/^\s*(.+)$/);
      if (m) examples.push({ cmd: m[1], description: '' });
    }
  }
  if (optFlag) options.push({ flag: optFlag, description: optDesc.trim() });
  synopsis = synopsis.trim();
  return { meaning, synopsis, options, examples };
}

export function parseHelp(txt: string) {
  const lines = txt.split('\n');
  let meaning = '';
  let synopsis = '';
  let options: Array<{flag: string, description: string}> = [];
  let section = '';
  let optFlag = '';
  let optDesc = '';
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    if (/usage:/i.test(line)) section = 'SYNOPSIS';
    if (/options?/i.test(line)) section = 'OPTIONS';
    if (section === 'SYNOPSIS' && line.trim()) synopsis += line + '\n';
    if (section === 'OPTIONS' && /^\s*-/.test(line)) {
      if (optFlag) options.push({ flag: optFlag, description: optDesc.trim() });
      const m = line.match(/^(\s*-[-\w, ]+)/);
      optFlag = m ? m[1].trim() : '';
      optDesc = line.replace(optFlag, '').trim();
    } else if (section === 'OPTIONS' && optFlag) {
      optDesc += ' ' + line.trim();
    }
    if (!meaning && / - /.test(line)) meaning = line.split(' - ').slice(1).join(' - ').trim();
  }
  if (optFlag) options.push({ flag: optFlag, description: optDesc.trim() });
  synopsis = synopsis.trim();
  return { meaning, synopsis, options };
}
