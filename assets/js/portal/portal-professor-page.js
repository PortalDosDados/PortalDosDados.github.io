/**
 * assets/js/portal/portal-professor-page.js
 * Controlador do Painel Docente: autenticação por chave, métricas da turma,
 * filtros por turma/busca e exportação CSV.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const Storage = window.PortalAlunoSupabase;
  const Cursos = window.PORTAL_CURSOS;

  if (!Storage || !Cursos) {
    console.error('Dependências do Painel do Professor não carregadas.');
    return;
  }

  const cursoId = 'informatica';
  const unidadeId = 'logica_programacao';

  const dom = {
    // Autenticação Docente
    secaoLoginDocente: document.getElementById('secaoLoginDocente'),
    formLoginDocente: document.getElementById('formLoginDocente'),
    chaveDocente: document.getElementById('chaveDocente'),
    btnToggleVisibilidadeChave: document.getElementById('btnToggleVisibilidadeChave'),
    iconeOlhoChave: document.getElementById('iconeOlhoChave'),
    msgErroDocente: document.getElementById('msgErroDocente'),
    docenteBadgePill: document.getElementById('docenteBadgePill'),
    btnSairDocente: document.getElementById('btnSairDocente'),

    // Painel Protegido
    painelDocenteConteudo: document.getElementById('painelDocenteConteudo'),
    totalAlunos: document.getElementById('totalAlunos'),
    totalTentativas: document.getElementById('totalTentativas'),
    mediaTurma: document.getElementById('mediaTurma'),
    qtdSeniors: document.getElementById('qtdSeniors'),
    filtroTurma: document.getElementById('filtroTurma'),
    filtroBusca: document.getElementById('filtroBusca'),
    tabelaCorpo: document.getElementById('tabelaRelatorioCorpo'),
    btnExportarCSV: document.getElementById('btnExportarCSV'),
    btnAtualizar: document.getElementById('btnAtualizar'),
  };

  let dadosAtuais = [];

  function atualizarVisibilidadeAutenticacao() {
    const autenticado = Storage.isDocenteAutenticado();
    if (autenticado) {
      if (dom.secaoLoginDocente) dom.secaoLoginDocente.classList.add('hidden');
      if (dom.painelDocenteConteudo) dom.painelDocenteConteudo.classList.remove('hidden');
      if (dom.docenteBadgePill) {
        dom.docenteBadgePill.classList.remove('hidden');
        dom.docenteBadgePill.classList.add('flex');
      }
      carregarRelatorio();
    } else {
      if (dom.secaoLoginDocente) dom.secaoLoginDocente.classList.remove('hidden');
      if (dom.painelDocenteConteudo) dom.painelDocenteConteudo.classList.add('hidden');
      if (dom.docenteBadgePill) {
        dom.docenteBadgePill.classList.add('hidden');
        dom.docenteBadgePill.classList.remove('flex');
      }
      if (dom.chaveDocente) dom.chaveDocente.value = '';
    }
  }

  function carregarRelatorio() {
    dadosAtuais = Storage.obterRelatorioProfessor(cursoId, unidadeId);
    popularFiltroTurmas(dadosAtuais);
    calcularKPIs(dadosAtuais);
    renderizarTabela(dadosAtuais);
  }

  function popularFiltroTurmas(dados) {
    if (!dom.filtroTurma) return;
    const turmaSelecionada = dom.filtroTurma.value;
    const turmasSet = new Set();
    if (Array.isArray(Cursos.turmas)) {
      Cursos.turmas.forEach(function (t) { turmasSet.add(t); });
    }
    dados.forEach(function (d) {
      if (d.turma) turmasSet.add(d.turma);
    });

    dom.filtroTurma.innerHTML = '<option value="todas">Todas as Turmas</option>';
    turmasSet.forEach(function (turma) {
      const opt = document.createElement('option');
      opt.value = turma;
      opt.textContent = turma;
      if (turma === turmaSelecionada) opt.selected = true;
      dom.filtroTurma.appendChild(opt);
    });
  }

  function calcularKPIs(dados) {
    const total = dados.length;
    dom.totalAlunos.textContent = total;

    let somaTentativas = 0;
    let somaScores = 0;
    let seniorsCount = 0;

    dados.forEach(function (d) {
      somaTentativas += d.tentativasTotal;
      somaScores += d.maiorPercentual;
      if (d.ultimoNivel === 'Sênior' || d.maiorPercentual >= 90) {
        seniorsCount += 1;
      }
    });

    dom.totalTentativas.textContent = somaTentativas;
    const media = total > 0 ? (somaScores / total).toFixed(1) : '0.0';
    dom.mediaTurma.textContent = `${media}%`;
    dom.qtdSeniors.textContent = seniorsCount;
  }

  function renderizarTabela(dados) {
    const termo = (dom.filtroBusca ? dom.filtroBusca.value : '').toLowerCase().trim();
    const turmaFiltro = dom.filtroTurma ? dom.filtroTurma.value : 'todas';

    const filtrados = dados.filter(function (d) {
      const matchTurma = turmaFiltro === 'todas' || d.turma === turmaFiltro;
      if (!matchTurma) return false;
      if (!termo) return true;
      return (
        d.matricula.toLowerCase().includes(termo) ||
        d.nomeExibicao.toLowerCase().includes(termo) ||
        (d.turma && d.turma.toLowerCase().includes(termo)) ||
        d.ultimoNivel.toLowerCase().includes(termo)
      );
    });

    if (filtrados.length === 0) {
      dom.tabelaCorpo.innerHTML = `
        <tr>
          <td colspan="8" class="p-8 text-center text-on-surface-variant font-code-md text-xs">
            Nenhum registro encontrado para os critérios de busca.
          </td>
        </tr>
      `;
      return;
    }

    dom.tabelaCorpo.innerHTML = '';
    filtrados.forEach(function (aluno) {
      let badgeCor = 'bg-surface-container-highest text-on-surface-variant';
      if (aluno.ultimoNivel === 'Sênior') badgeCor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      else if (aluno.ultimoNivel === 'Pleno') badgeCor = 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      else if (aluno.ultimoNivel === 'Júnior') badgeCor = 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      else if (aluno.ultimoNivel === 'Juninho') badgeCor = 'bg-rose-500/10 text-rose-400 border border-rose-500/30';

      const dataFormatada = aluno.dataUltimaTentativa !== '-'
        ? new Date(aluno.dataUltimaTentativa).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '-';

      const tr = document.createElement('tr');
      tr.className = 'border-b border-outline-variant/20 hover:bg-surface-container-high/40 transition-colors';
      tr.innerHTML = `
        <td class="p-3 font-code-md text-xs text-on-surface-variant font-medium">${aluno.turma || '-'}</td>
        <td class="p-3 font-code-md text-xs font-semibold text-primary">${aluno.matricula}</td>
        <td class="p-3 font-semibold text-xs text-on-surface">${aluno.nomeExibicao}</td>
        <td class="p-3 text-center font-code-md text-xs">${aluno.tentativasTotal}</td>
        <td class="p-3 text-right font-code-md text-xs font-bold text-on-surface">${aluno.maiorScore} pts</td>
        <td class="p-3 text-right font-code-md text-xs font-bold text-primary">${aluno.maiorPercentual}%</td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded-full font-code-md text-[10px] font-bold ${badgeCor}">
            ${aluno.ultimoNivel}
          </span>
        </td>
        <td class="p-3 text-right font-code-md text-[11px] text-on-surface-variant">${dataFormatada}</td>
      `;
      dom.tabelaCorpo.appendChild(tr);
    });
  }

  function exportarRelatorioCSV() {
    if (!dadosAtuais || dadosAtuais.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    const cabecalho = ['Turma', 'Matrícula', 'Nome/Apelido', 'Total Tentativas', 'Maior Score', 'Maior %', 'Último Nível', 'Última Tentativa'];
    const linhas = dadosAtuais.map(function (d) {
      return [
        `"${d.turma || 'Turma A'}"`,
        `"${d.matricula}"`,
        `"${d.nomeExibicao}"`,
        d.tentativasTotal,
        d.maiorScore,
        d.maiorPercentual,
        `"${d.ultimoNivel}"`,
        `"${d.dataUltimaTentativa}"`,
      ].join(';');
    });

    const conteudoCSV = '\uFEFF' + cabecalho.join(';') + '\n' + linhas.join('\n');
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-logica-programacao-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Listeners de Autenticação Docente
  if (dom.formLoginDocente) {
    dom.formLoginDocente.addEventListener('submit', function (e) {
      e.preventDefault();
      const chave = dom.chaveDocente ? dom.chaveDocente.value : '';
      const autenticou = Storage.autenticarDocente(chave);
      if (autenticou) {
        if (dom.msgErroDocente) dom.msgErroDocente.classList.add('hidden');
        atualizarVisibilidadeAutenticacao();
      } else {
        if (dom.msgErroDocente) dom.msgErroDocente.classList.remove('hidden');
        if (dom.chaveDocente) dom.chaveDocente.focus();
      }
    });
  }

  if (dom.btnToggleVisibilidadeChave && dom.chaveDocente) {
    dom.btnToggleVisibilidadeChave.addEventListener('click', function () {
      const isPassword = dom.chaveDocente.type === 'password';
      dom.chaveDocente.type = isPassword ? 'text' : 'password';
      if (dom.iconeOlhoChave) {
        dom.iconeOlhoChave.textContent = isPassword ? 'visibility_off' : 'visibility';
      }
    });
  }

  if (dom.btnSairDocente) {
    dom.btnSairDocente.addEventListener('click', function () {
      Storage.encerrarSessaoDocente();
      atualizarVisibilidadeAutenticacao();
    });
  }

  // Listeners de Relatório e Filtros
  if (dom.filtroBusca) {
    dom.filtroBusca.addEventListener('input', function () {
      renderizarTabela(dadosAtuais);
    });
  }

  if (dom.filtroTurma) {
    dom.filtroTurma.addEventListener('change', function () {
      renderizarTabela(dadosAtuais);
    });
  }

  if (dom.btnExportarCSV) {
    dom.btnExportarCSV.addEventListener('click', exportarRelatorioCSV);
  }

  if (dom.btnAtualizar) {
    dom.btnAtualizar.addEventListener('click', carregarRelatorio);
  }

  // Inicialização
  atualizarVisibilidadeAutenticacao();
});
