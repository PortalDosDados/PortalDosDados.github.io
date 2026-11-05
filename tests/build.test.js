const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { render, TARGETS } = require('../scripts/build.js');

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const ROOT_DIR = path.resolve(__dirname, '..');

test('páginas HTML estão sincronizadas com seus templates em src/ (rode: node scripts/build.js)', () => {
  for (const target of TARGETS) {
    const gerado = render(target.template);
    const atual = fs.readFileSync(target.output, 'utf8');
    assert.equal(atual, gerado, `${target.name} está desatualizado.`);
  }
});

test('todo partial em src/partials é referenciado por ao menos um template', () => {
  const templates = TARGETS.map((t) => fs.readFileSync(t.template, 'utf8')).join('\n');
  const partials = fs.readdirSync(path.join(SRC_DIR, 'partials'));
  for (const nome of partials) {
    assert.ok(templates.includes(`partials/${nome}`), `Partial órfão: ${nome}`);
  }
});
