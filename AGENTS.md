## Contexto do Projeto
- **Stack Principal:** HTML5 Semântico, Vanilla JavaScript moderno (client-side puro), Tailwind CSS (tema *Industrial Tech*, claro/escuro) e Chart.js. Tooling em Node.js (v20+) nativo, com **zero dependências externas** (`package.json` sem `node_modules`). Hospedado no GitHub Pages via GitHub Actions (`deploy.yml`).
- **Comando de Testes:** `npm test` (executa validação de build `node scripts/build.js --check` + testes `node --test tests/*.test.js`). Para rodar apenas testes: `node --test tests/*.test.js`.
- **Arquitetura:**
  - *Build Estático Componentizado:* O `index.html` na raiz é compilado a partir de `src/index.template.html` e fragmentos em `src/partials/` via `scripts/build.js`.
  - *Separação Rígida de Camadas (Ferramentas Industriais):* Funções de cálculo puro e determinísticas em `assets/js/tools/*.js` (100% desacopladas do DOM); controladores de interface e eventos em `assets/js/tools/*-page.js`; dados estruturados em `data/content.js`.
  - *Política Zero Inline:* Proibido uso de `<script>` ou `<style>` inline nos arquivos HTML (exceto JSON-LD para SEO).
- **Armadilhas Conhecidas:**
  - *Nunca editar `index.html` manualmente:* O arquivo é gerado por script. Alterações diretas falham no CI (`node scripts/build.js --check`) e são sobrescritas. Edite sempre em `src/partials/`, rode `node scripts/build.js` e inclua ambos os arquivos no commit.
  - *O `index.html` compilado deve subir no commit:* O GitHub Pages publica a raiz do repositório diretamente; o CI apenas valida a sincronização, não compila no deploy.
  - *Compatibilidade Dual (Browser & Node.js):* Módulos de cálculo em `assets/js/tools/*.js` devem manter exportação universal (`if (typeof module !== 'undefined' && module.exports)`) para rodarem tanto no browser quanto no `node --test`.
  - *Violação de Inline quebra o CI:* Tags `<script>` ou `<style>` em `ferramentas/` quebram o teste `tests/paginas-refs.test.js`.

## Código e Arquitetura
- Arquivos com menos de 500 linhas. Separe módulos por responsabilidade para caberem inteiros numa única leitura de contexto.
- Nomes específicos e únicos para funções e variáveis. Proibido usar termos genéricos como `data`, `handler`, `processor` ou `Manager` que poluem resultados de busca (`grep`).
- Mantenha os comentários que explicam o *porquê* (fórmulas de engenharia, normas técnicas, restrições ou motivos de bugs antigos) ao refatorar. Atualize se a lógica mudar; nunca apague o contexto.
- Proibido instalar pacotes externos (`npm install`). Antes de criar funções utilitárias do zero, verifique se já existe solução nativa na Web/Node.js ou implementada em `assets/js/`.

## Testes e Verificação (Oráculo)
- Toda nova ferramenta de cálculo ou correção de bug exige teste automatizado em `tests/` reproduzindo os cenários matemáticos e casos-limite.
- Proibido criar mocks ou dublês inventando assinaturas de métodos. Confira sempre o código real do módulo em `assets/js/` antes de escrever o teste.
- Priorize testes diretos nas funções puras de cálculo com entradas e saídas reais da engenharia.
- Proibido silenciar falhas nos testes de validação estrutural (`build.js --check` ou `paginas-refs.test.js`) alterando os scripts de teste para afrouxar as regras. Corrija o HTML/JS ofensor.

## Resiliência e Engenharia Defensiva
- Diferencie explicitamente input vazio (`null`, `undefined`, `""` ou `NaN`) de valor numérico `0`. Em cálculos técnicos e industriais, nunca converta campo em branco silenciosamente para `0`.
- Valide entradas numéricas nas fronteiras da interface (`*-page.js`) e nas funções puras: trate divisões por zero, valores negativos inválidos no domínio físico e limites de escala antes de renderizar gráficos no Chart.js.
- Caso o projeto faça chamadas externas (`fetch`), implemente timeouts, trate falhas degradando a interface com mensagem clara ao usuário e registre o erro técnico no console.
- Scripts de build e geração de arquivos (`scripts/`) devem ser idempotentes: rodar duas vezes seguidas deve produzir exatamente o mesmo artefato, sem duplicar trechos.

## Memória e Fluxo de Trabalho
- Faça commits pequenos e atômicos, sempre rodando `npm test` antes de finalizar.
- Documente decisões de arquitetura, referências de fórmulas e armadilhas novas em arquivos Markdown na pasta `docs/`. O que não vira arquivo evapora na compactação de contexto.
