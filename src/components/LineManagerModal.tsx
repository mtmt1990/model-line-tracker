import React, { useState } from 'react';
import { LineMaster, COLOR_PALETTES, DEFAULT_LINES } from '@/types';
import { createNewLine } from '@/lib/storage';
import { X, Plus, Trash2, Edit2, Check, RefreshCw, Layers, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: LineMaster[];
  onSaveLines: (newLines: LineMaster[]) => void;
  usedLineCounts: Record<string, number>;
}

export const LineManagerModal: React.FC<LineManagerModalProps> = ({
  isOpen,
  onClose,
  lines,
  onSaveLines,
  usedLineCounts,
}) => {
  const [lineList, setLineList] = useState<LineMaster[]>(lines);
  const [newNumberOrName, setNewNumberOrName] = useState('');
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // モーダルが開くたびに同期
  React.useEffect(() => {
    setLineList(lines);
    setError(null);
  }, [isOpen, lines]);

  if (!isOpen) return null;

  // 新規ライン追加
  const handleAddLine = (e: React.FormEvent) => {
    e.preventDefault();
    const input = newNumberOrName.trim();
    if (!input) return;

    // 重複チェック
    const isDuplicate = lineList.some(
      (l) => l.name.toLowerCase() === input.toLowerCase() || l.id.toLowerCase() === `Line ${input}`.toLowerCase()
    );
    if (isDuplicate) {
      setError(`「${input}」は既に登録されています`);
      return;
    }

    const newLine = createNewLine(input, undefined, lineList);
    const updated = [...lineList, newLine];
    setLineList(updated);
    onSaveLines(updated);
    setNewNumberOrName('');
    setError(null);
  };

  // ライン名のインライン編集
  const handleStartEdit = (line: LineMaster) => {
    setEditingLineId(line.id);
    setEditingName(line.name);
  };

  const handleSaveEdit = (lineId: string) => {
    if (!editingName.trim()) return;
    const updated = lineList.map((l) =>
      l.id === lineId ? { ...l, name: editingName.trim() } : l
    );
    setLineList(updated);
    onSaveLines(updated);
    setEditingLineId(null);
  };

  // 有効/無効切り替え
  const handleToggleActive = (lineId: string) => {
    const updated = lineList.map((l) =>
      l.id === lineId ? { ...l, active: !l.active } : l
    );
    setLineList(updated);
    onSaveLines(updated);
  };

  // ライン削除
  const handleDeleteLine = (lineId: string) => {
    const count = usedLineCounts[lineId] || 0;
    if (count > 0) {
      if (!confirm(`このラインは現在 ${count} 件の型番で流動可能ラインとして登録されています。削除しますか？`)) {
        return;
      }
    }
    const updated = lineList.filter((l) => l.id !== lineId);
    setLineList(updated);
    onSaveLines(updated);
  };

  // デフォルト初期化 (1~8, 11~17)
  const handleResetDefaults = () => {
    if (confirm('ラインマスターを工場初期設定（1〜8、11〜17ライン）にリセットしますか？')) {
      setLineList(DEFAULT_LINES);
      onSaveLines(DEFAULT_LINES);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              流動ラインマスター管理 (設定)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ボディ */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* 説明 */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">🏭 工場ラインの追加・命名</p>
            <p className="text-[11px] leading-relaxed">
              現在「1〜8」「11〜17」ラインが登録されています。新しいライン番号（例: <code>18</code> や <code>特設ラインB</code>）を入力していつでも自由に追加・編集できます。
            </p>
          </div>

          {/* 新規ライン追加フォーム */}
          <form onSubmit={handleAddLine} className="flex gap-2">
            <input
              type="text"
              value={newNumberOrName}
              onChange={(e) => setNewNumberOrName(e.target.value)}
              placeholder="新しいライン名 / 番号 (例: 18, 19, 21, 検査ライン)"
              className="flex-1 px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>ライン追加</span>
            </button>
          </form>

          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 登録済みライン一覧 */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>登録ライン一覧 ({lineList.length} 本)</span>
              <span>割当型番数</span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
              {lineList.map((line) => {
                const isEditing = editingLineId === line.id;
                const usedCount = usedLineCounts[line.id] || 0;

                return (
                  <div
                    key={line.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      line.active
                        ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    {/* 左側: 色ドット + 名称 */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${line.bg}`} />

                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2 py-1 text-xs rounded border border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none w-full max-w-xs"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(line.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {line.name}
                        </span>
                      )}
                    </div>

                    {/* 右側: 割当数 & 操作アクション */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {usedCount} 件
                      </span>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(line)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="名称を変更"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleActive(line.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title={line.active ? '無効化' : '有効化'}
                      >
                        {line.active ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLine(line.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 初期化ボタン */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              初期設定（1〜8、11〜17ライン）に戻す
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};
