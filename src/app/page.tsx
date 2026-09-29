'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PartModel, LineMaster, ViewMode, FilterState, DEFAULT_LINES } from '@/types';
import {
  fetchAllPartModels,
  createPartModel,
  updatePartModel,
  deletePartModel,
  bulkImportPartModels,
  resetToSampleData,
  fetchAllLines,
  saveAllLines,
} from '@/lib/storage';

import { Header } from '@/components/Header';
import { DashboardStats } from '@/components/DashboardStats';
import { FilterBar } from '@/components/FilterBar';
import { LineMatrixView } from '@/components/LineMatrixView';
import { CardView } from '@/components/CardView';
import { TableView } from '@/components/TableView';
import { LineGroupView } from '@/components/LineGroupView';
import { ItemModal } from '@/components/ItemModal';
import { ImportExportModal } from '@/components/ImportExportModal';
import { LineManagerModal } from '@/components/LineManagerModal';
import { Loader2, Plus, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';

export default function HomePage() {
  const [items, setItems] = useState<PartModel[]>([]);
  const [lines, setLines] = useState<LineMaster[]>(DEFAULT_LINES);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [copiedSql, setCopiedSql] = useState(false);

  // フィルター状態
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    vehicle: '',
    selectedLines: [],
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  // モーダル管理
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PartModel | null>(null);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isLineManagerOpen, setIsLineManagerOpen] = useState(false);

  // 初期データ読み込み
  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [itemsResult, linesResult] = await Promise.all([
        fetchAllPartModels(),
        fetchAllLines(),
      ]);
      setItems(itemsResult.items);
      setDataSource(itemsResult.source);
      if (itemsResult.error) {
        setErrorMessage(itemsResult.error);
      }
      setLines(linesResult);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setErrorMessage(err?.message || 'データ読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 車種一覧のユニーク抽出
  const uniqueVehicles = useMemo(() => {
    const list = Array.from(new Set(items.map((i) => i.vehicleModel.trim()))).filter(Boolean);
    return list.sort((a, b) => a.localeCompare(b, 'ja'));
  }, [items]);

  // 各ラインが使われている型番数のカウント集計
  const usedLineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    lines.forEach((l) => {
      counts[l.id] = items.filter((i) => i.lines.includes(l.id) || i.lines.includes(l.name)).length;
    });
    return counts;
  }, [items, lines]);

  // フィルター適用後のデータリスト
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matchPart = item.partNumber.toLowerCase().includes(q);
        const matchVeh = item.vehicleModel.toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchPart && !matchVeh && !matchNotes) {
          return false;
        }
      }

      if (filter.vehicle && item.vehicleModel !== filter.vehicle) {
        return false;
      }

      if (filter.selectedLines.length > 0) {
        const hasMatch = filter.selectedLines.every((lineId) => {
          const lineDef = lines.find((l) => l.id === lineId);
          return item.lines.includes(lineId) || (lineDef && item.lines.includes(lineDef.name));
        });
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [items, filter, lines]);

  const handleFilterChange = (newFilter: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleToggleLineFilter = (lineId: string) => {
    setFilter((prev) => {
      const isSelected = prev.selectedLines.includes(lineId);
      return {
        ...prev,
        selectedLines: isSelected
          ? prev.selectedLines.filter((l) => l !== lineId)
          : [lineId],
      };
    });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (item: PartModel) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (
    itemData: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'> | PartModel
  ) => {
    if ('id' in itemData && itemData.id) {
      const updated = await updatePartModel(itemData as PartModel);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } else {
      const created = await createPartModel(itemData);
      setItems((prev) => [created, ...prev]);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (confirm(`型番「${item.partNumber}」を削除してもよろしいですか？`)) {
      await deletePartModel(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleBulkImport = async (
    newItems: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'>[],
    mode: 'replace' | 'merge'
  ) => {
    const updated = await bulkImportPartModels(newItems, mode);
    setItems(updated);
  };

  const handleResetSample = async () => {
    const resetItems = await resetToSampleData();
    setItems(resetItems);
    setLines(DEFAULT_LINES);
  };

  const handleSaveLines = async (newLines: LineMaster[]) => {
    setLines(newLines);
    await saveAllLines(newLines);
  };

  const permissionFixSql = `-- Supabase 権限開放スクリプト (SQL Editor で実行)
GRANT ALL ON TABLE public.part_models TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.lines_master TO anon, authenticated, service_role;
ALTER TABLE public.part_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lines_master DISABLE ROW LEVEL SECURITY;`;

  const copySql = () => {
    navigator.clipboard.writeText(permissionFixSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header
        dataSource={dataSource}
        onRefresh={loadData}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full">
        {/* Supabase 権限エラー時のガイダンスバナー */}
        {dataSource === 'local' && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    現在「ローカル保存（端末内）」で動作しています（クラウド同期未完了）
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                    全端末（スマホ・他PC）でリアルタイム共有するには、Supabase の <b>SQL Editor</b> で権限開放スクリプトを実行してください。
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={copySql}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'SQLをコピーしました！' : '解決用SQLをコピー'}</span>
                    </button>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-medium hover:bg-amber-100/50 transition-colors"
                    >
                      <span>Supabase を開く</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DashboardStats
          items={items}
          lines={lines}
          selectedLineFilter={filter.selectedLines}
          onToggleLineFilter={handleToggleLineFilter}
          onClearFilter={() => handleFilterChange({ selectedLines: [] })}
          onOpenLineManager={() => setIsLineManagerOpen(true)}
        />

        <FilterBar
          filter={filter}
          onFilterChange={handleFilterChange}
          uniqueVehicles={uniqueVehicles}
          lines={lines}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenAddModal={handleOpenAdd}
          onOpenImportExportModal={() => setIsImportExportModalOpen(true)}
          onOpenLineManager={() => setIsLineManagerOpen(true)}
          totalFilteredCount={filteredItems.length}
        />

        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500">データを読み込み中...</p>
          </div>
        ) : (
          <div>
            {viewMode === 'matrix' && (
              <LineMatrixView
                items={filteredItems}
                lines={lines}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteItem}
              />
            )}

            {viewMode === 'cards' && (
              <CardView
                items={filteredItems}
                lines={lines}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteItem}
              />
            )}

            {viewMode === 'table' && (
              <TableView
                items={filteredItems}
                lines={lines}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteItem}
              />
            )}

            {viewMode === 'lineGroup' && (
              <LineGroupView
                items={filteredItems}
                lines={lines}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteItem}
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <p>型番・車種・流動可能ライン可視化マネージャー © 2026</p>
      </footer>

      <div className="fixed bottom-5 right-5 sm:hidden z-30">
        <button
          onClick={handleOpenAdd}
          className="w-13 h-13 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        initialItem={editingItem}
        existingVehicles={uniqueVehicles}
        lines={lines}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onImport={handleBulkImport}
        onResetSample={handleResetSample}
        currentItems={items}
        lines={lines}
      />

      <LineManagerModal
        isOpen={isLineManagerOpen}
        onClose={() => setIsLineManagerOpen(false)}
        lines={lines}
        onSaveLines={handleSaveLines}
        usedLineCounts={usedLineCounts}
      />
    </div>
  );
}
