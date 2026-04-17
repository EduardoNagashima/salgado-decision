import { ReactNode } from 'react';

interface ModuleGridProps {
  children: ReactNode;
}

export function ModuleGrid({ children }: ModuleGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}