/**
 * assets/js/tools/fmea.js
 * ------------------------------------------------------------------
 * Módulo de cálculo puro e determinístico para Matriz FMEA Industrial.
 * Suporta RPN clássico (S x O x D), alerta de Severidade Crítica (S >= 8),
 * priorização de risco, análise de Pareto, métricas agregadas e exportação.
 * 
 * Regra: 100% desacoplado do DOM. Exportação dual (Browser e Node.js).
 */

(function () {
  'use strict';

  /**
   * Valida e normaliza nota FMEA (escala inteira de 1 a 10).
   * Diferencia explicitamente valores vazios/inválidos de zero.
   * @param {*} valor
   * @returns {number|null}
   */
  function normalizarNota(valor) {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    const num = Number(valor);
    if (!Number.isFinite(num) || isNaN(num)) {
      return null;
    }
    const inteiro = Math.round(num);
    if (inteiro < 1 || inteiro > 10) {
      return null;
    }
    return inteiro;
  }

  /**
   * Calcula o RPN (Risk Priority Number) = S x O x D.
   * @param {*} s Severidade (1 a 10)
   * @param {*} o Ocorrência (1 a 10)
   * @param {*} d Detecção (1 a 10)
   * @returns {number|null}
   */
  function calcularRPN(s, o, d) {
    const sNorm = normalizarNota(s);
    const oNorm = normalizarNota(o);
    const dNorm = normalizarNota(d);

    if (sNorm === null || oNorm === null || dNorm === null) {
      return null;
    }
    return sNorm * oNorm * dNorm;
  }

  /**
   * Classifica o nível de criticidade baseado no RPN e no alerta de Severidade (S >= 8).
   * @param {*} s Severidade
   * @param {*} rpn Risk Priority Number
   * @returns {{ nivel: string, rotulo: string, cor: string, alertaSeveridade: boolean, badgeClass: string }}
   */
  function classificarCriticidade(s, rpn) {
    const sNorm = normalizarNota(s);
    const rpnVal = typeof rpn === 'number' && Number.isFinite(rpn) ? rpn : null;

    if (sNorm === null || rpnVal === null) {
      return {
        nivel: 'INDEFINIDO',
        rotulo: 'Pendente',
        cor: '#94a3b8',
        alertaSeveridade: false,
        badgeClass: 'bg-outline/20 text-outline border border-outline/30'
      };
    }

    const alertaSeveridade = sNorm >= 8;

    if (alertaSeveridade || rpnVal >= 120) {
      return {
        nivel: 'CRITICO',
        rotulo: 'Crítico',
        cor: '#ef4444',
        alertaSeveridade,
        badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/40'
      };
    }

    if (rpnVal >= 80) {
      return {
        nivel: 'ALTO',
        rotulo: 'Alto',
        cor: '#f97316',
        alertaSeveridade: false,
        badgeClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
      };
    }

    if (rpnVal >= 40) {
      return {
        nivel: 'MODERADO',
        rotulo: 'Moderado',
        cor: '#eab308',
        alertaSeveridade: false,
        badgeClass: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
      };
    }

    return {
      nivel: 'BAIXO',
      rotulo: 'Baixo',
      cor: '#10b981',
      alertaSeveridade: false,
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
    };
  }

  /**
   * Calcula a redução de risco absoluta e percentual entre RPN inicial e pós-ação.
   * @param {number|null} rpnInicial
   * @param {number|null} rpnFinal
   * @returns {{ delta: number, percentual: number }|null}
   */
  function calcularReducaoRisco(rpnInicial, rpnFinal) {
    if (rpnInicial === null || rpnFinal === null || !Number.isFinite(rpnInicial) || !Number.isFinite(rpnFinal)) {
      return null;
    }
    const delta = rpnInicial - rpnFinal;
    if (rpnInicial <= 0) {
      return { delta, percentual: 0 };
    }
    const perc = (delta / rpnInicial) * 100;
    return {
      delta,
      percentual: Number(perc.toFixed(1))
    };
  }

  /**
   * Processa a curva de Pareto dos modos de falha por RPN decrescente.
   * @param {Array<Object>} itens
   * @returns {{ itensOrdenados: Array<Object>, somaTotal: number, labels: Array<string>, rpns: Array<number>, acumulados: Array<number> }}
   */
  function calcularPareto(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
      return { itensOrdenados: [], somaTotal: 0, labels: [], rpns: [], acumulados: [] };
    }

    const validos = itens
      .map((item, index) => {
        const rpn = typeof item.rpnInicial === 'number' && Number.isFinite(item.rpnInicial) ? item.rpnInicial : 0;
        const modo = (item.modoFalha && item.modoFalha.trim()) ? item.modoFalha.trim() : `Item #${index + 1}`;
        return { ...item, _rpnPareto: rpn, _labelPareto: modo };
      })
      .filter((item) => item._rpnPareto > 0)
      .sort((a, b) => b._rpnPareto - a._rpnPareto);

    const somaTotal = validos.reduce((acc, curr) => acc + curr._rpnPareto, 0);

    let somaAcumulada = 0;
    const labels = [];
    const rpns = [];
    const acumulados = [];

    validos.forEach((item) => {
      somaAcumulada += item._rpnPareto;
      labels.push(item._labelPareto);
      rpns.push(item._rpnPareto);
      const pct = somaTotal > 0 ? (somaAcumulada / somaTotal) * 100 : 0;
      acumulados.push(Number(pct.toFixed(1)));
    });

    return {
      itensOrdenados: validos,
      somaTotal,
      labels,
      rpns,
      acumulados
    };
  }

  /**
   * Consolida métricas agregadas da matriz FMEA para exibição nos cards.
   * @param {Array<Object>} itens
   * @returns {Object}
   */
  function calcularMetricasAgregadas(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
      return {
        totalItens: 0,
        criticos: 0,
        altos: 0,
        moderados: 0,
        baixos: 0,
        pendentes: 0,
        rpnMedioInicial: 0,
        rpnMedioFinal: 0,
        reducaoGeralPercentual: 0
      };
    }

    let criticos = 0;
    let altos = 0;
    let moderados = 0;
    let baixos = 0;
    let pendentes = 0;

    let somaInicial = 0;
    let qtdInicial = 0;

    let somaFinal = 0;
    let qtdFinal = 0;

    let somaInicialComPar = 0;
    let somaFinalComPar = 0;

    itens.forEach((item) => {
      const s = normalizarNota(item.severidadeInicial);
      const rpnIni = typeof item.rpnInicial === 'number' && Number.isFinite(item.rpnInicial) ? item.rpnInicial : null;
      const rpnFin = typeof item.rpnFinal === 'number' && Number.isFinite(item.rpnFinal) ? item.rpnFinal : null;

      const crit = classificarCriticidade(s, rpnIni);
      if (crit.nivel === 'CRITICO') criticos++;
      else if (crit.nivel === 'ALTO') altos++;
      else if (crit.nivel === 'MODERADO') moderados++;
      else if (crit.nivel === 'BAIXO') baixos++;
      else pendentes++;

      if (rpnIni !== null) {
        somaInicial += rpnIni;
        qtdInicial++;
      }

      if (rpnFin !== null) {
        somaFinal += rpnFin;
        qtdFinal++;
      }

      if (rpnIni !== null && rpnFin !== null) {
        somaInicialComPar += rpnIni;
        somaFinalComPar += rpnFin;
      }
    });

    const rpnMedioInicial = qtdInicial > 0 ? Number((somaInicial / qtdInicial).toFixed(1)) : 0;
    const rpnMedioFinal = qtdFinal > 0 ? Number((somaFinal / qtdFinal).toFixed(1)) : 0;

    let reducaoGeralPercentual = 0;
    if (somaInicialComPar > 0) {
      const delta = somaInicialComPar - somaFinalComPar;
      reducaoGeralPercentual = Number(((delta / somaInicialComPar) * 100).toFixed(1));
    }

    return {
      totalItens: itens.length,
      criticos,
      altos,
      moderados,
      baixos,
      pendentes,
      rpnMedioInicial,
      rpnMedioFinal,
      reducaoGeralPercentual
    };
  }

  /**
   * Gera o conjunto padrão de modos de falha industriais (Bomba Centrífuga / Redutor).
   * @returns {Array<Object>}
   */
  function gerarExemploIndustrial() {
    const rawData = [
      {
        id: 'fmea-01',
        componente: 'Rolamento de Apoio',
        modoFalha: 'Desgaste severo e quebra de pista',
        efeito: 'Travamento do eixo, desarme de motor e parada da linha',
        severidadeInicial: 8,
        causa: 'Lubrificação deficiente e contaminação por particulado',
        ocorrenciaInicial: 6,
        controlesAtuais: 'Inspeção visual semanal e rota de engraxe manual',
        deteccaoInicial: 4,
        acaoRecomendada: 'Instalar lubrificador automático a ponto e sensor de vibração online',
        responsavel: 'PCM / Confiabilidade',
        severidadeFinal: 8,
        ocorrenciaFinal: 2,
        deteccaoFinal: 2
      },
      {
        id: 'fmea-02',
        componente: 'Selo Mecânico',
        modoFalha: 'Vazamento contínuo pela sede do selo',
        efeito: 'Contaminação ambiental e perda de pressão de bombeamento',
        severidadeInicial: 6,
        causa: 'Ataque químico / térmico na borracha das faces',
        ocorrenciaInicial: 7,
        controlesAtuais: 'Ronda operacional visual por turno',
        deteccaoInicial: 3,
        acaoRecomendada: 'Substituir por selo de carbeto de silício com plano de selagem API 11',
        responsavel: 'Engenharia de Aplicação',
        severidadeFinal: 6,
        ocorrenciaFinal: 3,
        deteccaoFinal: 2
      },
      {
        id: 'fmea-03',
        componente: 'Engrenamento Cônico',
        modoFalha: 'Pitting superficial e quebra de dente',
        efeito: 'Ruído excessivo e vibração destrutiva na carcaça',
        severidadeInicial: 7,
        causa: 'Desalinhamento angular dinâmico de montagem',
        ocorrenciaInicial: 4,
        controlesAtuais: 'Análise de óleo semestral',
        deteccaoInicial: 5,
        acaoRecomendada: 'Alinhamento a laser no setup e análise termográfica quinzenal',
        responsavel: 'Oficina Mecânica',
        severidadeFinal: 7,
        ocorrenciaFinal: 2,
        deteccaoFinal: 2
      },
      {
        id: 'fmea-04',
        componente: 'Acoplamento Flexível',
        modoFalha: 'Ressecamento do elemento elástico',
        efeito: 'Vibração 2x rotação e desgaste prematuro de buchas',
        severidadeInicial: 5,
        causa: 'Exposição contínua a calor radiante do processo',
        ocorrenciaInicial: 5,
        controlesAtuais: 'Inspeção estroboscópica mensal',
        deteccaoInicial: 3,
        acaoRecomendada: 'Instalar defletor térmico de proteção e troca programada anual',
        responsavel: 'Manutenção Preventiva',
        severidadeFinal: 5,
        ocorrenciaFinal: 2,
        deteccaoFinal: 2
      },
      {
        id: 'fmea-05',
        componente: 'Respiro Dessecante',
        modoFalha: 'Saturação do elemento filtrante de sílica',
        efeito: 'Aspiração de umidade atmosférica e degradação do óleo',
        severidadeInicial: 4,
        causa: 'Ambiente com alta umidade relativa (>85%)',
        ocorrenciaInicial: 6,
        controlesAtuais: 'Inspeção visual na rota de lubrificação',
        deteccaoInicial: 2,
        acaoRecomendada: 'Padronizar rota com troca do elemento ao atingir 70% de saturação',
        responsavel: 'Equipe de Lubrificação',
        severidadeFinal: 4,
        ocorrenciaFinal: 2,
        deteccaoFinal: 1
      }
    ];

    return rawData.map((item) => {
      const rpnInicial = calcularRPN(item.severidadeInicial, item.ocorrenciaInicial, item.deteccaoInicial);
      const rpnFinal = calcularRPN(item.severidadeFinal, item.ocorrenciaFinal, item.deteccaoFinal);
      const reducao = calcularReducaoRisco(rpnInicial, rpnFinal);

      return {
        ...item,
        rpnInicial,
        rpnFinal,
        reducaoDelta: reducao ? reducao.delta : null,
        reducaoPercentual: reducao ? reducao.percentual : null
      };
    });
  }

  /**
   * Exporta a lista de modos de falha para formato CSV compatível com Excel (separador ponto e vírgula).
   * @param {Array<Object>} itens
   * @returns {string}
   */
  function exportarCSV(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
      return '';
    }

    const headers = [
      'ID',
      'Componente',
      'Modo de Falha',
      'Efeito Potencial',
      'S_Inicial',
      'Causa Potencial',
      'O_Inicial',
      'Controles Atuais',
      'D_Inicial',
      'RPN_Inicial',
      'Criticidade_Inicial',
      'Acao Recomendada',
      'Responsavel',
      'S_Final',
      'O_Final',
      'D_Final',
      'RPN_Final',
      'Reducao_RPN_%'
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = itens.map((item) => {
      const s = normalizarNota(item.severidadeInicial);
      const rpnIni = calcularRPN(item.severidadeInicial, item.ocorrenciaInicial, item.deteccaoInicial);
      const crit = classificarCriticidade(s, rpnIni);
      const rpnFin = calcularRPN(item.severidadeFinal, item.ocorrenciaFinal, item.deteccaoFinal);
      const red = calcularReducaoRisco(rpnIni, rpnFin);

      return [
        escapeCSV(item.id || ''),
        escapeCSV(item.componente || ''),
        escapeCSV(item.modoFalha || ''),
        escapeCSV(item.efeito || ''),
        escapeCSV(s !== null ? s : ''),
        escapeCSV(item.causa || ''),
        escapeCSV(normalizarNota(item.ocorrenciaInicial) ?? ''),
        escapeCSV(item.controlesAtuais || ''),
        escapeCSV(normalizarNota(item.deteccaoInicial) ?? ''),
        escapeCSV(rpnIni !== null ? rpnIni : ''),
        escapeCSV(crit.rotulo),
        escapeCSV(item.acaoRecomendada || ''),
        escapeCSV(item.responsavel || ''),
        escapeCSV(normalizarNota(item.severidadeFinal) ?? ''),
        escapeCSV(normalizarNota(item.ocorrenciaFinal) ?? ''),
        escapeCSV(normalizarNota(item.deteccaoFinal) ?? ''),
        escapeCSV(rpnFin !== null ? rpnFin : ''),
        escapeCSV(red ? `${red.percentual}%` : '')
      ].join(';');
    });

    return [headers.join(';'), ...rows].join('\r\n');
  }

  /**
   * Exporta a lista de modos de falha para JSON estruturado.
   * @param {Array<Object>} itens
   * @returns {string}
   */
  function exportarJSON(itens) {
    if (!Array.isArray(itens)) {
      return JSON.stringify([], null, 2);
    }
    return JSON.stringify(itens, null, 2);
  }

  const fmea = {
    normalizarNota,
    calcularRPN,
    classificarCriticidade,
    calcularReducaoRisco,
    calcularPareto,
    calcularMetricasAgregadas,
    gerarExemploIndustrial,
    exportarCSV,
    exportarJSON
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = fmea;
  }
  if (typeof window !== 'undefined') {
    window.FmeaCalc = fmea;
  }
})();
