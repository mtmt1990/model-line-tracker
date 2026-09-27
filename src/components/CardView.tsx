import React from 'react';
import { PartModel, LineMaster } from '@/types';
import { LineBadge } from './LineBadge';
import { Edit, Trash2, Calendar, Car, AlertCircle } from 'lucide-react';

interface CardViewProps {
  items: PartModel[];
  lines: LineMaster[];
  onEdit: (item: PartModel) => void;
  onDelete: (id: string) => void;
}

export const CardView: React.FC<CardViewProps> = ({ items, lines, onEdit, onDelete }) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {items.map((item) => {
        const lineCount = item.lines.length;

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-md hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* 上部: 型番 & 車種 & 操作ボタン */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.partNumber}
                    </span>
                    {item.status === 'trial' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        試作
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                    <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.vehicleModel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                    title="編集"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 流動可能ライン一覧バッジ */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800/80 mb-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                  <span>流動可能ライン</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">
                    {lineCount} ライン対応
                  </span>
                </div>
                <LineBadge lines={item.lines} allLines={lines} mode="activeOnly" size="sm" />
              </div>

              {/* 備考メモ */}
              {item.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2 mb-2">
                  {item.notes}
                </p>
              )}
            </div>

            {/* フッター: 更新日時 */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ja-JP') : '—'}
              </span>
              <span className="text-slate-400 font-medium">
                {lineCount >= 4 ? '⭐️ 4ライン対応' : lineCount === 1 ? '⚠️ 単独ライン' : 'マルチ流動'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
