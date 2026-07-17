import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import queryClient from './queryClient';
import './styles/global.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
   <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
   </QueryClientProvider>
);