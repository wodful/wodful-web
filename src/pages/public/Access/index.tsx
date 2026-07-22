import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import { AuthShell } from '@/components/ui/AuthShell';
import { Button } from '@/components/ui/Button';
import { fieldInputClass, FormField } from '@/components/ui/FormField';
import useAuth from '@/hooks/useAuth';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Access = () => {
  const { Access, isError, isLoading, access } = useAuth();
  const [accessCode, setAccessCode] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isEmpty = useMemo(() => !accessCode.trim().length, [accessCode]);
  const accessErrorId = 'access-code-error';
  const errorText = isError ? 'Código incorreto ou inválido' : undefined;

  const handlePublicAccess = useCallback(() => {
    const code = accessCode.trim().toUpperCase();
    if (!code || isLoading) return;

    AnalyticsAdapter.event({
      action: 'buscar_competição_com_código',
      category: 'Atleta',
      label: 'Continuar com código',
      value: `${code}`,
    });
    Access(code).then(() => {
      return navigate(`/access/${code}/leaderboards`);
    });
  }, [Access, accessCode, isLoading, navigate]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    handlePublicAccess();
  }

  useEffect(() => {
    if (access) navigate(`/access/${access}/leaderboards`);
    AnalyticsAdapter.pageview(location.pathname);
  }, [location.pathname, access, navigate]);

  useEffect(() => {
    if (isError) {
      codeRef.current?.focus();
    }
  }, [isError]);

  return (
    <AuthShell
      headline="Acompanhe o campeonato em tempo real."
      description="Ranking, cronograma e provas com o código liberado pelo organizador."
    >
      <form
        className="flex flex-col gap-8"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Acesso ao campeonato"
      >
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Código do campeonato
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500">
            Informe o código para entrar na área pública do evento.
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            id="accessCode"
            label="Código de acesso"
            error={errorText}
            errorId={accessErrorId}
          >
            <input
              ref={codeRef}
              id="accessCode"
              type="text"
              autoFocus
              autoComplete="off"
              inputMode="text"
              spellCheck={false}
              placeholder="Ex: NADAI2026"
              className={fieldInputClass(isError)}
              value={accessCode}
              aria-invalid={isError || undefined}
              aria-describedby={isError ? accessErrorId : undefined}
              onChange={(event) => {
                setAccessCode(event.target.value.toUpperCase());
              }}
            />
          </FormField>

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isEmpty || isLoading}
            className="mt-2 w-full"
          >
            Continuar
          </Button>
        </div>

        <div className="space-y-3 border-t border-gray-200 pt-6">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-gray-400">
            Ou
          </p>
          <p className="text-center text-sm text-gray-600">
            É organizador e quer gerenciar o evento?
          </p>
          <Link
            to="/login"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-control border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-800 transition hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Entrar na plataforma
          </Link>
        </div>
      </form>
    </AuthShell>
  );
};

export default Access;
