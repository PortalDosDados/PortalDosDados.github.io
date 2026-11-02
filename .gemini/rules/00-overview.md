# 00 - Visão Geral & Comandos
[package.json] [AGENTS.md] [README.md] [.github/workflows/deploy.yml]

## Escopo da Aplicação
- Portfólio profissional de Dione Nascimento (Engenharia & Dados Industriais) [README.md:1-5].
- Ferramentas web interativas client-side para chão de fábrica e manutenção [README.md:52-56].
- Portal do Aluno com trilha técnica gamificada e painel de monitoramento docente [README.md:57-59].

## Stack & Versões Comprovadas
- Runtime: Node.js 20 (`v20+`) [AGENTS.md:2], [.github/workflows/deploy.yml:30].
- Dependências Externas: Zero pacotes via npm (`node_modules` inexistente e proibido) [AGENTS.md:2, 18], [package.json].
- Frontend: HTML5 Semântico, Vanilla JavaScript moderno (client-side puro) [AGENTS.md:2].
- Estilos & UI: Tailwind CSS (Industrial Tech via CDN) e Chart.js (v4 via CDN) [AGENTS.md:2], [README.md:108].
- Áudio: Web Audio API nativa do browser em `portal-audio.js` (sem arquivos de áudio) [docs/portal-do-aluno.md:33].
- Testes: Framework nativo `node:test` e `node:assert/strict` [AGENTS.md:3], [package.json:9].

## Comandos Fundamentais
- Instalação: `NÃO APLICÁVEL` — Proibido executar `npm install` [AGENTS.md:18].
- Execução Local [README.md:126-133]:
  - Python: `python -m http.server 8000`
  - Node.js: `npx serve .`
- Build / Geração:
  - Compilar `index.html`: `node scripts/build.js` [package.json:7].
  - Validar sincronia de build: `node scripts/build.js --check` [package.json:8].
- Testes & Quality Gate [package.json:9], [AGENTS.md:3]:
  - Suíte completa: `npm test` (roda `build.js --check` + testes).
  - Apenas testes: `node --test tests/*.test.js`.
- Linter / Formatação: `NÃO IDENTIFICADO` formalmente; validação feita via `npm test` [AGENTS.md:24].

## Regras Fundamentais da IA
- [DIRETRIZ] SEMPRE rodar `npm test` antes de considerar qualquer alteração concluída [AGENTS.md:33].
- [DIRETRIZ] NUNCA adicionar dependências em `package.json` ou criar pasta `node_modules` [AGENTS.md:18].
- [DIRETRIZ] NUNCA editar `index.html` diretamente; editar em `src/partials/` e rodar build [AGENTS.md:9].
