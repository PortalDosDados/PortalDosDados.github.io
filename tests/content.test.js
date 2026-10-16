const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const portfolio = require('../data/content.js');

const ROOT_DIR = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

describe('Base de Conteúdo Estruturada (data/content.js)', () => {
  test('Deve exportar a chave de idioma pt com a estrutura correta', () => {
    assert.ok(portfolio, 'Objeto PORTFOLIO não foi exportado');
    assert.ok(portfolio.pt, 'Idioma pt não encontrado no PORTFOLIO');
    assert.ok(Array.isArray(portfolio.pt.stats), 'stats deve ser um array');
    assert.ok(Array.isArray(portfolio.pt.projects), 'projects deve ser um array');
    assert.ok(Array.isArray(portfolio.pt.projectCategories), 'projectCategories deve ser um array');
    assert.ok(Array.isArray(portfolio.pt.experience), 'experience deve ser um array');
    assert.ok(Array.isArray(portfolio.pt.skills), 'skills deve ser um array');
    assert.ok(Array.isArray(portfolio.pt.education), 'education deve ser um array');
    assert.ok(Array.isArray(portfolio.pt.tools), 'tools deve ser um array');
    assert.ok(Array.isArray(portfolio.pt.youtubeVideos), 'youtubeVideos deve ser um array');
  });

  test('Todos os projetos devem pertencer a categorias válidas e possuir dados essenciais', () => {
    const validCategoryIds = new Set(portfolio.pt.projectCategories.map((c) => c.id));

    portfolio.pt.projects.forEach((p, idx) => {
      assert.ok(p.id, `Projeto ${idx}: campo id obrigatório`);
      assert.ok(p.title, `Projeto ${p.id}: campo title obrigatório`);
      assert.ok(p.category, `Projeto ${p.id}: campo category obrigatório`);
      assert.ok(
        validCategoryIds.has(p.category),
        `Projeto ${p.id}: categoria "${p.category}" não cadastrada em projectCategories`
      );
      assert.ok(p.problem, `Projeto ${p.id}: campo problem obrigatório`);
      assert.ok(p.solution, `Projeto ${p.id}: campo solution obrigatório`);
      assert.ok(p.result, `Projeto ${p.id}: campo result obrigatório`);
      assert.ok(Array.isArray(p.tech) && p.tech.length > 0, `Projeto ${p.id}: tech deve conter pelo menos uma tecnologia`);
    });
  });

  test('Todos os vídeos do canal devem conter ID do YouTube, título e URL válida', () => {
    assert.ok(portfolio.pt.youtubeVideos.length > 0, 'Deve conter pelo menos um vídeo cadastrado');
    portfolio.pt.youtubeVideos.forEach((v, idx) => {
      assert.ok(v.id, `Vídeo ${idx}: campo id (YouTube ID) obrigatório`);
      assert.ok(v.title, `Vídeo ${v.id}: campo title obrigatório`);
      assert.ok(v.url && v.url.startsWith('https://www.youtube.com/'), `Vídeo ${v.id}: url deve ser do YouTube`);
      assert.ok(v.description, `Vídeo ${v.id}: campo description obrigatório`);
      assert.ok(Array.isArray(v.topics) && v.topics.length > 0, `Vídeo ${v.id}: topics deve conter pelo menos um tópico`);
    });
  });
});

describe('Integridade de Produção, Acessibilidade e SEO (index.html)', () => {
  test('Deve conter landmarks semânticas (<header>, <main id="main-content">, <footer>) e menu mobile', () => {
    assert.match(indexHtml, /<header\b/i, 'Tag <header> obrigatória');
    assert.match(indexHtml, /<main\s+id="main-content"/i, 'Tag <main id="main-content"> obrigatória');
    assert.match(indexHtml, /<\/main>/i, 'Fechamento </main> obrigatório');
    assert.match(indexHtml, /<footer\b/i, 'Tag <footer> obrigatória');
    assert.match(indexHtml, /id="mobileMenuBtn"/, 'Botão de menu mobile (#mobileMenuBtn) obrigatório');
    assert.match(indexHtml, /id="mobileMenu"/, 'Container de menu mobile (#mobileMenu) obrigatório');
  });

  test('Deve possuir JSON-LD Schema.org válido e importar estilos e scripts principais', () => {
    const jsonLdMatch = indexHtml.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    assert.ok(jsonLdMatch, 'Bloco JSON-LD Schema.org não encontrado em index.html');
    const parsedLd = JSON.parse(jsonLdMatch[1]);
    assert.equal(parsedLd['@type'], 'Person', 'Schema.org @type deve ser Person');
    assert.ok(parsedLd.name.includes('Dione'), 'Schema.org name deve conter Dione');

    assert.match(indexHtml, /href="assets\/css\/main\.css"/, 'index.html deve importar assets/css/main.css');
    assert.match(indexHtml, /src="data\/content\.js"/, 'index.html deve importar data/content.js');
    assert.match(indexHtml, /src="assets\/js\/app\.js"/, 'index.html deve importar assets/js/app.js');
  });

  test('Todos os assets locais referenciados em index.html devem existir no repositório', () => {
    const assetMatches = [...indexHtml.matchAll(/(?:src|href)="(assets\/[^"#?]+|data\/[^"#?]+)"/g)];
    assert.ok(assetMatches.length > 0, 'Deve encontrar referências de assets locais');

    assetMatches.forEach((match) => {
      const relPath = match[1];
      const fullPath = path.join(ROOT_DIR, relPath);
      assert.ok(fs.existsSync(fullPath), `Arquivo referenciado em index.html não existe: ${relPath}`);
    });
  });

  test('Dados de formação e estatísticas em data/content.js devem estar sincronizados com index.html', () => {
    portfolio.pt.stats.forEach((stat) => {
      const expectedValue = `${stat.value}${stat.suffix}`;
      assert.ok(
        indexHtml.includes(expectedValue),
        `Estatística "${expectedValue}" (${stat.label}) de data/content.js não encontrada em index.html`
      );
      assert.ok(
        indexHtml.includes(stat.label),
        `Rótulo de estatística "${stat.label}" de data/content.js não encontrado em index.html`
      );
    });

    portfolio.pt.education.forEach((edu) => {
      assert.ok(
        indexHtml.includes(edu.type),
        `Tipo de formação "${edu.type}" (${edu.title}) não encontrado em index.html`
      );
    });
  });
});
