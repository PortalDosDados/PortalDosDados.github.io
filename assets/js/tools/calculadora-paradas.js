/**
 * assets/js/tools/calculadora-paradas.js
 * Lógica matemática e regras de negócio para Controle de Paradas Industriais e Cálculo de Downtime.
 * Compatível com navegador (window.CalculadoraParadas) e Node.js (CommonJS / module.exports).
 * 
 * Replicando com exatidão as regras do Python original (pages/6_Calculadora_de_Paradas.py):
 * - parse_horario inteligente (HHMM, HMM, HH, HH:MM)
 * - Cálculo de duração, horas decimais e minutos totais
 * - Matriz de Escalabilidade Industrial:
 *     > 1.5h: CRÍTICO -> REALIZAR ANÁLISE DE FALHA (#ef5350)
 *     > 1.0h: ATENÇÃO -> REALIZAR ANÁLISE FCA (#ffa726)
 *     <= 1.0h: ROTINA -> APONTAMENTO NO RELATÓRIO DE TURNO (#66bb6a)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CalculadoraParadas = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Interpreta entradas de horário em diversos formatos (HHMM, HMM, HH, HH:MM)
   * e converte para objeto de tempo e string padronizada 'HH:MM'.
   * @param {string|number} valor 
   * @returns {{ hora: number, minuto: number, formatado: string } | null}
   */
  function parseHorario(valor) {
    if (valor === undefined || valor === null || String(valor).trim() === '') {
      return null;
    }

    const strValor = String(valor).trim();
    // Sanitização: Remove qualquer caractere não numérico
    const nums = strValor.replace(/\D/g, '');

    let h, m;

    if (nums.length === 4) {
      // HHMM (ex: 1430 -> 14:30)
      h = parseInt(nums.slice(0, 2), 10);
      m = parseInt(nums.slice(2, 4), 10);
    } else if (nums.length === 3) {
      // HMM (ex: 830 -> 08:30)
      h = parseInt(nums.slice(0, 1), 10);
      m = parseInt(nums.slice(1, 3), 10);
    } else if (nums.length >= 1 && nums.length <= 2) {
      // HH ou H (ex: 14 -> 14:00, 8 -> 08:00)
      h = parseInt(nums, 10);
      m = 0;
    } else {
      return null;
    }

    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      return {
        hora: h,
        minuto: m,
        formatado: `${hStr}:${mStr}`,
      };
    }

    return null;
  }

  /**
   * Converte uma data string 'YYYY-MM-DD' ou 'DD/MM/YYYY' ou Date para [ano, mes (0-indexed), dia].
   * @param {string|Date} dataInput 
   * @returns {{ ano: number, mes: number, dia: number }}
   */
  function parseData(dataInput) {
    if (!dataInput) {
      const now = new Date();
      return { ano: now.getFullYear(), mes: now.getMonth(), dia: now.getDate() };
    }

    if (dataInput instanceof Date) {
      if (isNaN(dataInput.getTime())) throw new Error('Data inválida fornecida.');
      return { ano: dataInput.getFullYear(), mes: dataInput.getMonth(), dia: dataInput.getDate() };
    }

    const str = String(dataInput).trim();
    const matchYMD = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (matchYMD) {
      return {
        ano: parseInt(matchYMD[1], 10),
        mes: parseInt(matchYMD[2], 10) - 1,
        dia: parseInt(matchYMD[3], 10),
      };
    }

    const matchDMY = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (matchDMY) {
      return {
        ano: parseInt(matchDMY[3], 10),
        mes: parseInt(matchDMY[2], 10) - 1,
        dia: parseInt(matchDMY[1], 10),
      };
    }

    const d = new Date(str);
    if (isNaN(d.getTime())) throw new Error('Data inválida fornecida.');
    return { ano: d.getFullYear(), mes: d.getMonth(), dia: d.getDate() };
  }

  /**
   * Combina data e horário parsed em um timestamp Date em horário local.
   * @param {string|Date} dataInput 
   * @param {{ hora: number, minuto: number }} parsedHora 
   * @returns {Date}
   */
  function combinarDataHora(dataInput, parsedHora) {
    const { ano, mes, dia } = parseData(dataInput);
    return new Date(ano, mes, dia, parsedHora.hora, parsedHora.minuto, 0, 0);
  }

  /**
   * Classifica a severidade da parada de acordo com a regra industrial original:
   * - horas > 1.5: CRÍTICA -> REALIZAR ANÁLISE DE FALHA (#ef5350)
   * - horas > 1.0: ATENÇÃO -> REALIZAR ANÁLISE FCA (#ffa726)
   * - <= 1.0: ROTINA -> APONTAMENTO NO RELATÓRIO DE TURNO (#66bb6a)
   * @param {number} horasDecimais 
   * @returns {Object}
   */
  function classificarSeveridade(horasDecimais) {
    if (horasDecimais > 1.5) {
      return {
        nivel: 'CRITICO',
        titulo: 'Crítico',
        textoStatus: 'REALIZAR ANÁLISE DE FALHA',
        cor: '#ef5350',
        badgeClasse: 'bg-red-500/20 text-red-400 border-red-500/40',
        icone: 'warning',
        descricao: 'Parada de alta severidade (> 1,5 h). Exige investigação de causa raiz, diagrama de Ishikawa e plano de ação 5W2H.',
      };
    }
    if (horasDecimais > 1.0) {
      return {
        nivel: 'ATENCAO',
        titulo: 'Atenção',
        textoStatus: 'REALIZAR ANÁLISE FCA',
        cor: '#ffa726',
        badgeClasse: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        icone: 'priority_high',
        descricao: 'Parada intermediária (entre 1,0 h e 1,5 h). Exige registro estruturado no método Fato-Causa-Ação.',
      };
    }
    return {
      nivel: 'ROTINA',
      titulo: 'Rotina',
      textoStatus: 'APONTAMENTO NO RELATÓRIO DE TURNO',
      cor: '#66bb6a',
      badgeClasse: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icone: 'check_circle',
      descricao: 'Interrupção operacional de rotina (<= 1,0 h). Registro padrão de passagem de turno e log de eventos.',
    };
  }

  /**
   * Calcula o Downtime completo entre início e fim.
   * @param {Object} params 
   * @param {string|Date} params.dataInicio
   * @param {string} params.horaInicio (ex: '08:00', '0800', '8')
   * @param {string|Date} params.dataFim
   * @param {string} params.horaFim (ex: '17:30', '1730')
   * @returns {Object}
   */
  function calcularDowntime(params) {
    const { dataInicio, horaInicio, dataFim, horaFim } = params || {};

    const objIni = parseHorario(horaInicio);
    const objFim = parseHorario(horaFim);

    if (!objIni || !objFim) {
      throw new Error('Formato de horário inválido. Utilize o padrão HHMM ou HH:MM (ex: 08:00 ou 1430).');
    }

    const dtIni = combinarDataHora(dataInicio, objIni);
    const dtFim = combinarDataHora(dataFim, objFim);

    if (dtFim < dtIni) {
      throw new Error('A Data/Hora Final é anterior à Data/Hora Inicial.');
    }

    const diffMs = dtFim.getTime() - dtIni.getTime();
    const totalSegundos = Math.floor(diffMs / 1000);
    const minutosTotais = Math.floor(totalSegundos / 60);
    const horasDecimais = parseFloat((totalSegundos / 3600).toFixed(4));
    const horasDecimaisArredondadas = parseFloat((totalSegundos / 3600).toFixed(2));

    const horasInteiras = Math.floor(minutosTotais / 60);
    const minutosRestantes = minutosTotais % 60;
    const duracaoFormatada = `${horasInteiras}h ${String(minutosRestantes).padStart(2, '0')}min`;

    const severidade = classificarSeveridade(horasDecimais);

    return {
      dtInicio: dtIni,
      dtFim: dtFim,
      horaInicioFormatada: objIni.formatado,
      horaFimFormatada: objFim.formatado,
      minutosTotais,
      horasDecimais,
      horasDecimaisFormatadas: horasDecimaisArredondadas.toFixed(2),
      duracaoFormatada,
      severidade,
    };
  }

  return {
    parseHorario,
    parseData,
    combinarDataHora,
    classificarSeveridade,
    calcularDowntime,
  };
});
