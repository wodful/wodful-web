import { IUserData } from '@/data/interfaces/user';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function decodeBase64Json<T>(value: string): T | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as T;
  } catch {
    return null;
  }
}

function userFromJwt(token: string): IUserData | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const claims = decodeBase64Json<{ username?: string; role?: string }>(payload);
    if (!claims?.username) return null;

    return {
      name: claims.username,
      email: '',
      role: claims.role,
    };
  } catch {
    return null;
  }
}

const Impersonate = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (!token) {
      setError('Token de impersonação ausente.');
      return;
    }

    const userFromQuery = userParam ? decodeBase64Json<IUserData>(userParam) : null;
    const user = userFromQuery ?? userFromJwt(token);

    if (!user?.name) {
      setError('Não foi possível identificar o usuário.');
      return;
    }

    localStorage.setItem('@Wodful:tkn', token);
    localStorage.setItem('@Wodful:usr', JSON.stringify(user));
    window.location.href = '/championships';
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-base font-medium text-red-600">{error}</p>
            <a
              href="/login"
              className="mt-4 inline-block text-sm text-gray-600 underline underline-offset-2"
            >
              Voltar ao login
            </a>
          </>
        ) : (
          <p className="text-base text-gray-600">Entrando como organizador…</p>
        )}
      </div>
    </div>
  );
};

export default Impersonate;
