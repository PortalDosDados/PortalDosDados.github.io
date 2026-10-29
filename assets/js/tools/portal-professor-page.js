/**
 * assets/js/tools/portal-professor-page.js
 * Controlador do Painel Docente: métricas da turma, relatórios e exportação CSV.
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

  // Elementos do DOM
  const dom = {
    totalAlunos: document.getElementById('totalAlunos'),
    totalTentativas: document.getElementById('totalTentativas'),
    mediaTurma: document.getElementById('mediaTurma'),
    qtdSeniors: document.getElementById('qtdSeniors'),
    filtroBusca: document.getElementById('filtroBusca'),
    tabelaCorpo: document.getElementById('tabelaRelatorioCorpo'),
    btnExportarCSV: document.getElementById('btnExportarCSV'),
    btnAtualizar: document.getElementById('btnAtualizar'),
  };

  let dadosAtuais = [];

  function carregarRelatorio() {
    dadosAtuais = Storage.obterRelatorioProfessor(cursoId, unidadeId);
    calcularKPIs(dadosAtuais);
    renderizarTabela(dadosAtuais);
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
    const filtrados = dados.filter(function (d) {
      if (!termo) return true;
      return (
        d.matricula.toLowerCase().includes(termo) ||
        d.nomeExibicao.toLowerCase().includes(termo) ||
        d.ultimoNivel.toLowerCase().includes(termo)
      );
    });

    if (filtrados.length === 0) {
      dom.tabelaCorpo.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-on-surface-variant font-code-md text-xs">
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

    const cabecalho = ['Matrícula', 'Nome/Apelido', 'Total Tentativas', 'Maior Score', 'Maior %', 'Último Nível', 'Última Tentativa'];
    const linhas = dadosAtuais.map(function (d) {
      return [
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

  // Listeners
  if (dom.filtroBusca) {
    dom.filtroBusca.addEventListener('input', function () {
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
  carregarRelatorio();
});
