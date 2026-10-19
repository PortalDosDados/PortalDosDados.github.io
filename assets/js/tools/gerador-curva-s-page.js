/** Lógica de interface da página ferramentas/gerador-curva-s.html (extraída do HTML). */
document.addEventListener('DOMContentLoaded', () => {
  // 2. Elementos da Interface
  const kpiSpi = document.getElementById('kpiSpi');
  const kpiDesvio = document.getElementById('kpiDesvio');
  const kpiGapHoras = document.getElementById('kpiGapHoras');
  const kpiStatusText = document.getElementById('kpiStatusText');
  const kpiStatusIcon = document.getElementById('kpiStatusIcon');
  const kpiProjecaoHoras = document.getElementById('kpiProjecaoHoras');
  const cardDesvio = document.getElementById('cardDesvio');
  const cardStatus = document.getElementById('cardStatus');
  const txtTotalHoras = document.getElementById('txtTotalHoras');
  const corpoTabela = document.getElementById('corpoTabelaAtividades');
  const btnBaixarModelo = document.getElementById('btnBaixarModelo');
  const inputFileCSV = document.getElementById('inputFileCSV');
  const btnRestaurarPadrao = document.getElementById('btnRestaurarPadrao');

  let chartInstance = null;
  let ultimoResultado = null;
  let dadosAtuais = GeradorCurvaS.DADOS_MODELO_PADRAO;

  function renderizarGrafico(res) {
    const ctx = document.getElementById('graficoCurvaS');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#9eabbb' : '#576574';

    const labels = res.pontosGrafico.map(p => p.marco);
    const dataPlan = res.pontosGrafico.map(p => p.planejado);
    const dataReal = res.pontosGrafico.map(p => p.realizado);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Avanço Planejado (%)',
            data: dataPlan,
            borderColor: '#00CC96',
            backgroundColor: 'rgba(0, 204, 150, 0.1)',
            borderWidth: 3,
            tension: 0.35,
            fill: false,
            pointBackgroundColor: '#00CC96',
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: 'Avanço Realizado (%)',
            data: dataReal,
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.15)',
            borderWidth: 3,
            tension: 0.25,
            fill: false,
            pointBackgroundColor: '#00d4ff',
            pointRadius: 5,
            pointHoverRadius: 7,
            spanGaps: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: isDark ? '#1a2230' : '#ffffff',
            titleColor: isDark ? '#ffffff' : '#111827',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? '#334155' : '#cbd5e1',
            borderWidth: 1,
            callbacks: {
              label: function(ctx) {
                return `${ctx.dataset.label}: ${ctx.raw !== null ? ctx.raw + '%' : 'Não realizado'}`;
              }
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: val => val + '%',
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          },
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          }
        }
      }
    });
  }

  function atualizarInterface(itens) {
    try {
      const res = GeradorCurvaS.processarCurvaS(itens);
      ultimoResultado = res;

      // KPIs
      kpiSpi.textContent = res.spiFormatado;
      kpiDesvio.textContent = res.desvioEstimadoFormatado;
      kpiGapHoras.textContent = `(${res.gapHorasFormatado})`;
      kpiStatusText.textContent = res.statusText;
      kpiStatusText.style.color = res.corStatus;
      kpiProjecaoHoras.textContent = `Projeção: ${res.estimativaHorasTotal}h totais`;
      txtTotalHoras.textContent = `${res.totalDuracaoPlanejada}h`;

      cardDesvio.style.borderLeftColor = res.desvioEstimado > 0 ? '#ef5350' : '#66bb6a';
      cardStatus.style.borderLeftColor = res.corStatus;
      kpiStatusIcon.style.color = res.corStatus;

      // Tabela
      corpoTabela.innerHTML = '';
      res.tabela.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-surface-container-high/40 transition-colors';

        const statusItem = item.duracaoRealizada === null
          ? '<span class="px-2 py-0.5 rounded bg-surface-container-high text-outline text-[10px]">Pendente</span>'
          : item.duracaoRealizada > item.duracaoPlanejada
          ? '<span class="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px]">Atrasada</span>'
          : '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Concluída</span>';

        tr.innerHTML = `
          <td class="p-3 font-semibold text-on-surface">${item.atividade}</td>
          <td class="p-3 text-right">${item.duracaoPlanejada.toFixed(1)}h</td>
          <td class="p-3 text-right font-bold text-on-surface">${item.duracaoRealizada !== null ? item.duracaoRealizada.toFixed(1) + 'h' : '--'}</td>
          <td class="p-3 text-right text-outline">${item.progressoComputado.toFixed(1)}h</td>
          <td class="p-3 text-right text-emerald-400">${item.pctPlanAcum.toFixed(1)}%</td>
          <td class="p-3 text-right font-bold text-primary">${item.pctRealAcum !== null ? item.pctRealAcum.toFixed(1) + '%' : '--'}</td>
          <td class="p-3 text-center">${statusItem}</td>
        `;
        corpoTabela.appendChild(tr);
      });

      // Gráfico
      renderizarGrafico(res);

    } catch (err) {
      alert('Erro ao processar dados da Curva S: ' + err.message);
    }
  }

  // Baixar Modelo CSV
  btnBaixarModelo.addEventListener('click', () => {
    const csvContent = GeradorCurvaS.gerarCSVModelo();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_curva_s.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Carregar arquivo CSV
  inputFileCSV.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = GeradorCurvaS.parseCSV(event.target.result);
        dadosAtuais = parsed;
        atualizarInterface(dadosAtuais);
      } catch (err) {
        alert('Falha ao ler o arquivo CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  // Restaurar Exemplo
  btnRestaurarPadrao.addEventListener('click', () => {
    dadosAtuais = GeradorCurvaS.DADOS_MODELO_PADRAO;
    atualizarInterface(dadosAtuais);
  });

  // Inicialização
  atualizarInterface(dadosAtuais);

  // Redesenha o gráfico ao alternar o tema (evento emitido por tool-theme.js)
  document.addEventListener('themechange', () => {
    if (chartInstance) renderizarGrafico(ultimoResultado);
  });
});
