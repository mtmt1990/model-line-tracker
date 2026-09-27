export interface PartModel {
  id: string;
  partNumber: string;    // 型番 / 品番
  vehicleModel: string;  // 車種
  lines: string[];       // 流動可能ライン (例: ["Line 1", "Line 3", "Line 12"])
  notes?: string;        // 備考・特記事項
  status?: 'active' | 'suspended' | 'trial'; // 状態
  updatedAt: string;
  createdAt: string;
}

export interface LineMaster {
  id: string;          // 一意ID (例: 'Line 1', 'Line 11')
  name: string;        // 表示名 (例: 'ライン 1', '1L', '第11ライン')
  color: string;       // カラーテーマ
  bg: string;          // Tailwindのドット/バー用クラス
  lightBg: string;     // Tailwindのバッジ用クラス
  order: number;       // 表示順
  active: boolean;     // 有効/無効
}

export type ViewMode = 'matrix' | 'cards' | 'table' | 'lineGroup';

export interface FilterState {
  searchQuery: string;
  vehicle: string;
  selectedLines: string[];
  sortBy: 'partNumber' | 'vehicleModel' | 'updatedAt' | 'lineCount';
  sortOrder: 'asc' | 'desc';
}

// カラープリセット定義
export const COLOR_PALETTES = [
  { color: 'blue', bg: 'bg-blue-500', lightBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' },
  { color: 'emerald', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' },
  { color: 'amber', bg: 'bg-amber-500', lightBg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800' },
  { color: 'purple', bg: 'bg-purple-500', lightBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800' },
  { color: 'rose', bg: 'bg-rose-500', lightBg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800' },
  { color: 'cyan', bg: 'bg-cyan-500', lightBg: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800' },
  { color: 'indigo', bg: 'bg-indigo-500', lightBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800' },
  { color: 'orange', bg: 'bg-orange-500', lightBg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800' },
  { color: 'teal', bg: 'bg-teal-500', lightBg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800' },
  { color: 'violet', bg: 'bg-violet-500', lightBg: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800' },
  { color: 'fuchsia', bg: 'bg-fuchsia-500', lightBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:border-fuchsia-800' },
  { color: 'lime', bg: 'bg-lime-500', lightBg: 'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950/50 dark:text-lime-300 dark:border-lime-800' },
  { color: 'sky', bg: 'bg-sky-500', lightBg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800' },
  { color: 'pink', bg: 'bg-pink-500', lightBg: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800' },
  { color: 'yellow', bg: 'bg-yellow-500', lightBg: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800' },
];

// 初期ライン一覧: 1〜8, 11〜17
export const DEFAULT_LINES: LineMaster[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((num, idx) => ({
    id: `Line ${num}`,
    name: `ライン ${num}`,
    color: COLOR_PALETTES[idx % COLOR_PALETTES.length].color,
    bg: COLOR_PALETTES[idx % COLOR_PALETTES.length].bg,
    lightBg: COLOR_PALETTES[idx % COLOR_PALETTES.length].lightBg,
    order: idx + 1,
    active: true,
  })),
  ...[11, 12, 13, 14, 15, 16, 17].map((num, idx) => {
    const paletteIdx = (8 + idx) % COLOR_PALETTES.length;
    return {
      id: `Line ${num}`,
      name: `ライン ${num}`,
      color: COLOR_PALETTES[paletteIdx].color,
      bg: COLOR_PALETTES[paletteIdx].bg,
      lightBg: COLOR_PALETTES[paletteIdx].lightBg,
      order: 8 + idx + 1,
      active: true,
    };
  }),
];
