/**
 * assets/js/tools/portal-aluno-page.js
 * Controlador de Interface, Interatividade e Sons Arcade do Portal do Aluno.
 * Totalmente desacoplado de dependências externas (< 500 linhas).
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const Cursos = window.PORTAL_CURSOS;
  const Questoes = window.QUESTOES_LOGICA;
  const Engine = window.PortalAlunoEngine;
  const Storage = window.PortalAlunoSupabase;

  if (!Cursos || !Questoes || !Engine || !Storage) {
    console.error('Dependências do Portal do Aluno não carregadas.');
    return;
  }

  // Estado da Aplicação
  const estado = {
    aluno: Storage.obterSessaoAtual(),
    cursoAtual: Cursos.cursos[0],
    unidadeAtual: Cursos.cursos[0].unidadesCurriculares[0],
    somAtivo: true,
    audioCtx: null,
    emJogo: false,
    indiceQuestaoAtual: 0,
    respostasDadas: [],
    tempoInicio: null,
    tempoDecorrido: 0,
    timerInterval: null,
    comboAtual: 0,
  };

  // Elementos do DOM
  const $ = function (id) { return document.getElementById(id); };
  const dom = {
    btnAbrirPerfil: $('btnAbrirPerfil'),
    btnRanking: $('btnRanking'),
    btnMute: $('btnMute'),
    iconeMute: $('iconeMute'),
    avatarDisplay: $('avatarDisplay'),
    nomeAlunoDisplay: $('nomeAlunoDisplay'),
    matriculaDisplay: $('matriculaDisplay'),
    gridCheckpoints: $('gridCheckpoints'),
    modalPerfil: $('modalPerfil'),
    formPerfil: $('formPerfil'),
    inputMatricula: $('inputMatricula'),
    inputNome: $('inputNome'),
    gridAvatares: $('gridAvatares'),
    checkExibirRanking: $('checkExibirRanking'),
    btnFecharPerfil: $('btnFecharPerfil'),
    btnSairConta: $('btnSairConta'),
    modalDesafio: $('modalDesafio'),
    btnFecharDesafio: $('btnFecharDesafio'),
    barraProgresso: $('barraProgresso'),
    badgeProgressoTexto: $('badgeProgressoTexto'),
    badgeCombo: $('badgeCombo'),
    cronometroTexto: $('cronometroTexto'),
    badgeTemaQuestao: $('badgeTemaQuestao'),
    textoEnunciado: $('textoEnunciado'),
    blocoCodigoContainer: $('blocoCodigoContainer'),
    blocoCodigo: $('blocoCodigo'),
    containerAlternativas: $('containerAlternativas'),
    containerFeedback: $('containerFeedback'),
    iconeFeedback: $('iconeFeedback'),
    tituloFeedback: $('tituloFeedback'),
    textoFeedback: $('textoFeedback'),
    btnProximaQuestao: $('btnProximaQuestao'),
    modalResultado: $('modalResultado'),
    estrelasContainer: $('estrelasContainer'),
    scoreFinalTexto: $('scoreFinalTexto'),
    percentualFinalTexto: $('percentualFinalTexto'),
    badgeProficiencia: $('badgeProficiencia'),
    tituloProficiencia: $('tituloProficiencia'),
    descricaoProficiencia: $('descricaoProficiencia'),
    alertaNovoRecorde: $('alertaNovoRecorde'),
    btnJogarNovamente: $('btnJogarNovamente'),
    btnVerRankingResultado: $('btnVerRankingResultado'),
    btnFecharResultado: $('btnFecharResultado'),
    modalRanking: $('modalRanking'),
    btnFecharRanking: $('btnFecharRanking'),
    listaRankingCorpo: $('listaRankingCorpo'),
  };

  // Sintetizador Nativo Web Audio
  function obterAudioContext() {
    if (!estado.audioCtx && typeof window.AudioContext !== 'undefined') {
      estado.audioCtx = new window.AudioContext();
    }
    if (estado.audioCtx && estado.audioCtx.state === 'suspended') {
      estado.audioCtx.resume();
    }
    return estado.audioCtx;
  }

  function emitirTom(frequencia, tipo, duracao, delay, volume) {
    if (!estado.somAtivo) return;
    try {
      const ctx = obterAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + (delay || 0);
      osc.type = tipo;
      osc.frequency.setValueAtTime(frequencia, t);
      gain.gain.setValueAtTime(volume || 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duracao);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duracao);
    } catch (e) { /* silencioso */ }
  }

  function somAcerto() {
    emitirTom(523.25, 'sine', 0.1, 0, 0.15);
    emitirTom(659.25, 'sine', 0.15, 0.08, 0.18);
    emitirTom(783.99, 'sine', 0.25, 0.16, 0.2);
  }

  function somErro() {
    emitirTom(260, 'sawtooth', 0.15, 0, 0.12);
    emitirTom(196, 'sawtooth', 0.25, 0.1, 0.15);
  }

  function somVitoria() {
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
      emitirTom(f, 'triangle', 0.2, i * 0.1, 0.2);
    });
  }

  // Renderização da Interface
  function atualizarHeaderAluno() {
    if (estado.aluno) {
      const avatarObj = Cursos.avatares.find(function (a) {
        return a.id === estado.aluno.avatarId;
      }) || Cursos.avatares[0];
      dom.avatarDisplay.textContent = avatarObj.icone;
      dom.nomeAlunoDisplay.textContent = estado.aluno.nomeExibicao;
      dom.matriculaDisplay.textContent = 'Matrícula: ' + estado.aluno.matricula;
    } else {
      dom.avatarDisplay.textContent = '👤';
      dom.nomeAlunoDisplay.textContent = 'Identifique-se';
      dom.matriculaDisplay.textContent = 'Clique para entrar';
    }
  }

  function renderizarCheckpoints() {
    dom.gridCheckpoints.innerHTML = '';
    estado.cursoAtual.unidadesCurriculares.forEach(function (uc) {
      const card = document.createElement('div');
      const isAtivo = uc.status === 'ativo';
      const recorde = estado.aluno
        ? Storage.obterRecordeLocal(estado.aluno.matricula, estado.cursoAtual.id, uc.id)
        : { maiorScore: 0, maiorPercentual: 0, tentativasTotal: 0 };

      const estrelasNum = isAtivo ? Engine.calcularEstrelas(recorde.maiorPercentual) : 0;
      let estrelasHtml = '';
      if (isAtivo) {
        for (let i = 1; i <= 4; i++) {
          estrelasHtml += `<span class="material-symbols-outlined text-sm ${i <= estrelasNum && recorde.tentativasTotal > 0 ? 'text-amber-400' : 'text-outline/40'}">star</span>`;
        }
      }

      card.className = `relative rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ${
        isAtivo ? 'bg-surface-container border-primary/40 hover:border-primary shadow-lg' : 'bg-surface-container-lowest/60 border-outline-variant/30 opacity-70 cursor-not-allowed'
      }`;

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl p-2 rounded-lg ${isAtivo ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container-high'}">${uc.icone}</span>
            <div class="flex items-center gap-1">${isAtivo ? estrelasHtml : '<span class="text-[11px] font-code-md text-outline flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">lock</span> Bloqueado</span>'}</div>
          </div>
          <div class="flex items-center gap-1.5 mb-1">
            <span class="font-code-md text-[10px] text-primary uppercase font-bold tracking-wider">Módulo 0${uc.ordem}</span>
            ${isAtivo ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>' : ''}
          </div>
          <h3 class="font-bold text-base text-on-surface mb-1.5">${uc.nome}</h3>
          <p class="text-on-surface-variant text-xs leading-relaxed mb-4">${uc.resumo}</p>
        </div>
        <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
          <div class="text-[11px] font-code-md ${isAtivo && recorde.tentativasTotal > 0 ? 'text-on-surface' : 'text-on-surface-variant'}">
            ${isAtivo && recorde.tentativasTotal > 0 ? `Recorde: <span class="text-primary font-bold">${recorde.maiorScore} pts</span> (${recorde.maiorPercentual}%)` : (isAtivo ? 'Ainda não jogado' : 'Em breve')}
          </div>
          <button type="button" data-ucid="${uc.id}" class="btn-iniciar-uc px-3.5 py-1.5 rounded-lg font-code-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isAtivo ? 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-md' : 'bg-surface-container-high text-outline cursor-not-allowed'
          }" ${!isAtivo ? 'disabled' : ''}>
            <span>${recorde.tentativasTotal > 0 ? 'Jogar Novamente' : 'Iniciar Missão'}</span>
            <span class="material-symbols-outlined text-[16px]">play_arrow</span>
          </button>
        </div>
      `;
      dom.gridCheckpoints.appendChild(card);
    });

    dom.gridCheckpoints.querySelectorAll('.btn-iniciar-uc').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!estado.aluno) {
          abrirModalPerfil();
          return;
        }
        iniciarDesafio();
      });
    });
  }

  function abrirModalPerfil() {
    renderizarSeletorAvatares();
    if (estado.aluno) {
      dom.inputMatricula.value = estado.aluno.matricula;
      dom.inputNome.value = estado.aluno.nomeExibicao;
      dom.checkExibirRanking.checked = estado.aluno.exibirRanking !== false;
      dom.btnSairConta.classList.remove('hidden');
    } else {
      dom.inputMatricula.value = '';
      dom.inputNome.value = '';
      dom.checkExibirRanking.checked = true;
      dom.btnSairConta.classList.add('hidden');
    }
    dom.modalPerfil.classList.remove('hidden');
    dom.modalPerfil.classList.add('flex');
  }

  function fecharModalPerfil() {
    dom.modalPerfil.classList.add('hidden');
    dom.modalPerfil.classList.remove('flex');
  }

  function renderizarSeletorAvatares() {
    dom.gridAvatares.innerHTML = '';
    const avatarAtivo = estado.aluno ? estado.aluno.avatarId : Cursos.avatares[0].id;
    Cursos.avatares.forEach(function (av) {
      const label = document.createElement('label');
      label.className = `cursor-pointer p-2.5 rounded-xl border text-center transition-all ${
        av.id === avatarAtivo ? 'bg-primary/10 border-primary shadow-sm text-primary' : 'bg-surface-container-high border-outline-variant/30 hover:border-outline'
      }`;
      label.innerHTML = `
        <input type="radio" name="avatarSelect" value="${av.id}" class="sr-only" ${av.id === avatarAtivo ? 'checked' : ''}/>
        <div class="text-2xl mb-1">${av.icone}</div>
        <div class="text-[10px] font-code-md font-semibold truncate">${av.nome}</div>
      `;
      label.addEventListener('click', function () {
        dom.gridAvatares.querySelectorAll('label').forEach(function (l) {
          l.className = 'cursor-pointer p-2.5 rounded-xl border text-center transition-all bg-surface-container-high border-outline-variant/30 hover:border-outline';
        });
        label.className = 'cursor-pointer p-2.5 rounded-xl border text-center transition-all bg-primary/10 border-primary shadow-sm text-primary';
      });
      dom.gridAvatares.appendChild(label);
    });
  }

  function iniciarDesafio() {
    estado.emJogo = true;
    estado.indiceQuestaoAtual = 0;
    estado.respostasDadas = [];
    estado.tempoInicio = Date.now();
    estado.tempoDecorrido = 0;
    estado.comboAtual = 0;

    if (estado.timerInterval) clearInterval(estado.timerInterval);
    estado.timerInterval = setInterval(function () {
      estado.tempoDecorrido = Math.floor((Date.now() - estado.tempoInicio) / 1000);
      const m = String(Math.floor(estado.tempoDecorrido / 60)).padStart(2, '0');
      const s = String(estado.tempoDecorrido % 60).padStart(2, '0');
      dom.cronometroTexto.textContent = `${m}:${s}`;
    }, 1000);

    renderizarQuestaoAtual();
    dom.modalDesafio.classList.remove('hidden');
    dom.modalDesafio.classList.add('flex');
  }

  function renderizarQuestaoAtual() {
    const q = Questoes[estado.indiceQuestaoAtual];
    const total = Questoes.length;
    dom.barraProgresso.style.width = `${(estado.indiceQuestaoAtual / total) * 100}%`;
    dom.badgeProgressoTexto.textContent = `${estado.indiceQuestaoAtual + 1} de ${total}`;
    dom.badgeCombo.textContent = estado.comboAtual > 1 ? `🔥 Combo x${estado.comboAtual}` : '⚡ Em ritmo';
    dom.badgeTemaQuestao.textContent = q.tema;
    dom.textoEnunciado.textContent = q.enunciado;

    if (q.codigo) {
      dom.blocoCodigoContainer.classList.remove('hidden');
      dom.blocoCodigo.textContent = q.codigo;
    } else {
      dom.blocoCodigoContainer.classList.add('hidden');
    }

    dom.containerFeedback.classList.add('hidden');
    dom.containerAlternativas.innerHTML = '';

    q.alternativas.forEach(function (alt) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-alternativa w-full p-4 rounded-xl border border-outline-variant/40 bg-surface-container-high hover:bg-surface-container-highest text-left font-body-md text-sm text-on-surface transition-all flex items-start gap-3 active:scale-[0.99]';
      btn.innerHTML = `
        <span class="w-6 h-6 rounded-md bg-surface-container-lowest border border-outline-variant/40 flex items-center justify-center font-code-md text-xs font-bold text-primary shrink-0">${alt.id}</span>
        <span class="flex-1">${alt.texto}</span>
      `;
      btn.addEventListener('click', function () {
        processarResposta(q, alt.id, btn);
      });
      dom.containerAlternativas.appendChild(btn);
    });
  }

  function processarResposta(questao, respostaEscolhida, botaoClicado) {
    const todosBotoes = dom.containerAlternativas.querySelectorAll('.btn-alternativa');
    todosBotoes.forEach(function (b) {
      b.disabled = true;
      b.classList.remove('hover:bg-surface-container-highest', 'active:scale-[0.99]');
    });

    const acertou = respostaEscolhida === questao.respostaCorreta;
    if (acertou) {
      estado.comboAtual += 1;
      somAcerto();
      botaoClicado.classList.add('bg-emerald-500/10', 'border-emerald-500', 'text-emerald-300');
      dom.iconeFeedback.textContent = 'check_circle';
      dom.iconeFeedback.className = 'material-symbols-outlined text-2xl text-emerald-400';
      dom.tituloFeedback.textContent = estado.comboAtual > 1 ? `Excelente! Combo x${estado.comboAtual}!` : 'Resposta Correta!';
      dom.tituloFeedback.className = 'font-bold text-base text-emerald-400';
    } else {
      estado.comboAtual = 0;
      somErro();
      botaoClicado.classList.add('bg-rose-500/10', 'border-rose-500', 'text-rose-300');
      todosBotoes.forEach(function (b) {
        if (b.innerText.trim().startsWith(questao.respostaCorreta)) {
          b.classList.add('bg-emerald-500/10', 'border-emerald-500', 'text-emerald-300');
        }
      });
      dom.iconeFeedback.textContent = 'cancel';
      dom.iconeFeedback.className = 'material-symbols-outlined text-2xl text-rose-400';
      dom.tituloFeedback.textContent = 'Não foi dessa vez... Veja a lógica:';
      dom.tituloFeedback.className = 'font-bold text-base text-rose-400';
    }

    estado.respostasDadas.push({ questaoId: questao.id, respostaSelecionada: respostaEscolhida });
    dom.textoFeedback.textContent = questao.explicacao;
    dom.containerFeedback.classList.remove('hidden');
    dom.btnProximaQuestao.querySelector('span').textContent =
      estado.indiceQuestaoAtual + 1 >= Questoes.length ? 'Ver Resultado Final' : 'Continuar';
  }

  function avancarQuestao() {
    estado.indiceQuestaoAtual += 1;
    if (estado.indiceQuestaoAtual >= Questoes.length) {
      finalizarDesafio();
    } else {
      renderizarQuestaoAtual();
    }
  }

  async function finalizarDesafio() {
    clearInterval(estado.timerInterval);
    dom.modalDesafio.classList.add('hidden');
    dom.modalDesafio.classList.remove('flex');

    const resultado = Engine.avaliarTentativa({
      respostas: estado.respostasDadas,
      questoes: Questoes,
      tempoSegundos: estado.tempoDecorrido,
      cursoId: estado.cursoAtual.id,
      catalogo: Cursos,
    });

    const registroInfo = await Storage.registrarTentativa({
      matricula: estado.aluno.matricula,
      cursoId: estado.cursoAtual.id,
      unidadeId: estado.unidadeAtual.id,
      score: resultado.score,
      percentual: resultado.percentual,
      estrelas: resultado.estrelas,
      proficiencia: resultado.proficiencia,
      tempoSegundos: resultado.tempoSegundos,
      detalhes: resultado.detalhes,
    });

    somVitoria();
    renderizarModalResultado(resultado, registroInfo.bateuRecorde);
    renderizarCheckpoints();
  }

  function renderizarModalResultado(resultado, bateuRecorde) {
    dom.scoreFinalTexto.textContent = `${resultado.score} pts`;
    dom.percentualFinalTexto.textContent = `${resultado.percentual}% de aproveitamento (${resultado.acertos}/${resultado.totalQuestoes} certas)`;

    dom.estrelasContainer.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
      const estrela = document.createElement('span');
      estrela.className = `material-symbols-outlined text-3xl ${i <= resultado.estrelas ? 'text-amber-400 scale-110' : 'text-outline/30'}`;
      estrela.textContent = 'star';
      dom.estrelasContainer.appendChild(estrela);
    }

    dom.badgeProficiencia.textContent = resultado.proficiencia.badge;
    dom.tituloProficiencia.textContent = `Nível de Proficiência: ${resultado.proficiencia.titulo}`;
    dom.descricaoProficiencia.textContent = resultado.proficiencia.descricao;
    dom.alertaNovoRecorde.classList.toggle('hidden', !bateuRecorde);

    dom.modalResultado.classList.remove('hidden');
    dom.modalResultado.classList.add('flex');
  }

  async function abrirRanking() {
    dom.listaRankingCorpo.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-on-surface-variant font-code-md text-xs">Carregando placar arcade...</td></tr>';
    dom.modalRanking.classList.remove('hidden');
    dom.modalRanking.classList.add('flex');

    const lista = await Storage.obterRankingTurma(estado.cursoAtual.id, estado.unidadeAtual.id);
    if (lista.length === 0) {
      dom.listaRankingCorpo.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-on-surface-variant font-code-md text-xs">Nenhum recorde registrado ainda. Seja o primeiro a jogar!</td></tr>';
      return;
    }

    dom.listaRankingCorpo.innerHTML = '';
    lista.forEach(function (item, index) {
      const pos = index + 1;
      const medalha = pos === 1 ? '🥇 1º' : pos === 2 ? '🥈 2º' : pos === 3 ? '🥉 3º' : `${pos}º`;
      const tr = document.createElement('tr');
      tr.className = `border-b border-outline-variant/20 ${pos <= 3 ? 'bg-primary/5' : ''}`;
      tr.innerHTML = `
        <td class="p-3 font-code-md text-xs font-bold ${pos === 1 ? 'text-amber-400' : 'text-on-surface'}">${medalha}</td>
        <td class="p-3">
          <div class="flex items-center gap-2">
            <span class="text-base">${Cursos.avatares.find(function (a) { return a.id === item.avatarId; })?.icone || '👾'}</span>
            <span class="font-semibold text-xs text-on-surface">${item.matriculaAnonimizada}</span>
          </div>
        </td>
        <td class="p-3 text-right font-code-md text-xs font-bold text-primary">${item.maiorScore} pts</td>
        <td class="p-3 text-right font-code-md text-xs text-on-surface-variant">${item.maiorPercentual}%</td>
      `;
      dom.listaRankingCorpo.appendChild(tr);
    });
  }

  // Event Listeners
  dom.btnAbrirPerfil.addEventListener('click', abrirModalPerfil);
  dom.btnFecharPerfil.addEventListener('click', fecharModalPerfil);

  dom.formPerfil.addEventListener('submit', async function (e) {
    e.preventDefault();
    const matricula = dom.inputMatricula.value.trim();
    const nome = dom.inputNome.value.trim();
    const avatarInput = dom.formPerfil.querySelector('input[name="avatarSelect"]:checked');
    if (!matricula) {
      alert('Informe sua matrícula ou identificador.');
      return;
    }
    const alunoSalvo = await Storage.entrarOuCadastrarAluno({
      matricula: matricula,
      nomeExibicao: nome,
      avatarId: avatarInput ? avatarInput.value : 'dev_pixel',
      exibirRanking: dom.checkExibirRanking.checked,
    });
    estado.aluno = alunoSalvo;
    atualizarHeaderAluno();
    renderizarCheckpoints();
    fecharModalPerfil();
  });

  dom.btnSairConta.addEventListener('click', function () {
    Storage.encerrarSessao();
    estado.aluno = null;
    atualizarHeaderAluno();
    renderizarCheckpoints();
    fecharModalPerfil();
  });

  dom.btnProximaQuestao.addEventListener('click', avancarQuestao);
  dom.btnFecharDesafio.addEventListener('click', function () {
    if (confirm('Deseja interromper o desafio atual?')) {
      clearInterval(estado.timerInterval);
      dom.modalDesafio.classList.add('hidden');
      dom.modalDesafio.classList.remove('flex');
    }
  });

  dom.btnJogarNovamente.addEventListener('click', function () {
    dom.modalResultado.classList.add('hidden');
    dom.modalResultado.classList.remove('flex');
    iniciarDesafio();
  });

  dom.btnVerRankingResultado.addEventListener('click', function () {
    dom.modalResultado.classList.add('hidden');
    dom.modalResultado.classList.remove('flex');
    abrirRanking();
  });

  dom.btnFecharResultado.addEventListener('click', function () {
    dom.modalResultado.classList.add('hidden');
    dom.modalResultado.classList.remove('flex');
  });

  dom.btnRanking.addEventListener('click', abrirRanking);
  dom.btnFecharRanking.addEventListener('click', function () {
    dom.modalRanking.classList.add('hidden');
    dom.modalRanking.classList.remove('flex');
  });

  dom.btnMute.addEventListener('click', function () {
    estado.somAtivo = !estado.somAtivo;
    dom.iconeMute.textContent = estado.somAtivo ? 'volume_up' : 'volume_off';
    dom.btnMute.title = estado.somAtivo ? 'Som Arcade Ativo' : 'Som Mudo';
  });

  // Inicialização
  atualizarHeaderAluno();
  renderizarCheckpoints();
});
