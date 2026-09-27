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
import { Loader2, Plus } from 'lucide-react';

export default function HomePage() {
  const [items, setItems] = useState<PartModel[]>([]);
  const [lines, setLines] = useState<LineMaster[]>(DEFAULT_LINES);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');

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
    try {
      const [itemsResult, linesResult] = await Promise.all([
        fetchAllPartModels(),
        fetchAllLines(),
      ]);
      setItems(itemsResult.items);
      setDataSource(itemsResult.source);
      setLines(linesResult);
    } catch (err) {
      console.error('Failed to load data:', err);
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
      // 検索語句 (型番・車種・備考)
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matchPart = item.partNumber.toLowerCase().includes(q);
        const matchVeh = item.vehicleModel.toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchPart && !matchVeh && !matchNotes) {
          return false;
        }
      }

      // 車種フィルター
      if (filter.vehicle && item.vehicleModel !== filter.vehicle) {
        return false;
      }

      // ラインフィルター (選択されたラインを含むか)
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

  // フィルター更新ハンドラー
  const handleFilterChange = (newFilter: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  // ラインフィルターのトグル
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

  // 新規追加
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  // 編集
  const handleOpenEdit = (item: PartModel) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  // 保存処理 (新規 or 更新)
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

  // 削除処理
  const handleDeleteItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (confirm(`型番「${item.partNumber}」を削除してもよろしいですか？`)) {
      await deletePartModel(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // 一括インポート処理
  const handleBulkImport = async (
    newItems: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'>[],
    mode: 'replace' | 'merge'
  ) => {
    const updated = await bulkImportPartModels(newItems, mode);
    setItems(updated);
  };

  // サンプルデータリセット
  const handleResetSample = async () => {
    const resetItems = await resetToSampleData();
    setItems(resetItems);
    setLines(DEFAULT_LINES);
  };

  // ラインマスターの保存
  const handleSaveLines = async (newLines: LineMaster[]) => {
    setLines(newLines);
    await saveAllLines(newLines);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* グローバルヘッダー */}
      <Header
        dataSource={dataSource}
        onRefresh={loadData}
        isLoading={isLoading}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full">
        {/* 統計ダッシュボードカード */}
        <DashboardStats
          items={items}
          lines={lines}
          selectedLineFilter={filter.selectedLines}
          onToggleLineFilter={handleToggleLineFilter}
          onClearFilter={() => handleFilterChange({ selectedLines: [] })}
          onOpenLineManager={() => setIsLineManagerOpen(true)}
        />

        {/* 検索・絞り込みバー */}
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

        {/* メインコンテンツ表示部 */}
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

      {/* フッター */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <p>型番・車種・流動可能ライン可視化マネージャー © 2026</p>
      </footer>

      {/* モバイル用クイック追加フローティングボタン */}
      <div className="fixed bottom-5 right-5 sm:hidden z-30">
        <button
          onClick={handleOpenAdd}
          className="w-13 h-13 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* モーダル群 */}
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
