import { createContext, useContext } from 'react';
import type { MouseEvent } from 'react';

export interface TooltipData {
  x: number;
  y: number;
  lines: string[];
}

export interface TooltipContextValue {
  show: (e: MouseEvent, lines: string[]) => void;
  move: (e: MouseEvent) => void;
  hide: () => void;
}

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error('useTooltip must be inside TooltipProvider');
  return ctx;
}
