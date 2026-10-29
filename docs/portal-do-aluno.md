# Arquitetura e Decisões: Portal do Aluno (Trilha Técnica Gamificada)

## 1. Visão Geral
Aplicação web client-side no estilo Duolingo / Arcade para autoavaliação e fixação de conceitos dos estudantes dos cursos técnicos da instituição.

## 2. Piloto Ativo
- **Curso:** Técnico em Informática (`informatica`)
- **Unidade Curricular (Nó Ativo):** Lógica de Programação (`logica_programacao`)
- **Checkpoints Futuros (Bloqueados):** Banco de Dados, Redes de Computadores, Programação Orientada a Objetos, Desenvolvimento Web.

## 3. Mecânica Pedagógica (Sem Bloqueio Punitivo)
- O aluno nunca é impedido de avançar ou reprovado.
- Foco em **Autoavaliação Formativa**: o estudante recebe sua pontuação arcade (*High Score*), estrelas (1 a 4) e um diagnóstico com humor contextualizado:
  - **0% a 49%:** *Juninho* (☕) — "Estude mais! O café ainda não fez efeito ou faltou fechar um ponto e vírgula."
  - **50% a 69%:** *Júnior* (🐛) — "Está no caminho! Já resolve uns bugs sem travar tudo, mas ainda consulta o Stack Overflow o tempo todo."
  - **70% a 89%:** *Pleno* (🚀) — "Você sabe o que está fazendo! Código limpo, roda liso e não quebra em produção na sexta-feira."
  - **90% a 100%:** *Sênior* (🧙‍♂️) — "Você deve ter hackeado o sistema! Nível Matrix ativado. O compilador te respeita."

## 4. Estrutura de Autenticação e Sessões
- **Acesso do Aluno:**
  - Identificação por **Turma** (ex.: Turma A, B, C, EAD ou personalizada), **Matrícula** e **Nome/Apelido**.
  - Seletor de 5 Avatares retrô e controle de privacidade para exibição no ranking da turma.
  - Sessão persistida em `localStorage` com restauração automática e botão de Logout / Troca de Usuário.
- **Acesso do Professor (Painel Docente):**
  - Gate de proteção com **Chave de Acesso Docente** (padrão institucional: `prof2026`).
  - Sessão mantida em `sessionStorage` com botão de encerramento no Navbar.
  - Filtro interativo por turma e busca em tempo real.
  - Exportação de relatórios em formato CSV (Excel) incluindo a coluna de Turma.

## 5. Persistência e Resiliência
- **Supabase REST API:** Para sincronização em nuvem e ranking coletivo da turma.
- **LocalStorage Fallback:** Funcionamento 100% offline se a rede falhar ou se o Supabase não estiver configurado.
- **Sons Arcade:** Gerados dinamicamente via sintetizador nativo `Web Audio API` em `portal-audio.js` (zero arquivos de áudio pesados).

## 6. Estrutura de Arquivos
- `data/portal-cursos.js`: Catálogo de cursos, UCs, matrizes de proficiência com humor e turmas padrão.
- `data/questoes/informatica-logica.js`: Banco de 15 questões pedagógicas com dicas e explicações.
- `assets/js/portal/portal-aluno-engine.js`: Motor puro com cálculos de score, combo, agilidade, estrelas e proficiência.
- `assets/js/portal/portal-aluno-supabase.js`: Camada de persistência (Supabase + LocalStorage) e validação de chaves.
- `assets/js/portal/portal-audio.js`: Sintetizador nativo Web Audio API para efeitos retrô.
- `assets/js/portal/portal-aluno-page.js`: Controlador da interface do aluno e gerenciamento de trilhas (< 500 linhas).
- `assets/js/portal/portal-professor-page.js`: Painel docente com login por chave, KPIs, filtro por turma e exportação CSV.
- `portal/index.html`: Interface do aluno no tema Industrial Tech (URL: `/portal/`).
- `portal/professor.html`: Painel protegido do professor.
- `tests/portal-aluno-engine.test.js`, `tests/portal-auth.test.js`, `tests/portal-pages.test.js` & `tests/portal-questoes.test.js`: Testes automatizados com `node --test`.
