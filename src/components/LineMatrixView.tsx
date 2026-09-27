import React from 'react';
import { PartModel, LineMaster, DEFAULT_LINES } from '@/types';
import { Edit, Trash2, Check, Minus, AlertCircle } from 'lucide-react';

interface LineMatrixViewProps {
  items: PartModel[];
  lines: LineMaster[];
  onEdit: (item: PartModel) => void;
  onDelete: (id: string) => void;
}

export const LineMatrixView: React.FC<LineMatrixViewProps> = ({
  items,
  lines = DEFAULT_LINES,
  onEdit,
  onDelete,
}) => {
  const activeLines = lines.filter((l) => l.active);

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">該当する型番データがありません</p>
        <p className="text-xs text-slate-400 mt-1">検索条件を変更するか、新規型番を追加してください</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* ヘッダー注記 */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>📊 <b>対比マトリクスビュー</b>: 全 {activeLines.length} ラインへの流動可否（1型番あたり最大4本等）を一覧俯瞰できます</span>
        <span className="hidden sm:inline">全 {items.length} 件</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <th className="py-3 px-4 w-44 sticky left-0 bg-slate-100/90 dark:bg-slate-800/90 z-10">型番 / 品番</th>
              <th className="py-3 px-4 w-48">車種</th>
              
              {/* 各ラインのカラムヘッダー (1〜8, 11〜17...) */}
              {activeLines.map((line) => (
                <th key={line.id} className="py-3 px-2 text-center min-w-[64px]">
                  <div className="inline-flex flex-col items-center gap-0.5">
                    <span className={`w-2 h-2 rounded-full ${line.bg}`} />
                    <span className="text-[11px] font-bold whitespace-nowrap">{line.name.replace('ライン ', 'L')}</span>
                  </div>
                </th>
              ))}

              <th className="py-3 px-3 text-center w-20 whitespace-nowrap">流動数</th>
              <th className="py-3 px-4 min-w-[150px]">備考</th>
              <th className="py-3 px-3 text-center w-20">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.map((item) => {
              const activeCount = item.lines.length;
              return (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group"
                >
                  {/* 型番 */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono text-sm sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-blue-50/40 dark:group-hover:bg-blue-950/20 z-10 border-r border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      <span>{item.partNumber}</span>
                      {item.status === 'trial' && (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          試作
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 車種 */}
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {item.vehicleModel}
                  </td>

                  {/* 動的ライン列のマトリクスセル */}
                  {activeLines.map((line) => {
                    const isSupported = item.lines.includes(line.id) || item.lines.includes(line.name);
                    return (
                      <td key={line.id} className="py-3.5 px-1.5 text-center">
                        {isSupported ? (
                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-lg ${line.lightBg} font-bold shadow-2xs`}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-50 text-slate-200 dark:bg-slate-900/30 dark:text-slate-700">
                            <Minus className="w-3 h-3" />
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* 流動可能数バッジ */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeCount >= 4
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : activeCount >= 2
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {activeCount} 本
                    </span>
                  </td>

                  {/* 備考 */}
                  <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate" title={item.notes}>
                    {item.notes || <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>

                  {/* 操作ボタン */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
