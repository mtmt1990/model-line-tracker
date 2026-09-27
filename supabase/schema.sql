-- ========================================================
-- 型番・車種・流動可能ライン管理データベース スキーマ (Supabase用)
-- ========================================================

-- 1. ラインマスターテーブル: lines_master
CREATE TABLE IF NOT EXISTS public.lines_master (
  id TEXT PRIMARY KEY,                   -- 例: 'Line 1', 'Line 11', 'Line 17'
  name TEXT NOT NULL,                   -- 表示名 (例: 'ライン 1', 'ライン 11')
  color TEXT NOT NULL,                  -- テーマカラー識別子
  bg TEXT NOT NULL,                     -- 背景色クラス
  light_bg TEXT NOT NULL,               -- バッジ用背景色クラス
  "order" INTEGER NOT NULL DEFAULT 1,   -- 表示順
  active BOOLEAN NOT NULL DEFAULT true, -- 有効フラグ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 型番テーブル: part_models
CREATE TABLE IF NOT EXISTS public.part_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number TEXT NOT NULL UNIQUE,       -- 型番 / 品番 (ユニーク)
  vehicle_model TEXT NOT NULL,           -- 車種名
  lines TEXT[] NOT NULL DEFAULT '{}',    -- 流動可能ライン一覧 (例: ARRAY['Line 1', 'Line 2', 'Line 12'])
  notes TEXT,                            -- 備考・特記事項
  status TEXT DEFAULT 'active',          -- 状態 (active / suspended / trial)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 自動更新トリガー (updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_part_models_updated_at ON public.part_models;
CREATE TRIGGER update_part_models_updated_at
    BEFORE UPDATE ON public.part_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_part_models_part_number ON public.part_models(part_number);
CREATE INDEX IF NOT EXISTS idx_part_models_vehicle_model ON public.part_models(vehicle_model);
CREATE INDEX IF NOT EXISTS idx_part_models_lines ON public.part_models USING GIN(lines);

-- Row Level Security (RLS) 有効化
ALTER TABLE public.lines_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-access lines" ON public.lines_master FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert-access lines" ON public.lines_master FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update-access lines" ON public.lines_master FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete-access lines" ON public.lines_master FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read-access parts" ON public.part_models FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert-access parts" ON public.part_models FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update-access parts" ON public.part_models FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete-access parts" ON public.part_models FOR DELETE TO public USING (true);

-- 初期ラインデータ投入 (1〜8、11〜17ライン)
INSERT INTO public.lines_master (id, name, color, bg, light_bg, "order", active)
VALUES
  ('Line 1', 'ライン 1', 'blue', 'bg-blue-500', 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800', 1, true),
  ('Line 2', 'ライン 2', 'emerald', 'bg-emerald-500', 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800', 2, true),
  ('Line 3', 'ライン 3', 'amber', 'bg-amber-500', 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800', 3, true),
  ('Line 4', 'ライン 4', 'purple', 'bg-purple-500', 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800', 4, true),
  ('Line 5', 'ライン 5', 'rose', 'bg-rose-500', 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800', 5, true),
  ('Line 6', 'ライン 6', 'cyan', 'bg-cyan-500', 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800', 6, true),
  ('Line 7', 'ライン 7', 'indigo', 'bg-indigo-500', 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800', 7, true),
  ('Line 8', 'ライン 8', 'orange', 'bg-orange-500', 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800', 8, true),
  ('Line 11', 'ライン 11', 'teal', 'bg-teal-500', 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800', 9, true),
  ('Line 12', 'ライン 12', 'violet', 'bg-violet-500', 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800', 10, true),
  ('Line 13', 'ライン 13', 'fuchsia', 'bg-fuchsia-500', 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:border-fuchsia-800', 11, true),
  ('Line 14', 'ライン 14', 'lime', 'bg-lime-500', 'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950/50 dark:text-lime-300 dark:border-lime-800', 12, true),
  ('Line 15', 'ライン 15', 'sky', 'bg-sky-500', 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800', 13, true),
  ('Line 16', 'ライン 16', 'pink', 'bg-pink-500', 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800', 14, true),
  ('Line 17', 'ライン 17', 'yellow', 'bg-yellow-500', 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800', 15, true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, color = EXCLUDED.color, bg = EXCLUDED.bg, light_bg = EXCLUDED.light_bg, "order" = EXCLUDED."order";

-- 初期サンプル型番データ投入
INSERT INTO public.part_models (part_number, vehicle_model, lines, notes, status)
VALUES
  ('ENG-2041-A', 'ヤリス (Yaris)', ARRAY['Line 1', 'Line 2', 'Line 5'], '高圧インジェクター対応 / メインライン', 'active'),
  ('ENG-2041-B', 'ヤリス クロス (Yaris Cross)', ARRAY['Line 1', 'Line 6', 'Line 11'], '4WD用仕様 / 治具交換要', 'active'),
  ('ELE-8802-K', 'プリウス (Prius)', ARRAY['Line 2', 'Line 3', 'Line 12', 'Line 15'], 'HEV標準電装ユニット / 4ライン流動可', 'active'),
  ('CHA-1090-X', 'クラウン (Crown)', ARRAY['Line 7', 'Line 14'], '大型フレーム用ライン', 'active'),
  ('CHA-1090-Y', 'クラウン スポーツ (Crown Sport)', ARRAY['Line 7', 'Line 8', 'Line 14', 'Line 16'], 'スポーツサス対応 / 4ライン対応', 'active'),
  ('INT-3310-F', 'カローラ (Corolla)', ARRAY['Line 3', 'Line 4', 'Line 13'], '10インチナビ仕様', 'active'),
  ('DRV-7700-Z', 'ランドクルーザー250 (Land Cruiser 250)', ARRAY['Line 17'], '超重量物専用17ライン限定 / 試作評価中', 'trial'),
  ('SEN-5011-S', 'プリウス (Prius)', ARRAY['Line 2', 'Line 4', 'Line 11', 'Line 12'], 'ミリ波レーダーユニット', 'active'),
  ('BOD-6003-M', 'アルファード (Alphard)', ARRAY['Line 5', 'Line 8', 'Line 15'], '電動スライドドア関連', 'active'),
  ('BAT-9900-H', 'bZ4X (BEV)', ARRAY['Line 6', 'Line 16', 'Line 17'], 'BEV専用バッテリーパックマウント', 'active')
ON CONFLICT (part_number) DO NOTHING;
