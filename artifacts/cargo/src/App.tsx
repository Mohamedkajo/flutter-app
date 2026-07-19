import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Router as WouterRouter } from 'wouter';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PhoneFrame } from '@/components/PhoneFrame';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import Routes from './Routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

/** Keeps the custom-fetch auth token getter in sync with the auth context. */
function AuthTokenBridge() {
  const { token } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthTokenBridge />
          <TooltipProvider>
            <PhoneFrame>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <Routes />
              </WouterRouter>
            </PhoneFrame>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
