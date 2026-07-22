import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import { AuthShell } from '@/components/ui/AuthShell';
import { Button } from '@/components/ui/Button';
import { fieldInputClass, FormField } from '@/components/ui/FormField';
import { WHATSAPP_SUPPORT_PASSWORD_URL } from '@/constants/whatsapp';
import useAuth from '@/hooks/useAuth';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Login = () => {
  const { Login, isError, isLoading, errorMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const isEmpty = !email.length || !password.length;
  const loginErrorId = 'login-error';
  const errorText = isError
    ? errorMessage || 'E-mail ou senha incorreto.'
    : undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isEmpty || isLoading) return;

    AnalyticsAdapter.event({
      action: 'realizar_login',
      category: 'ADM',
      label: 'Realizando login na app',
      value: `${email}`,
    });
    Login({ email, password });
  }

  useEffect(() => {
    AnalyticsAdapter.pageview(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (isError) {
      emailRef.current?.focus();
    }
  }, [isError]);

  return (
    <AuthShell
      headline="Organize competições com clareza e controle."
      description="Inscrições, categorias, resultados e cronograma em um só lugar."
      logoDataCy="logo-wodful"
    >
      <form
        className="flex flex-col gap-8"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Login do organizador"
      >
        <div className="space-y-2">
          <h1
            className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
            data-cy="login-title"
          >
            Entrar na plataforma
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500">
            Use o e-mail e a senha da sua conta de organizador.
          </p>
        </div>

        <div className="space-y-4">
          <FormField id="email" label="E-mail" errorId={loginErrorId}>
            <input
              ref={emailRef}
              id="email"
              type="email"
              autoFocus
              autoComplete="email"
              placeholder="voce@email.com"
              data-cy="input-email"
              className={fieldInputClass(isError)}
              value={email}
              aria-invalid={isError || undefined}
              aria-describedby={isError ? loginErrorId : undefined}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>

          <FormField id="password" label="Senha" errorId={loginErrorId}>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                data-cy="input-senha"
                className={`${fieldInputClass(isError)} pr-12`}
                value={password}
                aria-invalid={isError || undefined}
                aria-describedby={isError ? loginErrorId : undefined}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-1.5 top-1/2 inline-flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-control text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </FormField>

          {errorText ? (
            <p
              id={loginErrorId}
              role="alert"
              className="text-sm text-red-600"
              data-cy="error-message"
            >
              {errorText}
            </p>
          ) : null}

          <Button
            type="submit"
            isLoading={isLoading}
            loadingLabel="Entrando…"
            disabled={isEmpty || isLoading}
            data-cy="button-continuar"
            className="mt-2 w-full"
          >
            Continuar
          </Button>

          <p className="text-center text-sm text-gray-500">
            Esqueceu a senha?{' '}
            <a
              href={WHATSAPP_SUPPORT_PASSWORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary transition hover:text-primary-hover"
            >
              Fale com a equipe Wodful
            </a>
          </p>
        </div>

        <div className="space-y-3 border-t border-gray-200 pt-6">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-gray-400">
            Ou
          </p>
          <p className="text-center text-sm text-gray-600">
            É atleta e quer ver o campeonato?
          </p>
          <Link
            to="/access"
            data-cy="link-acesso"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-control border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-800 transition hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Acessar com código
          </Link>
        </div>
      </form>
    </AuthShell>
  );
};

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.5 10.6a3 3 0 0 0 4 4M9.4 5.5A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-4.2 4.8M6.1 6.2A17.5 17.5 0 0 0 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.9-.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Login;
