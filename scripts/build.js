#!/usr/bin/env node
/**
 * Monta as páginas HTML a partir dos templates em src/*.template.html + src/partials/*.html.
 *
 * Gera:
 *   - src/index.template.html -> index.html (Portfólio de Soluções & Consultor)
 *   - src/curriculo.template.html -> curriculo.html (Currículo Detalhado)
 *
 * Uso:
 *   node scripts/build.js          # gera index.html e curriculo.html na raiz
 *   node scripts/build.js --check  # falha (exit 1) se algum arquivo estiver desatualizado
 *
 * Diretiva suportada no template/partials: <!-- @include partials/arquivo.html -->
 * Sem dependências externas: só Node.js.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');

const TARGETS = [
  {
    template: path.join(SRC_DIR, 'index.template.html'),
    output: path.join(ROOT, 'index.html'),
    name: 'index.html',
  },
  {
    template: path.join(SRC_DIR, 'curriculo.template.html'),
    output: path.join(ROOT, 'curriculo.html'),
    name: 'curriculo.html',
  },
];

const INCLUDE_RE = /^([ \t]*)<!--\s*@include\s+(\S+)\s*-->[ \t]*$/;

function render(file, stack = []) {
  if (stack.includes(file)) {
    throw new Error(`Include circular: ${[...stack, file].join(' -> ')}`);
  }
  const content = fs.readFileSync(file, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  return content
    .split(/\r?\n/)
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
  let allOk = true;
  const results = [];

  for (const target of TARGETS) {
    if (!fs.existsSync(target.template)) {
      continue;
    }
    const html = render(target.template);
    if (check) {
      const atual = fs.existsSync(target.output) ? fs.readFileSync(target.output, 'utf8') : '';
      const ok = atual === html;
      if (!ok) allOk = false;
      results.push({ name: target.name, ok, html });
    } else {
      fs.writeFileSync(target.output, html);
      results.push({ name: target.name, ok: true, html });
    }
  }

  return { ok: allOk, results };
}

module.exports = { build, render, TARGETS };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const { ok, results } = build({ check });
  if (check && !ok) {
    const desatualizados = results.filter((r) => !r.ok).map((r) => r.name);
    console.error(`Páginas desatualizadas: ${desatualizados.join(', ')}. Rode: node scripts/build.js`);
    process.exit(1);
  }
  console.log(check ? 'Páginas sincronizadas.' : 'Páginas geradas com sucesso.');
}
