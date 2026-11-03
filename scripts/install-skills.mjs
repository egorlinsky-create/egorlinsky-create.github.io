#!/usr/bin/env node
// Ставит внешние навыки (Agent Skills, SKILL.md) в проект для Claude Code и Codex.
// Список — в skills.config.json. Запуск: npm run skills:install
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../skills.config.json', import.meta.url), 'utf8'));
const agents = config.agents.map((a) => `--agent ${a}`).join(' ');

let failed = 0;
for (const skill of config.external) {
  const cmd = `npx -y skills add ${skill.source} ${agents} -y`;
  console.log(`\n→ ${skill.name}: ${skill.why}\n  ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch {
    failed += 1;
    console.warn(`  Не удалось поставить ${skill.name}. Проверь сеть и запусти команду вручную.`);
  }
}

console.log(failed ? `\nГотово с ошибками: ${failed}.` : '\nВсе навыки установлены.');
process.exit(failed ? 1 : 0);
