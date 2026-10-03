import type { HelpArticle } from '../types';

export const leaderboardsArticle: HelpArticle = {
  id: 'leaderboards',
  title: 'Leaderboard',
  summary:
    'Placar da categoria. O seu inclui resultados ainda ocultos. O do público só inclui o que você liberou.',
  group: 'live',
  pathSegment: 'leaderboards',
  sections: [
    {
      heading: 'Quem aparece',
      bullets: [
        'Só inscrição aprovada. Aguardando e recusada ficam de fora.',
        'Isenção conta como aprovada, então entra no placar.',
        'O total soma os pontos de cada prova. No seu painel, resultado oculto entra nessa soma. No público, não.',
      ],
    },
    {
      heading: 'Como o desempate funciona',
      steps: [
        'Primeiro o total. Em Pontuação, a maior soma fica na frente. Em Colocação, a menor soma fica na frente.',
        'Se o total empata, quem tem mais 1º lugares. Se continuar empatado, mais 2º lugares, depois mais 3º, e assim por diante.',
        'Se o total e esse histórico continuam iguais, os dois dividem a posição. O apelido só define quem aparece primeiro na lista.',
      ],
      paragraphs: ['Total zero fica sem colocação: o ranking mostra 0 e não ocupa uma vaga.'],
    },
  ],
  scoring: [
    {
      mode: 'SCORE',
      title: 'Pontuação',
      paragraphs: [
        'Cada prova entrega pontos pela colocação (100 no 1º, ou 50 se a prova vale 50 pts). Ganha quem soma mais.',
      ],
    },
    {
      mode: 'RANKING',
      title: 'Colocação',
      paragraphs: [
        'Cada prova soma a própria colocação (1 para o 1º, 2 para o 2º). Ganha quem soma menos.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Por que o meu placar é diferente do público?',
      answer:
        'O leaderboard do organizador inclui resultados ocultos. O público só vê provas que você liberou em Resultados. Libere a prova para os dois ficarem iguais.',
    },
    {
      question: 'Alguém está com posição 0.',
      answer:
        'O total está zerado. A pessoa ainda não tem pontos de prova liberada (no público) ou lançada (no seu painel). Ela aparece na lista, mas sem colocação.',
    },
    {
      question: 'Dois atletas ficaram com a mesma posição.',
      answer:
        'Eles têm o mesmo total e a mesma quantidade de 1º, 2º, 3º…. Por isso dividem a posição. O apelido só define a ordem na lista, sem criar uma posição diferente.',
    },
  ],
};
