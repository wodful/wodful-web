import { HelpCircle } from 'react-feather';
import { Link, useParams } from 'react-router-dom';

import { eventPath } from '@/constants/eventNav';

type HelpArticleLinkProps = {
  articleId: string;
};

export function HelpArticleLink({ articleId }: HelpArticleLinkProps) {
  const { id } = useParams();
  if (!id) return null;

  return (
    <Link
      to={`${eventPath(id, 'ajuda')}?artigo=${encodeURIComponent(articleId)}`}
      className='inline-flex min-h-10 items-center gap-1.5 rounded-control px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
    >
      <HelpCircle size={16} aria-hidden />
      Ajuda
    </Link>
  );
}
