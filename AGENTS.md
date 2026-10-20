## Contexto do Projeto
- **Stack Principal:** HTML5 Semântico, Vanilla JavaScript moderno (módulos client-side puros), Tailwind CSS (tema *Industrial Tech* customizado, suporte claro/escuro) e Chart.js. Tooling em Node.js (v20+) nativo, com zero dependências externas (`package.json` sem `node_modules`). Hospedado no GitHub Pages via GitHub Actions (`deploy.yml`).
- **Comando de Testes:** `npm test` (executa `node scripts/build.js --check && node --test tests/*.test.js`) ou isolado com `node --test tests/*.test.js`.
- **Arquitetura:**
  - *Build Estático Componentizado:* O `index.html` na raiz é gerado automaticamente a partir de `src/index.template.html` e fragmentos em `src/partials/` via `scripts/build.js`.
  - *Separação Rígida de Camadas (Ferramentas Industriais):* Funções de cálculo puro e determinísticas em `assets/js/tools/*.js` (desacopladas do DOM e universais para Node.js e browser); controladores de interface e eventos em `assets/js/tools/*-page.js`; dados estruturados em `data/content.js`.
  - *Política Zero Inline:* Proibido uso de `<script>` ou `<style>` inline nas páginas HTML (exceto JSON-LD estruturado para SEO).
- **Armadilhas Conhecidas (Atualizar continuamente):**
  - *Nunca editar index.html manualmente:* O arquivo é gerado por script. Qualquer alteração direta falha no CI (`node scripts/build.js --check`) e será sobrescrita. Sempre edite em `src/partials/`, execute `node scripts/build.js` e inclua ambos no commit.
  - *O index.html compilado deve subir no commit:* O GitHub Pages publica diretamente a raiz do repositório; o CI apenas valida a sincronização com `src/`, não compilando o artefato no deploy.
  - *Compatibilidade Dual (Browser & Node.js):* Os módulos de lógica em `assets/js/tools/` devem manter exportação compatível com o navegador e o executor nativo do Node.js (`if (typeof module !== 'undefined' && module.exports)`).
  - *Regra de Ausência de Inline:* Incluir tags `<script>` ou `<style>` diretamente nos arquivos HTML em `ferramentas/` quebra a suíte `tests/paginas-refs.test.js`.

## Código e Arquitetura
- Arquivos com menos de 500 linhas. Separe classes e módulos por responsabilidade para caberem inteiros numa única leitura de contexto.
- Nomes específicos e únicos para funções, classes e variáveis. Proibido usar termos genéricos como data, handler, processor ou Manager que poluem resultados de busca (grep).
- Mantenha os comentários que explicam o porquê (decisões de negócio, restrições ou motivos de bugs antigos) ao refatorar. Atualize o comentário se a lógica mudar; nunca apague o contexto histórico.
- Antes de implementar algoritmos complexos do zero, pesquise se já existe biblioteca ou modelo consolidado no projeto ou no ecossistema.

## Testes e Verificação (Oráculo)
- Toda correção de bug exige um teste automatizado que reproduza o erro antes da solução.
- Testes rodam de forma isolada com um único comando: npm test (ou node --test tests/*.test.js).
- Proibido criar mocks ou dublês para APIs ou métodos sem antes ler o código-fonte da biblioteca instalada para confirmar que a assinatura existe de fato.
- Priorize testes de integração com estruturas de dados reais. Nunca certifique sucesso baseando-se apenas em dublês escritos na mesma sessão.
- Proibido silenciar alertas de segurança, linters ou testes falhando adicionando exceções na configuração. Corrija a causa raiz.

## Resiliência e Engenharia Defensiva
- Em chamadas a serviços externos, implemente limites de tempo (timeouts), limites de tentativas (retries) e disjuntores (circuit breakers).
- Quando uma chamada externa falhar, degrade com elegância em vez de interromper o aplicativo, mas nunca engula o erro em silêncio: registre o detalhe técnico no log.
- Diferencie explicitamente dado ausente (null/nil) de valor 0. Nunca assuma zero quando uma fonte externa omitir um campo.
- Operações críticas e rotinas de coleta/processamento devem ser idempotentes (rodar duas vezes seguidas não pode duplicar dados nem corromper o estado).

## Memória e Fluxo de Trabalho
- Faça commits pequenos e atômicos, mantendo a suíte de testes sempre verde.
- Documente decisões de arquitetura, alternativas descartadas e armadilhas do domínio em arquivos Markdown na pasta docs/. O que não vira arquivo evapora na compactação de contexto.
