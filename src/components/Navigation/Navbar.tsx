import { ThemeToggle } from '../Theme/ThemeToggle';

interface NavItemProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ label, icon, active = false, onClick }: NavItemProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        active
          ? 'bg-green-500/10 text-green-400 border-l-2 border-green-400'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border-l-2 border-transparent'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-mono tracking-wide">{label}</span>
    </button>
  );
}

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem?: string;
  onSalgadoClick?: () => void;
  onChuvaClick?: () => void;
}

export function Navbar({ isOpen, onToggle, activeItem = 'salgado', onSalgadoClick, onChuvaClick }: NavbarProps): JSX.Element {
  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 rounded bg-zinc-800/90 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 md:hidden"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900/95 border-r border-zinc-700/50 z-40 transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-zinc-700/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                Menu
              </span>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <NavItem
              label="Vai ter salgado?"
              icon="🥐"
              active={activeItem === 'salgado'}
              onClick={onSalgadoClick}
            />
            <NavItem
              label="Vai chover?"
              icon="🌧️"
              active={activeItem === 'chuva'}
              onClick={onChuvaClick}
            />
          </div>

          <div className="p-4 border-t border-zinc-700/50">
            <div className="text-[10px] text-zinc-600 font-mono tracking-wide">
              Salgado Assessment System v5.0.0
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}