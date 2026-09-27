# 型番・車種・流動可能ライン可視化マネージャー (Model Line Tracker)

自動車部品・製造業向けの **「型番 × 車種 × 流動可能ライン（最大4ライン）」** を直感的に可視化・管理できるWebアプリケーションです。

---

## 🌟 主な特徴 & UI/UX の工夫

### 1. 流動可能ライン（最大4本）の見やすい可視化
1つの型番につき最大4本あるライン（Line 1〜Line 4）を、利用シーンに合わせて**4つの表示モード**で瞬時に把握できます。
- **① 対比マトリクスビュー (Matrix View)**: PC・タブレットで全体を俯瞰。Line 1〜4 の列に対応チェックアイコン（〇）が並び、ライン別対比が一目瞭然。
- **② 4スロットLEDインジケーター & スマートカード (Card View)**: スマホに最適化。`[ L1 ] [ L2 ] [ L3 ] [ L4 ]` の4つの固定スロットで対応ラインがテーマカラーで点灯。
- **③ 標準データテーブル (Table View)**: 業務向きのコンパクトな一覧表。
- **④ ライン別グループビュー (Line Group View)**: 「Line 1 で生産できる型番一覧」「Line 3 専用型番」などライン軸で絞り込み確認。

### 2. スマートな Excel / CSV インポート & エクスポート
- Excel (`.xlsx`, `.xls`) および CSV (`.csv`) のドラッグ＆ドロップ対応。
- 表記ゆれ（「型番」「品番」「Part No」「車種」「流動ライン」「Line 1」等）を自動判定。
- 「既存データとマージ（上書き）」または「全データ置換」を選択可能。
- テンプレートExcel/CSVのワンクリックダウンロード機能付き。

### 3. Web上での新規追加・編集・削除
- ワンタップでライン選択（Line 1〜4 のトグルスイッチ）。
- 型番・車種のインクリメンタル検索、車種フィルター、ライン別絞り込み。

### 4. モバイル（スマホ）& PC 完全レスポンシブ
- スマホでは親指操作しやすいカードUI・ボトムアクション対応。
- PCでは大画面を活かしたマトリクス対比表と詳細統計ダッシュボードを表示。

---

## 🚀 GitHub × Supabase × Vercel 連携・デプロイ手順

### Step 1. Supabase のセットアップ
1. [Supabase](https://supabase.com) にログインし、新しいプロジェクトを作成します。
2. 左メニューの **「SQL Editor」** を開きます。
3. 本プロジェクトの `supabase/schema.sql` の内容をコピー＆ペーストして **「Run」** を実行します（テーブル作成・RLSポリシー設定が完了します）。
4. 左メニューの **「Project Settings」 > 「API」** から以下を控えます：
   - `Project URL`
   - `anon / public key`

### Step 2. GitHub へのプッシュ
1. 本フォルダで Git リポジトリを初期化し、GitHubの新規リポジトリにプッシュします：
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Model Line Tracker"
   git branch -M main
   git remote add origin https://github.com/あなたのユーザー名/あなたのリポジトリ名.git
   git push -u origin main
   ```

### Step 3. Vercel へのデプロイ
1. [Vercel](https://vercel.com) にログインし、**「Add New...」 > 「Project」** を選択します。
2. GitHubリポジトリをインポートします。
3. **「Environment Variables（環境変数）」** に以下を追加します：
   - `NEXT_PUBLIC_SUPABASE_URL` = (Step 1で控えた Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Step 1で控えた anon key)
4. **「Deploy」** をクリックすると、数十秒で本番公開URLが発行されます！

> ※ 環境変数が未設定の場合でも、LocalStorage（ブラウザ内保存）モードで即座に動作するハイブリッド設計となっています。

---

## 💻 ローカル開発・起動方法

```bash
# 依存関係のインストール (初回のみ)
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。
