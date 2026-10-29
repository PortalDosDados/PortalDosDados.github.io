/**
 * assets/js/portal/portal-aluno-engine.js
 * Motor puro de cálculo pedagógico e gamificação do Portal do Aluno.
 * Totalmente desacoplado do DOM, com exportação universal (Node.js e Browser).
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    // Ambiente Node.js (testes unitários)
    const portalCursos = require('../../../data/portal-cursos.js');
    module.exports = factory(portalCursos);
  } else {
    // Ambiente Navegador
    root.PortalAlunoEngine = factory(root.PORTAL_CURSOS);
  }
})(typeof self !== 'undefined' ? self : this, function (catalogoPadrao) {
  'use strict';

  /**
   * Valida e calcula o percentual de acertos com tratamento defensivo.
   * Diferencia explicitamente valores nulos/indefinidos de zero.
   * @param {number} acertos - Quantidade de respostas corretas
   * @param {number} totalQuestoes - Total de questões avaliadas
   * @returns {number} Percentual entre 0 e 100 com 1 casa decimal
   */
  function calcularPercentual(acertos, totalQuestoes) {
    if (
      acertos === null ||
      acertos === undefined ||
      totalQuestoes === null ||
      totalQuestoes === undefined ||
      typeof acertos !== 'number' ||
      typeof totalQuestoes !== 'number' ||
      isNaN(acertos) ||
      isNaN(totalQuestoes)
    ) {
      return 0;
    }

    if (totalQuestoes <= 0) {
      return 0;
    }

    const valorSeguroAcertos = Math.max(0, Math.min(acertos, totalQuestoes));
    const percentualBruto = (valorSeguroAcertos / totalQuestoes) * 100;
    return Number(percentualBruto.toFixed(1));
  }

  /**
   * Calcula o score no estilo fliperama/arcade.
   * Pontuação base: 100 pontos por acerto.
   * Bônus de Combo: +25 pontos extras por acerto em sequência além do primeiro.
   * Bônus de Agilidade: até 150 pontos para resoluções rápidas com aproveitamento >= 70%.
   * @param {number} acertos 
   * @param {number} totalQuestoes 
   * @param {number} tempoSegundos 
   * @param {number} comboMaximo 
   * @returns {number} Score inteiro não-negativo
   */
  function calcularScoreArcade(acertos, totalQuestoes, tempoSegundos = 0, comboMaximo = 0) {
    if (typeof acertos !== 'number' || isNaN(acertos) || acertos <= 0) {
      return 0;
    }

    const pontosBase = acertos * 100;

    // Bônus de combo consecutivo
    const bonusCombo = Math.max(0, (comboMaximo - 1) * 25);

    // Bônus de tempo (se acertos forem expressivos e tempo razoável)
    let bonusTempo = 0;
    const percentual = calcularPercentual(acertos, totalQuestoes);
    if (percentual >= 70 && typeof tempoSegundos === 'number' && tempoSegundos > 0) {
      // Tempo estimado padrão: 40 segundos por questão
      const tempoAlvo = (totalQuestoes || 15) * 40;
      if (tempoSegundos < tempoAlvo) {
        const fatorVelocidade = Math.max(0, 1 - tempoSegundos / tempoAlvo);
        bonusTempo = Math.round(fatorVelocidade * 150);
      }
    }

    return pontosBase + bonusCombo + bonusTempo;
  }

  /**
   * Converte o percentual em quantidade de estrelas (1 a 4).
   * Sem punição: mesmo com score baixo o aluno ganha 1 estrela de participação.
   * @param {number} percentual 
   * @returns {number} Quantidade de estrelas (1, 2, 3 ou 4)
   */
  function calcularEstrelas(percentual) {
    if (typeof percentual !== 'number' || isNaN(percentual) || percentual < 50) {
      return 1; // Incentivo / Participação
    }
    if (percentual < 70) {
      return 2; // Em progresso
    }
    if (percentual < 90) {
      return 3; // Bom domínio
    }
    return 4; // Mestre / Sênior
  }

  /**
   * Obtém o diagnóstico temático de proficiência baseado no curso e percentual.
   * @param {string} cursoId 
   * @param {number} percentual 
   * @param {object} catalogo 
   * @returns {object} Objeto com titulo, badge, descricao e faixa
   */
  function obterDiagnosticoProficiencia(cursoId, percentual, catalogo) {
    const fonteCatalogo = catalogo || catalogoPadrao;
    const cursoPadrao = {
      niveisProficiencia: [
        { min: 0, max: 49.99, titulo: 'Iniciante', badge: '🌱', descricao: 'Continue praticando!' },
        { min: 50, max: 69.99, titulo: 'Praticante', badge: '⚡', descricao: 'Bom avanço, continue assim!' },
        { min: 70, max: 89.99, titulo: 'Avançado', badge: '🚀', descricao: 'Excelente domínio!' },
        { min: 90, max: 100, titulo: 'Mestre', badge: '🏆', descricao: 'Desempenho espetacular!' },
      ],
    };

    let cursoEncontrado = cursoPadrao;
    if (fonteCatalogo && Array.isArray(fonteCatalogo.cursos)) {
      const match = fonteCatalogo.cursos.find(function (c) {
        return c.id === cursoId;
      });
      if (match && Array.isArray(match.niveisProficiencia) && match.niveisProficiencia.length > 0) {
        cursoEncontrado = match;
      }
    }

    const valorPercentual = typeof percentual === 'number' && !isNaN(percentual) ? percentual : 0;

    const nivel = cursoEncontrado.niveisProficiencia.find(function (faixa) {
      return valorPercentual >= faixa.min && valorPercentual <= faixa.max;
    });

    if (nivel) {
      return {
        titulo: nivel.titulo,
        badge: nivel.badge,
        descricao: nivel.descricao,
        min: nivel.min,
        max: nivel.max,
      };
    }

    // Fallback para caso de arredondamento em 100
    const ultimoNivel = cursoEncontrado.niveisProficiencia[cursoEncontrado.niveisProficiencia.length - 1];
    return {
      titulo: ultimoNivel.titulo,
      badge: ultimoNivel.badge,
      descricao: ultimoNivel.descricao,
      min: ultimoNivel.min,
      max: ultimoNivel.max,
    };
  }

  /**
   * Avalia a tentativa completa do aluno, calculando acertos, combo, score, estrelas e diagnóstico.
   * @param {object} params
   * @param {Array<{questaoId: string, respostaSelecionada: string}>} params.respostas
   * @param {Array<object>} params.questoes
   * @param {number} params.tempoSegundos
   * @param {string} params.cursoId
   * @param {object} [params.catalogo]
   * @returns {object} Resultado completo da avaliação
   */
  function avaliarTentativa(params) {
    if (!params || typeof params !== 'object') {
      throw new Error('Parâmetros inválidos para avaliação da tentativa.');
    }

    const respostas = Array.isArray(params.respostas) ? params.respostas : [];
    const questoes = Array.isArray(params.questoes) ? params.questoes : [];
    const tempoSegundos = typeof params.tempoSegundos === 'number' ? params.tempoSegundos : 0;
    const cursoId = params.cursoId || 'informatica';
    const catalogo = params.catalogo || catalogoPadrao;

    const mapaQuestoes = new Map();
    questoes.forEach(function (q) {
      if (q && q.id) {
        mapaQuestoes.set(q.id, q);
      }
    });

    let acertos = 0;
    let erros = 0;
    let comboAtual = 0;
    let comboMaximo = 0;
    const detalhes = [];

    respostas.forEach(function (resp) {
      const questao = mapaQuestoes.get(resp.questaoId);
      if (!questao) return;

      const acertou = resp.respostaSelecionada === questao.respostaCorreta;
      if (acertou) {
        acertos += 1;
        comboAtual += 1;
        if (comboAtual > comboMaximo) {
          comboMaximo = comboAtual;
        }
      } else {
        erros += 1;
        comboAtual = 0;
      }

      detalhes.push({
        questaoId: questao.id,
        tema: questao.tema,
        acertou: acertou,
        respostaAluno: resp.respostaSelecionada,
        respostaCorreta: questao.respostaCorreta,
        explicacao: questao.explicacao,
      });
    });

    const totalQuestoes = questoes.length > 0 ? questoes.length : respostas.length;
    const percentual = calcularPercentual(acertos, totalQuestoes);
    const score = calcularScoreArcade(acertos, totalQuestoes, tempoSegundos, comboMaximo);
    const estrelas = calcularEstrelas(percentual);
    const proficiencia = obterDiagnosticoProficiencia(cursoId, percentual, catalogo);

    return {
      acertos: acertos,
      erros: erros,
      totalQuestoes: totalQuestoes,
      percentual: percentual,
      score: score,
      comboMaximo: comboMaximo,
      tempoSegundos: tempoSegundos,
      estrelas: estrelas,
      proficiencia: proficiencia,
      detalhes: detalhes,
    };
  }

  /**
   * Determina se a tentativa atual superou o recorde prévio do aluno.
   * @param {object} recordeAtual - { maiorScore, maiorPercentual, tentativasTotal }
   * @param {number} novoScore 
   * @param {number} novoPercentual 
   * @returns {object} { bateuRecorde: boolean, maiorScore: number, maiorPercentual: number, tentativasTotal: number }
   */
  function determinarNovoRecorde(recordeAtual, novoScore, novoPercentual) {
    const scoreValido = typeof novoScore === 'number' && !isNaN(novoScore) ? novoScore : 0;
    const percentualValido = typeof novoPercentual === 'number' && !isNaN(novoPercentual) ? novoPercentual : 0;

    const recordeSeguro = {
      maiorScore: recordeAtual && typeof recordeAtual.maiorScore === 'number' ? recordeAtual.maiorScore : 0,
      maiorPercentual: recordeAtual && typeof recordeAtual.maiorPercentual === 'number' ? recordeAtual.maiorPercentual : 0,
      tentativasTotal: recordeAtual && typeof recordeAtual.tentativasTotal === 'number' ? recordeAtual.tentativasTotal : 0,
    };

    const bateuRecorde = scoreValido > recordeSeguro.maiorScore || percentualValido > recordeSeguro.maiorPercentual;

    return {
      bateuRecorde: bateuRecorde,
      maiorScore: Math.max(recordeSeguro.maiorScore, scoreValido),
      maiorPercentual: Math.max(recordeSeguro.maiorPercentual, percentualValido),
      tentativasTotal: recordeSeguro.tentativasTotal + 1,
    };
  }

  return {
    calcularPercentual: calcularPercentual,
    calcularScoreArcade: calcularScoreArcade,
    calcularEstrelas: calcularEstrelas,
    obterDiagnosticoProficiencia: obterDiagnosticoProficiencia,
    avaliarTentativa: avaliarTentativa,
    determinarNovoRecorde: determinarNovoRecorde,
  };
});
