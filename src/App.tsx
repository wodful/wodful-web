import { AuthProvider } from '@/contexts/auth';
import { CouponProvider } from '@/contexts/coupon';
import { ThemeProvider } from '@/contexts/theme';
import Routes from '@/routes';
import { AppProvider } from './contexts/app';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CouponProvider>
          <AppProvider>
            <Routes />
          </AppProvider>
        </CouponProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
