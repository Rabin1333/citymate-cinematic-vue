import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SearchProvider } from './contexts/SearchContext'
import { CinematicEffectsProvider } from './contexts/CinematicEffectsContext'

createRoot(document.getElementById("root")!).render(
  <CinematicEffectsProvider>
    <SearchProvider>
      <App />
    </SearchProvider>
  </CinematicEffectsProvider>
);
