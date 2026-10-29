const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const portalCursos = require('../data/portal-cursos.js');
const questoesLogica = require('../data/questoes/informatica-logica.js');

describe('Integridade do Catálogo de Cursos e Banco de Questões', () => {
  describe('Catálogo de Cursos (data/portal-cursos.js)', () => {
    test('Deve conter o curso Técnico em Informática estruturado', () => {
      assert.ok(portalCursos && Array.isArray(portalCursos.cursos));
      const cursoInfo = portalCursos.cursos.find((c) => c.id === 'informatica');
      assert.ok(cursoInfo, 'Curso informatica deve existir');
      assert.equal(cursoInfo.nome, 'Técnico em Informática');
      assert.ok(cursoInfo.unidadesCurriculares.length >= 3);
    });

    test('Deve possuir a Unidade Curricular de Lógica de Programação ativa no piloto', () => {
      const cursoInfo = portalCursos.cursos.find((c) => c.id === 'informatica');
      const ucLogica = cursoInfo.unidadesCurriculares.find((u) => u.id === 'logica_programacao');
      assert.ok(ucLogica, 'Unidade Curricular logica_programacao deve existir');
      assert.equal(ucLogica.status, 'ativo');
      assert.equal(ucLogica.ordem, 1);
    });

    test('Deve conter a matriz temática de proficiência (Juninho a Sênior)', () => {
      const cursoInfo = portalCursos.cursos.find((c) => c.id === 'informatica');
      const titulos = cursoInfo.niveisProficiencia.map((n) => n.titulo);
      assert.deepEqual(titulos, ['Juninho', 'Júnior', 'Pleno', 'Sênior']);
    });

    test('Deve disponibilizar avatares temáticos válidos', () => {
      assert.ok(Array.isArray(portalCursos.avatares));
      assert.ok(portalCursos.avatares.length >= 4);
      portalCursos.avatares.forEach((av) => {
        assert.ok(av.id);
        assert.ok(av.nome);
        assert.ok(av.icone);
      });
    });
  });

  describe('Banco de Questões: Lógica de Programação (data/questoes/informatica-logica.js)', () => {
    test('Deve conter no mínimo 15 questões pedagógicas cadastradas', () => {
      assert.ok(Array.isArray(questoesLogica));
      assert.ok(questoesLogica.length >= 15);
    });

    test('Cada questão deve possuir estrutura completa, id único e 4 alternativas (A, B, C, D)', () => {
      const idsVistos = new Set();
      const idsPermitidos = ['A', 'B', 'C', 'D'];

      questoesLogica.forEach((q, index) => {
        assert.ok(q.id, `Questão no índice ${index} deve ter id`);
        assert.ok(!idsVistos.has(q.id), `ID duplicado detectado: ${q.id}`);
        idsVistos.add(q.id);

        assert.ok(q.tema, `Questão ${q.id} deve ter tema`);
        assert.ok(q.enunciado && q.enunciado.trim().length > 10, `Questão ${q.id} deve ter enunciado válido`);

        assert.ok(Array.isArray(q.alternativas), `Questão ${q.id} deve ter array de alternativas`);
        assert.equal(q.alternativas.length, 4, `Questão ${q.id} deve ter exatamente 4 alternativas`);

        const idsAlternativas = q.alternativas.map((a) => a.id);
        assert.deepEqual(idsAlternativas, idsPermitidos, `Questão ${q.id} deve ter opções A, B, C e D`);

        assert.ok(
          idsPermitidos.includes(q.respostaCorreta),
          `Questão ${q.id} deve ter respostaCorreta válida ('A', 'B', 'C' ou 'D')`
        );

        assert.ok(q.explicacao && q.explicacao.length > 15, `Questão ${q.id} deve ter explicação pedagógica detalhada`);
        assert.ok(q.dica, `Questão ${q.id} deve conter uma dica de apoio`);
      });
    });

    test('Deve cobrir os tópicos fundamentais da ementa de Lógica', () => {
      const temas = new Set(questoesLogica.map((q) => q.tema));
      assert.ok(temas.has('Tipos de Dados'));
      assert.ok(temas.has('Operadores Aritméticos'));
      assert.ok(temas.has('Operadores Lógicos'));
      assert.ok(temas.has('Laço Enquanto (While)') || temas.has('Laço Para (For)'));
      assert.ok(temas.has('Vetores (Arrays)'));
    });
  });
});
