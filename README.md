# Dione Nascimento · Engenharia & Dados Industriais

Portfólio profissional de **Dione Nascimento**, especialista em Dados Industriais, Automação e Engenharia de Confiabilidade com 15 anos de atuação no chão de fábrica e setor siderúrgico.

🌐 **Site no ar:** [https://portaldosdados.github.io](https://portaldosdados.github.io)

---

## 🎯 Sobre o Projeto

Este repositório contém o portfólio profissional desenvolvido por Dione Nascimento. A interface foi construída seguindo a estética **Industrial Tech / Blueprint**, com alto contraste, telemetria operacional, cards estruturados de estudos de caso (Problema → Solução → Resultado) e ferramentas práticas para a indústria.

---

## 📂 Estrutura de Pastas e Arquivos

```text
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI/CD: Quality Gate (testes) e deploy automatizado no Pages
├── assets/
│   ├── css/
│   │   └── main.css             # Estilos compartilhados e temas base
│   ├── cv/
│   │   └── Dione_Nascimento_CV.pdf # Currículo profissional para download (sanitizado)
│   ├── img/
│   │   ├── EU.jpg               # Foto profissional de perfil
│   │   ├── favicon.svg          # Favicon vetorial com monograma DN
│   │   └── videos/              # Capas e miniaturas de aulas práticas do YouTube
│   └── js/
│       ├── app.js               # Lógica interativa: tema, filtros, carrossel e lazy player
│       └── tools/               # Módulos matemáticos puros das ferramentas industriais
│           ├── calculadora-52-semanas.js
│           ├── calculadora-paradas.js
│           ├── gerador-curva-s.js
│           ├── series-temporais.js
│           └── dados-cotacoes.js
├── data/
│   └── content.js               # Base de dados estruturada de projetos e experiências
├── ferramentas/                 # Aplicações Web Industriais Interativas (Client-side)
│   ├── calculadora-52-semanas.html # Calculadora de 52 Semanas (ISO 8601)
│   ├── calculadora-paradas.html    # Controle de Paradas e Downtime Industrial
│   ├── gerador-curva-s.html        # Curva S & Tendência (EVM Industrial)
│   └── series-temporais.html       # Séries Temporais Financeiras com Médias Móveis
├── tests/                       # Bateria de testes automatizados com node:test
│   ├── content.test.js
│   ├── calculadora-52-semanas.test.js
│   ├── calculadora-paradas.test.js
│   ├── gerador-curva-s.test.js
│   ├── series-temporais.test.js
│   └── ferramentas-pages.test.js
├── .gitattributes               # Normalização de quebras de linha
├── .gitignore                   # Exclusão de arquivos de SO, IDE e temporários
├── .nojekyll                    # Instrução para o GitHub Pages ignorar o Jekyll
├── 404.html                     # Página 404 customizada
├── AGENTS.md                    # Diretrizes e padrões de commit para agentes e colaboradores
├── index.html                   # Página principal (Layout Industrial Tech com Tailwind)
├── LICENSE                      # Licença oficial MIT
├── robots.txt                   # Diretrizes para indexadores de busca
├── sitemap.xml                  # Mapa do site para SEO
└── README.md                    # Documentação do repositório
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend & Layout:** HTML5 semântico, Tailwind CSS com tema *Industrial Tech* customizado.
- **Tipografia & Ícones:** Inter, JetBrains Mono e Google Material Symbols Outlined.
- **Integrações de Dados & TO:** Power BI (DAX), Python (Pandas/Streamlit), SQL (PostgreSQL/MySQL), Power Apps, Power Automate, Pentaho (PDI), Google Apps Script, SAP, MES e SGI.
- **Hospedagem & CI/CD:** GitHub Pages automatizado via GitHub Actions (`.github/workflows/deploy.yml`).

---

## 🚀 Como Executar Localmente

Como se trata de uma aplicação estática moderna, não há necessidade de etapas pesadas de build ou Node modules:

1. Clone o repositório:
   ```bash
   git clone https://github.com/PortalDosDados/PortalDosDados.github.io.git
   cd PortalDosDados.github.io
   ```

2. Inicie um servidor HTTP local simples:
   ```bash
   # Com Python:
   python -m http.server 8000

   # Ou com Node.js (se tiver npx):
   npx serve .
   ```

3. Acesse no navegador:
   `http://localhost:8000`

---

## 🧪 Testes Automatizados & Qualidade

O projeto adota o executor nativo de testes do Node.js (`node:test`), sem necessidade de instalar dependências pesadas:

```bash
# Executa toda a bateria de testes unitários:
node --test tests/*.test.js
```

Os testes cobrem:
- **`tests/content.test.js`**: Valida a consistência de categorias, projetos, atributos e links da base de dados do portfólio.

---

## 🔄 Deploy e CI/CD

O deploy é protegido por **Quality Gate automatizado**:
- Qualquer alteração enviada via `git push origin main` ou `Pull Request` dispara o workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
- A pipeline primeiro executa a bateria de testes automatizados. O deploy no GitHub Pages só ocorre se todos os testes forem aprovados com sucesso.

---

## 📜 Licença

Distribuído sob a licença **MIT**. Consulte [`LICENSE`](LICENSE) para mais informações.

---

## 📬 Contato Profissional

- **E-mail:** [morrone.dione@gmail.com](mailto:morrone.dione@gmail.com)
- **LinkedIn:** [linkedin.com/in/dione-nascimento-37287a233](https://www.linkedin.com/in/dione-nascimento-37287a233/)
- **GitHub:** [github.com/PortalDosDados](https://github.com/PortalDosDados)
- **YouTube:** [youtube.com/@Portal_dos_Dados](https://www.youtube.com/@Portal_dos_Dados)
- **App Streamlit:** [portaldosdados-streamlit.app](https://portaldosdados-streamlit-portal-dos-dad-dione-nascimento-s9sdso.streamlit.app/)
