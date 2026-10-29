const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../assets/js/portal/portal-aluno-engine.js');
const portalCursos = require('../data/portal-cursos.js');
const questoesLogica = require('../data/questoes/informatica-logica.js');

describe('Motor de Cálculo e Gamificação do Portal do Aluno (portal-aluno-engine.js)', () => {
  describe('Cálculo Percentual de Aproveitamento (calcularPercentual)', () => {
    test('Deve calcular percentual correto com precisão de 1 casa decimal', () => {
      assert.equal(engine.calcularPercentual(15, 15), 100);
      assert.equal(engine.calcularPercentual(0, 15), 0);
      assert.equal(engine.calcularPercentual(10, 15), 66.7);
      assert.equal(engine.calcularPercentual(12, 15), 80);
      assert.equal(engine.calcularPercentual(7, 10), 70);
    });

    test('Deve tratar divisão por zero e inputs nulos ou indefinidos defensivamente', () => {
      assert.equal(engine.calcularPercentual(0, 0), 0);
      assert.equal(engine.calcularPercentual(5, 0), 0);
      assert.equal(engine.calcularPercentual(null, 15), 0);
      assert.equal(engine.calcularPercentual(undefined, 15), 0);
      assert.equal(engine.calcularPercentual(NaN, 15), 0);
      assert.equal(engine.calcularPercentual(10, null), 0);
    });

    test('Deve limitar acertos ao intervalo válido (0 até totalQuestoes)', () => {
      assert.equal(engine.calcularPercentual(-5, 15), 0);
      assert.equal(engine.calcularPercentual(20, 15), 100);
    });
  });

  describe('Cálculo de Pontuação Arcade (calcularScoreArcade)', () => {
    test('Deve computar 100 pontos por acerto base', () => {
      const score = engine.calcularScoreArcade(5, 15, 0, 0);
      assert.equal(score, 500);
    });

    test('Deve premiar combos consecutivos de acertos', () => {
      // 5 acertos com combo maximo de 5: 500 base + (5 - 1) * 25 = 600
      const scoreComCombo = engine.calcularScoreArcade(5, 15, 0, 5);
      assert.equal(scoreComCombo, 600);
    });

    test('Deve premiar agilidade quando aproveitamento for >= 70%', () => {
      // 15 acertos em 120 segundos (tempo alvo = 15 * 40 = 600s)
      const scoreAgil = engine.calcularScoreArcade(15, 15, 120, 15);
      // Base: 1500, Combo (14 * 25 = 350), Bonus Tempo > 0
      assert.ok(scoreAgil > 1850);
    });

    test('Não deve conceder bônus de agilidade para aproveitamento < 70%', () => {
      const score = engine.calcularScoreArcade(5, 15, 30, 0);
      assert.equal(score, 500);
    });

    test('Deve retornar 0 para zero acertos ou valores inválidos', () => {
      assert.equal(engine.calcularScoreArcade(0, 15), 0);
      assert.equal(engine.calcularScoreArcade(null, 15), 0);
      assert.equal(engine.calcularScoreArcade(-2, 15), 0);
    });
  });

  describe('Atribuição de Estrelas (calcularEstrelas)', () => {
    test('Deve conceder 1 estrela para faixas abaixo de 50% (incentivo à autoavaliação)', () => {
      assert.equal(engine.calcularEstrelas(0), 1);
      assert.equal(engine.calcularEstrelas(35), 1);
      assert.equal(engine.calcularEstrelas(49.9), 1);
    });

    test('Deve conceder 2 estrelas para faixa 50% a 69.9%', () => {
      assert.equal(engine.calcularEstrelas(50), 2);
      assert.equal(engine.calcularEstrelas(66.7), 2);
    });

    test('Deve conceder 3 estrelas para faixa 70% a 89.9%', () => {
      assert.equal(engine.calcularEstrelas(70), 3);
      assert.equal(engine.calcularEstrelas(85), 3);
    });

    test('Deve conceder 4 estrelas para faixa 90% a 100%', () => {
      assert.equal(engine.calcularEstrelas(90), 4);
      assert.equal(engine.calcularEstrelas(100), 4);
    });
  });

  describe('Diagnóstico Temático de Proficiência com Humor (obterDiagnosticoProficiencia)', () => {
    test('Deve classificar como "Juninho" para aproveitamento < 50% em Informática', () => {
      const diag = engine.obterDiagnosticoProficiencia('informatica', 30, portalCursos);
      assert.equal(diag.titulo, 'Juninho');
      assert.equal(diag.badge, '☕');
      assert.ok(diag.descricao.includes('ponto e vírgula') || diag.descricao.includes('café'));
    });

    test('Deve classificar como "Júnior" para faixa 50% a 69.9%', () => {
      const diag = engine.obterDiagnosticoProficiencia('informatica', 60, portalCursos);
      assert.equal(diag.titulo, 'Júnior');
      assert.equal(diag.badge, '🐛');
      assert.ok(diag.descricao.includes('Stack Overflow'));
    });

    test('Deve classificar como "Pleno" para faixa 70% a 89.9%', () => {
      const diag = engine.obterDiagnosticoProficiencia('informatica', 80, portalCursos);
      assert.equal(diag.titulo, 'Pleno');
      assert.equal(diag.badge, '🚀');
      assert.ok(diag.descricao.includes('produção'));
    });

    test('Deve classificar como "Sênior" para faixa 90% a 100%', () => {
      const diag = engine.obterDiagnosticoProficiencia('informatica', 95, portalCursos);
      assert.equal(diag.titulo, 'Sênior');
      assert.equal(diag.badge, '🧙‍♂️');
      assert.ok(diag.descricao.includes('hackeado') || diag.descricao.includes('Matrix'));
    });

    test('Deve manter integridade com fallback para curso desconhecido', () => {
      const diag = engine.obterDiagnosticoProficiencia('curso_inexistente', 75, portalCursos);
      assert.ok(diag.titulo);
      assert.ok(diag.descricao);
    });
  });

  describe('Avaliação Integrada de Tentativa (avaliarTentativa)', () => {
    test('Deve avaliar gabarito perfeito (100% de acertos)', () => {
      const respostas = questoesLogica.map((q) => ({
        questaoId: q.id,
        respostaSelecionada: q.respostaCorreta,
      }));

      const resultado = engine.avaliarTentativa({
        respostas,
        questoes: questoesLogica,
        tempoSegundos: 180,
        cursoId: 'informatica',
        catalogo: portalCursos,
      });

      assert.equal(resultado.acertos, questoesLogica.length);
      assert.equal(resultado.erros, 0);
      assert.equal(resultado.percentual, 100);
      assert.equal(resultado.estrelas, 4);
      assert.equal(resultado.proficiencia.titulo, 'Sênior');
      assert.equal(resultado.comboMaximo, questoesLogica.length);
      assert.equal(resultado.detalhes.length, questoesLogica.length);
      assert.ok(resultado.score >= 1800);
    });

    test('Deve avaliar tentativa com erros intercalados e quebra de combo', () => {
      const respostas = questoesLogica.map((q, idx) => ({
        questaoId: q.id,
        // Erra as questões de índice par
        respostaSelecionada: idx % 2 === 0 ? 'X' : q.respostaCorreta,
      }));

      const resultado = engine.avaliarTentativa({
        respostas,
        questoes: questoesLogica,
        tempoSegundos: 300,
        cursoId: 'informatica',
        catalogo: portalCursos,
      });

      assert.ok(resultado.erros > 0);
      assert.ok(resultado.acertos > 0);
      assert.ok(resultado.comboMaximo <= 1);
    });
  });

  describe('Gerenciamento de Recordes Pessoais (determinarNovoRecorde)', () => {
    test('Deve identificar quando o aluno bate o próprio recorde de score', () => {
      const recordeAtual = { maiorScore: 800, maiorPercentual: 60, tentativasTotal: 2 };
      const novo = engine.determinarNovoRecorde(recordeAtual, 1200, 75);

      assert.equal(novo.bateuRecorde, true);
      assert.equal(novo.maiorScore, 1200);
      assert.equal(novo.maiorPercentual, 75);
      assert.equal(novo.tentativasTotal, 3);
    });

    test('Deve manter o recorde se a pontuação atual for inferior', () => {
      const recordeAtual = { maiorScore: 1200, maiorPercentual: 85, tentativasTotal: 3 };
      const novo = engine.determinarNovoRecorde(recordeAtual, 900, 60);

      assert.equal(novo.bateuRecorde, false);
      assert.equal(novo.maiorScore, 1200);
      assert.equal(novo.maiorPercentual, 85);
      assert.equal(novo.tentativasTotal, 4);
    });
  });
});
