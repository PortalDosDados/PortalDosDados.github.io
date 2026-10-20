/**
 * assets/js/tools/fmea-page.js
 * ------------------------------------------------------------------
 * Controlador de interface e eventos para ferramentas/matriz-fmea.html.
 * Gerencia tabela interativa, gráficos Chart.js, localStorage e exportações.
 */

document.addEventListener('DOMContentLoaded', () => {
  const calc = window.FmeaCalc;
  if (!calc) return;

  const tabelaFmeaBody = document.getElementById('tabelaFmeaBody');
  const btnAdicionarLinha = document.getElementById('btnAdicionarLinha');
  const btnRestaurarExemplo = document.getElementById('btnRestaurarExemplo');
  const btnLimparTabela = document.getElementById('btnLimparTabela');
  const btnExportarCSV = document.getElementById('btnExportarCSV');
  const btnExportarJSON = document.getElementById('btnExportarJSON');
  const btnCopiarClipboard = document.getElementById('btnCopiarClipboard');
  const filtroCriticidade = document.getElementById('filtroCriticidade');

  const kpiTotalModos = document.getElementById('kpiTotalModos');
  const kpiModosCriticos = document.getElementById('kpiModosCriticos');
  const kpiRpnMedio = document.getElementById('kpiRpnMedio');
  const kpiReducaoGlobal = document.getElementById('kpiReducaoGlobal');

  const toastNotificacao = document.getElementById('toastNotificacao');
  const toastMensagem = document.getElementById('toastMensagem');
  const STORAGE_KEY = 'dn_fmea_matriz_dados';

  let paretoChartInstance = null;
  let criticidadeChartInstance = null;
  let toastTimer = null;

  let itens = carregarDadosIniciais();

  function exibirToast(mensagem) {
    if (!toastNotificacao || !toastMensagem) return;
    toastMensagem.textContent = mensagem;
    toastNotificacao.classList.remove('opacity-0', 'translate-y-24', 'pointer-events-none');
    toastNotificacao.classList.add('opacity-100', 'translate-y-0');

    if (toastTimer && typeof clearTimeout === 'function') clearTimeout(toastTimer);
    if (typeof setTimeout === 'function') {
      toastTimer = setTimeout(() => {
        toastNotificacao.classList.remove('opacity-100', 'translate-y-0');
        toastNotificacao.classList.add('opacity-0', 'translate-y-24', 'pointer-events-none');
      }, 3000);
    }
  }

  function criarItemVazio() {
    return {
      id: `fmea-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      componente: '', modoFalha: '', efeito: '', severidadeInicial: null,
      causa: '', ocorrenciaInicial: null, controlesAtuais: '', deteccaoInicial: null,
      rpnInicial: null, acaoRecomendada: '', responsavel: '', severidadeFinal: null,
      ocorrenciaFinal: null, deteccaoFinal: null, rpnFinal: null,
      reducaoDelta: null, reducaoPercentual: null
    };
  }

  function carregarDadosIniciais() {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) return sincronizarCalculos(parsed);
      }
    } catch (e) {
      console.warn('Falha ao ler localStorage:', e);
    }
    return calc.gerarExemploIndustrial();
  }

  function salvarLocalStorage() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(itens)); } catch (e) {}
  }

  function sincronizarCalculos(lista) {
    return lista.map((item, idx) => {
      const sIni = calc.normalizarNota(item.severidadeInicial);
      const oIni = calc.normalizarNota(item.ocorrenciaInicial);
      const dIni = calc.normalizarNota(item.deteccaoInicial);
      const rpnIni = calc.calcularRPN(sIni, oIni, dIni);

      const sFin = calc.normalizarNota(item.severidadeFinal);
      const oFin = calc.normalizarNota(item.ocorrenciaFinal);
      const dFin = calc.normalizarNota(item.deteccaoFinal);
      const rpnFin = calc.calcularRPN(sFin, oFin, dFin);
      const red = calc.calcularReducaoRisco(rpnIni, rpnFin);

      return {
        ...item,
        id: item.id || `fmea-${Date.now()}-${idx}`,
        severidadeInicial: sIni, ocorrenciaInicial: oIni, deteccaoInicial: dIni, rpnInicial: rpnIni,
        severidadeFinal: sFin, ocorrenciaFinal: oFin, deteccaoFinal: dFin, rpnFinal: rpnFin,
        reducaoDelta: red ? red.delta : null, reducaoPercentual: red ? red.percentual : null
      };
    });
  }

  function atualizarLinhaPorElemento(tr, index) {
    const item = itens[index];
    if (!item) return;

    item.componente = tr.querySelector('[data-field="componente"]')?.value || '';
    item.modoFalha = tr.querySelector('[data-field="modoFalha"]')?.value || '';
    item.efeito = tr.querySelector('[data-field="efeito"]')?.value || '';
    item.causa = tr.querySelector('[data-field="causa"]')?.value || '';
    item.controlesAtuais = tr.querySelector('[data-field="controlesAtuais"]')?.value || '';
    item.acaoRecomendada = tr.querySelector('[data-field="acaoRecomendada"]')?.value || '';
    item.responsavel = tr.querySelector('[data-field="responsavel"]')?.value || '';

    item.severidadeInicial = calc.normalizarNota(tr.querySelector('[data-field="severidadeInicial"]')?.value);
    item.ocorrenciaInicial = calc.normalizarNota(tr.querySelector('[data-field="ocorrenciaInicial"]')?.value);
    item.deteccaoInicial = calc.normalizarNota(tr.querySelector('[data-field="deteccaoInicial"]')?.value);
    item.rpnInicial = calc.calcularRPN(item.severidadeInicial, item.ocorrenciaInicial, item.deteccaoInicial);

    item.severidadeFinal = calc.normalizarNota(tr.querySelector('[data-field="severidadeFinal"]')?.value);
    item.ocorrenciaFinal = calc.normalizarNota(tr.querySelector('[data-field="ocorrenciaFinal"]')?.value);
    item.deteccaoFinal = calc.normalizarNota(tr.querySelector('[data-field="deteccaoFinal"]')?.value);
    item.rpnFinal = calc.calcularRPN(item.severidadeFinal, item.ocorrenciaFinal, item.deteccaoFinal);

    const red = calc.calcularReducaoRisco(item.rpnInicial, item.rpnFinal);
    item.reducaoDelta = red ? red.delta : null;
    item.reducaoPercentual = red ? red.percentual : null;

    const rpnIniCell = tr.querySelector('[data-cell="rpnInicial"]');
    if (rpnIniCell) rpnIniCell.textContent = item.rpnInicial !== null ? item.rpnInicial : '-';

    const badgeCell = tr.querySelector('[data-cell="badgeCriticidade"]');
    if (badgeCell) {
      const crit = calc.classificarCriticidade(item.severidadeInicial, item.rpnInicial);
      badgeCell.innerHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md font-semibold ${crit.badgeClass}">${crit.rotulo}</span>`;
    }

    const rpnFinCell = tr.querySelector('[data-cell="rpnFinal"]');
    if (rpnFinCell) rpnFinCell.textContent = item.rpnFinal !== null ? item.rpnFinal : '-';

    const redCell = tr.querySelector('[data-cell="reducao"]');
    if (redCell) {
      if (item.reducaoPercentual !== null) {
        const cor = item.reducaoPercentual >= 0 ? 'text-emerald-400' : 'text-red-400';
        redCell.className = `p-2.5 text-center font-code-md font-semibold ${cor} bg-surface-container/30`;
        redCell.textContent = `${item.reducaoPercentual > 0 ? '-' : ''}${Math.abs(item.reducaoPercentual)}%`;
      } else {
        redCell.className = 'p-2.5 text-center font-code-md text-on-surface-variant bg-surface-container/30';
        redCell.textContent = '-';
      }
    }

    salvarLocalStorage();
    atualizarKPIs();
    atualizarGraficos();
  }

  function renderizarTabela() {
    if (!tabelaFmeaBody) return;
    tabelaFmeaBody.innerHTML = '';
    const filtro = filtroCriticidade ? filtroCriticidade.value : 'TODOS';

    itens.forEach((item, index) => {
      const s = calc.normalizarNota(item.severidadeInicial);
      const crit = calc.classificarCriticidade(s, item.rpnInicial);
      if (filtro !== 'TODOS' && crit.nivel !== filtro) return;

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/20';
      tr.setAttribute('data-index', String(index));

      const inputCls = 'w-full bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 text-xs text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 font-body-md transition-all';
      const numCls = 'w-14 text-center bg-surface-container-low border border-outline-variant/30 rounded px-1 py-1 text-xs font-code-md text-on-surface focus:border-primary focus:outline-none transition-all';
      const corRed = item.reducaoPercentual !== null && item.reducaoPercentual >= 0 ? 'text-emerald-400' : 'text-red-400';
      const txtRed = item.reducaoPercentual !== null ? `${item.reducaoPercentual > 0 ? '-' : ''}${Math.abs(item.reducaoPercentual)}%` : '-';

      tr.innerHTML = `
        <td class="p-2.5 text-center font-code-md text-outline select-none">${index + 1}</td>
        <td class="p-2.5"><input type="text" data-field="componente" value="${escapeHtml(item.componente || '')}" class="${inputCls}" placeholder="Ex: Rolamento"/></td>
        <td class="p-2.5"><input type="text" data-field="modoFalha" value="${escapeHtml(item.modoFalha || '')}" class="${inputCls}" placeholder="Modo de falha"/></td>
        <td class="p-2.5"><input type="text" data-field="efeito" value="${escapeHtml(item.efeito || '')}" class="${inputCls}" placeholder="Efeito no sistema"/></td>
        <td class="p-2.5 text-center"><input type="number" min="1" max="10" data-field="severidadeInicial" value="${item.severidadeInicial || ''}" class="${numCls}" placeholder="1-10"/></td>
        <td class="p-2.5"><input type="text" data-field="causa" value="${escapeHtml(item.causa || '')}" class="${inputCls}" placeholder="Causa raiz"/></td>
        <td class="p-2.5 text-center"><input type="number" min="1" max="10" data-field="ocorrenciaInicial" value="${item.ocorrenciaInicial || ''}" class="${numCls}" placeholder="1-10"/></td>
        <td class="p-2.5"><input type="text" data-field="controlesAtuais" value="${escapeHtml(item.controlesAtuais || '')}" class="${inputCls}" placeholder="Detecção atual"/></td>
        <td class="p-2.5 text-center"><input type="number" min="1" max="10" data-field="deteccaoInicial" value="${item.deteccaoInicial || ''}" class="${numCls}" placeholder="1-10"/></td>
        <td class="p-2.5 text-center font-code-md font-bold text-primary text-sm" data-cell="rpnInicial">${item.rpnInicial !== null ? item.rpnInicial : '-'}</td>
        <td class="p-2.5 text-center" data-cell="badgeCriticidade">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md font-semibold ${crit.badgeClass}">${crit.rotulo}</span>
        </td>
        <td class="p-2.5 border-l border-outline-variant/40 bg-surface-container/30"><input type="text" data-field="acaoRecomendada" value="${escapeHtml(item.acaoRecomendada || '')}" class="${inputCls}" placeholder="Ação de bloqueio"/></td>
        <td class="p-2.5 bg-surface-container/30"><input type="text" data-field="responsavel" value="${escapeHtml(item.responsavel || '')}" class="${inputCls}" placeholder="Responsável"/></td>
        <td class="p-2.5 text-center bg-surface-container/30"><input type="number" min="1" max="10" data-field="severidadeFinal" value="${item.severidadeFinal || ''}" class="${numCls}" placeholder="1-10"/></td>
        <td class="p-2.5 text-center bg-surface-container/30"><input type="number" min="1" max="10" data-field="ocorrenciaFinal" value="${item.ocorrenciaFinal || ''}" class="${numCls}" placeholder="1-10"/></td>
        <td class="p-2.5 text-center bg-surface-container/30"><input type="number" min="1" max="10" data-field="deteccaoFinal" value="${item.deteccaoFinal || ''}" class="${numCls}" placeholder="1-10"/></td>
        <td class="p-2.5 text-center font-code-md font-bold text-secondary text-sm bg-surface-container/30" data-cell="rpnFinal">${item.rpnFinal !== null ? item.rpnFinal : '-'}</td>
        <td class="p-2.5 text-center font-code-md font-semibold ${corRed} bg-surface-container/30" data-cell="reducao">${txtRed}</td>
        <td class="p-2.5 text-center">
          <button type="button" data-action="remover" class="text-on-surface-variant hover:text-red-400 p-1 rounded hover:bg-surface-container-high transition-colors" title="Excluir este modo de falha">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </td>
      `;

      if (typeof tr.addEventListener === 'function') {
        tr.addEventListener('input', () => atualizarLinhaPorElemento(tr, index));
      }
      const btnRemover = typeof tr.querySelector === 'function' ? tr.querySelector('[data-action="remover"]') : null;
      if (btnRemover && typeof btnRemover.addEventListener === 'function') {
        btnRemover.addEventListener('click', () => removerLinha(index));
      }
      if (typeof tabelaFmeaBody.appendChild === 'function') {
        tabelaFmeaBody.appendChild(tr);
      }
    });

    atualizarKPIs();
    atualizarGraficos();
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function adicionarLinha() {
    itens.push(criarItemVazio());
    salvarLocalStorage();
    renderizarTabela();
    exibirToast('Novo modo de falha adicionado.');
  }

  function removerLinha(index) {
    if (itens.length <= 1) {
      itens = [criarItemVazio()];
    } else {
      itens.splice(index, 1);
    }
    salvarLocalStorage();
    renderizarTabela();
    exibirToast('Modo de falha removido.');
  }

  function atualizarKPIs() {
    const metricas = calc.calcularMetricasAgregadas(itens);
    if (kpiTotalModos) kpiTotalModos.textContent = String(metricas.totalItens);
    if (kpiModosCriticos) kpiModosCriticos.textContent = String(metricas.criticos);
    if (kpiRpnMedio) kpiRpnMedio.textContent = `${metricas.rpnMedioInicial} → ${metricas.rpnMedioFinal}`;
    if (kpiReducaoGlobal) kpiReducaoGlobal.textContent = `${metricas.reducaoGeralPercentual}%`;
  }

  function obterConfigTemaGraficos() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
      textColor: isDark ? '#94a3b8' : '#475569',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      tooltipBg: isDark ? '#1e293b' : '#ffffff',
      tooltipText: isDark ? '#f8fafc' : '#0f172a'
    };
  }

  function atualizarGraficos() {
    if (typeof Chart === 'undefined') return;
    const tema = obterConfigTemaGraficos();

    const ctxPareto = document.getElementById('paretoChart');
    if (ctxPareto) {
      const p = calc.calcularPareto(itens);
      if (paretoChartInstance) paretoChartInstance.destroy();
      paretoChartInstance = new Chart(ctxPareto, {
        data: {
          labels: p.labels,
          datasets: [
            {
              type: 'bar', label: 'RPN Inicial', data: p.rpns,
              backgroundColor: 'rgba(0, 212, 255, 0.75)', borderColor: '#00d4ff',
              borderWidth: 1, borderRadius: 4, yAxisID: 'y'
            },
            {
              type: 'line', label: '% Acumulado', data: p.acumulados,
              borderColor: '#ff9800', backgroundColor: 'rgba(255, 152, 0, 0.1)',
              borderWidth: 2, pointBackgroundColor: '#ff9800', pointRadius: 4,
              tension: 0.25, yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { color: tema.textColor, font: { family: 'JetBrains Mono', size: 11 } } },
            tooltip: { backgroundColor: tema.tooltipBg, titleColor: tema.tooltipText, bodyColor: tema.tooltipText }
          },
          scales: {
            x: { ticks: { color: tema.textColor, font: { family: 'JetBrains Mono', size: 10 } }, grid: { display: false } },
            y: { position: 'left', title: { display: true, text: 'RPN', color: tema.textColor, font: { family: 'JetBrains Mono', size: 10 } }, ticks: { color: tema.textColor }, grid: { color: tema.gridColor } },
            y1: { position: 'right', min: 0, max: 100, title: { display: true, text: '% Acumulado', color: tema.textColor, font: { family: 'JetBrains Mono', size: 10 } }, ticks: { color: tema.textColor, callback: (v) => `${v}%` }, grid: { drawOnChartArea: false } }
          }
        }
      });
    }

    const ctxCrit = document.getElementById('criticidadeChart');
    if (ctxCrit) {
      const m = calc.calcularMetricasAgregadas(itens);
      if (criticidadeChartInstance) criticidadeChartInstance.destroy();
      criticidadeChartInstance = new Chart(ctxCrit, {
        type: 'doughnut',
        data: {
          labels: ['Crítico', 'Alto', 'Moderado', 'Baixo'],
          datasets: [{
            data: [m.criticos, m.altos, m.moderados, m.baixos],
            backgroundColor: ['#ef4444', '#f97316', '#eab308', '#10b981'],
            borderColor: 'transparent', hoverOffset: 6
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: tema.textColor, font: { family: 'JetBrains Mono', size: 11 }, padding: 12 } },
            tooltip: { backgroundColor: tema.tooltipBg, titleColor: tema.tooltipText, bodyColor: tema.tooltipText }
          },
          cutout: '65%'
        }
      });
    }
  }

  if (btnAdicionarLinha) btnAdicionarLinha.addEventListener('click', adicionarLinha);

  if (btnRestaurarExemplo) {
    btnRestaurarExemplo.addEventListener('click', () => {
      itens = calc.gerarExemploIndustrial();
      salvarLocalStorage();
      renderizarTabela();
      exibirToast('Exemplo industrial restaurado.');
    });
  }

  if (btnLimparTabela) {
    btnLimparTabela.addEventListener('click', () => {
      itens = [criarItemVazio()];
      salvarLocalStorage();
      renderizarTabela();
      exibirToast('Matriz limpa. Nova linha em branco pronta.');
    });
  }

  if (filtroCriticidade) filtroCriticidade.addEventListener('change', renderizarTabela);

  function dispararDownload(conteudo, nomeArquivo, mime) {
    const blob = new Blob([conteudo], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (btnExportarCSV) {
    btnExportarCSV.addEventListener('click', () => {
      const csvStr = calc.exportarCSV(itens);
      dispararDownload(csvStr, `fmea_industrial_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
      exibirToast('Arquivo CSV baixado com sucesso!');
    });
  }

  if (btnExportarJSON) {
    btnExportarJSON.addEventListener('click', () => {
      const jsonStr = calc.exportarJSON(itens);
      dispararDownload(jsonStr, `fmea_industrial_${new Date().toISOString().slice(0, 10)}.json`, 'application/json;charset=utf-8;');
      exibirToast('Arquivo JSON baixado com sucesso!');
    });
  }

  if (btnCopiarClipboard) {
    btnCopiarClipboard.addEventListener('click', async () => {
      try {
        const csvStr = calc.exportarCSV(itens);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(csvStr);
          exibirToast('Dados copiados para a área de transferência!');
        } else {
          exibirToast('Copie os dados via exportação CSV.');
        }
      } catch (e) {
        exibirToast('Permissão negada para cópia.');
      }
    });
  }

  document.addEventListener('themechange', atualizarGraficos);
  renderizarTabela();
});
