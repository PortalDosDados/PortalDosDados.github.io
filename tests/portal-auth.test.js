const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const Storage = require('../assets/js/portal/portal-aluno-supabase.js');
const Cursos = require('../data/portal-cursos.js');

describe('Autenticação e Sessão: Alunos e Docentes (portal-aluno-supabase.js)', () => {
  describe('Autenticação do Professor (Chave de Acesso Docente)', () => {
    test('Deve validar chave padrão do professor (prof2026)', () => {
      assert.equal(Storage.validarChaveDocente('prof2026'), true);
      assert.equal(Storage.validarChaveDocente(' prof2026 '), true);
    });

    test('Deve rejeitar chaves incorretas, vazias ou nulas', () => {
      assert.equal(Storage.validarChaveDocente(''), false);
      assert.equal(Storage.validarChaveDocente(null), false);
      assert.equal(Storage.validarChaveDocente(undefined), false);
      assert.equal(Storage.validarChaveDocente('senhaErrada123'), false);
      assert.equal(Storage.validarChaveDocente(12345), false);
    });
  });

  describe('Identificação e Sessão do Aluno', () => {
    test('Deve cadastrar aluno com turma e persistir dados completos', async () => {
      const aluno = await Storage.entrarOuCadastrarAluno({
        matricula: 'TESTE-2026-TURMA',
        nomeExibicao: 'Aluno Teste',
        turma: 'Turma B (Tarde)',
        avatarId: 'arcade_gamer',
        exibirRanking: true,
      });

      assert.equal(aluno.matricula, 'TESTE-2026-TURMA');
      assert.equal(aluno.nomeExibicao, 'Aluno Teste');
      assert.equal(aluno.turma, 'Turma B (Tarde)');
      assert.equal(aluno.avatarId, 'arcade_gamer');
      assert.equal(aluno.exibirRanking, true);
    });

    test('Deve aplicar turma padrão se não for informada', async () => {
      const alunoSemTurma = await Storage.entrarOuCadastrarAluno({
        matricula: 'TESTE-SEM-TURMA',
        nomeExibicao: 'Sem Turma',
      });

      assert.equal(alunoSemTurma.turma, 'Turma A (Manhã)');
    });

    test('Deve incluir turma no relatório docente consolidado', async () => {
      await Storage.entrarOuCadastrarAluno({
        matricula: 'INFO-DOCENTE-01',
        nomeExibicao: 'Carlos Dev',
        turma: 'Turma C (Noite)',
      });

      await Storage.registrarTentativa({
        matricula: 'INFO-DOCENTE-01',
        nomeExibicao: 'Carlos Dev',
        turma: 'Turma C (Noite)',
        cursoId: 'informatica',
        unidadeId: 'logica_programacao',
        score: 1200,
        percentual: 80,
        estrelas: 3,
        proficiencia: { titulo: 'Pleno' },
        tempoSegundos: 180,
      });

      const relatorio = Storage.obterRelatorioProfessor('informatica', 'logica_programacao');
      const registroAluno = relatorio.find((r) => r.matricula === 'INFO-DOCENTE-01');

      assert.ok(registroAluno, 'Registro do aluno deve constar no relatório docente');
      assert.equal(registroAluno.turma, 'Turma C (Noite)');
      assert.equal(registroAluno.maiorScore, 1200);
      assert.equal(registroAluno.maiorPercentual, 80);
      assert.equal(registroAluno.ultimoNivel, 'Pleno');
    });
  });

  describe('Catálogo de Turmas Padrão (data/portal-cursos.js)', () => {
    test('Deve disponibilizar opções de turmas válidas', () => {
      assert.ok(Array.isArray(Cursos.turmas), 'Cursos.turmas deve ser um array');
      assert.ok(Cursos.turmas.length >= 3, 'Deve conter pelo menos 3 opções de turnos/turmas');
      assert.ok(Cursos.turmas.includes('Turma A (Manhã)'));
    });
  });
});
