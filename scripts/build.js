#!/usr/bin/env node
/**
 * Monta o index.html a partir de src/index.template.html + src/partials/*.html.
 *
 * Uso:
 *   node scripts/build.js          # gera index.html na raiz
 *   node scripts/build.js --check  # falha (exit 1) se index.html estiver desatualizado
 *
 * Diretiva suportada no template/partials: <!-- @include partials/arquivo.html -->
 * Sem dependências externas: só Node.js.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const TEMPLATE = path.join(SRC_DIR, 'index.template.html');
const OUTPUT = path.join(ROOT, 'index.html');
const INCLUDE_RE = /^([ \t]*)<!--\s*@include\s+(\S+)\s*-->[ \t]*$/;

function render(file, stack = []) {
  if (stack.includes(file)) {
    throw new Error(`Include circular: ${[...stack, file].join(' -> ')}`);
  }
  const content = fs.readFileSync(file, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  return content
    .split(eol)
    .map((line) => {
      const match = INCLUDE_RE.exec(line);
      if (!match) return line;
      const target = path.join(SRC_DIR, match[2]);
      if (!fs.existsSync(target)) {
        throw new Error(`Include não encontrado: ${match[2]} (em ${path.relative(ROOT, file)})`);
      }
      // Remove a quebra de linha final do partial para não duplicar linhas.
      return render(target, [...stack, file]).replace(/\r?\n$/, '');
    })
    .join(eol);
}

function build({ check = false } = {}) {
  const html = render(TEMPLATE);
  if (check) {
    const atual = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';
    return { ok: atual === html, html };
  }
  fs.writeFileSync(OUTPUT, html);
  return { ok: true, html };
}

module.exports = { build, render };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const { ok } = build({ check });
  if (check && !ok) {
    console.error('index.html desatualizado. Rode: node scripts/build.js');
    process.exit(1);
  }
  console.log(check ? 'index.html está sincronizado.' : 'index.html gerado.');
}
