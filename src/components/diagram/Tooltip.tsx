import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode, MouseEvent } from 'react';

interface TooltipData {
  x: number;
  y: number;
  lines: string[];
}

interface TooltipContextValue {
  show: (e: MouseEvent, lines: string[]) => void;
  move: (e: MouseEvent) => void;
  hide: () => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error('useTooltip must be inside TooltipProvider');
  return ctx;
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TooltipData | null>(null);

  const show = useCallback((e: MouseEvent, lines: string[]) => {
    setData({ x: e.clientX, y: e.clientY, lines });
  }, []);

  const move = useCallback((e: MouseEvent) => {
    setData(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);

  const hide = useCallback(() => setData(null), []);

  return (
    <TooltipContext.Provider value={{ show, move, hide }}>
      {children}
      {data && (
        <div
          style={{
            position: 'fixed',
            left: data.x + 12,
            top: data.y + 12,
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'pre-line',
            lineHeight: 1.4,
          }}
        >
          {data.lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </TooltipContext.Provider>
  );
}
