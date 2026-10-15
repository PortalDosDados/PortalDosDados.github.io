const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const metrologiaQuizData = require('../simuladores/dados-metrologia.js');

describe('Simulador de Metrologia - Validação de Dados e Regras de Negócio', () => {
  test('O banco de dados deve ser um array não vazio de questões', () => {
    assert.ok(Array.isArray(metrologiaQuizData), 'metrologiaQuizData deve ser um array');
    assert.ok(metrologiaQuizData.length >= 10, 'O quiz deve conter no mínimo 10 questões para avaliação');
  });

  test('Todas as questões devem possuir IDs únicos e sequenciais', () => {
    const ids = metrologiaQuizData.map((q) => q.id);
    const uniqueIds = new Set(ids);
    assert.equal(ids.length, uniqueIds.size, 'Existem IDs duplicados no banco de dados');
  });

  test('Cada questão deve possuir campos válidos e consistentes', () => {
    metrologiaQuizData.forEach((q, index) => {
      const idx = index + 1;
      assert.ok(typeof q.pergunta === 'string' && q.pergunta.trim().length > 0, `Questão ${idx}: pergunta vazia`);
      assert.ok(Array.isArray(q.opcoes), `Questão ${idx}: opcoes deve ser um array`);
      assert.ok(q.opcoes.length >= 2, `Questão ${idx}: deve haver pelo menos 2 opções`);
      
      // Validação de opções únicas
      const uniqueOptions = new Set(q.opcoes.map((o) => o.trim()));
      assert.equal(uniqueOptions.size, q.opcoes.length, `Questão ${idx}: existem opções com textos duplicados`);

      // Validação do índice de resposta correta
      assert.ok(Number.isInteger(q.respostaCorreta), `Questão ${idx}: respostaCorreta deve ser um número inteiro`);
      assert.ok(
        q.respostaCorreta >= 0 && q.respostaCorreta < q.opcoes.length,
        `Questão ${idx}: respostaCorreta (${q.respostaCorreta}) fora dos limites das opções (0 a ${q.opcoes.length - 1})`
      );

      // Validação da explicação
      assert.ok(
        typeof q.explicacao === 'string' && q.explicacao.trim().length > 0,
        `Questão ${idx}: explicação comentada ausente ou vazia`
      );
    });
  });
});
