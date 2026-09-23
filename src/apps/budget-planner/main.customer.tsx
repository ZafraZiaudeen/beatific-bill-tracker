import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../index.css';
import { LedgerlyApp } from './LedgerlyApp';

createRoot(document.getElementById('ldg-root')!).render(
  <StrictMode>
    <LedgerlyApp />
  </StrictMode>,
);
