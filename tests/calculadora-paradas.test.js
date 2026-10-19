const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const paradas = require('../assets/js/tools/calculadora-paradas.js');

describe('Aplicação 2: Controle e Calculadora de Paradas (Downtime Industrial)', () => {
  describe('Parsing flexível de horários (parseHorario)', () => {
    test('Deve aceitar formato HHMM (ex: 1430 -> 14:30)', () => {
      const p = paradas.parseHorario('1430');
      assert.deepEqual(p, { hora: 14, minuto: 30, formatado: '14:30' });
    });

    test('Deve aceitar formato HMM (ex: 830 -> 08:30)', () => {
      const p = paradas.parseHorario('830');
      assert.deepEqual(p, { hora: 8, minuto: 30, formatado: '08:30' });
    });

    test('Deve aceitar formato apenas horas HH ou H (ex: 14 -> 14:00, 8 -> 08:00)', () => {
      const p1 = paradas.parseHorario('14');
      assert.deepEqual(p1, { hora: 14, minuto: 0, formatado: '14:00' });

      const p2 = paradas.parseHorario('8');
      assert.deepEqual(p2, { hora: 8, minuto: 0, formatado: '08:00' });
    });

    test('Deve aceitar formato com pontuação padrão HH:MM (ex: 08:00)', () => {
      const p = paradas.parseHorario('08:00');
      assert.deepEqual(p, { hora: 8, minuto: 0, formatado: '08:00' });
    });

    test('Deve retornar null para horários inválidos ou fora do intervalo', () => {
      assert.equal(paradas.parseHorario('2500'), null);
      assert.equal(paradas.parseHorario('1265'), null);
      assert.equal(paradas.parseHorario(''), null);
      assert.equal(paradas.parseHorario(null), null);
      assert.equal(paradas.parseHorario('abc'), null);
    });
  });

  describe('Cálculo de Downtime e Regras de Severidade', () => {
    test('Cenário 1 (> 1.5 horas): Deve exigir ANÁLISE DE FALHA', () => {
      const res = paradas.calcularDowntime({
        dataInicio: '2026-10-19',
        horaInicio: '08:00',
        dataFim: '2026-10-19',
        horaFim: '17:30',
      });

      assert.equal(res.minutosTotais, 570);
      assert.equal(res.horasDecimaisFormatadas, '9.50');
      assert.equal(res.duracaoFormatada, '9h 30min');
      assert.equal(res.severidade.nivel, 'CRITICO');
      assert.equal(res.severidade.textoStatus, 'REALIZAR ANÁLISE DE FALHA');
      assert.equal(res.severidade.cor, '#ef5350');
    });

    test('Cenário 2 (entre 1.0 e 1.5 horas): Deve exigir ANÁLISE FCA', () => {
      const res = paradas.calcularDowntime({
        dataInicio: '2026-10-19',
        horaInicio: '0800',
        dataFim: '2026-10-19',
        horaFim: '0915',
      });

      assert.equal(res.minutosTotais, 75);
      assert.equal(res.horasDecimaisFormatadas, '1.25');
      assert.equal(res.duracaoFormatada, '1h 15min');
      assert.equal(res.severidade.nivel, 'ATENCAO');
      assert.equal(res.severidade.textoStatus, 'REALIZAR ANÁLISE FCA');
      assert.equal(res.severidade.cor, '#ffa726');
    });

    test('Cenário 3 (<= 1.0 hora): Deve ser ROTINA / RELATÓRIO DE TURNO', () => {
      const res = paradas.calcularDowntime({
        dataInicio: '2026-10-19',
        horaInicio: '0800',
        dataFim: '2026-10-19',
        horaFim: '0845',
      });

      assert.equal(res.minutosTotais, 45);
      assert.equal(res.horasDecimaisFormatadas, '0.75');
      assert.equal(res.duracaoFormatada, '0h 45min');
      assert.equal(res.severidade.nivel, 'ROTINA');
      assert.equal(res.severidade.textoStatus, 'APONTAMENTO NO RELATÓRIO DE TURNO');
      assert.equal(res.severidade.cor, '#66bb6a');
    });

    test('Cenário 4 (Parada que vira a noite/madrugada)', () => {
      const res = paradas.calcularDowntime({
        dataInicio: '2026-10-19',
        horaInicio: '2200',
        dataFim: '2026-10-20',
        horaFim: '0230',
      });

      assert.equal(res.minutosTotais, 270);
      assert.equal(res.horasDecimaisFormatadas, '4.50');
      assert.equal(res.duracaoFormatada, '4h 30min');
      assert.equal(res.severidade.nivel, 'CRITICO');
    });

    test('Deve rejeitar com erro quando a data final for anterior à data inicial', () => {
      assert.throws(
        () =>
          paradas.calcularDowntime({
            dataInicio: '2026-10-20',
            horaInicio: '10:00',
            dataFim: '2026-10-19',
            horaFim: '10:00',
          }),
        /A Data\/Hora Final é anterior/
      );
    });

    test('Deve rejeitar com erro quando o horário for inválido', () => {
      assert.throws(
        () =>
          paradas.calcularDowntime({
            dataInicio: '2026-10-19',
            horaInicio: '9999',
            dataFim: '2026-10-19',
            horaFim: '10:00',
          }),
        /Formato de horário inválido/
      );
    });
  });
});
