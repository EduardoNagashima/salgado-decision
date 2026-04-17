import { useState, useEffect } from 'react';
import { formatTime, formatDate } from '../../utils/dateUtils';
import { getISOWeek } from '../../utils/dateUtils';

export function Clock(): JSX.Element {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right">
      <div className="font-display text-xl tracking-wider text-zinc-100 leading-none">
        {formatTime(time)}
      </div>
      <div className="text-xs text-zinc-500 tracking-wide mt-1">
        {formatDate(time)}
      </div>
    </div>
  );
}

interface HeaderProps {
  systemStatus: 'OK' | 'DEGRADED';
}

export function Header({ systemStatus }: HeaderProps): JSX.Element {
  return (
    <header className="bg-zinc-900/95 border-b border-zinc-700/50 px-6 h-13 flex items-center justify-between shrink-0 relative z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500/10 border border-green-500/50 rounded flex items-center justify-center text-sm">
            🥐
          </div>
          <div>
            <div className="font-display text-lg tracking-widest text-zinc-100 leading-none">
              VAI TER SALGADO?
            </div>
            <div className="text-[9px] text-zinc-500 tracking-wide">
              Salgado Assessment & Availability System
            </div>
          </div>
        </div>

        <div className="w-px h-7 bg-zinc-700/50" />

        <div className="flex gap-3">
          <Pill label="versão" value="5.0.0" color="text-purple-400" />
          <Pill label="semana ISO" value={`W${getISOWeek()}`} color="text-cyan-400" />
          <Pill label="env" value="PRODUÇÃO" color="text-green-400" />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              systemStatus === 'OK'
                ? 'bg-green-400 shadow-[0_0_6px_theme(colors.green.400)] animate-pulse'
                : 'bg-red-400 shadow-[0_0_6px_theme(colors.red.400)]'
            }`}
          />
          <span className="text-xs tracking-widest uppercase text-zinc-500">
            {systemStatus === 'OK' ? 'sistema operacional' : 'sistema degradado'}
          </span>
        </div>

        <div className="w-px h-5 bg-zinc-700/50" />

        <Clock />
      </div>
    </header>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color: string }): JSX.Element {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded text-[10px]">
      <span className="text-zinc-500 tracking-widest uppercase">{label}</span>
      <span className={`font-bold tracking-wide ${color}`}>{value}</span>
    </div>
  );
}