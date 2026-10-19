const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

const FERRAMENTAS = [
  {
    nome: 'Calculadora de 52 Semanas',
    arquivo: 'ferramentas/calculadora-52-semanas.html',
    scriptEsperado: '../assets/js/tools/calculadora-52-semanas.js',
    tituloEsperado: 'Calculadora de 52 Semanas',
  },
  {
    nome: 'Controle de Parada (Downtime)',
    arquivo: 'ferramentas/calculadora-paradas.html',
    scriptEsperado: '../assets/js/tools/calculadora-paradas.js',
    tituloEsperado: 'Controle de Parada',
  },
  {
    nome: 'Gerador de Curva S',
    arquivo: 'ferramentas/gerador-curva-s.html',
    scriptEsperado: '../assets/js/tools/gerador-curva-s.js',
    tituloEsperado: 'Curva S',
  },
  {
    nome: 'Séries Temporais',
    arquivo: 'ferramentas/series-temporais.html',
    scriptEsperado: '../assets/js/tools/series-temporais.js',
    tituloEsperado: 'Séries Temporais',
  },
];

describe('Integridade das Páginas Web das Ferramentas Industriais (ferramentas/*.html)', () => {
  FERRAMENTAS.forEach((ferramenta) => {
    test(`Página ${ferramenta.nome} (${ferramenta.arquivo}) deve existir e conter estrutura semântica válida`, () => {
      const fullPath = path.join(ROOT_DIR, ferramenta.arquivo);
      assert.ok(fs.existsSync(fullPath), `Arquivo não encontrado: ${ferramenta.arquivo}`);

      const html = fs.readFileSync(fullPath, 'utf8');

      // Título e SEO
      assert.ok(html.includes(`<title>`), 'Deve conter tag <title>');
      assert.ok(html.includes(ferramenta.tituloEsperado), `Título deve conter "${ferramenta.tituloEsperado}"`);

      // Landmarks Semânticas
      assert.match(html, /<header\b/i, 'Deve conter tag <header>');
      assert.match(html, /<main\b/i, 'Deve conter tag <main>');
      assert.match(html, /<\/main>/i, 'Deve conter fechamento </main>');
      assert.match(html, /<footer\b/i, 'Deve conter tag <footer>');

      // Botão de retorno ao portfólio
      assert.ok(html.includes('../index.html'), 'Deve conter link de volta para o index.html');

      // Import do script da ferramenta
      assert.ok(html.includes(ferramenta.scriptEsperado), `Deve importar script ${ferramenta.scriptEsperado}`);

      // Verifica se o script importado realmente existe no disco
      const scriptRelativo = ferramenta.scriptEsperado.replace(/^\.\.\//, '');
      const scriptFullPath = path.join(ROOT_DIR, scriptRelativo);
      assert.ok(fs.existsSync(scriptFullPath), `Script referenciado não existe no disco: ${scriptRelativo}`);
    });
  });
});
