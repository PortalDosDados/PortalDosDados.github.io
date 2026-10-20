const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fmea = require('../assets/js/tools/fmea.js');

describe('Módulo de Cálculo da Matriz FMEA Industrial (assets/js/tools/fmea.js)', () => {
  describe('Validação e Normalização de Notas FMEA (normalizarNota)', () => {
    test('Deve aceitar inteiros válidos de 1 a 10', () => {
      for (let i = 1; i <= 10; i++) {
        assert.equal(fmea.normalizarNota(i), i);
        assert.equal(fmea.normalizarNota(String(i)), i);
      }
    });

    test('Deve arredondar valores numéricos com decimais', () => {
      assert.equal(fmea.normalizarNota(7.4), 7);
      assert.equal(fmea.normalizarNota(7.6), 8);
      assert.equal(fmea.normalizarNota('4.8'), 5);
    });

    test('Deve rejeitar 0 e números negativos (escala padrão FMEA é de 1 a 10)', () => {
      assert.equal(fmea.normalizarNota(0), null);
      assert.equal(fmea.normalizarNota(-1), null);
      assert.equal(fmea.normalizarNota('-5'), null);
    });

    test('Deve rejeitar números maiores que 10', () => {
      assert.equal(fmea.normalizarNota(11), null);
      assert.equal(fmea.normalizarNota(100), null);
    });

    test('Deve diferenciar explicitamente vazio, null, undefined e NaN', () => {
      assert.equal(fmea.normalizarNota(''), null);
      assert.equal(fmea.normalizarNota(null), null);
      assert.equal(fmea.normalizarNota(undefined), null);
      assert.equal(fmea.normalizarNota('abc'), null);
      assert.equal(fmea.normalizarNota(NaN), null);
    });
  });

  describe('Cálculo de RPN (calcularRPN)', () => {
    test('Deve calcular o produto exato S x O x D para valores limites e intermediários', () => {
      assert.equal(fmea.calcularRPN(1, 1, 1), 1);
      assert.equal(fmea.calcularRPN(10, 10, 10), 1000);
      assert.equal(fmea.calcularRPN(8, 6, 4), 192);
      assert.equal(fmea.calcularRPN(5, 5, 3), 75);
    });

    test('Deve retornar null se qualquer um dos fatores for inválido ou vazio', () => {
      assert.equal(fmea.calcularRPN('', 5, 5), null);
      assert.equal(fmea.calcularRPN(8, null, 4), null);
      assert.equal(fmea.calcularRPN(8, 6, undefined), null);
      assert.equal(fmea.calcularRPN(0, 6, 4), null);
      assert.equal(fmea.calcularRPN(12, 6, 4), null);
    });
  });

  describe('Classificação de Criticidade e Alertas de Severidade (classificarCriticidade)', () => {
    test('Deve classificar como CRÍTICO com alertaSeveridade=true quando S >= 8, mesmo com RPN baixo', () => {
      const crit = fmea.classificarCriticidade(8, 8); // S=8, O=1, D=1 -> RPN=8
      assert.equal(crit.nivel, 'CRITICO');
      assert.equal(crit.alertaSeveridade, true);
      assert.equal(crit.rotulo, 'Crítico');
      assert.equal(crit.cor, '#ef4444');
    });

    test('Deve classificar como CRÍTICO quando RPN >= 120, mesmo com S < 8', () => {
      const crit = fmea.classificarCriticidade(6, 126);
      assert.equal(crit.nivel, 'CRITICO');
      assert.equal(crit.alertaSeveridade, false);
      assert.equal(crit.rotulo, 'Crítico');
    });

    test('Deve classificar como ALTO quando 80 <= RPN < 120 e S < 8', () => {
      const crit = fmea.classificarCriticidade(7, 84);
      assert.equal(crit.nivel, 'ALTO');
      assert.equal(crit.alertaSeveridade, false);
      assert.equal(crit.rotulo, 'Alto');
      assert.equal(crit.cor, '#f97316');
    });

    test('Deve classificar como MODERADO quando 40 <= RPN < 80 e S < 8', () => {
      const crit = fmea.classificarCriticidade(5, 75);
      assert.equal(crit.nivel, 'MODERADO');
      assert.equal(crit.alertaSeveridade, false);
      assert.equal(crit.rotulo, 'Moderado');
      assert.equal(crit.cor, '#eab308');
    });

    test('Deve classificar como BAIXO quando RPN < 40 e S < 8', () => {
      const crit = fmea.classificarCriticidade(4, 24);
      assert.equal(crit.nivel, 'BAIXO');
      assert.equal(crit.alertaSeveridade, false);
      assert.equal(crit.rotulo, 'Baixo');
      assert.equal(crit.cor, '#10b981');
    });

    test('Deve retornar INDEFINIDO para entradas nulas ou vazias', () => {
      const crit = fmea.classificarCriticidade(null, null);
      assert.equal(crit.nivel, 'INDEFINIDO');
      assert.equal(crit.rotulo, 'Pendente');
    });
  });

  describe('Cálculo de Redução de Risco (calcularReducaoRisco)', () => {
    test('Deve calcular delta e percentual de redução com 1 casa decimal', () => {
      const res = fmea.calcularReducaoRisco(192, 32);
      assert.deepEqual(res, {
        delta: 160,
        percentual: 83.3
      });
    });

    test('Deve calcular 0% quando RPN inicial e final forem iguais', () => {
      const res = fmea.calcularReducaoRisco(100, 100);
      assert.deepEqual(res, {
        delta: 0,
        percentual: 0
      });
    });

    test('Deve calcular percentual negativo se o RPN final aumentar (piora no risco)', () => {
      const res = fmea.calcularReducaoRisco(50, 75);
      assert.deepEqual(res, {
        delta: -25,
        percentual: -50.0
      });
    });

    test('Deve retornar null se qualquer RPN for nulo ou inválido', () => {
      assert.equal(fmea.calcularReducaoRisco(null, 50), null);
      assert.equal(fmea.calcularReducaoRisco(100, null), null);
    });
  });

  describe('Curva e Análise de Pareto (calcularPareto)', () => {
    test('Deve ordenar modos de falha por RPN decrescente e calcular percentual acumulado até 100%', () => {
      const itens = [
        { modoFalha: 'Modo B', rpnInicial: 50 },
        { modoFalha: 'Modo A', rpnInicial: 150 },
        { modoFalha: 'Modo C', rpnInicial: 100 }
      ];

      const res = fmea.calcularPareto(itens);
      assert.equal(res.somaTotal, 300);
      assert.deepEqual(res.labels, ['Modo A', 'Modo C', 'Modo B']);
      assert.deepEqual(res.rpns, [150, 100, 50]);
      assert.deepEqual(res.acumulados, [50.0, 83.3, 100.0]);
    });

    test('Deve ignorar itens com RPN zero, nulo ou lista vazia sem quebrar', () => {
      assert.deepEqual(fmea.calcularPareto([]), {
        itensOrdenados: [],
        somaTotal: 0,
        labels: [],
        rpns: [],
        acumulados: []
      });

      const misto = [
        { modoFalha: 'Invalido', rpnInicial: null },
        { modoFalha: 'Zero', rpnInicial: 0 },
        { modoFalha: 'Valido', rpnInicial: 80 }
      ];
      const res = fmea.calcularPareto(misto);
      assert.equal(res.somaTotal, 80);
      assert.equal(res.labels.length, 1);
      assert.equal(res.labels[0], 'Valido');
      assert.deepEqual(res.acumulados, [100.0]);
    });
  });

  describe('Métricas Agregadas da Matriz (calcularMetricasAgregadas)', () => {
    test('Deve calcular métricas agregadas coerentes com o exemplo industrial', () => {
      const exemplo = fmea.gerarExemploIndustrial();
      const metricas = fmea.calcularMetricasAgregadas(exemplo);

      assert.equal(metricas.totalItens, 5);
      assert.equal(metricas.criticos, 3); // fmea-01 (192, S=8), fmea-02 (126, S=6), fmea-03 (140, S=7)
      assert.equal(metricas.altos, 0);
      assert.equal(metricas.moderados, 2); // fmea-04 (75), fmea-05 (48)
      assert.equal(metricas.baixos, 0);
      assert.ok(metricas.rpnMedioInicial > 100);
      assert.ok(metricas.rpnMedioFinal < 35);
      assert.ok(metricas.reducaoGeralPercentual > 70);
    });

    test('Deve retornar estrutura com zeros para lista vazia', () => {
      const metricas = fmea.calcularMetricasAgregadas([]);
      assert.equal(metricas.totalItens, 0);
      assert.equal(metricas.criticos, 0);
      assert.equal(metricas.rpnMedioInicial, 0);
      assert.equal(metricas.reducaoGeralPercentual, 0);
    });
  });

  describe('Exportação de Dados (exportarCSV e exportarJSON)', () => {
    test('CSV deve conter cabeçalho esperado e separadores ponto e vírgula', () => {
      const exemplo = fmea.gerarExemploIndustrial();
      const csv = fmea.exportarCSV(exemplo);

      assert.ok(csv.startsWith('ID;Componente;Modo de Falha;Efeito Potencial;'));
      assert.ok(csv.includes('Rolamento de Apoio'));
      assert.ok(csv.includes('PCM / Confiabilidade'));
      assert.equal(csv.split('\r\n').length, 6); // Cabeçalho + 5 linhas
    });

    test('JSON deve ser válido e parseável', () => {
      const exemplo = fmea.gerarExemploIndustrial();
      const jsonStr = fmea.exportarJSON(exemplo);
      const parsed = JSON.parse(jsonStr);

      assert.ok(Array.isArray(parsed));
      assert.equal(parsed.length, 5);
      assert.equal(parsed[0].componente, 'Rolamento de Apoio');
    });
  });
});
