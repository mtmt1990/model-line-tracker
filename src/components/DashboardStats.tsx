import React from 'react';
import { PartModel, LineMaster } from '@/types';
import { Layers, Activity, CheckCircle2, Settings2, Sparkles, ChevronRight } from 'lucide-react';

interface DashboardStatsProps {
  items: PartModel[];
  lines: LineMaster[];
  selectedLineFilter: string[];
  onToggleLineFilter: (lineId: string) => void;
  onClearFilter: () => void;
  onOpenLineManager: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  items,
  lines,
  selectedLineFilter,
  onToggleLineFilter,
  onClearFilter,
  onOpenLineManager,
}) => {
  const totalItems = items.length;
  
  // 各ラインごとの対応数
  const lineStats = lines
    .filter((l) => l.active)
    .map((line) => {
      const count = items.filter((i) => i.lines.includes(line.id) || i.lines.includes(line.name)).length;
      const ratio = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
      return {
        ...line,
        count,
        ratio,
      };
    });

  // 複数ライン対応品
  const multiLineCount = items.filter((i) => i.lines.length >= 2).length;
  // 単独ライン専用品
  const singleLineCount = items.filter((i) => i.lines.length === 1).length;
  // 車種数
  const uniqueVehicles = new Set(items.map((i) => i.vehicleModel.trim()).filter(Boolean)).size;

  return (
    <div className="space-y-3 mb-6">
      {/* 上段: 全体サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">登録型番数</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {totalItems} <span className="text-xs font-normal text-slate-500">件</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {uniqueVehicles} 車種に対応
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">稼働ライン総数</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {lines.filter((l) => l.active).length} <span className="text-xs font-normal text-slate-500">ライン</span>
            </div>
            <button
              onClick={onOpenLineManager}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5"
            >
              <Settings2 className="w-3.5 h-3.5" />
              設定・追加
            </button>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            1〜8, 11〜17 ＋ 任意追加可能
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">複数ライン流動可能</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {multiLineCount} <span className="text-xs font-normal text-slate-500">件</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            柔軟な生産振分が可能
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">単独ライン専用品</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
            {singleLineCount} <span className="text-xs font-normal text-slate-500">件</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            専用治具・特定ライン指定
          </div>
        </div>
      </div>

      {/* 下段: ライン別対応数カード（横スクロール or グリッド） */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              各ラインの流動可能型番数
            </span>
            <span className="text-[10px] text-slate-400">
              (カードクリックで即時絞り込み)
            </span>
          </div>

          <button
            onClick={onOpenLineManager}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            <Settings2 className="w-3.5 h-3.5" />
            ライン管理・追加
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2">
          {lineStats.map((line) => {
            const isSelected = selectedLineFilter.includes(line.id);
            return (
              <button
                key={line.id}
                onClick={() => onToggleLineFilter(line.id)}
                className={`text-left p-2.5 rounded-xl border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 ring-2 ring-blue-400/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${line.bg}`} />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {line.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {line.count} <span className="text-[10px] font-normal text-slate-400">件</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {line.ratio}%
                  </span>
                </div>

                {/* プログレスバー */}
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full ${line.bg} transition-all duration-500`}
                    style={{ width: `${line.ratio}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
