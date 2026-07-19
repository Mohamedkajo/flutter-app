import { createRoot } from 'react-dom/client';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import App from './App';
import './index.css';

// Wire auth token synchronously before first render so React Query
// always has the token available from the first fetch attempt.
setAuthTokenGetter(() => localStorage.getItem('token'));

createRoot(document.getElementById('root')!).render(<App />);
