import React, { useState } from 'react';
import { PartModel, LineMaster, DEFAULT_LINES } from '@/types';
import { Edit, Trash2, Car, AlertCircle } from 'lucide-react';

interface LineGroupViewProps {
  items: PartModel[];
  lines: LineMaster[];
  onEdit: (item: PartModel) => void;
  onDelete: (id: string) => void;
}

export const LineGroupView: React.FC<LineGroupViewProps> = ({
  items,
  lines = DEFAULT_LINES,
  onEdit,
  onDelete,
}) => {
  const activeLines = lines.filter((l) => l.active);
  const [activeTab, setActiveTab] = useState<string>(activeLines[0]?.id || 'Line 1');

  const selectedLineDef = activeLines.find((l) => l.id === activeTab) || activeLines[0] || DEFAULT_LINES[0];
  const lineItems = items.filter((item) => item.lines.includes(selectedLineDef.id) || item.lines.includes(selectedLineDef.name));

  return (
    <div className="space-y-4">
      {/* ライン切り替えタブ (1〜8, 11〜17...) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {activeLines.map((line) => {
            const count = items.filter((i) => i.lines.includes(line.id) || i.lines.includes(line.name)).length;
            const isCurrent = activeTab === line.id;

            return (
              <button
                key={line.id}
                onClick={() => setActiveTab(line.id)}
                className={`px-3 py-2 rounded-xl border text-left transition-all shrink-0 flex items-center gap-2 ${
                  isCurrent
                    ? `${line.lightBg} ring-2 ring-blue-500 shadow-xs font-bold`
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${line.bg}`} />
                <span className="text-xs font-bold whitespace-nowrap">{line.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isCurrent ? 'bg-white/80 dark:bg-black/40 text-blue-800 dark:text-blue-200' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 選択されたラインの型番一覧 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${selectedLineDef.bg}`} />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {selectedLineDef.name} で流動可能な型番一覧
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            全 {lineItems.length} 件
          </span>
        </div>

        {lineItems.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {selectedLineDef.name} に流動可能な型番は登録されていません
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lineItems.map((item) => {
              const otherLines = item.lines.filter((l) => l !== selectedLineDef.id && l !== selectedLineDef.name);

              return (
                <div
                  key={item.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-blue-300 dark:hover:border-blue-700 transition-all bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {item.partNumber}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="編集"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 mb-2">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.vehicleModel}</span>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700/60 mb-2 line-clamp-1">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* 併用ライン */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>併用可能:</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
                      {otherLines.length > 0 ? otherLines.join(', ') : '単独ライン専用品'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
