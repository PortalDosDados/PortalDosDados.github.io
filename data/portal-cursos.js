/**
 * data/portal-cursos.js
 * Catálogo central de cursos, unidades curriculares (checkpoints) e matrizes de proficiência com humor.
 * Suporta execução tanto no browser (window.PORTAL_CURSOS) quanto em Node.js (module.exports).
 */

const PORTAL_CURSOS = {
  cursos: [
    {
      id: 'informatica',
      nome: 'Técnico em Informática',
      icone: '💻',
      area: 'Tecnologia da Informação',
      descricao: 'Desenvolvimento de software, infraestrutura de redes, banco de dados e aplicações industriais.',
      niveisProficiencia: [
        {
          min: 0,
          max: 49.99,
          titulo: 'Juninho',
          badge: '☕',
          descricao: 'Estude mais! O café ainda não fez efeito ou faltou fechar um ponto e vírgula. Revise os conceitos e tente de novo!',
        },
        {
          min: 50,
          max: 69.99,
          titulo: 'Júnior',
          badge: '🐛',
          descricao: 'Está no caminho! Já resolve uns bugs sem travar tudo, mas ainda consulta o Stack Overflow o tempo todo. Que tal mais um round?',
        },
        {
          min: 70,
          max: 89.99,
          titulo: 'Pleno',
          badge: '🚀',
          descricao: 'Você sabe o que está fazendo! Código limpo, roda liso e não quebra em produção na sexta-feira. Quase impecável!',
        },
        {
          min: 90,
          max: 100,
          titulo: 'Sênior',
          badge: '🧙‍♂️',
          descricao: 'Você deve ter hackeado o sistema! Nível Matrix ativado. O compilador te respeita e você já pode pedir aumento!',
        },
      ],
      unidadesCurriculares: [
        {
          id: 'logica_programacao',
          nome: 'Lógica de Programação',
          status: 'ativo',
          ordem: 1,
          icone: '⚡',
          resumo: 'Variáveis, operadores, estruturas condicionais, laços de repetição e vetores.',
          totalQuestoes: 15,
        },
        {
          id: 'banco_dados',
          nome: 'Banco de Dados',
          status: 'em_breve',
          ordem: 2,
          icone: '🗄️',
          resumo: 'Modelagem relacional, normalização, consultas SQL e integridade de dados.',
          totalQuestoes: 15,
        },
        {
          id: 'redes_computadores',
          nome: 'Redes de Computadores',
          status: 'em_breve',
          ordem: 3,
          icone: '🌐',
          resumo: 'Topologias, modelo OSI/TCP-IP, endereçamento IPv4/IPv6 e roteamento.',
          totalQuestoes: 15,
        },
        {
          id: 'programacao_oo',
          nome: 'Programação Orientada a Objetos',
          status: 'em_breve',
          ordem: 4,
          icone: '🧩',
          resumo: 'Classes, objetos, encapsulamento, herança, polimorfismo e interfaces.',
          totalQuestoes: 15,
        },
        {
          id: 'desenvolvimento_web',
          nome: 'Desenvolvimento Web',
          status: 'em_breve',
          ordem: 5,
          icone: '🌐',
          resumo: 'HTML5 semântico, estilização com CSS moderno, JavaScript e consumo de APIs.',
          totalQuestoes: 15,
        },
      ],
    },
  ],
  avatares: [
    {
      id: 'dev_pixel',
      nome: 'Dev Retrô',
      icone: '👾',
      descricao: 'Compila código ouvindo chiptune em monitor de fósforo verde.',
    },
    {
      id: 'cyborg_tech',
      nome: 'Cyborg Tech',
      icone: '🤖',
      descricao: 'Processamento overclockado com refrigeramento a nitrogênio.',
    },
    {
      id: 'hacker_capuz',
      nome: 'Hacker Ético',
      icone: '🥷',
      descricao: 'Encontra bugs em tempo de execução antes do próprio compilador.',
    },
    {
      id: 'mago_terminal',
      nome: 'Mago do Bash',
      icone: '🧙',
      descricao: 'Resolve qualquer incidente de produção com um comando regex.',
    },
    {
      id: 'arcade_gamer',
      nome: 'Mestre do Arcade',
      icone: '🕹️',
      descricao: 'Focado em atingir o High Score e colocar 3 letras no placar.',
    },
  ],
  turmas: [
    'Turma A (Manhã)',
    'Turma B (Tarde)',
    'Turma C (Noite)',
    'Turma EAD / Sábado',
  ],
};

if (typeof window !== 'undefined') {
  window.PORTAL_CURSOS = PORTAL_CURSOS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PORTAL_CURSOS;
}
