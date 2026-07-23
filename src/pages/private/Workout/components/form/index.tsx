import { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import useCategoryData from '@/hooks/useCategoryData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { validationMessages } from '@/utils/messages';
import { useEffect, useMemo, useState } from 'react';

const WORKOUT_TYPES = ['EMOM', 'FORTIME', 'AMRAP', 'PR'] as const;

type CategoryDraft = {
  description: string;
  workoutType: string;
  worthHalfPoints: boolean;
};

interface IFormChampionshipProps {
  id: string;
  onClose: () => void;
  showHalfPointsOption?: boolean;
}

const emptyDraft = (): CategoryDraft => ({
  description: '',
  workoutType: '',
  worthHalfPoints: false,
});

const FormWorkout = ({ id, onClose, showHalfPointsOption = false }: IFormChampionshipProps) => {
  const { CreateMany, isLoading } = useWorkoutData();
  const { List, categories } = useCategoryData();

  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [drafts, setDrafts] = useState<Record<string, CategoryDraft>>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    List(id);
  }, [List, id]);

  const selectedCategories = useMemo(
    () => categories.filter((category) => selectedIds.includes(category.id)),
    [categories, selectedIds],
  );

  const activeCategory =
    selectedCategories.find((category) => category.id === activeCategoryId) ??
    selectedCategories[0];

  const activeDraft = activeCategory
    ? drafts[activeCategory.id] ?? emptyDraft()
    : emptyDraft();

  useEffect(() => {
    if (!selectedIds.length) {
      setActiveCategoryId('');
      return;
    }
    if (!selectedIds.includes(activeCategoryId)) {
      setActiveCategoryId(selectedIds[0]);
    }
  }, [selectedIds, activeCategoryId]);

  const toggleCategory = (categoryId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(categoryId)) {
        setDrafts((current) => {
          const next = { ...current };
          delete next[categoryId];
          return next;
        });
        return prev.filter((id) => id !== categoryId);
      }

      const template = prev[0] ? drafts[prev[0]] : undefined;
      setDrafts((current) => ({
        ...current,
        [categoryId]: {
          description: '',
          workoutType: template?.workoutType ?? '',
          worthHalfPoints: template?.worthHalfPoints ?? false,
        },
      }));
      setActiveCategoryId(categoryId);
      return [...prev, categoryId];
    });
  };

  const updateActiveDraft = (patch: Partial<CategoryDraft>) => {
    if (!activeCategory) return;
    setDrafts((current) => ({
      ...current,
      [activeCategory.id]: {
        ...(current[activeCategory.id] ?? emptyDraft()),
        ...patch,
      },
    }));
  };

  const applyTypeToOthers = () => {
    if (!activeCategory || !activeDraft.workoutType) return;
    setDrafts((current) => {
      const next = { ...current };
      for (const categoryId of selectedIds) {
        if (categoryId === activeCategory.id) continue;
        next[categoryId] = {
          ...(next[categoryId] ?? emptyDraft()),
          workoutType: activeDraft.workoutType,
        };
      }
      return next;
    });
  };

  const copyDescriptionFrom = (sourceId: string) => {
    const source = drafts[sourceId];
    if (!source || !activeCategory) return;
    updateActiveDraft({ description: source.description });
  };

  const nameError =
    touched && (name.trim().length < 4 || name.trim().length > 50)
      ? name.trim().length < 4
        ? validationMessages['minLength']
        : validationMessages['maxLengthSm']
      : undefined;

  const categoriesError =
    touched && selectedIds.length === 0 ? 'Selecione ao menos uma categoria' : undefined;

  const draftErrors = useMemo(() => {
    const errors: Record<string, { description?: string; workoutType?: string }> = {};
    for (const categoryId of selectedIds) {
      const draft = drafts[categoryId];
      if (!draft) continue;
      const entry: { description?: string; workoutType?: string } = {};
      if (!draft.workoutType) entry.workoutType = validationMessages['required'];
      if (!draft.description.trim() || draft.description.trim().length < 4) {
        entry.description = validationMessages['minLength'];
      } else if (draft.description.length > 1400) {
        entry.description = validationMessages['maxLengthSm'];
      }
      if (entry.description || entry.workoutType) errors[categoryId] = entry;
    }
    return errors;
  }, [drafts, selectedIds]);

  const incompleteCount = Object.keys(draftErrors).length;

  const canSubmit =
    name.trim().length >= 4 &&
    name.trim().length <= 50 &&
    selectedIds.length > 0 &&
    incompleteCount === 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    const payload = selectedIds.map((categoryId) => {
      const draft = drafts[categoryId];
      return {
        name: name.trim(),
        championshipId: id,
        categoryId,
        description: draft.description.trim(),
        workoutType: draft.workoutType,
        worthHalfPoints: showHalfPointsOption ? draft.worthHalfPoints : false,
      };
    });

    const ok = await CreateMany(payload);
    if (ok) onClose();
  };

  const activeErrors = activeCategory ? draftErrors[activeCategory.id] : undefined;
  const copySources = selectedCategories.filter(
    (category) => category.id !== activeCategory?.id,
  );

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
      <FormField id="workout-name" label="Nome da prova" error={nameError}>
        <Input
          id="workout-name"
          placeholder="Ex.: Prova 1 - Detonado"
          invalid={!!nameError}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormField>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-800">1. Escolha as categorias</p>
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma categoria cadastrada neste evento.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Selecionar categorias">
            {categories.map((category) => {
              const active = selectedIds.includes(category.id);
              const hasError = !!draftErrors[category.id];
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleCategory(category.id)}
                  className={[
                    'rounded-chip px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    active
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    touched && hasError ? 'ring-2 ring-red-300' : '',
                  ].join(' ')}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
        {categoriesError ? (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {categoriesError}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500">
            Marque todas em que a prova existe. Depois preencha uma de cada vez.
          </p>
        )}
      </div>

      {activeCategory ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-sm font-medium text-slate-800">2. Preencha cada categoria</p>
            {incompleteCount > 0 && touched ? (
              <p className="text-xs font-medium text-amber-700">
                {incompleteCount}{' '}
                {incompleteCount === 1 ? 'categoria incompleta' : 'categorias incompletas'}
              </p>
            ) : null}
          </div>

          {selectedCategories.length > 1 ? (
            <div
              className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2"
              role="tablist"
              aria-label="Categoria em edição"
            >
              {selectedCategories.map((category) => {
                const selected = category.id === activeCategory.id;
                const hasError = !!draftErrors[category.id];
                const complete =
                  !hasError &&
                  !!drafts[category.id]?.workoutType &&
                  (drafts[category.id]?.description.trim().length ?? 0) >= 4;

                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={[
                      'rounded-control px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                      selected
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {category.name}
                    {complete ? (
                      <span className="ml-1.5 opacity-70" aria-hidden>
                        ✓
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div
            role="tabpanel"
            className="space-y-3 rounded-surface border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{activeCategory.name}</p>
              {copySources.length > 0 ? (
                <Select
                  className="!min-h-9 max-w-[220px] !py-1.5 text-xs"
                  value=""
                  aria-label={`Copiar descrição para ${activeCategory.name}`}
                  onChange={(e) => {
                    if (e.target.value) copyDescriptionFrom(e.target.value);
                    e.target.value = '';
                  }}
                >
                  <option value="">Copiar descrição de…</option>
                  {copySources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </Select>
              ) : null}
            </div>

            <FormField
              id="workout-type-active"
              label="Tipo"
              error={touched ? activeErrors?.workoutType : undefined}
            >
              <Select
                id="workout-type-active"
                invalid={touched && !!activeErrors?.workoutType}
                value={activeDraft.workoutType}
                onChange={(e) => updateActiveDraft({ workoutType: e.target.value })}
              >
                <option value="">Selecione o tipo</option>
                {WORKOUT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>

            {selectedCategories.length > 1 && activeDraft.workoutType ? (
              <button
                type="button"
                onClick={applyTypeToOthers}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Usar este tipo nas outras categorias
              </button>
            ) : null}

            <FormField
              id="workout-desc-active"
              label="Descrição / WOD"
              error={touched ? activeErrors?.description : undefined}
            >
              <Textarea
                id="workout-desc-active"
                placeholder={`WOD de ${activeCategory.name}`}
                invalid={touched && !!activeErrors?.description}
                value={activeDraft.description}
                onChange={(e) => updateActiveDraft({ description: e.target.value })}
                className="min-h-[7rem]"
              />
            </FormField>

            {showHalfPointsOption ? (
              <label htmlFor="half-active" className="flex cursor-pointer items-center gap-2.5">
                <input
                  id="half-active"
                  type="checkbox"
                  checked={activeDraft.worthHalfPoints}
                  onChange={(e) => updateActiveDraft({ worthHalfPoints: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/25"
                />
                <span className="text-sm text-slate-700">Vale 50 pts nesta categoria</span>
              </label>
            ) : null}
          </div>
        </div>
      ) : null}

      <ModalFooter>
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={touched ? !canSubmit : !name.trim() || selectedIds.length === 0}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {selectedIds.length > 1
            ? `Adicionar em ${selectedIds.length} categorias`
            : 'Adicionar'}
        </Button>
      </ModalFooter>
    </form>
  );
};

export default FormWorkout;
