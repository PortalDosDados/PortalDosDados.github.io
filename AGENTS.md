## Código e Arquitetura
- Arquivos com menos de 500 linhas. Separe classes e módulos por responsabilidade para caberem inteiros numa única leitura de contexto.
- Nomes específicos e únicos para funções, classes e variáveis. Proibido usar termos genéricos como data, handler, processor ou Manager que poluem resultados de busca (grep).
- Mantenha os comentários que explicam o porquê (decisões de negócio, restrições ou motivos de bugs antigos) ao refatorar. Atualize o comentário se a lógica mudar; nunca apague o contexto histórico.
- Antes de implementar algoritmos complexos do zero, pesquise se já existe biblioteca ou modelo consolidado no projeto ou no ecossistema.

## Testes e Verificação (Oráculo)
- Toda correção de bug exige um teste automatizado que reproduza o erro antes da solução.
- Testes rodam de forma isolada com um único comando: pytest (ou npm test / bundle exec rspec).
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