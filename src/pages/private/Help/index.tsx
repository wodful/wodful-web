import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { eventPath } from '@/constants/eventNav';
import {
  HELP_GROUPS,
  HELP_POINTS_50,
  HELP_POINTS_100,
  HELP_RESULT_MODE_LABEL,
  asHelpResultMode,
  faqMatchesQuery,
  filterHelpArticles,
  type HelpArticle,
  type HelpResultMode,
  type HelpScoringNote,
  type HelpFigure,
  type HelpSection,
  type HelpStep,
} from '@/content/help';
import useApp from '@/hooks/useApp';
import { ChampionshipService } from '@/services/Championship';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'react-feather';
import { Link, useParams, useSearchParams } from 'react-router-dom';

const championshipService = new ChampionshipService(new AxiosAdapter());

function PointsGrid({
  caption,
  rows,
}: {
  caption: string;
  rows: { place: number; points: number }[];
}) {
  return (
    <details className='rounded-control border border-slate-200 bg-white'>
      <summary className='cursor-pointer px-3 py-2 text-sm font-semibold text-slate-800'>
        {caption}
      </summary>
      <div className='grid grid-cols-3 gap-1 px-3 pb-3 sm:grid-cols-5'>
        {rows.map((row) => (
          <div
            key={row.place}
            className='flex items-baseline justify-between rounded bg-slate-50 px-2 py-1 text-xs'
          >
            <span className='font-semibold text-slate-700'>{row.place}º</span>
            <span className='tabular-nums text-slate-500'>{row.points}</span>
          </div>
        ))}
      </div>
    </details>
  );
}

function ScoringNotes({
  notes,
  eventMode,
}: {
  notes: HelpScoringNote[];
  eventMode: HelpResultMode | null;
}) {
  const ordered = eventMode
    ? [...notes].sort((a, b) => Number(b.mode === eventMode) - Number(a.mode === eventMode))
    : notes;

  return (
    <div className='space-y-3'>
      {ordered.map((note) => {
        const isCurrent = eventMode === note.mode;
        return (
          <section
            key={note.mode}
            className={
              isCurrent
                ? 'rounded-surface border border-primary/30 bg-primary/5 px-4 py-3'
                : 'rounded-surface border border-slate-200 bg-slate-50 px-4 py-3'
            }
          >
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-sm font-semibold text-slate-900'>{note.title}</h3>
              {isCurrent ? (
                <span className='rounded-chip bg-primary px-2 py-0.5 text-[11px] font-semibold text-white'>
                  Modo deste evento
                </span>
              ) : eventMode ? (
                <span className='rounded-chip bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600'>
                  Outro modo
                </span>
              ) : null}
            </div>
            <div className='mt-2 space-y-2'>
              {note.paragraphs.map((paragraph) => (
                <p key={paragraph} className='text-sm leading-relaxed text-slate-700'>
                  {paragraph}
                </p>
              ))}
            </div>
            {note.showPointsTable ? (
              <div className='mt-3 space-y-2'>
                <PointsGrid caption='Tabela de 100 pontos' rows={HELP_POINTS_100} />
                <PointsGrid caption='Tabela de 50 pontos' rows={HELP_POINTS_50} />
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function stepText(step: string | HelpStep): string {
  return typeof step === 'string' ? step : step.text;
}

function HelpFigureView({ figure }: { figure: HelpFigure }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <figure className='mt-2 space-y-1.5'>
      <button
        type='button'
        onClick={() => dialogRef.current?.showModal()}
        className='block w-full overflow-hidden rounded-surface border border-slate-200 bg-slate-50 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      >
        <img src={figure.src} alt={figure.alt} className='w-full object-contain object-top' />
      </button>
      {figure.caption ? (
        <figcaption className='text-xs leading-relaxed text-slate-500'>{figure.caption}</figcaption>
      ) : null}
      <dialog
        ref={dialogRef}
        className='w-[min(100%-1.5rem,56rem)] rounded-surface bg-white p-3 backdrop:bg-slate-900/60'
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <img src={figure.src} alt={figure.alt} className='max-h-[80vh] w-full object-contain' />
        {figure.caption ? <p className='mt-2 text-sm text-slate-600'>{figure.caption}</p> : null}
      </dialog>
    </figure>
  );
}

function SectionBlock({ section }: { section: HelpSection }) {
  return (
    <section className='space-y-2'>
      <h3 className='text-sm font-semibold text-slate-900'>{section.heading}</h3>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className='text-sm leading-relaxed text-slate-600'>
          {paragraph}
        </p>
      ))}
      {section.steps ? (
        <ol className='list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-600'>
          {section.steps.map((step) => {
            const figure = typeof step === 'string' ? undefined : step.figure;
            return (
              <li key={stepText(step)}>
                {stepText(step)}
                {figure ? <HelpFigureView figure={figure} /> : null}
              </li>
            );
          })}
        </ol>
      ) : null}
      {section.bullets ? (
        <ul className='list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600'>
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {section.figures?.map((figure) => (
        <HelpFigureView key={figure.src} figure={figure} />
      ))}
    </section>
  );
}

function ArticleCard({
  article,
  championshipId,
  eventMode,
  query,
  open,
  onToggle,
}: {
  article: HelpArticle;
  championshipId: string;
  eventMode: HelpResultMode | null;
  query: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      id={`ajuda-${article.id}`}
      className='scroll-mt-24 rounded-surface border border-slate-200 bg-white shadow-sm'
    >
      <button
        type='button'
        className='flex w-full items-start gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary'
        aria-expanded={open}
        aria-controls={`ajuda-panel-${article.id}`}
        onClick={onToggle}
      >
        <span className='min-w-0 flex-1'>
          <span className='block text-base font-semibold text-slate-900'>{article.title}</span>
          <span className='mt-1 block text-sm leading-relaxed text-slate-500'>
            {article.summary}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`mt-1 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={`ajuda-panel-${article.id}`}
          className='space-y-5 border-t border-slate-100 px-4 py-4'
        >
          {article.scoring?.length ? (
            <ScoringNotes notes={article.scoring} eventMode={eventMode} />
          ) : null}

          {article.sections.map((section) => (
            <SectionBlock key={section.heading} section={section} />
          ))}

          <div className='space-y-2'>
            <h3 className='text-sm font-semibold text-slate-900'>Dúvidas frequentes</h3>
            {article.faqs.map((faq) => (
              <details
                key={`${query}-${faq.question}`}
                className='rounded-control border border-slate-200'
                {...(query ? { open: faqMatchesQuery(faq, query) } : {})}
              >
                <summary className='cursor-pointer px-3 py-2 text-sm font-medium text-slate-800'>
                  {faq.question}
                </summary>
                <p className='px-3 pb-3 text-sm leading-relaxed text-slate-600'>{faq.answer}</p>
              </details>
            ))}
          </div>

          <Link
            to={eventPath(championshipId, article.pathSegment)}
            className='inline-flex text-sm font-semibold text-primary hover:underline'
          >
            Ir para {article.title}
          </Link>
        </div>
      ) : null}
    </article>
  );
}

const HelpCenter = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const artigo = searchParams.get('artigo');
  const { currentChampionship } = useApp();
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(() => (artigo ? [artigo] : []));
  const [eventMode, setEventMode] = useState<HelpResultMode | null>(() =>
    currentChampionship?.id === id ? asHelpResultMode(currentChampionship.resultType) : null,
  );

  useEffect(() => {
    if (!id) return;

    if (currentChampionship?.id === id && currentChampionship.resultType) {
      setEventMode(asHelpResultMode(currentChampionship.resultType));
      return;
    }

    let cancelled = false;
    championshipService
      .getById(id)
      .then((championship) => {
        if (!cancelled) setEventMode(asHelpResultMode(championship.resultType));
      })
      .catch(() => {
        if (!cancelled) setEventMode(null);
      });

    return () => {
      cancelled = true;
    };
  }, [currentChampionship, id]);

  useEffect(() => {
    if (!artigo) return;
    setOpenIds((current) => (current.includes(artigo) ? current : [...current, artigo]));
    document.getElementById(`ajuda-${artigo}`)?.scrollIntoView({ block: 'start' });
  }, [artigo]);

  const articles = useMemo(() => filterHelpArticles(query), [query]);

  const toggle = (articleId: string) => {
    setOpenIds((current) =>
      current.includes(articleId)
        ? current.filter((item) => item !== articleId)
        : [...current, articleId],
    );
  };

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  if (!id) return null;

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8'>
      <header className='mb-5'>
        <p className='text-xs font-semibold uppercase tracking-wide text-primary'>Evento</p>
        <h1 className='mt-1 text-2xl font-bold text-slate-900'>Ajuda</h1>
        <p className='mt-1 text-sm text-slate-500'>
          Regras do dia: cronograma, resultados, leaderboard, inscrições e participantes.
        </p>
      </header>

      {eventMode ? (
        <p className='mb-4 rounded-surface border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700'>
          Este evento usa <span className='font-semibold'>{HELP_RESULT_MODE_LABEL[eventMode]}</span>
          . Resultados e leaderboard destacam essa regra.
        </p>
      ) : null}

      <form onSubmit={onSearch} className='relative mb-6'>
        <Search
          size={16}
          className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
          aria-hidden
        />
        <Input
          id='help-search'
          className='!pl-10'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Buscar uma dúvida'
          aria-label='Buscar na ajuda'
          autoComplete='off'
        />
      </form>

      {articles.length === 0 ? (
        <EmptyState
          icon={<HelpCircle size={22} aria-hidden />}
          title='Nenhuma dúvida encontrada'
          description='Tente cronograma, liberar, empate, isenta ou kit.'
          actionLabel='Limpar busca'
          onAction={() => setQuery('')}
        />
      ) : (
        <div className='space-y-8'>
          {HELP_GROUPS.map((group) => {
            const groupArticles = articles.filter((article) => article.group === group.id);
            if (!groupArticles.length) return null;

            return (
              <section key={group.id} className='space-y-3'>
                <h2 className='text-xs font-semibold uppercase tracking-wide text-slate-400'>
                  {group.label}
                </h2>
                {groupArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    championshipId={id}
                    eventMode={eventMode}
                    query={query.trim()}
                    open={Boolean(query.trim()) || openIds.includes(article.id)}
                    onToggle={() => {
                      if (query.trim()) return;
                      toggle(article.id);
                    }}
                  />
                ))}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HelpCenter;
