const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const portfolio = require('../data/content.js');

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
