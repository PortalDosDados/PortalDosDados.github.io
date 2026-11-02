# 03 - Testes & Quality Gate
[package.json] [AGENTS.md] [.github/workflows/deploy.yml] [tests/*.test.js]

## Estrutura dos Testes
- Executor nativo: `node:test` e asserções via `node:assert/strict` [AGENTS.md:3], [tests/*.test.js].
- Validação no CI: Job `test` executa `node scripts/build.js --check` e `node --test tests/*.test.js` [deploy.yml:20-37].
- Execução local consolidada: `npm test` [package.json:9].

## Regras de Testes (Oráculo)
- [DIRETRIZ] Toda nova ferramenta de cálculo ou correção de bug exige teste automatizado correspondente em `tests/` reproduzindo cenários reais e casos-limite [AGENTS.md:21].
- [DIRETRIZ] Priorizar testes diretos nas funções puras de cálculo com dados reais de engenharia [AGENTS.md:23].
- [DIRETRIZ] NUNCA criar mocks ou dublês inventando assinaturas de métodos; verificar sempre o código real em `assets/js/` [AGENTS.md:22].
- [DIRETRIZ] NUNCA silenciar falhas nos testes de validação estrutural (`build.js --check` ou `paginas-refs.test.js`) alterando os scripts de teste para afrouxar regras; corrija o arquivo ofensor [AGENTS.md:24].

## Checklist Obrigatório para Agentes de IA
Antes de reportar qualquer tarefa como concluída, o agente DEVE cumprir a seguinte lista de verificação:
1. [ ] Se modificou `src/` ou `src/partials/`, rodou `node scripts/build.js` para regenerar `index.html`?
2. [ ] Se gerou `index.html`, incluiu tanto `src/` quanto `index.html` na entrega?
3. [ ] Executou `npm test` e obteve 100% de sucesso (zero falhas e zero cancelamentos)?
4. [ ] Garantiu que nenhum arquivo contém `<script>` ou `<style>` inline (exceto JSON-LD)?
5. [ ] Manteve os arquivos criados ou modificados com menos de 500 linhas?
6. [ ] Nenhuma dependência externa ou `npm install` foi adicionada?
7. [ ] Não modificou nenhum arquivo fora do escopo da solicitação do usuário?
8. [ ] Comentários explicativos de fórmulas ou normas técnicas foram rigorosamente preservados?
