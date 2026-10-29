/**
 * assets/js/portal/portal-aluno-supabase.js
 * Camada de persistência, autenticação e ranking do Portal do Aluno.
 * Suporta Supabase REST API direta com fallback transparente e resiliente em localStorage.
 * Exportação universal (Browser e Node.js).
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PortalAlunoSupabase = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Configuração padrão pública (pode ser sobrescrita em tempo de execução)
  let supabaseConfig = {
    url: '',
    anonKey: '',
    ativo: false,
  };

  const CHAVES_STORAGE = {
    SESSAO: 'portal_aluno_sessao',
    ALUNOS: 'portal_aluno_cadastros',
    TENTATIVAS: 'portal_aluno_tentativas',
    RECORDES: 'portal_aluno_recordes',
    DOCENTE_AUTH: 'portal_docente_autenticado',
  };

  const CHAVE_DOCENTE_PADRAO = 'prof2026';
  const memoriaFallback = {};

  /**
   * Inicializa credenciais do Supabase.
   * @param {string} url 
   * @param {string} anonKey 
   */
  function inicializar(url, anonKey) {
    if (url && anonKey && url.startsWith('http')) {
      supabaseConfig = {
        url: url.replace(/\/+$/, ''),
        anonKey: anonKey,
        ativo: true,
      };
    } else {
      supabaseConfig.ativo = false;
    }
  }

  /**
   * Helper seguro para leitura do localStorage (compatível com Node e Browser).
   */
  function lerStorage(chave, valorPadrao) {
    if (typeof localStorage === 'undefined') {
      return memoriaFallback[chave] !== undefined
        ? JSON.parse(JSON.stringify(memoriaFallback[chave]))
        : valorPadrao;
    }
    try {
      const item = localStorage.getItem(chave);
      return item ? JSON.parse(item) : valorPadrao;
    } catch (e) {
      console.warn('Erro ao ler localStorage [' + chave + ']:', e);
      return valorPadrao;
    }
  }

  /**
   * Helper seguro para escrita no localStorage.
   */
  function salvarStorage(chave, valor) {
    if (typeof localStorage === 'undefined') {
      memoriaFallback[chave] = JSON.parse(JSON.stringify(valor));
      return;
    }
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) {
      console.warn('Erro ao gravar localStorage [' + chave + ']:', e);
    }
  }

  /**
   * Obtém os dados do aluno atualmente logado na sessão local.
   * @returns {object|null}
   */
  function obterSessaoAtual() {
    return lerStorage(CHAVES_STORAGE.SESSAO, null);
  }

  /**
   * Salva a sessão ativa localmente.
   * @param {object} aluno 
   */
  function definirSessaoAtual(aluno) {
    salvarStorage(CHAVES_STORAGE.SESSAO, aluno);
  }

  /**
   * Encerra a sessão ativa (Logout).
   */
  function encerrarSessao() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CHAVES_STORAGE.SESSAO);
    }
  }

  /**
   * Autentica ou cria perfil de aluno (Matrícula + Nome + Avatar).
   * @param {object} dados - { matricula, nomeExibicao, avatarId, exibirRanking }
   * @returns {Promise<object>} Perfil do aluno
   */
  async function entrarOuCadastrarAluno(dados) {
    const matriculaLimpa = String(dados.matricula || '').trim().toUpperCase();
    const nomeLimpo = String(dados.nomeExibicao || '').trim() || ('Aluno ' + matriculaLimpa);
    const turmaLimpa = String(dados.turma || '').trim() || 'Turma A (Manhã)';
    const avatarId = dados.avatarId || 'dev_pixel';
    const exibirRanking = dados.exibirRanking !== false;

    if (!matriculaLimpa) {
      throw new Error('A matrícula ou identificador do aluno é obrigatório.');
    }

    const alunoObj = {
      matricula: matriculaLimpa,
      nomeExibicao: nomeLimpo,
      turma: turmaLimpa,
      avatarId: avatarId,
      exibirRanking: exibirRanking,
      atualizadoEm: new Date().toISOString(),
    };

    // 1. Tenta sincronizar com Supabase se configurado
    if (supabaseConfig.ativo && typeof fetch !== 'undefined') {
      try {
        const response = await fetch(`${supabaseConfig.url}/rest/v1/portal_alunos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseConfig.anonKey,
            Authorization: `Bearer ${supabaseConfig.anonKey}`,
            Prefer: 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify({
            matricula: alunoObj.matricula,
            nome_exibicao: alunoObj.nomeExibicao,
            avatar_id: alunoObj.avatarId,
            exibir_ranking: alunoObj.exibirRanking,
          }),
        });
        if (response.ok) {
          const dadosRetornados = await response.json();
          if (Array.isArray(dadosRetornados) && dadosRetornados[0]) {
            alunoObj.id = dadosRetornados[0].id;
          }
        }
      } catch (errSupabase) {
        console.warn('Supabase indisponível, operando via LocalStorage offline:', errSupabase.message);
      }
    }

    // 2. Persistência em LocalStorage
    const cadastros = lerStorage(CHAVES_STORAGE.ALUNOS, {});
    cadastros[matriculaLimpa] = alunoObj;
    salvarStorage(CHAVES_STORAGE.ALUNOS, cadastros);
    definirSessaoAtual(alunoObj);

    return alunoObj;
  }

  /**
   * Obtém o recorde de uma unidade curricular para um aluno.
   * @param {string} matricula 
   * @param {string} cursoId 
   * @param {string} unidadeId 
   * @returns {object} { maiorScore, maiorPercentual, tentativasTotal }
   */
  function obterRecordeLocal(matricula, cursoId, unidadeId) {
    const recordes = lerStorage(CHAVES_STORAGE.RECORDES, {});
    const chave = `${matricula}_${cursoId}_${unidadeId}`;
    return (
      recordes[chave] || {
        maiorScore: 0,
        maiorPercentual: 0,
        tentativasTotal: 0,
      }
    );
  }

  /**
   * Registra a tentativa de um aluno e atualiza os recordes.
   * @param {object} tentativa - { matricula, cursoId, unidadeId, score, percentual, estrelas, proficiencia, tempoSegundos, detalhes }
   * @returns {Promise<object>} Registro salvo e status de recorde
   */
  async function registrarTentativa(tentativa) {
    if (!tentativa || !tentativa.matricula || !tentativa.cursoId || !tentativa.unidadeId) {
      throw new Error('Dados de tentativa incompletos para registro.');
    }

    const agora = new Date().toISOString();
    const registro = {
      matricula: tentativa.matricula,
      nomeExibicao: tentativa.nomeExibicao || '',
      turma: tentativa.turma || 'Turma A (Manhã)',
      cursoId: tentativa.cursoId,
      unidadeId: tentativa.unidadeId,
      score: tentativa.score || 0,
      percentual: tentativa.percentual || 0,
      estrelas: tentativa.estrelas || 1,
      proficienciaTitulo: tentativa.proficiencia ? tentativa.proficiencia.titulo : 'Iniciante',
      tempoSegundos: tentativa.tempoSegundos || 0,
      criadoEm: agora,
    };

    // 1. Atualizar recorde local
    const chaveRecorde = `${tentativa.matricula}_${tentativa.cursoId}_${tentativa.unidadeId}`;
    const recordes = lerStorage(CHAVES_STORAGE.RECORDES, {});
    const recordeAnterior = recordes[chaveRecorde] || { maiorScore: 0, maiorPercentual: 0, tentativasTotal: 0 };

    const bateuRecorde = registro.score > recordeAnterior.maiorScore || registro.percentual > recordeAnterior.maiorPercentual;

    const novoRecorde = {
      maiorScore: Math.max(recordeAnterior.maiorScore, registro.score),
      maiorPercentual: Math.max(recordeAnterior.maiorPercentual, registro.percentual),
      tentativasTotal: recordeAnterior.tentativasTotal + 1,
      ultimoEm: agora,
    };
    recordes[chaveRecorde] = novoRecorde;
    salvarStorage(CHAVES_STORAGE.RECORDES, recordes);

    // 2. Histórico de tentativas local
    const historico = lerStorage(CHAVES_STORAGE.TENTATIVAS, []);
    historico.push(registro);
    // Limita o histórico local a 200 itens para não estourar storage
    if (historico.length > 200) {
      historico.shift();
    }
    salvarStorage(CHAVES_STORAGE.TENTATIVAS, historico);

    // 3. Tenta sincronizar com Supabase se ativo
    if (supabaseConfig.ativo && typeof fetch !== 'undefined') {
      try {
        await fetch(`${supabaseConfig.url}/rest/v1/portal_tentativas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseConfig.anonKey,
            Authorization: `Bearer ${supabaseConfig.anonKey}`,
          },
          body: JSON.stringify({
            matricula: registro.matricula,
            curso_id: registro.cursoId,
            unidade_id: registro.unidadeId,
            score: registro.score,
            percentual: registro.percentual,
            nivel_alcancado: registro.proficienciaTitulo,
            tempo_segundos: registro.tempoSegundos,
          }),
        });
      } catch (e) {
        console.warn('Falha ao enviar tentativa para Supabase (salvo localmente):', e.message);
      }
    }

    return {
      registro: registro,
      recorde: novoRecorde,
      bateuRecorde: bateuRecorde,
    };
  }

  /**
   * Obtém o ranking geral da turma para a unidade curricular.
   * Respeita a preferência de privacidade dos alunos (exibirRanking).
   * @param {string} cursoId 
   * @param {string} unidadeId 
   * @returns {Promise<Array<object>>} Lista ordenada decrescente por maiorScore
   */
  async function obterRankingTurma(cursoId, unidadeId) {
    const alunos = lerStorage(CHAVES_STORAGE.ALUNOS, {});
    const recordes = lerStorage(CHAVES_STORAGE.RECORDES, {});

    const listaRanking = [];

    Object.keys(alunos).forEach(function (mat) {
      const aluno = alunos[mat];
      const chave = `${mat}_${cursoId}_${unidadeId}`;
      const rec = recordes[chave];

      if (rec && rec.tentativasTotal > 0) {
        listaRanking.push({
          matriculaAnonimizada: aluno.exibirRanking ? aluno.nomeExibicao : 'Piloto Anônimo #' + mat.slice(-3),
          nomeExibicao: aluno.nomeExibicao,
          avatarId: aluno.avatarId || 'dev_pixel',
          exibirRanking: aluno.exibirRanking,
          maiorScore: rec.maiorScore,
          maiorPercentual: rec.maiorPercentual,
          tentativasTotal: rec.tentativasTotal,
        });
      }
    });

    // Ordenação decrescente por maiorScore e maiorPercentual
    listaRanking.sort(function (a, b) {
      if (b.maiorScore !== a.maiorScore) {
        return b.maiorScore - a.maiorScore;
      }
      return b.maiorPercentual - a.maiorPercentual;
    });

    return listaRanking;
  }

  /**
   * Obtém o relatório consolidado de todos os alunos (uso exclusivo do Painel do Professor).
   * @param {string} cursoId 
   * @param {string} unidadeId 
   * @returns {Array<object>}
   */
  function obterRelatorioProfessor(cursoId, unidadeId) {
    const alunos = lerStorage(CHAVES_STORAGE.ALUNOS, {});
    const recordes = lerStorage(CHAVES_STORAGE.RECORDES, {});
    const historico = lerStorage(CHAVES_STORAGE.TENTATIVAS, []);

    const linhas = [];

    Object.keys(alunos).forEach(function (mat) {
      const aluno = alunos[mat];
      const chave = `${mat}_${cursoId}_${unidadeId}`;
      const rec = recordes[chave] || { maiorScore: 0, maiorPercentual: 0, tentativasTotal: 0, ultimoEm: '-' };

      // Filtrar tentativas deste aluno para esta unidade
      const tentativasAluno = historico.filter(function (t) {
        return t.matricula === mat && t.cursoId === cursoId && t.unidadeId === unidadeId;
      });

      const ultimaTentativa = tentativasAluno.length > 0 ? tentativasAluno[tentativasAluno.length - 1] : null;

      linhas.push({
        matricula: aluno.matricula,
        nomeExibicao: aluno.nomeExibicao,
        turma: aluno.turma || (ultimaTentativa ? ultimaTentativa.turma : 'Turma A (Manhã)'),
        avatarId: aluno.avatarId,
        tentativasTotal: rec.tentativasTotal,
        maiorScore: rec.maiorScore,
        maiorPercentual: rec.maiorPercentual,
        ultimoScore: ultimaTentativa ? ultimaTentativa.score : 0,
        ultimoPercentual: ultimaTentativa ? ultimaTentativa.percentual : 0,
        ultimoNivel: ultimaTentativa ? ultimaTentativa.proficienciaTitulo : 'Nenhuma',
        dataUltimaTentativa: rec.ultimoEm || '-',
      });
    });

    return linhas;
  }

  /**
   * Valida a chave de acesso do docente.
   * @param {string} chave 
   * @returns {boolean}
   */
  function validarChaveDocente(chave) {
    if (!chave || typeof chave !== 'string') return false;
    const chaveConfigurada = lerStorage('portal_chave_docente', CHAVE_DOCENTE_PADRAO);
    return chave.trim() === String(chaveConfigurada).trim();
  }

  /**
   * Autentica o docente salvando a sessão no sessionStorage.
   * @param {string} chave 
   * @returns {boolean}
   */
  function autenticarDocente(chave) {
    const valido = validarChaveDocente(chave);
    if (valido) {
      if (typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.setItem(CHAVES_STORAGE.DOCENTE_AUTH, 'true');
        } catch (e) {
          console.warn('Erro ao salvar sessionStorage do docente:', e);
        }
      } else {
        memoriaFallback[CHAVES_STORAGE.DOCENTE_AUTH] = 'true';
      }
    }
    return valido;
  }

  /**
   * Verifica se o docente está com sessão ativa.
   * @returns {boolean}
   */
  function isDocenteAutenticado() {
    if (typeof sessionStorage === 'undefined') {
      return memoriaFallback[CHAVES_STORAGE.DOCENTE_AUTH] === 'true';
    }
    try {
      return sessionStorage.getItem(CHAVES_STORAGE.DOCENTE_AUTH) === 'true';
    } catch (e) {
      return false;
    }
  }

  /**
   * Encerra a sessão do docente.
   */
  function encerrarSessaoDocente() {
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem(CHAVES_STORAGE.DOCENTE_AUTH);
      } catch (e) {
        console.warn('Erro ao limpar sessionStorage do docente:', e);
      }
    } else {
      delete memoriaFallback[CHAVES_STORAGE.DOCENTE_AUTH];
    }
  }

  return {
    inicializar: inicializar,
    obterSessaoAtual: obterSessaoAtual,
    definirSessaoAtual: definirSessaoAtual,
    encerrarSessao: encerrarSessao,
    entrarOuCadastrarAluno: entrarOuCadastrarAluno,
    obterRecordeLocal: obterRecordeLocal,
    registrarTentativa: registrarTentativa,
    obterRankingTurma: obterRankingTurma,
    obterRelatorioProfessor: obterRelatorioProfessor,
    validarChaveDocente: validarChaveDocente,
    autenticarDocente: autenticarDocente,
    isDocenteAutenticado: isDocenteAutenticado,
    encerrarSessaoDocente: encerrarSessaoDocente,
    CHAVE_DOCENTE_PADRAO: CHAVE_DOCENTE_PADRAO,
    CHAVES_STORAGE: CHAVES_STORAGE,
  };
});
