import lancarResultadoGif from '../gifs/resultados-lancar.gif';
import type { HelpArticle } from '../types';

export const resultsArticle: HelpArticle = {
  id: 'results',
  title: 'Resultados',
  summary:
    'Lance o resultado de cada atleta ou equipe na prova. Ele nasce oculto e só entra no placar público quando você libera a prova.',
  group: 'live',
  pathSegment: 'results',
  sections: [
    {
      heading: 'Como lançar',
      steps: [
        'Escolha a categoria e a prova.',
        'Selecione quem ainda não tem resultado nessa prova e informe o valor.',
        'Confira a tabela. Dá para editar ou remover. A colocação da prova é recalculada ao lançar, editar ou remover.',
      ],
      paragraphs: [
        'Cada inscrição só pode ter um resultado por prova. Se a pessoa já está na tabela, edite o valor em vez de lançar de novo. A prova e a inscrição precisam ser da mesma categoria.',
      ],
      figures: [
        {
          src: lancarResultadoGif,
          alt: 'Gravação de como lançar um resultado',
          caption: 'Da escolha da categoria até o resultado na tabela.',
        },
      ],
    },
    {
      heading: 'Quem vence a prova',
      bullets: [
        'For Time: o menor tempo fica na frente. Use o campo de hora.',
        'AMRAP, EMOM e PR: o maior número fica na frente.',
        'Empate: o mesmo resultado divide a colocação e a próxima é pulada. Dois primeiros ficam em 1º e 1º, e o seguinte fica em 3º.',
      ],
    },
    {
      heading: 'Liberar para o público',
      bullets: [
        'Todo resultado começa oculto.',
        'Liberar resultados publica todos os resultados daquela prova. Ocultar esconde todos de novo.',
        'O leaderboard do organizador já conta os ocultos. O placar público e o cronograma público só contam o que foi liberado.',
      ],
    },
  ],
  scoring: [
    {
      mode: 'SCORE',
      title: 'Pontuação',
      showPointsTable: true,
      paragraphs: [
        'A colocação na prova vira pontos. No leaderboard, a maior soma fica na frente.',
        'Prova normal: o 1º lugar vale 100 pontos e a tabela desce até 1 ponto no 30º. Prova marcada como Vale 50 pts: o 1º vale 50 e a tabela também vai até 1 ponto no 30º.',
      ],
    },
    {
      mode: 'RANKING',
      title: 'Colocação',
      paragraphs: [
        'A colocação na prova é o ponto daquela prova. O 1º soma 1, o 2º soma 2. No leaderboard, a menor soma fica na frente.',
        'O empate também pula a colocação seguinte: dois primeiros somam 1 e 1, e o próximo soma 3. A opção Vale 50 pts não se aplica neste tipo de evento.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Como marco desclassificado, DNS ou não compareceu?',
      answer:
        'O sistema não tem esses status. Se a pessoa não fez a prova, não lance o resultado — ou remova o que já foi lançado. Ela fica sem os pontos daquela prova. Se ela não deve aparecer no placar de jeito nenhum, recuse a inscrição. Só inscrição aprovada entra no leaderboard.',
    },
    {
      question: 'O atleta já viu um resultado que eu ainda não queria mostrar.',
      answer:
        'Use Ocultar na prova. Isso tira todos os resultados dela do placar público. O seu leaderboard continua mostrando, com a marca de que inclui ocultos.',
    },
    {
      question: 'Lancei o resultado na categoria errada.',
      answer:
        'Remova o resultado. A prova precisa ser da mesma categoria da inscrição. Se a pessoa mudou de categoria, transfira a inscrição antes — e só dá para transferir se não houver resultado lançado.',
    },
  ],
};
