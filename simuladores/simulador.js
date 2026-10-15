/*
  simulador.js: lógica do Simulador de Metrologia Teórica.
  As questões vêm de dados-metrologia.js (metrologiaQuizData).
*/
(function () {
  'use strict';

  var questions = typeof metrologiaQuizData !== 'undefined' ? metrologiaQuizData : [];
  var LETTERS = 'ABCDEFGH';

  var $ = function (id) { return document.getElementById(id); };
  var form = $('quiz-form');
  var area = $('area-perguntas');
  var nomeInput = $('nome-aluno');
  var resultSection = $('resultado');
  var pdfBtn = $('btn-gerar-pdf');

  // ---------- Tema (mesma preferência do portfólio) ----------
  var themeToggle = $('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      if (next === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // ---------- Renderização das questões (via DOM, sem innerHTML com dados) ----------
  function renderQuestions() {
    area.textContent = '';
    questions.forEach(function (q, qi) {
      var fs = document.createElement('fieldset');
      fs.className = 'card question';
      fs.id = 'q-' + qi;

      var legend = document.createElement('legend');
      legend.className = 'question__title';
      var num = document.createElement('span');
      num.className = 'question__num';
      num.textContent = String(qi + 1).padStart(2, '0');
      legend.appendChild(num);
      legend.appendChild(document.createTextNode(q.pergunta));
      fs.appendChild(legend);

      q.opcoes.forEach(function (opcao, oi) {
        var label = document.createElement('label');
        label.className = 'option';
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = 'q' + qi;
        input.value = String(oi);
        var letter = document.createElement('span');
        letter.className = 'option__letter';
        letter.textContent = LETTERS[oi];
        var text = document.createElement('span');
        text.textContent = opcao;
        label.append(input, letter, text);
        fs.appendChild(label);
      });

      area.appendChild(fs);
    });
    updateProgress();
  }

  function answerOf(qi) {
    var checked = form.querySelector('input[name="q' + qi + '"]:checked');
    return checked ? Number(checked.value) : null;
  }

  function updateProgress() {
    var answered = questions.filter(function (_, i) { return answerOf(i) !== null; }).length;
    $('progress-text').textContent = answered + ' de ' + questions.length + ' respondidas';
    $('progress-fill').style.width = (questions.length ? (answered / questions.length) * 100 : 0) + '%';
  }

  form.addEventListener('change', function (e) {
    if (e.target.type === 'radio') {
      e.target.closest('.question').classList.remove('question--missing');
      updateProgress();
    }
  });

  nomeInput.addEventListener('input', function () {
    $('nome-erro').hidden = true;
    nomeInput.removeAttribute('aria-invalid');
  });

  // ---------- Correção ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nome = nomeInput.value.trim();
    if (!nome) {
      $('nome-erro').hidden = false;
      nomeInput.setAttribute('aria-invalid', 'true');
      nomeInput.focus();
      return;
    }

    var pending = [];
    questions.forEach(function (_, i) {
      var missing = answerOf(i) === null;
      $('q-' + i).classList.toggle('question--missing', missing);
      if (missing) pending.push(i + 1);
    });

    var pendErr = $('pendentes-erro');
    if (pending.length) {
      pendErr.textContent = 'Responda todas as questões antes de finalizar. Faltam: ' + pending.join(', ') + '.';
      pendErr.hidden = false;
      $('q-' + (pending[0] - 1)).scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    pendErr.hidden = true;

    showResult(nome);
  });

  function showResult(nome) {
    var acertos = 0;
    var review = $('review-list');
    review.textContent = '';

    questions.forEach(function (q, i) {
      var ans = answerOf(i);
      var ok = ans === q.respostaCorreta;
      if (ok) acertos++;

      var li = document.createElement('li');
      li.className = 'review__item ' + (ok ? 'review__item--ok' : 'review__item--wrong');

      var title = document.createElement('p');
      title.className = 'review__q';
      title.textContent = (i + 1) + '. ' + q.pergunta;

      var status = document.createElement('p');
      status.className = 'review__status';
      status.textContent = ok
        ? '✔ Correta: ' + LETTERS[ans] + ') ' + q.opcoes[ans]
        : '✘ Sua resposta: ' + LETTERS[ans] + ') ' + q.opcoes[ans] + '  |  Correta: ' + LETTERS[q.respostaCorreta] + ') ' + q.opcoes[q.respostaCorreta];

      li.append(title, status);

      if (q.explicacao) {
        var exp = document.createElement('p');
        exp.className = 'review__exp';
        exp.textContent = q.explicacao;
        li.appendChild(exp);
      }
      review.appendChild(li);
    });

    var total = questions.length;
    var pct = total ? (acertos / total) * 100 : 0;

    $('display-nome').textContent = nome;
    $('display-data').textContent = new Date().toLocaleDateString('pt-BR');
    $('display-nota').textContent = acertos + ' de ' + total + ' acertos';
    $('display-pct').textContent = pct.toFixed(0) + '%';

    var comment = $('perf-comment');
    comment.className = 'boletim__comment';
    if (pct >= 80) {
      comment.textContent = 'Excelente desempenho! Conceitos consolidados.';
      comment.classList.add('is-good');
    } else if (pct >= 50) {
      comment.textContent = 'Bom desempenho. Revise as questões erradas e a apostila para consolidar os conceitos básicos.';
      comment.classList.add('is-mid');
    } else {
      comment.textContent = 'Recomendamos reler os slides teóricos, revisar as explicações abaixo e tentar novamente.';
      comment.classList.add('is-low');
    }

    form.hidden = true;
    resultSection.hidden = false;
    pdfBtn.disabled = false;
    pdfBtn.textContent = 'Baixar boletim em PDF';
    resultSection.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- PDF ----------
  pdfBtn.addEventListener('click', function () {
    if (typeof html2pdf === 'undefined') {
      alert('Não foi possível carregar o gerador de PDF. Verifique sua conexão e tente novamente.');
      return;
    }
    var boletim = $('boletim');
    var nome = nomeInput.value.trim().replace(/\s+/g, '_').replace(/[^\w\-À-ÿ]/g, '');

    pdfBtn.disabled = true;
    pdfBtn.textContent = 'Gerando PDF...';
    boletim.classList.add('pdf-mode'); // força layout claro para impressão

    html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename: 'Boletim_Metrologia_' + (nome || 'aluno') + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: '.review__item' },
      })
      .from(boletim)
      .save()
      .then(function () {
        boletim.classList.remove('pdf-mode');
        pdfBtn.disabled = false;
        pdfBtn.textContent = 'PDF baixado ✔';
      })
      .catch(function (err) {
        console.error('Erro ao gerar PDF:', err);
        boletim.classList.remove('pdf-mode');
        pdfBtn.disabled = false;
        pdfBtn.textContent = 'Tentar novamente';
      });
  });

  // ---------- Refazer ----------
  $('btn-refazer').addEventListener('click', function () {
    form.reset();
    nomeInput.value = $('display-nome').textContent; // mantém o nome
    resultSection.hidden = true;
    form.hidden = false;
    renderQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  renderQuestions();
})();
