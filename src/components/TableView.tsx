import React from 'react';
import { PartModel, LineMaster } from '@/types';
import { LineBadge } from './LineBadge';
import { Edit, Trash2, AlertCircle } from 'lucide-react';

interface TableViewProps {
  items: PartModel[];
  lines: LineMaster[];
  onEdit: (item: PartModel) => void;
  onDelete: (id: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({ items, lines, onEdit, onDelete }) => {
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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <th className="py-3 px-4 w-48">型番 / 品番</th>
              <th className="py-3 px-4 w-48">車種</th>
              <th className="py-3 px-4 w-72">流動可能ライン</th>
              <th className="py-3 px-4">備考・特記事項</th>
              <th className="py-3 px-3 w-28 text-center">更新日</th>
              <th className="py-3 px-3 text-center w-24">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group"
              >
                {/* 型番 */}
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono text-sm">
                  {item.partNumber}
                  {item.status === 'trial' && (
                    <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      試作
                    </span>
                  )}
                </td>

                {/* 車種 */}
                <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {item.vehicleModel}
                </td>

                {/* 流動可能ライン */}
                <td className="py-3.5 px-4">
                  <LineBadge lines={item.lines} allLines={lines} mode="activeOnly" size="sm" />
                </td>

                {/* 備考 */}
                <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate" title={item.notes}>
                  {item.notes || <span className="text-slate-300 dark:text-slate-600">—</span>}
                </td>

                {/* 更新日 */}
                <td className="py-3.5 px-3 text-center text-xs text-slate-400 whitespace-nowrap">
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ja-JP') : '—'}
                </td>

                {/* 操作 */}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
