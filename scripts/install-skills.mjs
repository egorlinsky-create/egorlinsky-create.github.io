#!/usr/bin/env node
// Ставит внешние навыки (Agent Skills, SKILL.md) для Claude Code и Codex.
// Список — в skills.config.json. Запуск: npm run skills:install
// --missing — только те, чьего источника ещё нет в skills-lock.json (так зовёт publish.cmd).
// global: true у навыка — ставит ещё и в пользовательские папки (-g), чтобы он работал везде.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../skills.config.json', import.meta.url), 'utf8'));
const agents = config.agents.map((a) => `--agent ${a}`).join(' ');
const onlyMissing = process.argv.includes('--missing');

const lockUrl = new URL('../skills-lock.json', import.meta.url);
const installed = new Set(
  existsSync(lockUrl) ? Object.values(JSON.parse(readFileSync(lockUrl, 'utf8')).skills ?? {}).map((s) => s.source) : [],
);

let failed = 0;
for (const skill of config.external) {
  if (onlyMissing && installed.has(skill.source)) continue;
  const cmds = [`npx -y skills add ${skill.source} ${agents} -y`];
  if (skill.global) cmds.push(`npx -y skills add ${skill.source} ${agents} -g -y`);
  console.log(`\n→ ${skill.name}: ${skill.why}`);
  for (const cmd of cmds) {
    console.log(`  ${cmd}`);
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch {
      failed += 1;
      console.warn(`  Не удалось поставить ${skill.name}. Проверь сеть и запусти команду вручную.`);
    }
  }
}

console.log(failed ? `\nГотово с ошибками: ${failed}.` : '\nНавыки на месте.');
process.exit(failed ? 1 : 0);
