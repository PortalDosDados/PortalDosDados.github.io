# 02 - Padrões de Código & Restrições
[AGENTS.md] [.agents/rules/git-commits.md] [tests/paginas-refs.test.js]

## Regras de Estilo & Escrita
- [DIRETRIZ] SEMPRE manter arquivos com menos de 500 linhas. Módulos devem ser divididos por responsabilidade para leitura integral de contexto [AGENTS.md:15].
- [DIRETRIZ] SEMPRE utilizar nomes específicos e únicos para funções e variáveis [AGENTS.md:16].
- [DIRETRIZ] NUNCA utilizar termos genéricos como `data`, `handler`, `processor` ou `Manager` que poluem buscas via `grep` [AGENTS.md:16].
- [DIRETRIZ] SEMPRE preservar comentários que explicam o *porquê* (fórmulas de engenharia, normas técnicas, restrições e bugs antigos) [AGENTS.md:17].

## Política Zero Inline
- [DIRETRIZ] NUNCA utilizar `<script>` ou `<style>` inline em nenhum arquivo HTML (`ferramentas/`, `portal/`, `src/`) [AGENTS.md:7], [tests/paginas-refs.test.js:28-34].
- [EXCEÇÃO OBSERVADA] Apenas `<script type="application/ld+json">` (metadados estruturados de SEO) é permitido inline [tests/paginas-refs.test.js:30].

## Engenharia Defensiva & Resiliência
- [DIRETRIZ] SEMPRE diferenciar explicitamente entrada vazia (`null`, `undefined`, `""`, `NaN`) do valor numérico `0` [AGENTS.md:27].
- [DIRETRIZ] NUNCA converter campo em branco silenciosamente para `0` em cálculos técnicos e industriais [AGENTS.md:27].
- [DIRETRIZ] SEMPRE validar entradas numéricas nas fronteiras de interface (`*-page.js`) e nas funções puras (divisão por zero, valores negativos ou fora da escala física) [AGENTS.md:28].
- [DIRETRIZ] Chamadas assíncronas externas (`fetch`) devem implementar timeout, degradação graciosa com aviso na UI e log de erro no console [AGENTS.md:29].
- [DIRETRIZ] Scripts utilitários em `scripts/` devem ser estritamente idempotentes [AGENTS.md:30].

## Segurança & Git
- [DIRETRIZ] NUNCA ler, expor ou comitar segredos, arquivos `.env*`, `.pem` ou `.key` [.gitignore:43-48].
- [DIRETRIZ] SEMPRE escrever mensagens de commit em português (`pt-BR`) no padrão Conventional Commits (`feat:`, `fix:`, `style:`, `docs:`, `refactor:`) [.agents/rules/git-commits.md:3-9].
- [DIRETRIZ] Fazer commits pequenos, atômicos e sempre antecedidos de `npm test` [AGENTS.md:33].
