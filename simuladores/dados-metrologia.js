/*
  Arquivo: dados-metrologia.js
  Banco de questões do Simulador de Metrologia Teórica.

  Para adicionar uma questão, copie um bloco { ... } e cole no final do array.
  - respostaCorreta: índice da opção correta, contado a partir de 0
    (0 = primeira opção, 1 = segunda, ...)
  - explicacao: aparece na revisão depois que o aluno finaliza o teste
*/

const metrologiaQuizData = [
  {
    id: 1,
    pergunta: 'Qual é o principal objetivo da calibração de um instrumento de medição em ambiente industrial?',
    opcoes: [
      'Ajustar o instrumento para que ele não apresente nenhum erro.',
      'Estabelecer a relação entre os valores indicados pelo instrumento e os valores de um padrão de referência.',
      'Consertar peças internas desgastadas para aumentar a vida útil (MTBF).',
      'Garantir a lubrificação adequada dos componentes móveis.',
    ],
    respostaCorreta: 1,
    explicacao:
      'Calibrar é comparar o instrumento com um padrão e registrar os erros encontrados. Ajustar é uma operação diferente, que pode ou não ser feita depois da calibração.',
  },
  {
    id: 2,
    pergunta: "O que define a 'Resolução' de um paquímetro?",
    opcoes: [
      'A capacidade do instrumento de resistir a choques mecânicos na bancada.',
      'O erro máximo tolerado durante uma medição.',
      'A menor diferença entre indicações de um mostrador que pode ser significativamente percebida.',
      'A temperatura ambiente na qual o instrumento foi fabricado.',
    ],
    respostaCorreta: 2,
    explicacao: 'Resolução é a menor variação que o instrumento consegue indicar, por exemplo 0,05 mm ou 0,02 mm em paquímetros.',
  },
  {
    id: 3,
    pergunta: 'No Sistema Internacional de Unidades (SI), qual é a unidade base de comprimento?',
    opcoes: ['Milímetro (mm)', 'Centímetro (cm)', 'Polegada (in)', 'Metro (m)'],
    respostaCorreta: 3,
    explicacao: 'O metro (m) é a unidade base de comprimento do SI. O milímetro e o centímetro são submúltiplos do metro.',
  },
  {
    id: 4,
    pergunta: 'Qual a diferença entre exatidão e precisão (repetibilidade) de uma medição?',
    opcoes: [
      'São sinônimos e podem ser usados da mesma forma.',
      'Exatidão é a proximidade do valor verdadeiro; precisão é a proximidade entre medições repetidas.',
      'Exatidão depende do operador; precisão depende somente do instrumento.',
      'Precisão é a proximidade do valor verdadeiro; exatidão é a quantidade de casas decimais.',
    ],
    respostaCorreta: 1,
    explicacao:
      'Um instrumento pode ser preciso (resultados próximos entre si) e mesmo assim inexato, se todos estiverem deslocados do valor verdadeiro, como acontece quando há erro sistemático.',
  },
  {
    id: 5,
    pergunta: 'Um paquímetro em milímetros possui nônio com 20 divisões. Qual é a sua resolução?',
    opcoes: ['0,02 mm', '0,05 mm', '0,1 mm', '0,01 mm'],
    respostaCorreta: 1,
    explicacao: 'Resolução = menor divisão da escala fixa ÷ número de divisões do nônio = 1 mm ÷ 20 = 0,05 mm.',
  },
  {
    id: 6,
    pergunta: 'Um micrômetro tem fuso com passo de 0,5 mm e tambor com 50 divisões. Qual é a sua resolução?',
    opcoes: ['0,001 mm', '0,005 mm', '0,01 mm', '0,05 mm'],
    respostaCorreta: 2,
    explicacao: 'Resolução = passo ÷ número de divisões do tambor = 0,5 mm ÷ 50 = 0,01 mm.',
  },
  {
    id: 7,
    pergunta: 'Qual é a temperatura de referência padronizada para medições dimensionais (ISO 1)?',
    opcoes: ['0 °C', '15 °C', '20 °C', '25 °C'],
    respostaCorreta: 2,
    explicacao: 'A ISO 1 define 20 °C como temperatura de referência para especificação e verificação dimensional de produtos.',
  },
  {
    id: 8,
    pergunta: 'O erro de paralaxe em uma leitura de escala é causado principalmente por:',
    opcoes: [
      'Desgaste das faces de medição do instrumento.',
      'Posição inadequada dos olhos do observador em relação à escala.',
      'Variação da temperatura da peça.',
      'Força de medição excessiva.',
    ],
    respostaCorreta: 1,
    explicacao: 'Para evitar a paralaxe, a linha de visão deve ficar perpendicular à escala no ponto de leitura.',
  },
  {
    id: 9,
    pergunta: 'O que é rastreabilidade metrológica?',
    opcoes: [
      'A possibilidade de localizar o instrumento no almoxarifado.',
      'O registro de quem utilizou o instrumento por último.',
      'A relação do resultado com uma referência por meio de uma cadeia ininterrupta e documentada de calibrações.',
      'O número de série gravado no instrumento.',
    ],
    respostaCorreta: 2,
    explicacao:
      'A rastreabilidade liga a medição a padrões nacionais ou internacionais por uma cadeia documentada de calibrações, cada uma com sua incerteza declarada.',
  },
  {
    id: 10,
    pergunta: 'Quantos milímetros equivalem a 1 polegada?',
    opcoes: ['25,0 mm', '25,4 mm', '24,5 mm', '30,48 mm'],
    respostaCorreta: 1,
    explicacao: '1" = 25,4 mm (definição exata). O valor 30,48 cm corresponde a 1 pé.',
  },
];

if (typeof window !== 'undefined') {
  window.metrologiaQuizData = metrologiaQuizData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = metrologiaQuizData;
}