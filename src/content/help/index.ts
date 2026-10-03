import { leaderboardsArticle } from './articles/leaderboards';
import { participantsArticle } from './articles/participants';
import { resultsArticle } from './articles/results';
import { schedulesArticle } from './articles/schedules';
import { subscriptionsArticle } from './articles/subscriptions';
import type { HelpArticle, HelpFaq, HelpGroup, HelpResultMode, HelpStep } from './types';

export const HELP_GROUPS: HelpGroup[] = [
  { id: 'live', label: 'Ao vivo' },
  { id: 'people', label: 'Pessoas' },
];

export const HELP_ARTICLES: HelpArticle[] = [
  schedulesArticle,
  resultsArticle,
  leaderboardsArticle,
  subscriptionsArticle,
  participantsArticle,
];

export const HELP_RESULT_MODE_LABEL: Record<HelpResultMode, string> = {
  SCORE: 'Pontuação',
  RANKING: 'Colocação',
};

export function asHelpResultMode(value: string | null | undefined): HelpResultMode | null {
  if (value === 'SCORE' || value === 'RANKING') return value;
  return null;
}

export function normalizeHelpQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function stepText(step: string | HelpStep): string {
  return typeof step === 'string' ? step : step.text;
}

function articleBlob(article: HelpArticle): string {
  const parts: string[] = [article.title, article.summary];

  for (const section of article.sections) {
    parts.push(section.heading, ...(section.paragraphs ?? []), ...(section.bullets ?? []));
    for (const step of section.steps ?? []) {
      parts.push(stepText(step));
      const figure = typeof step === 'string' ? undefined : step.figure;
      if (figure) parts.push(figure.alt, figure.caption ?? '');
    }
    for (const figure of section.figures ?? []) {
      parts.push(figure.alt, figure.caption ?? '');
    }
  }

  for (const note of article.scoring ?? []) {
    parts.push(note.title, ...note.paragraphs);
  }

  for (const faq of article.faqs) {
    parts.push(faq.question, faq.answer);
  }

  return normalizeHelpQuery(parts.join('\n'));
}

const articleBlobs = new Map(HELP_ARTICLES.map((article) => [article.id, articleBlob(article)]));

export function filterHelpArticles(query: string): HelpArticle[] {
  const normalized = normalizeHelpQuery(query);
  if (!normalized) return HELP_ARTICLES;
  return HELP_ARTICLES.filter((article) => articleBlobs.get(article.id)?.includes(normalized));
}

export function faqMatchesQuery(faq: HelpFaq, query: string): boolean {
  const normalized = normalizeHelpQuery(query);
  if (!normalized) return false;
  return normalizeHelpQuery(`${faq.question}\n${faq.answer}`).includes(normalized);
}

export { HELP_POINTS_100, HELP_POINTS_50 } from './points';
export type {
  HelpArticle,
  HelpFaq,
  HelpFigure,
  HelpGroup,
  HelpResultMode,
  HelpScoringNote,
  HelpSection,
  HelpStep,
} from './types';
