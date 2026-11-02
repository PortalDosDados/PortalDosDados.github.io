# 01 - Arquitetura & Estrutura de Diretórios
[AGENTS.md] [scripts/build.js] [tests/paginas-refs.test.js]

## Mapa de Responsabilidades
- `src/index.template.html`: Esqueleto principal do portfólio com diretivas `@include` [scripts/build.js:17].
- `src/partials/`: Fragmentos HTML modulares (hero, projetos, ferramentas, etc.) [README.md:83-84].
- `scripts/build.js`: Compilador nativo que gera `index.html` na raiz [scripts/build.js:1-62].
- `index.html`: Artefato gerado; commit obrigatório junto com `src/` [AGENTS.md:9-10].
- `ferramentas/*.html`: Páginas web das calculadoras industriais client-side [README.md:52-56].
- `portal/*.html`: Páginas do Portal do Aluno (`index.html`) e Painel Docente (`professor.html`) [README.md:57-59].
- `assets/js/tools/`: Módulos de cálculo puro (`fmea.js`, `calculadora-*.js`) [AGENTS.md:6].
- `assets/js/tools/*-page.js`: Controladores de interface e manipulação do DOM [AGENTS.md:6].
- `assets/js/portal/`: Lógica do portal (`portal-aluno-engine.js`, `portal-aluno-page.js`, etc.) [docs/portal-do-aluno.md:38-42].
- `data/`: Bases de dados JS desacopladas (`content.js`, `portal-cursos.js`, `questoes/`) [README.md:47-51].
- `tests/`: Bateria de testes automatizados com `node:test` [README.md:60-71].

## Fronteiras de Acoplamento
- [DIRETRIZ] Funções de cálculo puro em `assets/js/tools/*.js` e `portal-aluno-engine.js` devem ser 100% desacopladas do DOM (sem referências a `window`, `document` ou eventos) [AGENTS.md:6].
- [DIRETRIZ] Toda lógica de interface, listeners e binds deve residir em controladores `*-page.js` [AGENTS.md:6].
- [DIRETRIZ] Módulos de domínio devem manter compatibilidade dual (Browser e Node.js) utilizando o padrão de exportação universal UMD:
  ```javascript
  (function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.MeuModulo = factory();
  })(typeof globalThis !== 'undefined' ? globalThis : this, function () { ... });
  ```
  [AGENTS.md:11] [assets/js/tools/calculadora-52-semanas.js:12-18]

## Regras de Arquitetura
- [DIRETRIZ] SEMPRE editar fragmentos em `src/partials/` e executar `node scripts/build.js` [AGENTS.md:9].
- [DIRETRIZ] SEMPRE incluir no commit tanto o arquivo de origem em `src/` quanto o `index.html` gerado [AGENTS.md:10].
- [DIRETRIZ] SEMPRE garantir que scripts e estilos locais referenciados existam no disco físico [tests/paginas-refs.test.js:18-26].
- [DIRETRIZ] NUNCA editar `index.html` diretamente na raiz [AGENTS.md:9].
