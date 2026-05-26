# データ設計

**プロジェクト:** タスクボード  
**最終更新:** 2026-05-26

---

## データ要件

| # | 要件 |
|---|------|
| Da-1 | すべてのデータ変更（追加・編集・削除・並び替え）は即座にバックエンド API 経由で PostgreSQL へ反映する |
| Da-2 | API のレスポンスが返るまでローディング状態を表示し、エラー時はユーザーにメッセージを表示する |
| Da-3 | カード・列の順序は `position` カラムで管理する |

---

## DB テーブル設計

### `columns`（列）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(255) | PRIMARY KEY | フロントエンド生成のユニーク ID（例: `"col-1"`, `"id-1748000000000-ab3cd"`） |
| title | VARCHAR(255) | NOT NULL | 列のタイトル（空文字不可） |
| position | INTEGER | NOT NULL DEFAULT 0 | 表示順（昇順） |

### `cards`（カード）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(255) | PRIMARY KEY | フロントエンド生成のユニーク ID |
| title | VARCHAR(255) | NOT NULL | タイトル（空文字不可） |
| description | VARCHAR(4096) | NOT NULL DEFAULT '' | 説明（空文字可） |
| column_id | VARCHAR(255) | NOT NULL, FK → columns.id | 所属する列 |
| position | INTEGER | NOT NULL DEFAULT 0 | 列内の表示順（昇順） |
| priority | VARCHAR(10) | NOT NULL DEFAULT 'MEDIUM' | 優先度（`HIGH` / `MEDIUM` / `LOW`） |

**外部キー制約:** `cards.column_id` → `columns.id` ON DELETE CASCADE（列削除時にカードも削除）

---

## ER 図

```
columns
┌─────────────────┐
│ id (PK)         │
│ title           │
│ position        │
└────────┬────────┘
         │ 1
         │
         │ *
┌────────┴────────┐
│ cards           │
│ id (PK)         │
│ column_id (FK)  │
│ title           │
│ description     │
│ position        │
│ priority        │
└─────────────────┘
```

---

## REST API エンドポイント設計

### ボード（Board）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/board | ボード全体（列・カード・列順序）を取得 |
| PUT | /api/board/reorder | D&D 後のカード位置・列を一括更新 |
| GET | /api/board/search | キーワードでカードを全文検索（クエリパラメータ: `?q=キーワード`） |

### 列（Column）

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /api/columns | 列を追加 |
| PATCH | /api/columns/{id} | 列のタイトルを更新 |
| DELETE | /api/columns/{id} | 列を削除（配下のカードも CASCADE 削除） |

### カード（Card）

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /api/cards | カードを追加 |
| PATCH | /api/cards/{id} | カードのタイトル・説明・優先度を更新 |
| DELETE | /api/cards/{id} | カードを削除 |

---

## レスポンス例

### GET /api/board

```json
{
  "columns": {
    "col-1": { "id": "col-1", "title": "To Do",       "cardIds": ["card-1"] },
    "col-2": { "id": "col-2", "title": "In Progress",  "cardIds": [] },
    "col-3": { "id": "col-3", "title": "Done",         "cardIds": [] }
  },
  "cards": {
    "card-1": {
      "id": "card-1",
      "title": "サンプルタスク",
      "description": "ここにタスクの詳細を書きます",
      "priority": "MEDIUM"
    }
  },
  "columnOrder": ["col-1", "col-2", "col-3"]
}
```

---

## 初期データ（Flyway マイグレーション）

| バージョン | ファイル | 内容 |
|-----------|---------|------|
| V1 | `V1__init.sql` | テーブル作成 + 初期データ（3 列・サンプルカード 1 件） |
| V2 | `V2__add_priority_to_cards.sql` | `cards` テーブルに `priority` カラムを追加 |
