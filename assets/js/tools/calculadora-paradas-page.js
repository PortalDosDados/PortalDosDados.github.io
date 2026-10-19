/** Lógica de interface da página ferramentas/calculadora-paradas.html (extraída do HTML). */
document.addEventListener('DOMContentLoaded', () => {
  // 2. Elementos da Interface
  const inputDataIni = document.getElementById('inputDataIni');
  const inputHoraIni = document.getElementById('inputHoraIni');
  const inputDataFim = document.getElementById('inputDataFim');
  const inputHoraFim = document.getElementById('inputHoraFim');
  const btnProcessar = document.getElementById('btnProcessar');
  const msgAlerta = document.getElementById('msgAlerta');

  const painelResultados = document.getElementById('painelResultados');
  const badgeStatus = document.getElementById('badgeStatus');
  const iconeStatus = document.getElementById('iconeStatus');
  const textoStatus = document.getElementById('textoStatus');
  const dispHorasDecimais = document.getElementById('dispHorasDecimais');
  const dispMinutos = document.getElementById('dispMinutos');
  const dispPeriodo = document.getElementById('dispPeriodo');
  const dispImpacto = document.getElementById('dispImpacto');
  const dispDescricaoAcao = document.getElementById('dispDescricaoAcao');

  // Presets
  const btnPresetFalha = document.getElementById('btnPresetFalha');
  const btnPresetFca = document.getElementById('btnPresetFca');
  const btnPresetRotina = document.getElementById('btnPresetRotina');

  function formatarDataISO(d) {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  function processar() {
    try {
      msgAlerta.classList.add('hidden');

      const dIniVal = inputDataIni.value;
      const hIniVal = inputHoraIni.value;
      const dFimVal = inputDataFim.value;
      const hFimVal = inputHoraFim.value;

      const res = CalculadoraParadas.calcularDowntime({
        dataInicio: dIniVal,
        horaInicio: hIniVal,
        dataFim: dFimVal,
        horaFim: hFimVal,
      });

      // Atualiza o card de resultados
      painelResultados.style.borderTopColor = res.severidade.cor;
      badgeStatus.style.backgroundColor = `${res.severidade.cor}22`;
      badgeStatus.style.color = res.severidade.cor;
      badgeStatus.style.border = `1px solid ${res.severidade.cor}55`;
      iconeStatus.textContent = res.severidade.icone;
      textoStatus.textContent = res.severidade.textoStatus;

      dispHorasDecimais.textContent = res.horasDecimaisFormatadas;
      dispMinutos.textContent = `⏱️ Total: ${res.minutosTotais} minutos (${res.duracaoFormatada})`;
      dispPeriodo.textContent = `${res.horaInicioFormatada} às ${res.horaFimFormatada}`;
      dispImpacto.textContent = `${res.severidade.titulo} (${res.severidade.nivel})`;
      dispDescricaoAcao.textContent = res.severidade.descricao;

    } catch (err) {
      msgAlerta.textContent = err.message || 'Erro ao processar parada.';
      msgAlerta.classList.remove('hidden');
    }
  }

  // Eventos
  btnProcessar.addEventListener('click', processar);

  // Submissão ao pressionar Enter em qualquer input
  [inputDataIni, inputHoraIni, inputDataFim, inputHoraFim].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') processar();
    });
  });

  // Presets
  btnPresetFalha.addEventListener('click', () => {
    const hoje = formatarDataISO(new Date());
    inputDataIni.value = hoje;
    inputHoraIni.value = '08:00';
    inputDataFim.value = hoje;
    inputHoraFim.value = '17:30';
    processar();
  });

  btnPresetFca.addEventListener('click', () => {
    const hoje = formatarDataISO(new Date());
    inputDataIni.value = hoje;
    inputHoraIni.value = '08:00';
    inputDataFim.value = hoje;
    inputHoraFim.value = '09:15';
    processar();
  });

  btnPresetRotina.addEventListener('click', () => {
    const hoje = formatarDataISO(new Date());
    inputDataIni.value = hoje;
    inputHoraIni.value = '08:00';
    inputDataFim.value = hoje;
    inputHoraFim.value = '08:45';
    processar();
  });

  // Inicialização com valores padrão
  const hoje = formatarDataISO(new Date());
  inputDataIni.value = hoje;
  inputHoraIni.value = '08:00';
  inputDataFim.value = hoje;
  inputHoraFim.value = '17:30';
  processar();
});
