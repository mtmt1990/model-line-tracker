import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '型番・流動可能ライン管理システム | Model Line Tracker',
  description: '型番・車種・流動可能4ラインの可視化、Excel/CSVインポート・エクスポート、Supabase連携Webアプリ',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
