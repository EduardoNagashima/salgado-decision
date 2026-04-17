import { Card, CardHeader, CardTitle, CardBody } from '../Common/Card';
import { Badge } from '../Common/Badge';

export function ChuvaModule(): JSX.Element {
  return (
    <Card className="flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>Previsão de Chuva</CardTitle>
        <Badge variant="default">EM BREVE</Badge>
      </CardHeader>

      <CardBody className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-5xl opacity-50">🌧️</div>
        <div className="text-center">
          <div className="font-display text-lg text-zinc-400 tracking-wider">
            MÓDULO EM DESENVOLVIMENTO
          </div>
          <div className="text-xs text-zinc-600 mt-2 tracking-wide">
            Integração com API de meteorologia em breve
          </div>
        </div>
      </CardBody>

      <div className="px-4 py-3 border-t border-zinc-700/50">
        <div className="text-[10px] text-zinc-600 text-center tracking-wide">
          placeholder — aguardando integração
        </div>
      </div>
    </Card>
  );
}