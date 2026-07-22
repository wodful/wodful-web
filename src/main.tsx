import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from '@/components/ui/Toast';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ToastProvider>
    <App />
  </ToastProvider>,
);
