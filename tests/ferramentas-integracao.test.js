const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT_DIR = path.resolve(__dirname, '..');

function createSimpleDOM(html) {
  const elements = {};
  
  const idRegex = /id=["']([^"']+)["']/g;
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    elements[id] = {
      id,
      textContent: '',
      value: '',
      className: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      listeners: {},
      addEventListener(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
      },
      dispatchEvent(event) {
        if (this.listeners[event.type]) {
          this.listeners[event.type].forEach(fn => fn(event));
        }
      },
      click() {
        this.dispatchEvent({ type: 'click', target: this });
      },
      setAttribute(name, val) { this[name] = val; },
      getAttribute(name) { return this[name] || null; },
      appendChild() {},
      removeChild() {},
      innerHTML: '',
    };
  }

  const documentListeners = {};
  const mockDocument = {
    getElementById(id) {
      return elements[id] || null;
    },
    documentElement: {
      classList: { add: () => {}, remove: () => {} },
      setAttribute: () => {},
      getAttribute: (attr) => attr === 'data-theme' ? 'dark' : null
    },
    addEventListener(event, fn) {
      if (!documentListeners[event]) documentListeners[event] = [];
      documentListeners[event].push(fn);
    },
    dispatchEvent(event) {
      if (documentListeners[event.type]) {
        documentListeners[event.type].forEach(fn => fn(event));
      }
    },
    createElement() {
      return {
        setAttribute() {},
        getAttribute() { return null; },
        style: {},
        classList: { add() {}, remove() {} },
        addEventListener() {},
        querySelector() { return null; },
        querySelectorAll() { return []; },
        appendChild() {},
        innerHTML: ''
      };
    }
  };

  return { mockDocument, elements, documentListeners };
}

describe('Testes de Integração e Funcionalidade Real das Ferramentas', () => {

  test('Calculadora de 52 Semanas: DOMContentLoaded, eventos e cálculos ISO 8601', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'ferramentas/calculadora-52-semanas.html'), 'utf8');
    const { mockDocument, elements, documentListeners } = createSimpleDOM(html);

    const context = {
      document: mockDocument,
      console,
      Date,
      Math,
      String,
      Number,
      setTimeout,
      clearTimeout,
      localStorage: { getItem: () => 'dark', setItem: () => {} },
      CustomEvent: function(type, opts) { this.type = type; this.detail = opts ? opts.detail : null; }
    };
    context.window = context;
    context.globalThis = context;

    vm.runInNewContext(fs.readFileSync(path.join(ROOT_DIR, 'assets/js/tools/calculadora-52-semanas.js'), 'utf8'), context);
    vm.runInNewContext(fs.readFileSync(path.join(ROOT_DIR, 'assets/js/tools/calculadora-52-semanas-page.js'), 'utf8'), context);

    documentListeners['DOMContentLoaded'].forEach(fn => fn());

    elements['btnHoje'].click();
    assert.match(elements['resSemana'].textContent, /^S\d{2}$/);
    assert.match(elements['resDiaAno'].textContent, /^Dia \d+/);
    assert.ok(elements['resDiaSemana'].textContent.length > 0);

    elements['btnInicioAno'].click();
    assert.equal(elements['resSemana'].textContent, 'S01');
    assert.equal(elements['resDiaAno'].textContent, 'Dia 1');
  });

  test('Calculadora de Paradas: Interatividade, presets e classificação de downtime', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'ferramentas/calculadora-paradas.html'), 'utf8');
    const { mockDocument, elements, documentListeners } = createSimpleDOM(html);

    const context = {
      document: mockDocument,
      console,
      Date,
      Math,
      String,
      Number,
      setTimeout,
      clearTimeout,
      localStorage: { getItem: () => 'dark', setItem: () => {} },
      CustomEvent: function(type, opts) { this.type = type; this.detail = opts ? opts.detail : null; }
    };
    context.window = context;
    context.globalThis = context;

    vm.runInNewContext(fs.readFileSync(path.join(ROOT_DIR, 'assets/js/tools/calculadora-paradas.js'), 'utf8'), context);
    vm.runInNewContext(fs.readFileSync(path.join(ROOT_DIR, 'assets/js/tools/calculadora-paradas-page.js'), 'utf8'), context);

    documentListeners['DOMContentLoaded'].forEach(fn => fn());

    elements['btnPresetFalha'].click();
    assert.equal(elements['textoStatus'].textContent, 'REALIZAR ANÁLISE DE FALHA');
    assert.equal(elements['dispHorasDecimais'].textContent, '9.50');

    elements['btnPresetRotina'].click();
    assert.equal(elements['textoStatus'].textContent, 'APONTAMENTO NO RELATÓRIO DE TURNO');
    assert.equal(elements['dispHorasDecimais'].textContent, '0.75');
  });

  test('Gerador de Curva S: Renderização de KPIs, tabela e gráfico Chart.js', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'ferramentas/gerador-curva-s.html'), 'utf8');
    const { mockDocument, elements, documentListeners } = createSimpleDOM(html);

    let chartCreated = false;
    class MockChart {
      constructor(ctx, config) {
        chartCreated = true;
        this.ctx = ctx;
        this.config = config;
      }
      destroy() {}
    }

    const context = {
      document: mockDocument,
      Chart: MockChart,
      console,
      Date,
      Math,
      String,
      Number,
      setTimeout,
      clearTimeout,
      localStorage: { getItem: () => 'dark', setItem: () => {} },
      CustomEvent: function(type, opts) { this.type = type; this.detail = opts ? opts.detail : null; }
    };
    context.window = context;
    context.globalThis = context;

    vm.runInNewContext(fs.readFileSync(path.join(ROOT_DIR, 'assets/js/tools/gerador-curva-s.js'), 'utf8'), context);
    vm.runInNewContext(fs.readFileSync(path.join(ROOT_DIR, 'assets/js/tools/gerador-curva-s-page.js'), 'utf8'), context);

    documentListeners['DOMContentLoaded'].forEach(fn => fn());

    assert.ok(chartCreated, 'Gráfico Chart.js deve ser instanciado');
    assert.ok(elements['kpiSpi'].textContent.length > 0, 'KPI SPI deve ser calculado');
    assert.ok(elements['kpiDesvio'].textContent.includes('%'), 'KPI Desvio deve exibir percentual');
  });

  test('Matriz FMEA Industrial: Interatividade, adição de linha, KPIs e gráficos Chart.js', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'ferramentas/matriz-fmea.html'), 'utf8');
    const { mockDocument, elements, documentListeners } = createSimpleDOM(html);

    let chartsCreated = 0;
    class MockChart {
      constructor(ctx, config) {
        chartsCreated++;
        this.ctx = ctx;
        this.config = config;
      }
      destroy() {}
    }

    const storageMap = {};
    const context = {
      document: mockDocument,
      Chart: MockChart,
      console,
      Date,
      Math,
      String,
      Number,
      setTimeout,
      clearTimeout,
      localStorage: {
        getItem: (k) => storageMap[k] || null,
        setItem: (k, v) => { storageMap[k] = String(v); }
      },
      CustomEvent: function(type, opts) { this.type = type; this.detail = opts ? opts.detail : null; }
    };
    context.window = context;
    context.globalThis = context;

    vm.runInNewContext(fs.readFileSync(path.join(ROOT_DIR, 'assets/js/tools/fmea.js'), 'utf8'), context);
    vm.runInNewContext(fs.readFileSync(path.join(ROOT_DIR, 'assets/js/tools/fmea-page.js'), 'utf8'), context);

    documentListeners['DOMContentLoaded'].forEach(fn => fn());

    assert.ok(chartsCreated >= 2, 'Gráficos Chart.js (Pareto e Criticidade) devem ser instanciados');
    assert.equal(elements['kpiTotalModos'].textContent, '5', 'Deve iniciar com 5 modos do exemplo industrial');
    assert.equal(elements['kpiModosCriticos'].textContent, '3', 'Deve identificar 3 modos críticos iniciais');
    assert.ok(elements['kpiReducaoGlobal'].textContent.includes('%'), 'KPI de redução global deve conter %');

    // Testar adição de nova linha
    elements['btnAdicionarLinha'].click();
    assert.equal(elements['kpiTotalModos'].textContent, '6', 'Total deve passar para 6 após adicionar modo');

    // Testar restauração de exemplo
    elements['btnRestaurarExemplo'].click();
    assert.equal(elements['kpiTotalModos'].textContent, '5', 'Deve voltar para 5 após restaurar exemplo');
  });

});
