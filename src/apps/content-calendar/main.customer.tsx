import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../index.css';
import ContentCalendarApp from './ContentCalendarApp';

createRoot(document.getElementById('cc-root')!).render(
  <StrictMode>
    <ContentCalendarApp />
  </StrictMode>,
);
