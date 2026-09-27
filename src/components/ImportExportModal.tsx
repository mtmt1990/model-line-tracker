import React, { useState, useRef } from 'react';
import { PartModel, LineMaster } from '@/types';
import { parseImportFile, exportToExcelOrCsv, downloadTemplate } from '@/lib/excel-helper';
import { X, Upload, Download, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, RefreshCcw, ArrowRight } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'>[], mode: 'replace' | 'merge') => Promise<void>;
  onResetSample: () => Promise<void>;
  currentItems: PartModel[];
  lines: LineMaster[];
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onResetSample,
  currentItems,
  lines,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'template'>('import');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewItems, setPreviewItems] = useState<Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setParseErrors([]);
    setImportSuccess(false);

    try {
      const result = await parseImportFile(file, lines);
      setPreviewItems(result.items);
      setParseErrors(result.errors);
    } catch (err: any) {
      setParseErrors([err?.message || 'ファイルの読み込みに失敗しました']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (previewItems.length === 0) return;
    setIsProcessing(true);
    try {
      await onImport(previewItems, importMode);
      setImportSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetSample = async () => {
    if (confirm('初期サンプルデータにリセットしますか？現在の編集内容は破棄されます。')) {
      setIsProcessing(true);
      await onResetSample();
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Excel / CSV データ管理
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* タブナビ */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-2 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            一括インポート
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            エクスポート
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'template'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            テンプレートDL
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* 1. インポートタブ */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* ドロップゾーン */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : 'Excel (.xlsx) または CSV ファイルを選択'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  クリックまたはドラッグ＆ドロップでファイルを追加
                </p>
              </div>

              {/* 取り込みモード選択 */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  取り込み方式
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`p-2.5 rounded-lg text-xs font-semibold border text-left transition-all ${
                      importMode === 'merge'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ring-2 ring-blue-400/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>🔄 既存データとマージ</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      同名型番は上書き更新、新規型番は追加
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-2.5 rounded-lg text-xs font-semibold border text-left transition-all ${
                      importMode === 'replace'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 ring-2 ring-rose-400/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>⚠️ 全データを置換</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      現在の全データを消去しファイル内容に置換
                    </div>
                  </button>
                </div>
              </div>

              {/* 解析結果プレビュー */}
              {previewItems.length > 0 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>読み込み完了: {previewItems.length} 件の型番データを検出</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate">
                    例: {previewItems.slice(0, 3).map((p) => `${p.partNumber} (${p.vehicleModel} - ${p.lines.join('/')})`).join(', ')} ...
                  </p>
                </div>
              )}

              {/* エラー表示 */}
              {parseErrors.length > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1 text-xs text-rose-600 dark:text-rose-300">
                  <div className="flex items-center gap-1 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>検出されたエラー ({parseErrors.length} 件):</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] max-h-20 overflow-y-auto">
                    {parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 bg-emerald-500 text-white rounded-xl text-center text-sm font-bold animate-bounce">
                  ✨ インポートが正常に完了しました！
                </div>
              )}
            </div>
          )}

          {/* 2. エクスポートタブ */}
          {activeTab === 'export' && (
            <div className="space-y-4 text-center py-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                現在登録されている <b className="text-slate-900 dark:text-white">{currentItems.length} 件</b> の型番データ（全 {lines.length} ライン列含む）をダウンロードします。
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => exportToExcelOrCsv(currentItems, lines, 'xlsx')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-all group"
                >
                  <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Excel形式 (.xlsx)
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">全ライン対比表付き</span>
                </button>

                <button
                  onClick={() => exportToExcelOrCsv(currentItems, lines, 'csv')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all group"
                >
                  <FileText className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    CSV形式 (.csv)
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">UTF-8カンマ区切り</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. テンプレートダウンロード */}
          {activeTab === 'template' && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                <p className="font-bold mb-1">💡 入力フォーマットについて</p>
                <p className="text-[11px] leading-relaxed">
                  ExcelやCSVの列名は「型番」「車種」「流動ライン一覧（Line 1, Line 12など）」のほか、「ライン 1」〜「ライン 17」各列に〇を付ける方式の両方に対応しています。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadTemplate(lines, 'xlsx')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-500" />
                  Excelテンプレート
                </button>
                <button
                  onClick={() => downloadTemplate(lines, 'csv')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4 text-blue-500" />
                  CSVテンプレート
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleResetSample}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-800 font-semibold transition-colors"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  初期サンプルデータ（1〜8、11〜17ライン）を再読み込み
                </button>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {activeTab === 'import' && previewItems.length > 0
              ? `${previewItems.length} 件インポート準備完了`
              : 'Excel / CSV 対応'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              閉じる
            </button>
            {activeTab === 'import' && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={previewItems.length === 0 || isProcessing}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <span>取り込み実行</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
