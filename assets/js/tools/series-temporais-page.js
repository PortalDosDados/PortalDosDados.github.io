/** Lógica de interface da página ferramentas/series-temporais.html (extraída do HTML). */
document.addEventListener('DOMContentLoaded', () => {
  // 2. Elementos da Interface
  const selectTicker = document.getElementById('selectTicker');
  const inputDataInicio = document.getElementById('inputDataInicio');
  const inputDataFim = document.getElementById('inputDataFim');
  const btnGerarGrafico = document.getElementById('btnGerarGrafico');
  const msgAlerta = document.getElementById('msgAlerta');

  const kpiPrecoFinal = document.getElementById('kpiPrecoFinal');
  const kpiVariacao = document.getElementById('kpiVariacao');
  const kpiMA21 = document.getElementById('kpiMA21');
  const kpiMA200 = document.getElementById('kpiMA200');
  const kpiTendencia = document.getElementById('kpiTendencia');
  const kpiDescricao = document.getElementById('kpiDescricao');
  const cardDiagnostico = document.getElementById('cardDiagnostico');
  const txtTituloTicker = document.getElementById('txtTituloTicker');

  let chartInstance = null;
  let ultimoResultado = null;

  function renderizarGrafico(res) {
    const ctx = document.getElementById('graficoSeriesTemporais');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#9eabbb' : '#576574';

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: res.serie.datas,
        datasets: [
          {
            label: 'Preço de Fechamento',
            data: res.serie.fechamento,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.1,
          },
          {
            label: 'Média Móvel 21 dias (MA21)',
            data: res.serie.ma21,
            borderColor: '#facc15',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.2,
          },
          {
            label: 'Média Móvel 200 dias (MA200)',
            data: res.serie.ma200,
            borderColor: '#a855f7',
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
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
                if (ctx.raw === null) return `${ctx.dataset.label}: Sem dados`;
                return `${ctx.dataset.label}: R$ ${Number(ctx.raw).toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: val => 'R$ ' + Number(val).toFixed(2),
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          },
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              maxTicksLimit: 12,
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          }
        }
      }
    });
  }

  function atualizar() {
    try {
      msgAlerta.classList.add('hidden');
      const ticker = selectTicker.value;
      const dtIni = inputDataInicio.value;
      const dtFim = inputDataFim.value;

      const baseDados = DadosCotacoesB3[ticker];
      if (!baseDados) {
        throw new Error(`Dados indisponíveis para o ticker ${ticker}.`);
      }

      const filtrados = SeriesTemporais.filtrarPorPeriodo(baseDados, dtIni, dtFim);
      if (filtrados.length === 0) {
        throw new Error('Nenhum dado encontrado para o intervalo de datas selecionado.');
      }

      const res = SeriesTemporais.processarSerie(filtrados);
      ultimoResultado = res;

      txtTituloTicker.textContent = ticker;
      kpiPrecoFinal.textContent = `R$ ${res.precoFinal.toFixed(2)}`;
      
      const varColor = res.variacaoPeriodo >= 0 ? 'text-emerald-400' : 'text-red-400';
      const varSinal = res.variacaoPeriodo >= 0 ? '+' : '';
      kpiVariacao.className = `font-code-md text-xs font-bold ${varColor}`;
      kpiVariacao.textContent = `Variação: ${varSinal}${res.variacaoPeriodo.toFixed(2)}%`;

      kpiMA21.textContent = res.ultimoMA21 !== null ? `R$ ${res.ultimoMA21.toFixed(2)}` : 'N/D';
      kpiMA200.textContent = res.ultimoMA200 !== null ? `R$ ${res.ultimoMA200.toFixed(2)}` : 'N/D';

      kpiTendencia.textContent = res.tendencia;
      kpiTendencia.style.color = res.tendenciaCor;
      kpiDescricao.textContent = res.descricaoTecnica;
      cardDiagnostico.style.borderLeftColor = res.tendenciaCor;

      renderizarGrafico(res);
    } catch (err) {
      msgAlerta.textContent = err.message || 'Erro ao processar dados de série temporal.';
      msgAlerta.classList.remove('hidden');
    }
  }

  btnGerarGrafico.addEventListener('click', atualizar);
  selectTicker.addEventListener('change', atualizar);

  // Inicia com o padrão
  atualizar();

  // Redesenha o gráfico ao alternar o tema (evento emitido por tool-theme.js)
  document.addEventListener('themechange', () => {
    if (chartInstance && ultimoResultado) renderizarGrafico(ultimoResultado);
  });
});
