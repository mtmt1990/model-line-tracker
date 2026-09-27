import React from 'react';
import { ViewMode, FilterState, LineMaster } from '@/types';
import { Search, Grid3X3, Table, LayoutGrid, Layers, X, Plus, Upload, Settings2 } from 'lucide-react';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  uniqueVehicles: string[];
  lines: LineMaster[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenAddModal: () => void;
  onOpenImportExportModal: () => void;
  onOpenLineManager: () => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  uniqueVehicles,
  lines,
  viewMode,
  onViewModeChange,
  onOpenAddModal,
  onOpenImportExportModal,
  onOpenLineManager,
  totalFilteredCount,
}) => {
  const hasActiveFilters = Boolean(
    filter.searchQuery ||
    filter.vehicle ||
    filter.selectedLines.length > 0
  );

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      vehicle: '',
      selectedLines: [],
    });
  };

  const activeLines = lines.filter((l) => l.active);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs mb-4 space-y-3">
      {/* 1段目: 検索バー + 主要アクションボタン */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* 検索入力 */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="型番 / 品番 / 車種 / 備考を検索..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 右側アクションボタン */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={onOpenLineManager}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shadow-xs"
            title="流動ラインの追加・命名管理"
          >
            <Settings2 className="w-4 h-4 text-purple-500" />
            <span>ライン管理</span>
          </button>

          <button
            onClick={onOpenImportExportModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shadow-xs"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Excel/CSV</span>
            <span>入出力</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap shadow-xs shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>新規型番追加</span>
          </button>
        </div>
      </div>

      {/* 2段目: フィルター条件 ＋ 表示モード切り替え */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* フィルター群 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 車種セレクト */}
          <select
            value={filter.vehicle}
            onChange={(e) => onFilterChange({ vehicle: e.target.value })}
            className="text-xs sm:text-sm rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value="">全車種 ({uniqueVehicles.length})</option>
            {uniqueVehicles.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* ライン絞り込みセレクト */}
          <select
            value={filter.selectedLines[0] || ''}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({ selectedLines: val ? [val] : [] });
            }}
            className="text-xs sm:text-sm rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value="">全ライン ({activeLines.length})</option>
            {activeLines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name} のみ
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              条件クリア
            </button>
          )}

          <span className="text-xs text-slate-400 ml-auto lg:ml-2">
            該当: <b className="text-slate-700 dark:text-slate-200 font-semibold">{totalFilteredCount}</b> 件
          </span>
        </div>

        {/* 表示モード切り替えタブ */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => onViewModeChange('matrix')}
            title="対比マトリクス表 (全体俯瞰)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'matrix'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">マトリクス</span>
          </button>

          <button
            onClick={() => onViewModeChange('cards')}
            title="スマートカード (スマホ最適化)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">カード</span>
          </button>

          <button
            onClick={() => onViewModeChange('table')}
            title="標準テーブル (一覧)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">テーブル</span>
          </button>

          <button
            onClick={() => onViewModeChange('lineGroup')}
            title="ライン別グループ"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'lineGroup'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ライン別</span>
          </button>
        </div>
      </div>
    </div>
  );
};
