const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const series = require('../assets/js/tools/series-temporais.js');
const cotacoes = require('../assets/js/tools/dados-cotacoes.js');

describe('Aplicação 4: Análise Técnica de Séries Temporais com Python (Web Native)', () => {
  describe('Cálculo de Média Móvel Simples (calcularMediaMovel)', () => {
    test('Deve replicar rigorosamente a fórmula rolling(N).mean() do Pandas com valores null iniciais', () => {
      const input = [10, 20, 30, 40, 50];
      const resultado = series.calcularMediaMovel(input, 3);
      assert.deepEqual(resultado, [null, null, 20.0, 30.0, 40.0]);
    });

    test('Para janela de 5 períodos, os primeiros 4 valores devem ser nulos', () => {
      const input = [1, 2, 3, 4, 5, 6, 7];
      const resultado = series.calcularMediaMovel(input, 5);
      assert.equal(resultado[0], null);
      assert.equal(resultado[1], null);
      assert.equal(resultado[2], null);
      assert.equal(resultado[3], null);
      assert.equal(resultado[4], 3.0); // (1+2+3+4+5)/5
      assert.equal(resultado[5], 4.0); // (2+3+4+5+6)/5
      assert.equal(resultado[6], 5.0); // (3+4+5+6+7)/5
    });

    test('Deve lançar erro para parâmetros inválidos', () => {
      assert.throws(() => series.calcularMediaMovel('invalido', 5), /Parâmetros inválidos/);
      assert.throws(() => series.calcularMediaMovel([1, 2], 0), /Parâmetros inválidos/);
    });
  });

  describe('Processamento de Dados Reais de Ações (BBAS3.SA)', () => {
    test('Deve carregar e processar a base de cotações de BBAS3.SA', () => {
      assert.ok(cotacoes['BBAS3.SA'], 'Ticker BBAS3.SA deve existir no catálogo de cotações');
      const dados = cotacoes['BBAS3.SA'];
      assert.ok(dados.length >= 200, 'Deve conter pelo menos 200 pregões para cálculo de MA200');

      const res = series.processarSerie(dados, { janelaCurta: 21, janelaLonga: 200 });

      assert.equal(res.totalRegistros, dados.length);
      assert.equal(res.serie.ma21.length, dados.length);
      assert.equal(res.serie.ma200.length, dados.length);

      // Primeiros 20 dias de MA21 devem ser null
      for (let i = 0; i < 20; i++) {
        assert.equal(res.serie.ma21[i], null);
      }
      assert.notEqual(res.serie.ma21[20], null);

      // Primeiros 199 dias de MA200 devem ser null
      for (let i = 0; i < 199; i++) {
        assert.equal(res.serie.ma200[i], null);
      }
      assert.notEqual(res.serie.ma200[199], null);

      assert.ok(typeof res.ultimoMA21 === 'number');
      assert.ok(typeof res.ultimoMA200 === 'number');
      assert.ok(res.menorPreco > 0);
      assert.ok(res.maiorPreco >= res.menorPreco);
      assert.ok(res.tendencia);
    });

    test('Deve filtrar corretamente por período', () => {
      const dados = cotacoes['BBAS3.SA'];
      const filtrados = series.filtrarPorPeriodo(dados, '2024-01-01', '2024-06-30');
      assert.ok(filtrados.length > 0);
      filtrados.forEach(f => {
        assert.ok(f.date >= '2024-01-01');
        assert.ok(f.date <= '2024-06-30');
      });
    });

    test('Deve rejeitar lista vazia com erro claro', () => {
      assert.throws(() => series.processarSerie([]), /Nenhum dado encontrado/);
    });
  });
});
