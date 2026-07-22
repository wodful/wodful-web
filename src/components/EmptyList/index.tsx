import { Link } from 'react-router-dom';
import { FolderPlus } from 'react-feather';
import { Button } from '@/components/ui/Button';

type EmptyListProps = {
  text: string;
  linkTo?: string;
  textLinkTo?: string;
  contentButton?: string;
  /** Primary CTA click — kept as onClose for existing call sites */
  onClose?: () => void;
};

export const EmptyList = ({
  contentButton,
  onClose,
  text,
  linkTo,
  textLinkTo,
}: EmptyListProps) => (
  <div className="mx-auto mt-[15vh] flex max-w-sm flex-col items-center gap-3 px-4 text-center">
    <FolderPlus size={48} className="text-gray-400" aria-hidden />
    <p className="text-sm text-gray-600 sm:text-base">{text}</p>

    {contentButton ? (
      <Button variant="primary" onClick={onClose} className="mt-1 w-full">
        {contentButton.trim()}
      </Button>
    ) : null}

    {linkTo ? (
      <Link
        to={linkTo}
        className="text-sm font-semibold text-primary no-underline hover:underline"
      >
        {textLinkTo}
      </Link>
    ) : null}
  </div>
);
