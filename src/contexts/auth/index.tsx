import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { AuthenticatedUser, IAuthenticateUserRequest, IUserData } from '@/data/interfaces/user';
import { AuthenticateService } from '@/services/Authenticate';
import { PublicAccessService } from '@/services/Public/Access';
import { createContext, useCallback, useEffect, useState } from 'react';
import { PublicUser } from '../../data/interfaces/user/index';

interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthContextData {
  signed: boolean;
  user: IUserData | null;
  Login({ email, password }: IAuthenticateUserRequest): Promise<void>;
  Logout(): void;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  access: string | null;
  Access: (accessCode: string) => Promise<void>;
  Reset(): void;
}

const AuthContext = createContext({} as AuthContextData);

const axios = new AxiosAdapter();

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<IUserData | null>(null);
  const [access, setAccessCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const Login = useCallback(async ({ email, password }: IAuthenticateUserRequest) => {
    setIsLoading(true);
    await new AuthenticateService(axios)
      .login({ email, password })
      .then((userData: AuthenticatedUser) => {
        setIsError(false);
        setErrorMessage(null);
        setUser(userData.user);

        localStorage.setItem('@Wodful:usr', JSON.stringify(userData.user));
        localStorage.setItem('@Wodful:tkn', userData.token);
      })
      .catch((err: unknown) => {
        setIsError(true);
        const message = err instanceof Error ? err.message : '';
        if (message.includes('inactive')) {
          setErrorMessage('Sua conta está desativada. Fale com o suporte Wodful.');
        } else if (message.includes('no access')) {
          setErrorMessage('Sua conta não possui acesso ao sistema.');
        } else {
          setErrorMessage('E-mail ou senha incorreto.');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const Logout = useCallback(() => {
    setUser(null);

    localStorage.removeItem('@Wodful:usr');
    localStorage.removeItem('@Wodful:tkn');
  }, []);

  const Access = useCallback(async (accessCode: string): Promise<void> => {
    setIsLoading(true);
    await new PublicAccessService(axios)
      .access(accessCode)
      .then((access: PublicUser) => {
        setIsError(false);
        setAccessCode(access.code);
        localStorage.setItem('@Wodful:access', access.code);
        localStorage.setItem('@Wodful:pcname', access.championship.name);
      })
      .catch(() => {
        setIsError(true);
        setErrorMessage(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const Reset = useCallback(() => {
    setAccessCode(null);
    localStorage.removeItem('@Wodful:access');
    localStorage.removeItem('@Wodful:pcname');
  }, []);

  useEffect(() => {
    const storagedUser = localStorage.getItem('@Wodful:usr');
    const storagedToken = localStorage.getItem('@Wodful:tkn');
    const storagedCode = localStorage.getItem('@Wodful:access');

    if (storagedCode) setAccessCode(storagedCode);
    if (storagedToken && storagedUser) {
      setUser(JSON.parse(storagedUser));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signed: Boolean(user),
        user,
        Login,
        Logout,
        isLoading,
        isError,
        errorMessage,
        Access,
        Reset,
        access,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
