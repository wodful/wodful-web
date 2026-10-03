import type { HelpArticle } from '../types';

export const participantsArticle: HelpArticle = {
  id: 'participants',
  title: 'Participantes',
  summary:
    'No dia do evento, esta tela registra quem retirou o kit e quem retirou a medalha. Não é o check-in da prova.',
  group: 'people',
  pathSegment: 'participants',
  sections: [
    {
      heading: 'Retirar kit ou medalha',
      steps: [
        'Busque o atleta pelo nome ou pelo time.',
        'Escolha Retirar kit ou Retirar medalha.',
        'Informe quem retirou. O nome precisa ter pelo menos 4 caracteres.',
        'Confirme. O nome de quem retirou fica visível na lista.',
      ],
    },
    {
      heading: 'O que não dá para fazer duas vezes',
      bullets: [
        'Não retira o kit de novo se ele já foi retirado. O mesmo vale para a medalha.',
        'Para desfazer, use Devolver kit ou Devolver medalha. Só devolve o que já foi retirado.',
        'Depois de devolver, dá para registrar outra retirada com o nome certo.',
      ],
      paragraphs: [
        'A retirada é por atleta, não pelo time. Cada pessoa da equipe tem o próprio kit e a própria medalha.',
      ],
    },
    {
      heading: 'Presença na prova',
      paragraphs: [
        'Retirar kit não marca presença na bateria. Quem fez a prova entra em Resultados. Quem não fez fica sem resultado naquela prova e, se não deve aparecer no placar, a inscrição é recusada em Inscrições.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Marquei a pessoa errada na retirada.',
      answer:
        'Use Devolver kit ou Devolver medalha e registre de novo com o nome certo. Não dá para trocar o nome por cima de uma retirada já confirmada.',
    },
    {
      question: 'O botão devolver não aparece.',
      answer:
        'Devolver só existe depois da retirada. Se ainda não foi retirado, a ação da linha é Retirar kit ou Retirar medalha.',
    },
    {
      question: 'O atleta não está na lista.',
      answer:
        'A lista mostra os atletas das inscrições. Confira o filtro de categoria e a busca. Se a inscrição ainda não existe, cadastre em Inscrições.',
    },
  ],
};
