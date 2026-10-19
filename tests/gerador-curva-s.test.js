const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const curva = require('../assets/js/tools/gerador-curva-s.js');

describe('Aplicação 3: Gerador de Curva S & Tendência (EVM Industrial)', () => {
  test('Deve calcular com precisão os dados modelo padrão do Python', () => {
    const res = curva.processarCurvaS(curva.DADOS_MODELO_PADRAO);

    assert.equal(res.totalDuracaoPlanejada, 18.0);
    assert.equal(res.spiFormatado, '0.91');
    assert.equal(res.desvioEstimado, 9.67);
    assert.equal(res.gapHorasFormatado, '+1.7h');
    assert.equal(res.statusText, '⚠️ POTENCIAL ATRASO');
    assert.equal(res.severidade, 'ATENCAO');

    // Validação dos acumulados planejados
    const planejado = res.tabela.map(t => t.pctPlanAcum);
    assert.deepEqual(planejado, [5.56, 16.67, 38.89, 94.44, 100.0]);

    // Validação dos acumulados realizados
    const realizado = res.tabela.map(t => t.pctRealAcum);
    assert.deepEqual(realizado, [2.78, 8.33, 30.56, 86.11, null]);

    // Validação da Trava de Eficiência: na tarefa 4 (Vulcanizar 1ª emenda),
    // duracaoPlanejada=10 e duracaoRealizada=12 -> progressoComputado DEVE ser 10.0
    const tarefa4 = res.tabela.find(t => t.atividade === 'Vulcanizar 1ª emenda');
    assert.ok(tarefa4);
    assert.equal(tarefa4.progressoComputado, 10.0);
  });

  test('Deve identificar projeto com status CRÍTICO quando desvio > 15%', () => {
    const dadosAtrasados = [
      { atividade: 'Etapa 1', duracaoPlanejada: 10, duracaoRealizada: 5, inicioPlanejado: '10/01/2025 - 08:00' },
      { atividade: 'Etapa 2', duracaoPlanejada: 10, duracaoRealizada: null, inicioPlanejado: '10/01/2025 - 18:00' },
    ];
    const res = curva.processarCurvaS(dadosAtrasados);
    // SPI = (5/20) / (10/20) = 0.5 -> Desvio = (100 / 0.5) - 100 = +100%
    assert.equal(res.spiFormatado, '0.50');
    assert.equal(res.desvioEstimado, 100.0);
    assert.equal(res.statusText, '🔴 CRÍTICO / ATRASO');
    assert.equal(res.severidade, 'CRITICO');
  });

  test('Deve identificar projeto NO PRAZO quando SPI >= 1.0 ou desvio <= 5%', () => {
    const dadosNoPrazo = [
      { atividade: 'Etapa 1', duracaoPlanejada: 10, duracaoRealizada: 10, inicioPlanejado: '10/01/2025 - 08:00' },
      { atividade: 'Etapa 2', duracaoPlanejada: 10, duracaoRealizada: null, inicioPlanejado: '10/01/2025 - 18:00' },
    ];
    const res = curva.processarCurvaS(dadosNoPrazo);
    assert.equal(res.spiFormatado, '1.00');
    assert.equal(res.desvioEstimado, 0.0);
    assert.equal(res.statusText, '✅ NO PRAZO');
    assert.equal(res.severidade, 'OK');
  });

  test('Deve gerar CSV modelo válido e re-importar via parseCSV sem perda de dados', () => {
    const csvTexto = curva.gerarCSVModelo();
    assert.ok(typeof csvTexto === 'string' && csvTexto.includes('Atividade'));
    assert.ok(csvTexto.includes('Vulcanizar 1ª emenda'));

    const parsed = curva.parseCSV(csvTexto);
    assert.equal(parsed.length, 5);
    assert.equal(parsed[0].atividade, 'Bloqueio');
    assert.equal(parsed[3].duracaoPlanejada, 10.0);
    assert.equal(parsed[3].duracaoRealizada, 12.0);
    assert.equal(parsed[4].duracaoRealizada, null);

    const reCalculado = curva.processarCurvaS(parsed);
    assert.equal(reCalculado.spiFormatado, '0.91');
  });

  test('Deve lançar erro apropriado para lista vazia ou durações inválidas', () => {
    assert.throws(() => curva.processarCurvaS([]), /vazia/);
    assert.throws(
      () => curva.processarCurvaS([{ atividade: 'Teste', duracaoPlanejada: 0 }]),
      /Duração Planejada inválida/
    );
  });
});
