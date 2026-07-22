import { Info } from 'react-feather';

type FieldHintProps = {
  text: string;
};

/** Compact help affordance — full text on hover/focus via native title. */
export function FieldHint({ text }: FieldHintProps) {
  return (
    <button
      type="button"
      className="inline-flex rounded-control p-0.5 text-primary/80 transition hover:bg-primary/10 hover:text-primary"
      title={text}
      aria-label={text}
    >
      <Info size={14} aria-hidden />
    </button>
  );
}
