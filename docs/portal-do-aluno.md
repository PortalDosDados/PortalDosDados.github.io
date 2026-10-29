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

## 4. Persistência e Resiliência
- **Supabase REST API:** Para sincronização em nuvem e ranking coletivo da turma.
- **LocalStorage Fallback:** Funcionamento 100% offline se a rede falhar ou se o Supabase não estiver configurado.
- **Sons Arcade:** Gerados dinamicamente via sintetizador nativo `Web Audio API` (zero arquivos de áudio pesados).

## 5. Estrutura de Arquivos
- `data/portal-cursos.js`: Catálogo de cursos, UCs e mensagens de proficiência com humor.
- `data/questoes/informatica-logica.js`: Banco de 15 questões pedagógicas com dicas e explicações.
- `assets/js/tools/portal-aluno-engine.js`: Motor puro com cálculos de score, combo, agilidade, estrelas e proficiência.
- `assets/js/tools/portal-aluno-supabase.js`: Camada de persistência (Supabase + LocalStorage).
- `assets/js/tools/portal-aluno-page.js`: Controlador da interface do aluno e sintetizador de som.
- `assets/js/tools/portal-professor-page.js`: Painel docente com KPIs, busca e exportação CSV.
- `ferramentas/portal-do-aluno.html`: Interface do aluno no tema Industrial Tech.
- `ferramentas/portal-professor.html`: Painel do professor.
- `tests/portal-aluno-engine.test.js` & `tests/portal-questoes.test.js`: Testes automatizados com `node --test`.
