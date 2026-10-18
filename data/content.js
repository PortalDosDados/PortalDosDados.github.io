/*
  data/content.js — FONTE ÚNICA DE CONTEÚDO DO PORTFÓLIO
  ------------------------------------------------------------------
  Edite aqui projetos, experiências, habilidades e formação.
  Base estruturada alinhada com o currículo e experiência de Dione Nascimento.

  - O conteúdo está organizado por idioma (window.PORTFOLIO.pt).
  - Projetos:
      featured: true   → aparece nos cards grandes de destaque
      category         → usado no filtro ("bi", "python", "powerplatform", "educacao")
      image (opcional) → caminho da imagem
      links (opcional) → [{ label: "Demo", url: "https://..." }]
*/

const PORTFOLIO = {
  pt: {
    stats: [
      { value: 15, suffix: '+', label: 'Anos na Indústria' },
      { value: 10, suffix: '', label: 'Anos em Siderurgia' },
      { value: 5, suffix: '+', label: 'Anos com Power BI' },
      { value: 10, suffix: '+', label: 'Automações' },
      { value: 5, suffix: '+', label: 'Projetos Estratégicos' },
    ],

    projectCategories: [
      { id: 'all', label: 'Todos' },
      { id: 'bi', label: 'Power BI' },
      { id: 'python', label: 'Python & Automação' },
      { id: 'mobile', label: 'Mobile & Flutter' },
    ],

    projects: [
      {
        id: 'dashboard-custos-manutencao',
        featured: true,
        category: 'bi',
        title: 'Dashboard de Custos de Manutenção — Avine',
        problem:
          'Projeto de BI iniciado por consultoria e interrompido, com dados descentralizados e bases espalhadas entre MySQL e planilhas Excel manuais.',
        solution:
          'Mapeamento e validação das bases de dados em MySQL e Excel, revisando medidas e regras de negócio existentes. Consolidação da base no MySQL como fonte única de dados, eliminando dependências de planilhas.',
        result:
          'Eliminação de inconsistências causadas por planilhas, aumento da confiabilidade dos indicadores e redução expressiva do tempo necessário para atualização dos dashboards.',
        tech: ['Power BI', 'DAX', 'MySQL', 'Excel', 'Modelagem Relacional'],
        context: 'Avine · Consultoria PJ',
      },
      {
        id: 'portal-indicadores',
        featured: true,
        category: 'bi',
        title: 'Portal de Indicadores de Manutenção — ArcelorMittal',
        problem:
          'Dispersão e complexidade de integração de dados multi-origem industriais (SAP, MES e SGI), demandando geração manual de relatórios e dificultando decisões rápidas.',
        solution:
          'Tratamento, padronização e modelagem dimensional dos dados de SAP, MES e SGI, com desenvolvimento de dashboards gerenciais em Power BI para monitoramento de desempenho.',
        result:
          'Centralização das informações, aumento da confiabilidade dos dados, redução do tempo de geração de relatórios e maior agilidade na tomada de decisão da liderança.',
        tech: ['Power BI', 'DAX', 'SAP', 'MES', 'SGI', 'Modelagem de Dados'],
        context: 'ArcelorMittal Pecém',
      },
      {
        id: 'pm-mobit',
        featured: true,
        category: 'mobile',
        title: 'Aplicativo Mobile para Gestão de Manutenção em Campo (PM Mobit)',
        problem:
          'Operações de campo e rotinas de manutenção de equipamentos críticos realizadas com formulários manuais em papel, gerando baixa rastreabilidade, atrasos no cumprimento de SLA e falta de visibilidade em tempo real.',
        solution:
          'Desenvolvimento de aplicação móvel corporativa em Flutter e Dart integrada ao Supabase (Auth, Database e Storage). Digitalização completa de rotinas de inspeção, checklists preventivos com captura de evidências fotográficas, abertura automática de ordens corretivas ao detectar itens não conformes, controle rigoroso de SLA e dashboards gerenciais de desempenho operacional.',
        result:
          'Substituição de 100% dos formulários em papel por fluxo digital auditável, detecção precoce de falhas com disparo imediato de corretivas e monitoramento de pontualidade e produtividade da equipe técnica em tempo real.',
        tech: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL', 'Mobile'],
        context: 'Gestão de Manutenção em Campo',
      },
      {
        id: 'disponibilidade',
        featured: true,
        category: 'python',
        title: 'Aplicativo para Cálculo da Disponibilidade dos Equipamentos — ArcelorMittal',
        problem:
          'Extração e tratamento manual recorrente de dados operacionais do sistema MES para cálculo da disponibilidade dos equipamentos industriais.',
        solution:
          'Pipeline automatizado para extração e tratamento dos dados do sistema MES, com desenvolvimento de interface operacional em Python/Streamlit e geração de relatórios com visualização em tela e exportação para Excel.',
        result:
          'Redução de aproximadamente 10 horas/mês em atividades operacionais repetitivas, padronizando métricas de disponibilidade com precisão.',
        highlight: '−10 h/mês',
        tech: ['Python', 'Pandas', 'Streamlit', 'MES', 'Excel'],
        context: 'ArcelorMittal Pecém',
      },
      {
        id: 'inconsistencias-contabeis',
        featured: true,
        category: 'python',
        title: 'Automação em Python para Detecção de Inconsistências Contábeis — ArcelorMittal',
        problem:
          'Processo manual e vulnerável a erros na integração e conferência de múltiplas planilhas Excel para validação contábil entre custos fixos e variáveis.',
        solution:
          'Automação em Python integrando dados de múltiplas planilhas Excel, com tratamento, padronização, transformação e implementação de regras de validação para identificar classificações incorretas e emitir relatórios automáticos.',
        result:
          'Redução de aproximadamente 4 horas mensais em atividades operacionais, aumento da confiabilidade dos dados contábeis e maior agilidade e precisão nas análises gerenciais.',
        highlight: '−4 h/mês',
        tech: ['Python', 'Pandas', 'Excel', 'Regras de Validação', 'Auditoria'],
        context: 'ArcelorMittal Pecém',
      },
      {
        id: 'inconsistencias-requisicoes',
        featured: true,
        category: 'python',
        title: 'Automação em Python para Inconsistências em Requisições de Compra — ArcelorMittal',
        problem:
          'Erros de classificação e divergências de centros de custo em requisições de compras identificados tardiamente, gerando retrabalho e inconsistências orçamentárias.',
        solution:
          'Desenvolvimento de automação em Python para integração e validação de dados de múltiplas fontes com correção proativa de desvios, além de estruturação de dashboard de monitoramento em tempo real no Power BI.',
        result:
          'Redução de aproximadamente 4 horas mensais de trabalho operacional e mitigação de erros contábeis, garantindo conformidade nos processos de compra e precisão gerencial.',
        highlight: '−4 h/mês',
        tech: ['Python', 'Power BI', 'Pandas', 'Centros de Custo', 'Validação'],
        context: 'ArcelorMittal Pecém',
      },
    ],

    experience: [
      {
        period: 'Maio/2026 – Atual',
        company: 'Avine (Consultor PJ)',
        role: 'Consultor em Dados',
        achievements: [
          'Análise de dados para identificação de padrões, tendências e oportunidades de melhoria em processos de negócio.',
          'Desenvolvimento de dashboards e relatórios gerenciais em Power BI para acompanhamento de indicadores de desempenho (KPIs).',
          'Coleta, tratamento, limpeza, transformação e consolidação de dados provenientes de diferentes fontes.',
          'Modelagem de indicadores e métricas para suporte à tomada de decisão baseada em dados.',
          'Desenvolvimento de aplicações utilizando Power Apps para coleta, validação e gestão de informações.',
          'Automatização de processos e elaboração de soluções para aumentar a eficiência operacional e reduzir atividades manuais.',
          'Criação de consultas, análises e relatórios utilizando SQL, Excel e Python.',
          'Capacitação de equipes por meio de treinamentos e consultorias em análise de dados, Power BI, Excel e ferramentas Microsoft Power Platform.',
        ],
      },
      {
        period: 'Agosto/2026 – Atual',
        company: 'SENAI',
        role: 'Instrutor',
        achievements: [
          'Condução de treinamentos técnicos focados em Data Analytics, Engenharia de Produção e processos de Manutenção Industrial.',
          'Execução de atividades práticas com Power BI, Excel, SQL e Python para tratamento e visualização de dados operacionais.',
          'Criação de dashboards e indicadores de desempenho (KPIs) para suporte estratégico e monitoramento de resultados.',
          'Desenvolvimento de soluções com Power Apps e automações para otimização da coleta e gestão de informações industriais.',
          'Produção de materiais didáticos e estudos de caso aplicados à melhoria de processos de produção e manutenção.',
          'Capacitação profissional no uso de tecnologias e ferramentas de engenharia para análise e solução de problemas baseada em dados.',
        ],
      },
      {
        period: 'Agosto/2022 – Abril/2026',
        company: 'ArcelorMittal Pecém',
        role: 'Analista de Confiabilidade Mecânica',
        achievements: [
          'Análise de dados de manutenção para identificação de padrões de falha e oportunidades de melhoria.',
          'Desenvolvimento de dashboards em Power BI para acompanhamento de indicadores (MTBF, MTTR, backlog, disponibilidade).',
          'Aplicação de análise de causa raiz baseada em dados históricos de falhas.',
          'Estruturação e monitoramento de KPIs para suporte à tomada de decisão.',
          'Priorização de ordens de serviço com base em criticidade e análise de dados.',
          'Criação de soluções digitais com Power Apps para coleta e tratamento de dados operacionais.',
          'Apoio na definição de estratégias de manutenção baseadas em dados.',
        ],
      },
      {
        period: 'Janeiro/2021 – Agosto/2022',
        company: 'CSP (Companhia Siderúrgica do Pecém)',
        role: 'Programador de Manutenção',
        achievements: [
          'Análise de dados de ordens de manutenção para otimização da programação.',
          'Monitoramento de indicadores e geração de insights para melhoria do planejamento.',
          'Priorização de atividades com base em criticidade e dados históricos.',
          'Identificação de desvios e oportunidades de melhoria no processo através de análise de dados.',
        ],
      },
      {
        period: 'Outubro/2015 – Janeiro/2021',
        company: 'CSP (Companhia Siderúrgica do Pecém)',
        role: 'Técnico de Inspeção/Planejamento Mecânico',
        achievements: [
          'Coleta e análise de dados de inspeção para suporte à manutenção preventiva e preditiva.',
          'Identificação de padrões de falha em equipamentos industriais.',
          'Apoio à tomada de decisão com base em dados de condition dos ativos.',
          'Utilização de dados para priorização de intervenções de manutenção.',
        ],
      },
      {
        period: 'Junho/2012 – Setembro/2015',
        company: 'SENAI',
        role: 'Instrutor de Metalurgia/Mecânica',
        achievements: [
          'Desenvolvimento de materiais técnicos e didáticos voltados à formação profissional na área de metalurgia e mecânica.',
          'Estruturação e organização de conteúdos técnicos.',
          'Planejamento e ministração de treinamentos e palestras para turmas técnicas.',
          'Acompanhamento do aprendizado dos alunos e suporte no desenvolvimento de competências técnicas.',
        ],
      },
    ],

    skills: [
      {
        group: 'BI / Visualização',
        icon: 'chart',
        items: [
          'Power BI (DAX)',
          'Modelagem Dimensional (Star Schema, Normalização)',
          'Power Query',
          'Excel Avançado',
        ],
      },
      {
        group: 'Programação / Automação',
        icon: 'code',
        items: [
          'Python (Pandas, Streamlit, scripts)',
          'Flutter & Dart (Mobile)',
          'Supabase (BaaS & PostgreSQL)',
          'Power Apps',
          'Power Automate',
          'Google Apps Script',
        ],
      },
      {
        group: 'Banco de Dados / Modelagem',
        icon: 'database',
        items: [
          'SQL (consultas complexas, otimização)',
          'Modelagem (Star Schema, Normalização)',
          'PostgreSQL',
          'MySQL',
        ],
      },
      {
        group: 'ETL / Fontes de Dados & Sistemas',
        icon: 'factory',
        items: [
          'Power Query',
          'Pentaho Data Integration (PDI)',
          'SAP',
          'MES',
          'SGI',
          'Excel',
        ],
      },
      {
        group: 'Confiabilidade & Métodos Industriais',
        icon: 'gear',
        items: [
          'Confiabilidade Mecânica (MTBF, MTTR, disponibilidade)',
          'Análise de Causa Raiz (RCA)',
          'MASP (Metodologia de Análise e Solução de Problemas)',
          'Gestão de Paradas & Backlog',
        ],
      },
    ],

    education: [
      {
        title: 'Engenharia de Produção',
        detail: 'Cursando 7º Semestre · Estácio',
        type: 'Graduação',
      },
      {
        title: 'Tecnólogo em Análise e Desenvolvimento de Sistemas',
        detail: 'Graduado (2022) · Estácio',
        type: 'Graduação',
      },
      {
        title: 'Formação em Data Analytics',
        detail: 'Digital College',
        type: 'Formação',
      },
      {
        title: 'Certificação de Analista de Dados',
        detail: 'Google · Coursera',
        type: 'Certificação',
      },
      {
        title: 'Business Intelligence',
        detail: 'FIAP · 40 horas',
        type: 'Formação',
      },
      {
        title: 'Power BI para Análise de Dados',
        detail: 'Data Science Academy · 72 horas',
        type: 'Formação',
      },
      {
        title: 'Gestão de Projetos',
        detail: 'Veduca / USP (2021) · 45 horas',
        type: 'Formação',
      },
      {
        title: 'Metodologia MASP',
        detail: 'Grupo Voitto',
        type: 'Formação',
      },
    ],

    youtubeVideos: [
      {
        id: '5IF6ByNH_hQ',
        ref: 'VID-001-PBI-FROTA',
        badge: 'POWER BI • AULA 01',
        title: 'Power BI do Zero: Dashboard de Manutenção de Frota',
        category: 'Power BI',
        description:
          'Construção passo a passo de um dashboard gerencial de manutenção de frotas e ordens de serviço no Power BI, calculando taxa de manutenção preventiva, volume de OS por mês e análise por árvore de decomposição.',
        thumbnail: 'assets/img/videos/power-bi-do-zero-aula-1.png',
        fallbackThumbnail: 'https://img.youtube.com/vi/5IF6ByNH_hQ/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=5IF6ByNH_hQ&list=PLdDl00ELa1blnoiUxODvPpyfP0cHirX0L',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLdDl00ELa1blnoiUxODvPpyfP0cHirX0L',
        topics: ['Modelagem Relacional', 'KPI Preventivas (28.19%)', 'Árvore de Decomposição', 'Power BI Service'],
      },
      {
        id: 'HExTWVTRovg',
        ref: 'VID-002-POWERAPPS-ESTOQUE',
        badge: 'POWER APPS • AULA 01',
        title: 'Power Apps: App de Gestão e Controle de Estoque',
        category: 'Power Apps',
        description:
          'Desenvolvimento prático de um aplicativo corporativo em Power Apps para controle de estoque em tempo real, abrangendo telas interativas, cadastros e movimentações operacionais no chão de fábrica.',
        thumbnail: 'https://img.youtube.com/vi/HExTWVTRovg/maxresdefault.jpg',
        fallbackThumbnail: 'https://img.youtube.com/vi/HExTWVTRovg/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=HExTWVTRovg&t=7s',
        playlistUrl: null,
        topics: ['Telas & Formulários', 'Navegação Dinâmica', 'Entradas & Saídas', 'Chão de Fábrica'],
      },
    ],

    tools: [
      {
        title: 'Canal Portal dos Dados (YouTube)',
        description: 'Canal dedicado à disseminação de conhecimento sobre dados industriais, gestão da manutenção e tomada de decisão baseada em dados.',
        url: 'https://www.youtube.com/@Portal_dos_Dados',
        icon: 'video',
      },
      {
        title: 'Página / App Portal dos Dados (Streamlit)',
        description: 'Aplicações analíticas operacionais e interativas desenvolvidas em Python para dados industriais.',
        url: 'https://portaldosdados-streamlit-portal-dos-dad-dione-nascimento-s9sdso.streamlit.app/',
        icon: 'code',
      },
    ],
  },
};

if (typeof window !== 'undefined') {
  window.PORTFOLIO = PORTFOLIO;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PORTFOLIO;
}
