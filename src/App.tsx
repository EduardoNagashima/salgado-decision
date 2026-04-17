import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header/Header';
import { Navbar } from './components/Navigation/Navbar';
import { ModuleGrid } from './components/Modules/ModuleGrid';
import { SalgadoModule } from './components/Modules/SalgadoModule';
import { ChuvaModule } from './components/Modules/ChuvaModule';
import { useWindowSize } from './hooks/useWindowSize';
import './styles/globals.css';

function AppContent(): JSX.Element {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('salgado');
  const { width } = useWindowSize();

  const isMobile = width < 768;

  const closeNavIfMobile = (): void => {
    if (isMobile) {
      setIsNavOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header systemStatus="OK" />

      <div className="flex-1 flex">
        <Navbar
          isOpen={isNavOpen}
          onToggle={() => setIsNavOpen(!isNavOpen)}
          activeItem={activeItem}
          onSalgadoClick={() => { setActiveItem('salgado'); closeNavIfMobile(); }}
          onChuvaClick={() => { setActiveItem('chuva'); closeNavIfMobile(); }}
        />

        <main
          className="flex-1 p-4 md:p-6 overflow-y-auto"
          style={{ marginLeft: isMobile ? 0 : '16rem' }}
        >
          <ModuleGrid>
            <SalgadoModule />
            <ChuvaModule />
          </ModuleGrid>
        </main>
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}