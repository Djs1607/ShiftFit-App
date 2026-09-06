import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

// iOS Safari's native pinch-zoom gesture can ignore the `touch-action` CSS
// restriction outside standalone/PWA mode — block it at the event level too
// so pinch and double-tap zoom both stay off, matching the fixed viewport.
document.addEventListener('gesturestart', (e: Event) => e.preventDefault());
document.addEventListener(
  'touchmove',
  (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault(); },
  { passive: false },
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
