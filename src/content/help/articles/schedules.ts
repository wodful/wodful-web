import adicionarHorarioGif from '../gifs/cronograma-adicionar-horario.gif';
import iniciarCronogramaGif from '../gifs/iniciar-cronograma.gif';
import type { HelpArticle } from '../types';

export const schedulesArticle: HelpArticle = {
  id: 'schedules',
  title: 'Cronograma',
  summary:
    'Monte os horários, inicie a bateria da vez e encerre quando acabar. Bateria encerrada some do cronograma público.',
  group: 'live',
  pathSegment: 'schedules',
  sections: [
    {
      heading: 'Como adicionar um horário',
      steps: [
        'Em Cronograma, toque em Adicionar atividade.',
        'Informe data, hora, número da bateria, quantidade de baias e pelo menos uma categoria com a prova dela.',
        'Dá para colocar mais de uma categoria no mesmo horário. Elas compartilham a bateria.',
      ],
      figures: [
        {
          src: adicionarHorarioGif,
          alt: 'Gravação de como adicionar um horário no cronograma',
          caption: 'Do botão Adicionar atividade até a bateria nova na lista.',
        },
      ],
    },
    {
      heading: 'O que o sistema não deixa repetir',
      bullets: [
        'Dois horários com a mesma data e a mesma hora neste campeonato.',
        'O mesmo número de bateria para a mesma categoria e a mesma prova.',
        'Baia com quantidade menor que 1, ou bateria sem categoria e prova.',
      ],
    },
    {
      heading: 'Durante a prova',
      bullets: [
        'Iniciar marca a bateria como Ao vivo. Não inicia se ela já estiver ao vivo ou encerrada.',
        'Parar tira do ao vivo. A bateria volta a ficar agendada e o público continua vendo o horário.',
        'Encerrar só funciona com a bateria ao vivo. Ela fica Encerrada e deixa o cronograma público.',
        'Reabrir devolve uma bateria encerrada. Excluir só aparece enquanto ela ainda não começou.',
      ],
      figures: [
        {
          src: iniciarCronogramaGif,
          alt: 'Gravação de iniciar, parar e encerrar uma bateria',
          caption: 'Iniciar, parar e encerrar a bateria da vez.',
        },
      ],
    },
    {
      heading: 'Quem fica em cada baia',
      paragraphs: [
        'No seu cronograma, os atletas entram nas baias pelo ranking da categoria. A bateria 1 recebe os piores colocados e a última bateria recebe os melhores. Cada bateria ocupa tantas vagas quanto o número de baias. Esse ranking do painel inclui resultados que você ainda não liberou.',
        'No cronograma público, essa ordem pelo ranking só vale se a Ordenação automática estiver ligada em Configurações, aba Cronograma. Lá o ranking usa apenas resultados liberados. Com a opção ligada, o público vê os nomes só na prova da vez — a mais cedo da categoria que ainda não foi encerrada. As provas seguintes aparecem no horário, sem a lista, até essa prova ser encerrada.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Por que não consigo criar o horário?',
      answer:
        'Já existe outra atividade na mesma data e hora, ou já existe essa bateria para a mesma categoria e prova. Mude o horário ou o número da bateria.',
    },
    {
      question: 'A bateria sumiu para o atleta. O que aconteceu?',
      answer:
        'Bateria encerrada sai do cronograma público. No seu painel ela continua, com o status Encerrada. Use Reabrir se ainda precisar mostrá-la.',
    },
    {
      question: 'Iniciar não funciona.',
      answer:
        'A bateria já está ao vivo ou já foi encerrada. Se estiver encerrada, reabra antes de iniciar de novo.',
    },
    {
      question: 'O público não vê os atletas da próxima prova.',
      answer:
        'Com a ordenação automática ligada, os nomes só aparecem na prova da vez. Encerre a prova atual para a seguinte passar a mostrar a lista. Sem a ordenação automática, o cronograma público não monta as baias pelo ranking.',
    },
  ],
};
