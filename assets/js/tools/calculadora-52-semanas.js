/**
 * assets/js/tools/calculadora-52-semanas.js
 * Lógica matemática e regras de negócio para cálculo de datas industriais (Padrão ISO 8601 e 52 Semanas).
 * Compatível tanto com navegador (window.Calculadora52Semanas) quanto com Node.js (CommonJS / module.exports).
 * 
 * Replica com precisão os comportamentos do Python:
 * - datetime.isocalendar() -> (ano_iso, semana_iso, dia_num_iso)
 * - datetime.timetuple().tm_yday -> dia_do_ano (1..366)
 * - datetime.weekday() -> 0 (Segunda) a 6 (Domingo)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Calculadora52Semanas = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DIAS_PT = {
    0: 'Segunda-feira',
    1: 'Terça-feira',
    2: 'Quarta-feira',
    3: 'Quinta-feira',
    4: 'Sexta-feira',
    5: 'Sábado',
    6: 'Domingo',
  };

  /**
   * Verifica se o ano é bissexto.
   * @param {number} ano 
   * @returns {boolean}
   */
  function isAnoBissexto(ano) {
    return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
  }

  /**
   * Converte entrada para objeto Date em horário local (zerando horas para evitar desvios de timezone).
   * Aceita: 'YYYY-MM-DD', Date ou milissegundos.
   * @param {string|Date|number} dataInput 
   * @returns {Date}
   */
  function normalizarData(dataInput) {
    if (!dataInput) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    if (dataInput instanceof Date) {
      if (isNaN(dataInput.getTime())) {
        throw new Error('Data inválida fornecida.');
      }
      return new Date(dataInput.getFullYear(), dataInput.getMonth(), dataInput.getDate());
    }

    if (typeof dataInput === 'string') {
      // Aceita formato 'YYYY-MM-DD'
      const matchYMD = dataInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (matchYMD) {
        const ano = parseInt(matchYMD[1], 10);
        const mes = parseInt(matchYMD[2], 10) - 1;
        const dia = parseInt(matchYMD[3], 10);
        const d = new Date(ano, mes, dia);
        if (d.getFullYear() !== ano || d.getMonth() !== mes || d.getDate() !== dia) {
          throw new Error('Data inexistente no calendário.');
        }
        return d;
      }

      // Aceita formato 'DD/MM/YYYY'
      const matchDMY = dataInput.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (matchDMY) {
        const dia = parseInt(matchDMY[1], 10);
        const mes = parseInt(matchDMY[2], 10) - 1;
        const ano = parseInt(matchDMY[3], 10);
        const d = new Date(ano, mes, dia);
        if (d.getFullYear() !== ano || d.getMonth() !== mes || d.getDate() !== dia) {
          throw new Error('Data inexistente no calendário.');
        }
        return d;
      }

      const d = new Date(dataInput);
      if (isNaN(d.getTime())) {
        throw new Error('Formato de data inválido.');
      }
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    const d = new Date(dataInput);
    if (isNaN(d.getTime())) {
      throw new Error('Data inválida fornecida.');
    }
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /**
   * Calcula o dia do ano (1 a 365 ou 366). Equivalente ao tm_yday do Python.
   * @param {Date} date 
   * @returns {number}
   */
  function calcularDiaDoAno(date) {
    const inicioAno = new Date(date.getFullYear(), 0, 1);
    const diffMs = date - inicioAno;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDias + 1;
  }

  /**
   * Calcula o dia da semana no padrão Python (0 = Segunda, ..., 6 = Domingo).
   * @param {Date} date 
   * @returns {number}
   */
  function calcularDiaDaSemanaPython(date) {
    // getDay() no JS: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const jsDay = date.getDay();
    return (jsDay + 6) % 7;
  }

  /**
   * Calcula o calendário ISO 8601 (ano_iso, semana_iso, dia_num_iso).
   * Conforme ISO 8601:
   * - A semana começa na segunda-feira (dia 1) e termina no domingo (dia 7).
   * - A semana 1 do ano é a semana que contém a primeira quinta-feira do ano (ou 4 de janeiro).
   * @param {Date} date 
   * @returns {{ anoIso: number, semanaIso: number, diaNumIso: number }}
   */
  function calcularIsoCalendar(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // getUTCDay: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    // ISO dia da semana: 1 = Segunda, ..., 7 = Domingo
    const diaNumIso = d.getUTCDay() || 7;

    // Deslocar para a quinta-feira da mesma semana ISO
    d.setUTCDate(d.getUTCDate() + 4 - diaNumIso);

    const anoIso = d.getUTCFullYear();
    const inicioAno = new Date(Date.UTC(anoIso, 0, 1));
    const semanaIso = Math.ceil((((d - inicioAno) / 86400000) + 1) / 7);

    return {
      anoIso,
      semanaIso,
      diaNumIso,
    };
  }

  /**
   * Função principal que recebe uma data e devolve o conjunto completo de métricas.
   * @param {string|Date|number} dataInput 
   * @returns {Object}
   */
  function calcular(dataInput) {
    const data = normalizarData(dataInput);
    const diaDoAno = calcularDiaDoAno(data);
    const diaSemanaPython = calcularDiaDaSemanaPython(data);
    const nomeDiaSemana = DIAS_PT[diaSemanaPython];
    const { anoIso, semanaIso, diaNumIso } = calcularIsoCalendar(data);

    const bissexto = isAnoBissexto(data.getFullYear());
    const totalDiasAno = bissexto ? 366 : 365;
    const percentualAno = parseFloat(((diaDoAno / totalDiasAno) * 100).toFixed(1));

    // Formatações úteis
    const diaStr = String(data.getDate()).padStart(2, '0');
    const mesStr = String(data.getMonth() + 1).padStart(2, '0');
    const anoStr = String(data.getFullYear());
    const dataFormatada = `${diaStr}/${mesStr}/${anoStr}`;
    const dataIsoInput = `${anoStr}-${mesStr}-${diaStr}`;
    const semanaFormatada = `S${String(semanaIso).padStart(2, '0')}`;

    return {
      data,
      dataFormatada,
      dataIsoInput,
      semanaIso,
      semanaFormatada,
      anoIso,
      diaNumIso,
      diaDoAno,
      totalDiasAno,
      anoBissexto: bissexto,
      percentualAno,
      diaSemanaNumero: diaSemanaPython,
      diaSemanaNome: nomeDiaSemana,
    };
  }

  return {
    calcular,
    isAnoBissexto,
    calcularDiaDoAno,
    calcularDiaDaSemanaPython,
    calcularIsoCalendar,
    normalizarData,
    DIAS_PT,
  };
});
