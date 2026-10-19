const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const calc = require('../assets/js/tools/calculadora-52-semanas.js');

describe('Aplicação 1: Calculadora de 52 Semanas (Datas Industriais ISO 8601)', () => {
  test('Deve calcular corretamente para a data de referência 2026-10-19', () => {
    // Referência Python: (2026, 43, 1), tm_yday=292, weekday=0 ('Segunda-feira')
    const res = calc.calcular('2026-10-19');
    assert.equal(res.semanaIso, 43);
    assert.equal(res.semanaFormatada, 'S43');
    assert.equal(res.anoIso, 2026);
    assert.equal(res.diaNumIso, 1);
    assert.equal(res.diaDoAno, 292);
    assert.equal(res.diaSemanaNumero, 0);
    assert.equal(res.diaSemanaNome, 'Segunda-feira');
    assert.equal(res.dataFormatada, '19/10/2026');
    assert.equal(res.anoBissexto, false);
    assert.equal(res.totalDiasAno, 365);
  });

  test('Deve tratar ano bissexto corretamente (ex: 29 de fevereiro de 2024)', () => {
    // Referência Python: (2024, 9, 4), tm_yday=60, weekday=3 ('Quinta-feira')
    const res = calc.calcular('2024-02-29');
    assert.equal(res.anoBissexto, true);
    assert.equal(res.totalDiasAno, 366);
    assert.equal(res.semanaIso, 9);
    assert.equal(res.semanaFormatada, 'S09');
    assert.equal(res.diaDoAno, 60);
    assert.equal(res.diaSemanaNome, 'Quinta-feira');
  });

  test('Deve calcular virada de ano onde 01/01 pertence à última semana do ano anterior', () => {
    // 01/01/2023 é um Domingo -> Python: (2022, 52, 7), tm_yday=1, weekday=6
    const res = calc.calcular('2023-01-01');
    assert.equal(res.anoIso, 2022);
    assert.equal(res.semanaIso, 52);
    assert.equal(res.semanaFormatada, 'S52');
    assert.equal(res.diaDoAno, 1);
    assert.equal(res.diaSemanaNome, 'Domingo');
    assert.equal(res.diaNumIso, 7);
  });

  test('Deve suportar ano com 53 semanas (ex: 31/12/2020)', () => {
    // 31/12/2020 é uma Quinta-feira -> Python: (2020, 53, 4), tm_yday=366
    const res = calc.calcular('2020-12-31');
    assert.equal(res.anoIso, 2020);
    assert.equal(res.semanaIso, 53);
    assert.equal(res.semanaFormatada, 'S53');
    assert.equal(res.diaDoAno, 366);
    assert.equal(res.diaSemanaNome, 'Quinta-feira');
  });

  test('Deve calcular corretamente dia 1º de janeiro em ano que inicia na Semana 01', () => {
    // 01/01/2024 é Segunda-feira -> Python: (2024, 1, 1), tm_yday=1, weekday=0
    const res = calc.calcular('2024-01-01');
    assert.equal(res.anoIso, 2024);
    assert.equal(res.semanaIso, 1);
    assert.equal(res.semanaFormatada, 'S01');
    assert.equal(res.diaDoAno, 1);
    assert.equal(res.diaSemanaNome, 'Segunda-feira');
  });

  test('Deve aceitar formato DD/MM/YYYY e objetos Date', () => {
    const res1 = calc.calcular('15/06/2025');
    const res2 = calc.calcular(new Date(2025, 5, 15));
    assert.equal(res1.dataFormatada, '15/06/2025');
    assert.equal(res1.semanaIso, res2.semanaIso);
    assert.equal(res1.diaDoAno, res2.diaDoAno);
    assert.equal(res1.diaSemanaNome, res2.diaSemanaNome);
  });

  test('Deve lançar erro claro para datas inexistentes ou formatos inválidos', () => {
    assert.throws(() => calc.calcular('2024-02-30'), /Data inexistente/);
    assert.throws(() => calc.calcular('data-invalida'), /inválido|inválida/);
  });
});
