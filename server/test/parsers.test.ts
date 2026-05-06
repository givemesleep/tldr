import { describe, it, expect } from 'vitest';
import { parseMan, parseHelp, parseTldr } from '../src/parsers.js';

describe('parseMan', () => {
  it('parses NAME and SYNOPSIS', () => {
    const txt = `NAME\nls - list directory contents\nSYNOPSIS\nls [OPTION]... [FILE]...\nOPTIONS\n-a  do not ignore entries starting with .\n-b  print C-style escapes for nongraphic characters`;
    const res = parseMan(txt);
    expect(res.meaning).toBe('list directory contents');
    expect(res.synopsis).toContain('ls [OPTION]');
    expect(res.options.length).toBeGreaterThan(0);
  });
});

describe('parseTldr', () => {
  it('parses tldr markdown', () => {
    const md = `# ls\n> List directory contents.\n- List files:\n` +
      '`ls`\n- List all files including hidden:\n`ls -a`';
    const res = parseTldr(md);
    expect(res.meaning).toContain('List directory contents');
    expect(res.examples.length).toBeGreaterThan(0);
  });
});
