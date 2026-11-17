#!/usr/bin/env node
// Источник правды для навыков — .agents/skills (его читает Codex).
// Скрипт зеркалит собственные навыки проекта в .claude/skills для Claude Code.
// Симлинк не используем: на Windows git по умолчанию превращает его в текстовый файл.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const quiet = process.argv.includes('--quiet');
const root = fileURLToPath(new URL('..', import.meta.url));
const src = join(root, '.agents', 'skills');
const dst = join(root, '.claude', 'skills');

if (!existsSync(src)) process.exit(0);
mkdirSync(dst, { recursive: true });

let count = 0;
for (const name of readdirSync(src)) {
  const from = join(src, name);
  if (!statSync(from).isDirectory()) continue;
  const to = join(dst, name);
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  count += 1;
}

if (!quiet) console.log(`Навыки синхронизированы: ${count} → .claude/skills`);
