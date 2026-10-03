import type { HelpArticle } from '../types';

export const subscriptionsArticle: HelpArticle = {
  id: 'subscriptions',
  title: 'Inscrições',
  summary:
    'Aprove, recuse, isente ou transfira. Só a inscrição aprovada entra no leaderboard e nas baias do cronograma.',
  group: 'people',
  pathSegment: 'subscriptions',
  sections: [
    {
      heading: 'O que cada status significa',
      bullets: [
        'Aguardando: ainda não entrou no evento. Fica de fora do placar.',
        'Aprovada: entra no leaderboard e na distribuição das baias.',
        'Recusada: fora do placar. Não dá para transferir.',
        'Isenta: cortesia. O sistema aprova na hora e o status aparece como Isenta.',
      ],
    },
    {
      heading: 'O que você pode fazer no painel',
      bullets: [
        'Adicionar inscrição manualmente, com responsável, ticket e atletas.',
        'Aprovar no painel ou Recusar. Não dá para repetir o status que já está valendo.',
        'Marcar como isenta aprova sem cobrança. Não marca isenta se já houve pagamento online com valor. Remover a isenção não desaprova sozinho.',
        'Reenviar e-mail só para inscrição aprovada, com pagamento confirmado e e-mail do responsável.',
        'Transferir muda a categoria. A inscrição não pode estar recusada e não pode ter resultado lançado — remova o resultado antes. A categoria destino exige a quantidade certa de atletas, e o apelido não pode repetir nela entre aprovadas e aguardando.',
      ],
      paragraphs: [
        'Valor extra na transferência só é gerado para inscrição aprovada que tenha lote de compra.',
      ],
    },
    {
      heading: 'Pagamento na página pública',
      paragraphs: [
        'O atleta paga no site. A vaga fica reservada por cerca de 1 hora. Pagamento confirmado aprova a inscrição.',
        'Se a reserva acaba sem pagamento, ou se o pagamento é cancelado ou expira, a inscrição que ainda estava aguardando vira recusada e a vaga é liberada.',
      ],
    },
  ],
  faqs: [
    {
      question: 'A pessoa pagou e não aparece no placar.',
      answer:
        'Só inscrição aprovada entra no leaderboard. Se o pagamento ainda está na janela de cerca de 1 hora, ela continua aguardando. Se o prazo passou sem pagamento, ela foi recusada. Aprovar no painel coloca no placar na hora.',
    },
    {
      question: 'Não consigo marcar como isenta.',
      answer:
        'Já existe pagamento online com valor nesta inscrição. Isenção vale para quem não pagou, inclusive ingresso gratuito. Quem já pagou permanece como aprovada online.',
    },
    {
      question: 'Não consigo transferir de categoria.',
      answer:
        'Inscrição recusada não transfere. Se já existe resultado lançado, remova o resultado em Resultados e tente de novo. A categoria destino também precisa fechar a quantidade de atletas, e o apelido não pode já existir lá.',
    },
    {
      question: 'Como tiro alguém do evento no dia?',
      answer:
        'Recuse a inscrição. Ela sai do leaderboard. Isso não é desclassificação de uma prova: para tirar só uma prova, remova o resultado dela e deixe a inscrição aprovada.',
    },
  ],
};
