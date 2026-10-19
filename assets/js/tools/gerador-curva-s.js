/**
 * assets/js/tools/gerador-curva-s.js
 * Motor matemático e regras de Engenharia de Custos / Planejamento para Gerador de Curva S & Tendência.
 * Compatível com navegador (window.GeradorCurvaS) e Node.js (CommonJS / module.exports).
 * 
 * Replicando com precisão absoluta as regras do Python original (pages/7_Gerador_de_Curva_S.py):
 * - Ordenação cronológica
 * - Trava de Eficiência física: min(Duração Realizada, Duração Planejada)
 * - Avanço Planejado Acumulado e Avanço Real Acumulado
 * - EVM (Earned Value Management): SPI = Realizado / Planejado
 * - Desvio Estimado (%) = (100 / SPI) - 100
 * - Projeção de Horas Totais e Gap em Horas
 * - Classificação:
 *     Desvio > 15%: 🔴 CRÍTICO / ATRASO (#ef5350)
 *     Desvio > 5%:  ⚠️ POTENCIAL ATRASO (#ffa726)
 *     Outros:       ✅ NO PRAZO (#66bb6a)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GeradorCurvaS = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Dados modelo originais do arquivo modelo_curva_s.xlsx
  const DADOS_MODELO_PADRAO = [
    {
      atividade: 'Bloqueio',
      duracaoPlanejada: 1.0,
      duracaoRealizada: 0.5,
      inicioPlanejado: '10/01/2025 - 08:00',
      terminoPlanejado: '10/01/2025 - 09:00',
      inicioReal: '10/01/2025 - 08:00',
      terminoReal: '10/01/2025 - 08:30',
    },
    {
      atividade: 'C.Peso',
      duracaoPlanejada: 2.0,
      duracaoRealizada: 1.0,
      inicioPlanejado: '10/01/2025 - 09:00',
      terminoPlanejado: '10/01/2025 - 11:00',
      inicioReal: '10/01/2025 - 08:30',
      terminoReal: '10/01/2025 - 09:30',
    },
    {
      atividade: 'Passagem 1ª bobina',
      duracaoPlanejada: 4.0,
      duracaoRealizada: 4.2,
      inicioPlanejado: '10/01/2025 - 11:00',
      terminoPlanejado: '10/01/2025 - 15:00',
      inicioReal: '10/01/2025 - 09:30',
      terminoReal: '10/01/2025 - 13:42',
    },
    {
      atividade: 'Vulcanizar 1ª emenda',
      duracaoPlanejada: 10.0,
      duracaoRealizada: 12.0,
      inicioPlanejado: '10/01/2025 - 15:00',
      terminoPlanejado: '11/01/2025 - 01:00',
      inicioReal: '10/01/2025 - 13:42',
      terminoReal: '11/01/2025 - 01:42',
    },
    {
      atividade: 'Desbloqueio',
      duracaoPlanejada: 1.0,
      duracaoRealizada: null,
      inicioPlanejado: '11/01/2025 - 01:00',
      terminoPlanejado: '11/01/2025 - 02:00',
      inicioReal: null,
      terminoReal: null,
    },
  ];

  /**
   * Converte uma string no formato 'DD/MM/YYYY - HH:MM' ou ISO para Date.
   * @param {string} dataHoraStr 
   * @returns {Date|null}
   */
  function parseDataHoraCustom(dataHoraStr) {
    if (!dataHoraStr) return null;
    const match = String(dataHoraStr).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2})$/);
    if (match) {
      const dia = parseInt(match[1], 10);
      const mes = parseInt(match[2], 10) - 1;
      const ano = parseInt(match[3], 10);
      const h = parseInt(match[4], 10);
      const m = parseInt(match[5], 10);
      return new Date(ano, mes, dia, h, m);
    }
    const d = new Date(dataHoraStr);
    return isNaN(d.getTime()) ? null : d;
  }

  /**
   * Processa uma lista de atividades e computa a Curva S com KPIs de EVM.
   * @param {Array<Object>} itens 
   * @returns {Object}
   */
  function processarCurvaS(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
      throw new Error('A lista de atividades do cronograma está vazia.');
    }

    // Clonar e normalizar
    const atividades = itens.map((it, idx) => {
      const plan = Number(it.duracaoPlanejada);
      if (isNaN(plan) || plan <= 0) {
        throw new Error(`A atividade na linha ${idx + 1} possui Duração Planejada inválida (${it.duracaoPlanejada}).`);
      }
      const real = it.duracaoRealizada !== null && it.duracaoRealizada !== undefined && it.duracaoRealizada !== ''
        ? Number(it.duracaoRealizada)
        : null;

      const dtInicioPlan = parseDataHoraCustom(it.inicioPlanejado);

      return {
        id: idx + 1,
        atividade: it.atividade || `Atividade ${idx + 1}`,
        duracaoPlanejada: plan,
        duracaoRealizada: real !== null && !isNaN(real) ? real : null,
        inicioPlanejado: it.inicioPlanejado || '',
        terminoPlanejado: it.terminoPlanejado || '',
        inicioReal: it.inicioReal || '',
        terminoReal: it.terminoReal || '',
        _dtInicio: dtInicioPlan ? dtInicioPlan.getTime() : idx,
      };
    });

    // Ordenação cronológica por Início Planejado
    atividades.sort((a, b) => a._dtInicio - b._dtInicio);

    // Baseline Total (Denominador)
    const totalDuracaoPlanejada = atividades.reduce((acc, at) => acc + at.duracaoPlanejada, 0);

    let somaPlanejadaAcumulada = 0;
    let somaRealComputadaAcumulada = 0;
    let ultimoIdxValido = -1;

    // Processamento passo a passo das atividades
    const tabelaProcessada = atividades.map((at, idx) => {
      somaPlanejadaAcumulada += at.duracaoPlanejada;
      const pctPlanAcum = parseFloat(((somaPlanejadaAcumulada / totalDuracaoPlanejada) * 100).toFixed(2));

      let progressoComputado = 0;
      let pctRealAcum = null;

      if (at.duracaoRealizada !== null) {
        // Regra de Ouro / Trava de Eficiência do Python: min(realizada, planejada)
        progressoComputado = Math.min(at.duracaoRealizada, at.duracaoPlanejada);
        somaRealComputadaAcumulada += progressoComputado;
        pctRealAcum = parseFloat(((somaRealComputadaAcumulada / totalDuracaoPlanejada) * 100).toFixed(2));
        ultimoIdxValido = idx;
      }

      // Rótulo temporal para o eixo X
      const marcoTemporal = at.inicioPlanejado && at.terminoPlanejado
        ? `${at.atividade} (${at.inicioPlanejado.split(' - ')[1] || ''} às ${at.terminoPlanejado.split(' - ')[1] || ''})`
        : at.atividade;

      return {
        ...at,
        progressoComputado,
        pctPlanAcum,
        pctRealAcum,
        marcoTemporal,
      };
    });

    // Cálculo dos KPIs no último marco realizado
    let spi = 1.0;
    let desvioEstimado = 0.0;
    let estimativaHorasTotal = totalDuracaoPlanejada;
    let gapHoras = 0.0;
    let percentualRealizado = 0.0;
    let percentualPlanejado = 0.0;

    if (ultimoIdxValido >= 0) {
      percentualRealizado = tabelaProcessada[ultimoIdxValido].pctRealAcum;
      percentualPlanejado = tabelaProcessada[ultimoIdxValido].pctPlanAcum;

      if (percentualPlanejado > 0) {
        spi = percentualRealizado / percentualPlanejado;
      }

      if (spi > 0) {
        desvioEstimado = (100 / spi) - 100;
        estimativaHorasTotal = totalDuracaoPlanejada / spi;
        gapHoras = estimativaHorasTotal - totalDuracaoPlanejada;
      }
    }

    // Classificação de Status
    let statusText = '✅ NO PRAZO';
    let corStatus = '#66bb6a';
    let severidade = 'OK';

    if (desvioEstimado > 15) {
      statusText = '🔴 CRÍTICO / ATRASO';
      corStatus = '#ef5350';
      severidade = 'CRITICO';
    } else if (desvioEstimado > 5) {
      statusText = '⚠️ POTENCIAL ATRASO';
      corStatus = '#ffa726';
      severidade = 'ATENCAO';
    }

    // Montagem da série para o gráfico incluindo Ponto Zero (Início = 0%)
    const pontosGrafico = [
      {
        marco: 'Ponto Zero (Início)',
        planejado: 0.0,
        realizado: 0.0,
      },
      ...tabelaProcessada.map((t) => ({
        marco: t.atividade,
        planejado: t.pctPlanAcum,
        realizado: t.pctRealAcum, // Pode ser null para tarefas futuras
      })),
    ];

    return {
      totalDuracaoPlanejada: parseFloat(totalDuracaoPlanejada.toFixed(2)),
      ultimoIdxValido,
      percentualRealizado,
      percentualPlanejado,
      spi: parseFloat(spi.toFixed(4)),
      spiFormatado: spi.toFixed(2),
      desvioEstimado: parseFloat(desvioEstimado.toFixed(2)),
      desvioEstimadoFormatado: `${desvioEstimado >= 0 ? '+' : ''}${desvioEstimado.toFixed(2)}%`,
      estimativaHorasTotal: parseFloat(estimativaHorasTotal.toFixed(2)),
      gapHoras: parseFloat(gapHoras.toFixed(2)),
      gapHorasFormatado: `${gapHoras >= 0 ? '+' : ''}${gapHoras.toFixed(1)}h`,
      statusText,
      corStatus,
      severidade,
      tabela: tabelaProcessada,
      pontosGrafico,
    };
  }

  /**
   * Gera representação CSV compatível com Excel do modelo padrão.
   * @returns {string}
   */
  function gerarCSVModelo() {
    const cabecalho = 'Atividade;Duração Planejada;Duração Realizada;Início Planejado;Término Planejado;Inicio Real;Término Real\n';
    const linhas = DADOS_MODELO_PADRAO.map(d => 
      `${d.atividade};${d.duracaoPlanejada};${d.duracaoRealizada !== null ? d.duracaoRealizada : ''};${d.inicioPlanejado};${d.terminoPlanejado};${d.inicioReal || ''};${d.terminoReal || ''}`
    ).join('\n');
    return cabecalho + linhas;
  }

  /**
   * Converte texto CSV (separado por vírgula ou ponto-e-vírgula) para array de atividades.
   * @param {string} textoCSV 
   * @returns {Array<Object>}
   */
  function parseCSV(textoCSV) {
    if (!textoCSV || typeof textoCSV !== 'string') {
      throw new Error('Conteúdo CSV vazio ou inválido.');
    }

    const linhas = textoCSV
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (linhas.length < 2) {
      throw new Error('O CSV deve conter cabeçalho e pelo menos uma linha de dados.');
    }

    // Detectar delimitador (; ou , ou \t)
    const primeiraLinha = linhas[0];
    const delim = primeiraLinha.includes(';') ? ';' : primeiraLinha.includes('\t') ? '\t' : ',';

    const colunas = primeiraLinha.split(delim).map(c => c.trim().toLowerCase());

    const findIndex = (aliases) => {
      return colunas.findIndex(c => aliases.some(a => c.includes(a)));
    };

    const idxAtividade = findIndex(['atividade', 'task', 'nome']);
    const idxDurPlan = findIndex(['duração planejada', 'duracao planejada', 'planejada', 'dur_plan']);
    const idxDurReal = findIndex(['duração realizada', 'duracao realizada', 'realizada', 'dur_real']);
    const idxIniPlan = findIndex(['início planejado', 'inicio planejado', 'ini_plan']);
    const idxFimPlan = findIndex(['término planejado', 'termino planejado', 'fim_plan']);
    const idxIniReal = findIndex(['inicio real', 'início real', 'ini_real']);
    const idxFimReal = findIndex(['termino real', 'término real', 'fim_real']);

    if (idxDurPlan === -1) {
      throw new Error('Coluna obrigatória "Duração Planejada" não encontrada no CSV.');
    }

    const dados = [];

    for (let i = 1; i < linhas.length; i++) {
      const parts = linhas[i].split(delim).map(p => p.trim());
      if (parts.length === 0 || parts.every(p => p === '')) continue;

      const ativ = idxAtividade !== -1 ? parts[idxAtividade] : `Item ${i}`;
      const dPlanStr = parts[idxDurPlan] ? parts[idxDurPlan].replace(',', '.') : '';
      const dRealStr = idxDurReal !== -1 && parts[idxDurReal] ? parts[idxDurReal].replace(',', '.') : '';

      const durPlan = parseFloat(dPlanStr);
      const durReal = dRealStr !== '' ? parseFloat(dRealStr) : null;

      if (!isNaN(durPlan)) {
        dados.push({
          atividade: ativ,
          duracaoPlanejada: durPlan,
          duracaoRealizada: durReal !== null && !isNaN(durReal) ? durReal : null,
          inicioPlanejado: idxIniPlan !== -1 ? parts[idxIniPlan] || '' : '',
          terminoPlanejado: idxFimPlan !== -1 ? parts[idxFimPlan] || '' : '',
          inicioReal: idxIniReal !== -1 ? parts[idxIniReal] || '' : '',
          terminoReal: idxFimReal !== -1 ? parts[idxFimReal] || '' : '',
        });
      }
    }

    if (dados.length === 0) {
      throw new Error('Nenhuma linha válida de atividade foi extraída do arquivo CSV.');
    }

    return dados;
  }

  return {
    DADOS_MODELO_PADRAO,
    processarCurvaS,
    parseDataHoraCustom,
    gerarCSVModelo,
    parseCSV,
  };
});
