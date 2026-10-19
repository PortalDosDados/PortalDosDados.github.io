const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { render } = require('../scripts/build.js');

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const ROOT_DIR = path.resolve(__dirname, '..');

test('index.html está sincronizado com src/ (rode: node scripts/build.js)', () => {
  const gerado = render(path.join(SRC_DIR, 'index.template.html'));
  const atual = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert.equal(atual, gerado);
});

test('todo partial em src/partials é referenciado pelo template', () => {
  const template = fs.readFileSync(path.join(SRC_DIR, 'index.template.html'), 'utf8');
  const partials = fs.readdirSync(path.join(SRC_DIR, 'partials'));
  for (const nome of partials) {
    assert.ok(template.includes(`partials/${nome}`), `Partial órfão: ${nome}`);
  }
});
