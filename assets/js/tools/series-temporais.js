/**
 * assets/js/tools/series-temporais.js
 * Motor matemático e analítico para Análise Técnica de Séries Temporais Financeiras.
 * Compatível com navegador (window.SeriesTemporais) e Node.js (CommonJS / module.exports).
 * 
 * Replicando as regras do Python original (pages/4_Séries_Temporais_com_Python.py):
 * - Aquisição e filtragem por intervalo de datas (start_date, end_date)
 * - Média Móvel Simples de 21 períodos (MA_21 = rolling(21).mean())
 * - Média Móvel Simples de 200 períodos (MA_200 = rolling(200).mean())
 * - Análise de tendência técnica (Cruzamentos, Distância das Médias, Máximas e Mínimas)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SeriesTemporais = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Calcula a Média Móvel Simples (SMA) de uma série de valores numéricos.
   * Replica exatamente o comportamento do Pandas:
   * Os primeiros (janela - 1) elementos retornam null (equivalente ao NaN do Pandas).
   * @param {Array<number>} valores 
   * @param {number} janela 
   * @returns {Array<number|null>}
   */
  function calcularMediaMovel(valores, janela) {
    if (!Array.isArray(valores) || typeof janela !== 'number' || janela <= 0) {
      throw new Error('Parâmetros inválidos para cálculo de média móvel.');
    }

    const resultado = [];
    let soma = 0;

    for (let i = 0; i < valores.length; i++) {
      soma += valores[i];

      if (i >= janela) {
        soma -= valores[i - janela];
      }

      if (i >= janela - 1) {
        resultado.push(parseFloat((soma / janela).toFixed(2)));
      } else {
        resultado.push(null);
      }
    }

    return resultado;
  }

  /**
   * Filtra registros históricos entre dataInicio e dataFim (strings 'YYYY-MM-DD').
   * @param {Array<Object>} registros 
   * @param {string} [dataInicio] 
   * @param {string} [dataFim] 
   * @returns {Array<Object>}
   */
  function filtrarPorPeriodo(registros, dataInicio, dataFim) {
    if (!Array.isArray(registros)) return [];

    return registros.filter((item) => {
      if (!item.date) return false;
      if (dataInicio && item.date < dataInicio) return false;
      if (dataFim && item.date > dataFim) return false;
      return true;
    });
  }

  /**
   * Processa a série temporal completa e calcula os indicadores técnicos (MA21, MA200 e métricas).
   * @param {Array<Object>} registros Array com { date, close, open, high, low, volume }
   * @param {Object} [opcoes]
   * @param {number} [opcoes.janelaCurta=21]
   * @param {number} [opcoes.janelaLonga=200]
   * @returns {Object}
   */
  function processarSerie(registros, opcoes = {}) {
    if (!Array.isArray(registros) || registros.length === 0) {
      throw new Error('Nenhum dado encontrado para este período.');
    }

    const janelaCurta = opcoes.janelaCurta || 21;
    const janelaLonga = opcoes.janelaLonga || 200;

    // Ordenação cronológica por data
    const ordenados = [...registros].sort((a, b) => a.date.localeCompare(b.date));

    const datas = ordenados.map((r) => r.date);
    const precosFechamento = ordenados.map((r) => Number(r.close));
    const precosAbertura = ordenados.map((r) => Number(r.open || r.close));
    const precosMax = ordenados.map((r) => Number(r.high || r.close));
    const precosMin = ordenados.map((r) => Number(r.low || r.close));
    const volumes = ordenados.map((r) => Number(r.volume || 0));

    // Cálculo das Médias Móveis (Pandas rolling mean)
    const ma21 = calcularMediaMovel(precosFechamento, janelaCurta);
    const ma200 = calcularMediaMovel(precosFechamento, janelaLonga);

    // Métricas estatísticas do período
    const precoInicial = precosFechamento[0];
    const precoFinal = precosFechamento[precosFechamento.length - 1];
    const variacaoPeriodo = parseFloat((((precoFinal - precoInicial) / precoInicial) * 100).toFixed(2));

    const menorPreco = Math.min(...precosMin);
    const maiorPreco = Math.max(...precosMax);

    const ultimoMA21 = ma21[ma21.length - 1];
    const ultimoMA200 = ma200[ma200.length - 1];

    // Análise de Tendência Técnica
    let tendencia = 'LATERAL / NEUTRA';
    let tendenciaCor = '#9eabbb';
    let descricaoTecnica = 'Médias em consolidação sem direção predominante evidente.';

    if (ultimoMA21 !== null && ultimoMA200 !== null) {
      if (precoFinal > ultimoMA21 && ultimoMA21 > ultimoMA200) {
        tendencia = 'TENDÊNCIA DE ALTA (BULLISH)';
        tendenciaCor = '#00CC96';
        descricaoTecnica = 'Preço negociado acima da MA21 e MA21 acima da MA200, configurando alinhamento clássico de alta.';
      } else if (precoFinal < ultimoMA21 && ultimoMA21 < ultimoMA200) {
        tendencia = 'TENDÊNCIA DE BAIXA (BEARISH)';
        tendenciaCor = '#ef5350';
        descricaoTecnica = 'Preço negociado abaixo da MA21 e MA21 abaixo da MA200, indicando pressão vendedora estrutural.';
      } else if (ultimoMA21 > ultimoMA200) {
        tendencia = 'ALTA MODERADA / CORREÇÃO';
        tendenciaCor = '#00d4ff';
        descricaoTecnica = 'Médias apontam estrutura de alta no longo prazo com correção de curto prazo no preço.';
      } else {
        tendencia = 'BAIXA MODERADA / RECUPERAÇÃO';
        tendenciaCor = '#ffa726';
        descricaoTecnica = 'Estrutura de longo prazo em baixa com repique técnico de curto prazo.';
      }
    } else if (ultimoMA21 !== null) {
      tendencia = precoFinal > ultimoMA21 ? 'ALTA CURTO PRAZO' : 'BAIXA CURTO PRAZO';
      tendenciaCor = precoFinal > ultimoMA21 ? '#00CC96' : '#ef5350';
      descricaoTecnica = 'Histórico insuficiente para cálculo da MA200 (mínimo de 200 dias de pregão).';
    }

    return {
      totalRegistros: ordenados.length,
      primeiraData: datas[0],
      ultimaData: datas[datas.length - 1],
      precoInicial,
      precoFinal,
      variacaoPeriodo,
      menorPreco,
      maiorPreco,
      ultimoMA21,
      ultimoMA200,
      tendencia,
      tendenciaCor,
      descricaoTecnica,
      serie: {
        datas,
        fechamento: precosFechamento,
        abertura: precosAbertura,
        maximas: precosMax,
        minimas: precosMin,
        volumes,
        ma21,
        ma200,
      },
    };
  }

  return {
    calcularMediaMovel,
    filtrarPorPeriodo,
    processarSerie,
  };
});
