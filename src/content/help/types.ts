export type HelpGroupId = 'live' | 'people';

export type HelpResultMode = 'SCORE' | 'RANKING';

export type HelpFigure = {
  src: string;
  alt: string;
  caption?: string;
};

export type HelpStep = {
  text: string;
  figure?: HelpFigure;
};

export type HelpSection = {
  heading: string;
  paragraphs?: string[];
  steps?: Array<string | HelpStep>;
  bullets?: string[];
  figures?: HelpFigure[];
};

export type HelpFaq = {
  question: string;
  answer: string;
};

export type HelpScoringNote = {
  mode: HelpResultMode;
  title: string;
  paragraphs: string[];
  /** Tabelas de 100 e de 50 pontos. Só faz sentido no modo Pontuação. */
  showPointsTable?: boolean;
};

export type HelpArticle = {
  id: string;
  title: string;
  summary: string;
  group: HelpGroupId;
  /** Trecho da rota da tela relacionada, o mesmo de `eventNav`. */
  pathSegment: string;
  sections: HelpSection[];
  scoring?: HelpScoringNote[];
  faqs: HelpFaq[];
};

export type HelpGroup = {
  id: HelpGroupId;
  label: string;
};
