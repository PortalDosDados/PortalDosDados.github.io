# Diretrizes de Desenvolvimento com IA

Governança e padrões modulares para agentes de IA neste repositório.

## Regras Modulares
- Overview & Comandos: @.gemini/rules/00-overview.md
- Arquitetura & Diretórios: @.gemini/rules/01-architecture.md
- Padrões de Código & Restrições: @.gemini/rules/02-code-standards.md
- Testes & Quality Gate: @.gemini/rules/03-testing-and-quality.md
- Portal do Aluno & Integrações: @.gemini/rules/04-portal-and-integrations.md

## Checklist Rápido Pré-Entrega
1. `node scripts/build.js` (se alterou `src/`)
2. `npm test` (Quality Gate automatizado com 100% de aprovação)
3. Zero dependências externas e zero scripts/estilos inline
