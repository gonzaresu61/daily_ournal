# 📔 Daily Journal – Next.js + Supabase

Apple風 Liquid Glass UIで毎日の気分・食事・快適さを記録するWebアプリ。

## 🛠 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| スタイル | Tailwind CSS + CSS Variables |
| バックエンド | Supabase (PostgreSQL + Auth + RLS) |
| 認証 | Google OAuth |
| デプロイ | Vercel |

---

## 🚀 セットアップ手順

### 1. リポジトリをクローン
```bash
git clone https://github.com/your-username/daily-journal.git
cd daily-journal
npm install
```

### 2. Supabaseプロジェクト作成
1. [supabase.com](https://supabase.com) でプロジェクト作成
2. **SQL Editor** で `supabase-migration.sql` を実行
3. **Authentication > Providers** で Google を有効化
   - Google Cloud Console でOAuth 2.0クライアントID取得
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
4. **Settings > API** から URL と anon key を取得

### 3. 環境変数設定
```bash
cp .env.local.example .env.local
# .env.local を編集して Supabase の値を設定
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. ローカル起動
```bash
npm run dev
# http://localhost:3000
```

### 5. Vercelデプロイ
```bash
# Vercel CLIでデプロイ
npx vercel --prod

# または GitHub連携で自動デプロイ
# Vercel ダッシュボード > 環境変数に追加
```

**Vercelの環境変数:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Supabase の Redirect URL に追加:**
- `https://your-app.vercel.app/auth/callback`

---

## 📁 ディレクトリ構成

```
src/
├── app/
│   ├── auth/
│   │   ├── page.tsx          # ログイン画面
│   │   ├── AuthForm.tsx      # Googleログインボタン
│   │   └── callback/
│   │       └── route.ts      # OAuth コールバック
│   ├── dashboard/
│   │   ├── page.tsx          # ダッシュボード（サーバー）
│   │   ├── layout.tsx        # 認証ガード
│   │   └── DashboardClient.tsx # メインSPA（クライアント）
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── BackgroundBlobs.tsx
│   │   └── BottomNav.tsx
│   ├── ui/
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   └── journal/
│       ├── HomeView.tsx
│       ├── FormView.tsx
│       ├── CalendarView.tsx
│       ├── HistoryView.tsx
│       ├── DetailView.tsx
│       ├── TrashView.tsx
│       └── SettingsView.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── api.ts                # Supabase CRUD
│   └── utils.ts              # ユーティリティ
└── types/
    └── index.ts              # TypeScript型定義
```

---

## 🗄 データベース設計

### diary_entries
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | auth.users FK |
| date | text | YYYY-MM-DD |
| mood_morning | text | excellent/good/neutral/bad/awful |
| mood_afternoon | text | 同上 |
| mood_evening | text | 同上 |
| comfort_morning | int2 | 1-5 |
| energy_level | int2 | 1-5 |
| meal_breakfast | text | 朝食 |
| meal_lunch | text | 昼食 |
| meal_dinner | text | 夕食 |
| note | text | メモ |
| weather | text | sunny/cloudy/rainy/snowy/windy |

### diary_trash
diary_entries と同構造 + `deleted_at`, `auto_delete`

### app_settings
| カラム | 型 | 説明 |
|--------|-----|------|
| user_id | uuid | |
| key | text | 設定キー |
| value | text | 設定値 |

---

## 🔒 セキュリティ

- **Row Level Security (RLS)**: 全テーブルに適用。ユーザーは自分のデータのみ操作可能
- **Auth Trigger**: INSERT時に `user_id` を自動設定（フロントから user_id を送る必要なし）

---

## 🚧 今後の予定

- [ ] 気分グラフ（Chart.js / Recharts）
- [ ] 睡眠時間の記録
- [ ] 写真添付
- [ ] タグ機能
- [ ] CSV エクスポート
- [ ] プッシュ通知
- [ ] iOS/Android対応（Capacitor）
- [ ] ダークテーマ以外のオプション
