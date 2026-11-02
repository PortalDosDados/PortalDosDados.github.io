# 04 - Portal do Aluno & Integrações
[docs/portal-do-aluno.md] [assets/js/portal/*] [tests/portal-*.test.js]

## Contexto & Mecânica Pedagógica
- Aplicação client-side estilo arcade / autoavaliação formativa para cursos técnicos [docs/portal-do-aluno.md:3-5].
- Piloto ativo: Técnico em Informática (`informatica`) -> Lógica de Programação (`logica_programacao`) [docs/portal-do-aluno.md:6-10].
- Pontuação arcade: base de acertos, bônus de combos consecutivos e agilidade [tests/portal-aluno-engine.test.js].
- Humor contextualizado: faixas de proficiência (Juninho 0-49%, Júnior 50-69%, Pleno 70-89%, Sênior 90-100%) [docs/portal-do-aluno.md:13-17].

## Arquitetura de Módulos
- `data/portal-cursos.js`: Catálogo de cursos, matrizes de proficiência e turmas padrão [docs/portal-do-aluno.md:36].
- `data/questoes/*.js`: Bancos de questões pedagógicas [docs/portal-do-aluno.md:37].
- `assets/js/portal/portal-aluno-engine.js`: Motor puro desacoplado com cálculo de score, combos e estrelas [docs/portal-do-aluno.md:38].
- `assets/js/portal/portal-aluno-supabase.js`: Camada de persistência híbrida e autenticação [docs/portal-do-aluno.md:39].
- `assets/js/portal/portal-audio.js`: Sintetizador retrô nativo via Web Audio API [docs/portal-do-aluno.md:40].
- `assets/js/portal/portal-aluno-page.js`: Interface do aluno e trilhas (< 500 linhas) [docs/portal-do-aluno.md:41].
- `assets/js/portal/portal-professor-page.js`: Painel docente com KPIs e exportação CSV [docs/portal-do-aluno.md:42].

## Persistência & Resiliência
- [OBSERVADO] Persistência em nuvem via Supabase REST API direta; fallback offline em `localStorage` [docs/portal-do-aluno.md:31-32].
- [OBSERVADO] Variáveis modelo documentadas em `.env.example` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) [.env.example].
- [OBSERVADO] Sessão do aluno persistida em `localStorage`; autenticação docente em `sessionStorage` [docs/portal-do-aluno.md:23, 26].
- [OBSERVADO] Chave docente padrão: `prof2026` [docs/portal-do-aluno.md:25], [assets/js/portal/portal-aluno-supabase.js:32].
- [DIRETRIZ] NUNCA comitar credenciais do Supabase; usar `.env` local (ignorado) ou injeção em CI [.env.example] [.gitignore:44].
- [DIRETRIZ] Efeitos sonoros devem usar estritamente o sintetizador nativo em `portal-audio.js`; NUNCA introduzir arquivos pesados de áudio (.mp3, .wav) [docs/portal-do-aluno.md:33].
- [DIRETRIZ] O motor pedagógico (`portal-aluno-engine.js`) deve permanecer puro e testável via `node --test tests/portal-aluno-engine.test.js` [docs/portal-do-aluno.md:45].
