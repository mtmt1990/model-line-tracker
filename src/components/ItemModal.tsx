import React, { useState, useEffect } from 'react';
import { PartModel, LineMaster } from '@/types';
import { X, Save, Check, AlertCircle } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'> | PartModel) => void;
  initialItem?: PartModel | null;
  existingVehicles: string[];
  lines: LineMaster[];
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  existingVehicles,
  lines,
}) => {
  const [partNumber, setPartNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'trial' | 'suspended'>('active');
  const [error, setError] = useState<string | null>(null);

  const activeLines = lines.filter((l) => l.active);

  useEffect(() => {
    if (initialItem) {
      setPartNumber(initialItem.partNumber || '');
      setVehicleModel(initialItem.vehicleModel || '');
      setSelectedLines(initialItem.lines || []);
      setNotes(initialItem.notes || '');
      setStatus(initialItem.status || 'active');
    } else {
      setPartNumber('');
      setVehicleModel('');
      setSelectedLines([activeLines[0]?.id || 'Line 1']);
      setNotes('');
      setStatus('active');
    }
    setError(null);
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const toggleLine = (lineId: string) => {
    if (selectedLines.includes(lineId)) {
      setSelectedLines(selectedLines.filter((l) => l !== lineId));
    } else {
      setSelectedLines([...selectedLines, lineId]);
    }
  };

  const clearLines = () => {
    setSelectedLines([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partNumber.trim()) {
      setError('型番 / 品番を入力してください');
      return;
    }
    if (!vehicleModel.trim()) {
      setError('車種名を入力してください');
      return;
    }
    if (selectedLines.length === 0) {
      setError('少なくとも1つの流動可能ラインを選択してください');
      return;
    }

    if (initialItem) {
      onSave({
        ...initialItem,
        partNumber: partNumber.trim(),
        vehicleModel: vehicleModel.trim(),
        lines: selectedLines,
        notes: notes.trim(),
        status,
      });
    } else {
      onSave({
        partNumber: partNumber.trim(),
        vehicleModel: vehicleModel.trim(),
        lines: selectedLines,
        notes: notes.trim(),
        status,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* モーダルヘッダー */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {initialItem ? '型番情報の編集' : '新規型番の追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォームボディ */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 型番 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              型番 / 品番 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="例: ENG-2041-A"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 車種 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              車種名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              list="vehicle-suggestions"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="例: ヤリス / プリウス / クラウン"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="vehicle-suggestions">
              {existingVehicles.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>

          {/* 流動可能ライン選択 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                流動可能ライン選択 (選択中: <b className="text-blue-600 dark:text-blue-400 font-bold">{selectedLines.length}</b> 本) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={clearLines}
                className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
              >
                クリア
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50/50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-700">
              {activeLines.map((line) => {
                const isSelected = selectedLines.includes(line.id) || selectedLines.includes(line.name);
                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => toggleLine(line.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? `${line.lightBg} ring-2 ring-blue-500 shadow-xs font-bold`
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${line.bg}`} />
                      <span className="text-xs truncate">{line.name.replace('ライン ', 'L')}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[3] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">※ 1型番につき流動可能なライン（通常1〜4本程度）をクリックして選択してください。</p>
          </div>

          {/* 状態 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              状態ステータス
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'active', label: '通常稼働 (Active)' },
                { id: 'trial', label: '試作・評価 (Trial)' },
                { id: 'suspended', label: '休止中 (Suspended)' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                    status === st.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 備考・特記事項 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              備考 / 流動条件・治具指定など
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例: 専用治具No.12必要、17Lは大型クレーン流動など"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* モーダルフッター */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>保存する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
