import axios from 'axios';

const AUTH_LOGOUT_MESSAGES = [
  'Invalid token',
  'Token is missing',
  'User does not exists!',
  'User account is inactive',
];

const wodfulApiPrivate = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_API_URL}`,
});

let isLoggingOut = false;

function forceLogout() {
  if (isLoggingOut) return;
  if (window.location.pathname === '/login') return;

  isLoggingOut = true;
  localStorage.removeItem('@Wodful:usr');
  localStorage.removeItem('@Wodful:tkn');
  window.location.assign('/login');
}

function shouldLogout(status?: number, message?: unknown) {
  if (status === 401) return true;
  if (status === 400 && typeof message === 'string') {
    return AUTH_LOGOUT_MESSAGES.includes(message);
  }
  return false;
}

[wodfulApiPrivate].forEach((instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('@Wodful:tkn');

      if (token) config.headers!.Authorization = `Bearer ${token}`;

      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status as number | undefined;
      const message = error?.response?.data?.message;

      if (shouldLogout(status, message)) {
        forceLogout();
      }

      return Promise.reject(error);
    },
  );
});

export default wodfulApiPrivate;
