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

  test('Página do aluno deve possuir formulário de login com Turma e importar sintetizador de áudio', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'portal/index.html'), 'utf8');
    assert.ok(html.includes('id="formLoginDireto"'), 'Deve conter form de login do aluno');
    assert.ok(html.includes('id="loginTurma"'), 'Deve conter select de turma para o aluno');
    assert.ok(html.includes('id="loginMatricula"'), 'Deve conter input de matrícula');
    assert.ok(html.includes('portal-audio.js'), 'Deve importar o script de áudio arcade');
  });

  test('Página do professor deve possuir gate de autenticação com chave e filtro por turma', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'portal/professor.html'), 'utf8');
    assert.ok(html.includes('id="secaoLoginDocente"'), 'Deve conter seção de login docente');
    assert.ok(html.includes('id="chaveDocente"'), 'Deve conter campo de chave docente');
    assert.ok(html.includes('id="filtroTurma"'), 'Deve conter filtro de turmas no painel');
  });
});
