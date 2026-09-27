import React from 'react';
import { Database, GitBranch, Sparkles, RefreshCw, Smartphone, Laptop } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface HeaderProps {
  dataSource: 'supabase' | 'local';
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ dataSource, onRefresh, isLoading }) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* ロゴ・タイトル */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  型番・流動ラインマネージャー
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
                車種 × 型番 × 流動可能4ライン可視化・管理システム
              </p>
            </div>
          </div>

          {/* 右側: DB接続ステータス & リフレッシュ */}
          <div className="flex items-center gap-2">
            {/* 接続ステータス */}
            <div
              title={
                dataSource === 'supabase'
                  ? 'Supabase データベースとリアルタイム接続中'
                  : 'ローカルストレージ（オフライン/デモ）モードで動作中'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                dataSource === 'supabase'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {dataSource === 'supabase' ? 'Supabase 接続済' : 'ローカルDB'}
              </span>
              <span className="sm:hidden">
                {dataSource === 'supabase' ? 'Cloud' : 'Local'}
              </span>
            </div>

            {/* 再読み込みボタン */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="最新データを再取得"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
