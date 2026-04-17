import { useSalgadoLogic } from '../../hooks/useSalgadoLogic';
import { formatDate } from '../../utils/dateUtils';
import { Card, CardHeader, CardTitle, CardBody } from '../Common/Card';
import { Skeleton } from '../Common/Skeleton';
import { Badge } from '../Common/Badge';

export function SalgadoModule(): JSX.Element {
  const { chances, nextDate, holidaysThisWeek, isLoading, error, refresh } = useSalgadoLogic();

  return (
    <Card className="flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>Probabilidade de Salgado</CardTitle>
        {isLoading ? (
          <Badge variant="warning">CARREGANDO</Badge>
        ) : error ? (
          <Badge variant="error">ERRO</Badge>
        ) : (
          <Badge variant="success">ATUALIZADO</Badge>
        )}
      </CardHeader>

      <CardBody className="flex-1 flex flex-col items-center justify-center gap-6 p-8 relative overflow-hidden">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refresh} />
        ) : (
          <ResultState chances={chances} nextDate={nextDate} />
        )}

        {holidaysThisWeek.length > 0 && !isLoading && (
          <div className="w-full mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded">
            <div className="text-xs text-amber-400 font-bold tracking-widest uppercase mb-1">
              Feriados esta semana
            </div>
            {holidaysThisWeek.map((h) => (
              <div key={h.date} className="text-xs text-amber-300">
                {h.name} - {formatDate(new Date(h.date))}
              </div>
            ))}
          </div>
        )}
      </CardBody>

      <div className="px-4 py-3 border-t border-zinc-700/50 flex items-center justify-between">
        <span className="text-[10px] text-zinc-500 tracking-wide">
          Última atualização: {formatDate(new Date())}
        </span>
        <button
          onClick={() => void refresh()}
          disabled={isLoading}
          className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
        >
          {isLoading ? 'Atualizando...' : '↻ Atualizar'}
        </button>
      </div>
    </Card>
  );
}

function ResultState({ chances, nextDate }: { chances: number; nextDate: Date }): JSX.Element {
  const isLikely = chances >= 50;

  return (
    <div className="text-center w-full">
      <div className="text-6xl mb-4">{isLikely ? '🥐' : '🚫'}</div>

      <div
        className={`font-display text-6xl tracking-wider mb-2 ${
          isLikely ? 'text-green-400' : 'text-red-400'
        }`}
        style={{
          textShadow: isLikely
            ? '0 0 20px rgba(74, 222, 128, 0.4)'
            : '0 0 20px rgba(248, 113, 113, 0.4)',
        }}
      >
        {chances}%
      </div>

      <div className="text-xs tracking-widest uppercase text-zinc-400 mb-6">
        {isLikely ? 'probabilidade alta' : 'probabilidade baixa'}
      </div>

      <div className="inline-block px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded">
        <div className="text-[10px] text-zinc-500 tracking-widest uppercase mb-1">
          Próximo salgado
        </div>
        <div className="text-sm font-mono text-zinc-200">
          {nextDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
          })}
        </div>
      </div>
    </div>
  );
}

function LoadingState(): JSX.Element {
  return (
    <div className="text-center w-full">
      <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
      <Skeleton className="h-12 w-32 mx-auto mb-2" />
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }): JSX.Element {
  return (
    <div className="text-center w-full">
      <div className="text-4xl mb-4">⚠️</div>
      <div className="text-red-400 font-mono text-sm mb-4">{error}</div>
      <button
        onClick={() => void onRetry()}
        className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded hover:bg-red-500/30"
      >
        Tentar novamente
      </button>
    </div>
  );
}