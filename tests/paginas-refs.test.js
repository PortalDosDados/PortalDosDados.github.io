const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PAGINAS = [
  'index.html',
  ...fs.readdirSync(path.join(ROOT_DIR, 'ferramentas')).filter((f) => f.endsWith('.html')).map((f) => `ferramentas/${f}`),
  ...fs.readdirSync(path.join(ROOT_DIR, 'portal')).filter((f) => f.endsWith('.html')).map((f) => `portal/${f}`),
];

describe('Referências locais e ausência de código inline nas páginas', () => {
  PAGINAS.forEach((pagina) => {
    const html = fs.readFileSync(path.join(ROOT_DIR, pagina), 'utf8');
    const dir = path.dirname(path.join(ROOT_DIR, pagina));

    test(`${pagina}: todos os scripts/estilos locais referenciados existem`, () => {
      const refs = [...html.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((u) => !/^(https?:)?\/\//.test(u) && !u.startsWith('#') && !u.startsWith('mailto:') && !u.startsWith('data:'));
      for (const ref of refs) {
        const alvo = path.resolve(dir, ref.split('#')[0].split('?')[0]);
        assert.ok(fs.existsSync(alvo), `${pagina}: referência quebrada -> ${ref}`);
      }
    });

    test(`${pagina}: não contém <script> ou <style> inline (exceto JSON-LD)`, () => {
      const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(
        ([, attrs, body]) => !/\bsrc=/.test(attrs) && !/application\/ld\+json/.test(attrs) && body.trim() !== ''
      );
      assert.equal(inlineScripts.length, 0, `${pagina}: ${inlineScripts.length} script(s) inline encontrado(s)`);
      assert.doesNotMatch(html, /<style\b/i, `${pagina}: contém <style> inline`);
    });
  });
});
