const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

const PAGINAS_PORTAL = [
  {
    nome: 'Portal do Aluno (Trilha Gamificada)',
    arquivo: 'portal/index.html',
    scriptEsperado: '../assets/js/portal/portal-aluno-page.js',
    tituloEsperado: 'Portal do Aluno',
  },
  {
    nome: 'Painel Docente & Gestão da Turma',
    arquivo: 'portal/professor.html',
    scriptEsperado: '../assets/js/portal/portal-professor-page.js',
    tituloEsperado: 'Painel Docente',
  },
];

describe('Integridade das Páginas do Portal do Aluno (portal/*.html)', () => {
  PAGINAS_PORTAL.forEach((pagina) => {
    test(`Página ${pagina.nome} (${pagina.arquivo}) deve existir e conter estrutura semântica válida`, () => {
      const fullPath = path.join(ROOT_DIR, pagina.arquivo);
      assert.ok(fs.existsSync(fullPath), `Arquivo não encontrado: ${pagina.arquivo}`);

      const html = fs.readFileSync(fullPath, 'utf8');

      // Título e SEO
      assert.ok(html.includes('<title>'), 'Deve conter tag <title>');
      assert.ok(html.includes(pagina.tituloEsperado), `Título deve conter "${pagina.tituloEsperado}"`);

      // Landmarks Semânticas
      assert.match(html, /<header\b/i, 'Deve conter tag <header>');
      assert.match(html, /<main\b/i, 'Deve conter tag <main>');
      assert.match(html, /<\/main>/i, 'Deve conter fechamento </main>');
      assert.match(html, /<footer\b/i, 'Deve conter tag <footer>');

      // Botão de retorno ao portfólio
      assert.ok(html.includes('../index.html'), 'Deve conter link de volta para o index.html');

      // Import do script da página
      assert.ok(html.includes(pagina.scriptEsperado), `Deve importar script ${pagina.scriptEsperado}`);

      // Verifica se o script importado realmente existe no disco
      const scriptRelativo = pagina.scriptEsperado.replace(/^\.\.\//, '');
      const scriptFullPath = path.join(ROOT_DIR, scriptRelativo);
      assert.ok(fs.existsSync(scriptFullPath), `Script referenciado não existe no disco: ${scriptRelativo}`);
    });
  });
});
