import React from 'react';
import { LineMaster, DEFAULT_LINES } from '@/types';

interface LineBadgeProps {
  lines: string[];
  size?: 'sm' | 'md' | 'lg';
  mode?: 'activeOnly' | 'indicator';
  allLines?: LineMaster[];
}

export const LineBadge: React.FC<LineBadgeProps> = ({
  lines,
  size = 'md',
  mode = 'activeOnly',
  allLines = DEFAULT_LINES,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 min-w-[34px]',
    md: 'text-xs px-2.5 py-1 min-w-[40px]',
    lg: 'text-sm px-3 py-1.5 min-w-[48px]',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  // 対応ラインのみをスマートに並べる表示（1型番に最大4本などの場合に最も見やすくおすすめ）
  if (mode === 'activeOnly' || lines.length <= 4) {
    if (lines.length === 0) {
      return (
        <span className="text-xs text-slate-400 italic bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-800">
          ライン未設定
        </span>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {lines.map((lineId) => {
          const def = allLines.find((l) => l.id === lineId || l.name === lineId);
          const name = def ? def.name : lineId.replace('Line ', 'L');
          const lightBg = def ? def.lightBg : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
          const bg = def ? def.bg : 'bg-slate-400';

          return (
            <span
              key={lineId}
              className={`inline-flex items-center font-bold rounded-lg border shadow-2xs transition-all ${lightBg} ${sizeClasses[size]}`}
            >
              <span className={`rounded-full mr-1.5 shrink-0 ${bg} ${dotSizes[size]}`} />
              {name}
            </span>
          );
        })}
      </div>
    );
  }

  // 多ラインインジケーターモード
  return (
    <div className="flex flex-wrap items-center gap-1">
      {allLines.map((def) => {
        const isActive = lines.includes(def.id) || lines.includes(def.name);
        const shortName = def.name.replace(/ライン\s*/, 'L');

        if (isActive) {
          return (
            <span
              key={def.id}
              title={`${def.name}: 流動可能`}
              className={`inline-flex items-center justify-center font-bold rounded-md border shadow-xs ${def.lightBg} ${sizeClasses[size]}`}
            >
              <span className={`rounded-full mr-1 shrink-0 ${def.bg} ${dotSizes[size]}`} />
              {shortName}
            </span>
          );
        }

        return null;
      })}
    </div>
  );
};
