/** Lógica de interface da página ferramentas/calculadora-52-semanas.html (extraída do HTML). */
document.addEventListener('DOMContentLoaded', () => {
  // 2. Elementos da Calculadora
  const inputData = document.getElementById('inputData');
  const resSemana = document.getElementById('resSemana');
  const subSemana = document.getElementById('subSemana');
  const resDiaAno = document.getElementById('resDiaAno');
  const subDiaAno = document.getElementById('subDiaAno');
  const resDiaSemana = document.getElementById('resDiaSemana');
  const subDiaSemana = document.getElementById('subDiaSemana');
  const txtPercentualAno = document.getElementById('txtPercentualAno');
  const barPercentualAno = document.getElementById('barPercentualAno');
  const txtDataFormatada = document.getElementById('txtDataFormatada');
  const txtAnoIso = document.getElementById('txtAnoIso');
  const txtAnoBissexto = document.getElementById('txtAnoBissexto');
  const msgErro = document.getElementById('msgErro');

  // Atalhos
  const btnHoje = document.getElementById('btnHoje');
  const btnInicioAno = document.getElementById('btnInicioAno');
  const btnMeioAno = document.getElementById('btnMeioAno');
  const btnFimAno = document.getElementById('btnFimAno');

  function atualizar(dataValor) {
    try {
      msgErro.classList.add('hidden');
      const resultado = Calculadora52Semanas.calcular(dataValor);

      // Atualiza inputs e labels
      inputData.value = resultado.dataIsoInput;
      resSemana.textContent = resultado.semanaFormatada;
      subSemana.textContent = `Ano ISO: ${resultado.anoIso}`;

      resDiaAno.textContent = `Dia ${resultado.diaDoAno}`;
      subDiaAno.textContent = `de ${resultado.totalDiasAno} dias ${resultado.anoBissexto ? '(Bissexto)' : ''}`;

      resDiaSemana.textContent = resultado.diaSemanaNome;
      subDiaSemana.textContent = resultado.diaSemanaNumero === 5 || resultado.diaSemanaNumero === 6 ? 'Fim de semana' : 'Dia útil industrial';

      txtPercentualAno.textContent = `${resultado.percentualAno}%`;
      barPercentualAno.style.width = `${Math.min(resultado.percentualAno, 100)}%`;

      txtDataFormatada.textContent = resultado.dataFormatada;
      txtAnoIso.textContent = `${resultado.anoIso} (Calendário: ${resultado.data.getFullYear()})`;
      txtAnoBissexto.textContent = resultado.anoBissexto ? 'Sim (366 dias)' : 'Não (365 dias)';
    } catch (err) {
      msgErro.textContent = err.message || 'Erro ao processar data.';
      msgErro.classList.remove('hidden');
    }
  }

  // Eventos
  inputData.addEventListener('change', (e) => atualizar(e.target.value));
  inputData.addEventListener('input', (e) => {
    if (e.target.value) atualizar(e.target.value);
  });

  btnHoje.addEventListener('click', () => {
    const hoje = new Date();
    atualizar(hoje);
  });

  btnInicioAno.addEventListener('click', () => {
    const ano = inputData.value ? new Date(inputData.value).getFullYear() : new Date().getFullYear();
    atualizar(`${ano}-01-01`);
  });

  btnMeioAno.addEventListener('click', () => {
    const ano = inputData.value ? new Date(inputData.value).getFullYear() : new Date().getFullYear();
    atualizar(`${ano}-07-01`);
  });

  btnFimAno.addEventListener('click', () => {
    const ano = inputData.value ? new Date(inputData.value).getFullYear() : new Date().getFullYear();
    atualizar(`${ano}-12-31`);
  });

  // Inicializa com a data de hoje
  atualizar(new Date());
});
