import { useState } from 'react';
import { Plus, X } from 'react-feather';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';

type ShirtSizeManagerProps = {
  sizes: string[];
  setSizes: (sizes: string[]) => void;
};

const ShirtSizeManager = ({ sizes, setSizes }: ShirtSizeManagerProps) => {
  const [size, setSize] = useState('');

  const addSize = () => {
    const next = size.trim().toUpperCase();
    if (!next || sizes.includes(next)) return;
    setSizes([...sizes, next]);
    setSize('');
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <FormField
        id="shirt-size"
        label="Tamanhos"
        hint="Ex.: P, M, G. Pressione Enter para adicionar."
      >
        <div className="flex items-center gap-2">
          <Input
            id="shirt-size"
            type="text"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addSize();
              }
            }}
            placeholder="Adicione um tamanho"
            className="flex-1"
          />
          <button
            type="button"
            disabled={!size.trim()}
            onClick={addSize}
            aria-label="Adicionar tamanho"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} aria-hidden />
          </button>
        </div>
      </FormField>

      {sizes.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {sizes.map((item, index) => (
            <li key={`${item}-${index}`} className="list-none">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {item}
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="rounded-full p-0.5 transition hover:bg-white/20"
                  aria-label={`Remover ${item}`}
                >
                  <X size={12} aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">Nenhum tamanho adicionado.</p>
      )}
    </div>
  );
};

export default ShirtSizeManager;
