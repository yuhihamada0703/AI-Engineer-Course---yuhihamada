# データ設計

**プロジェクト:** タスクボード  
**最終更新:** 2026-05-24

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
| id | BIGSERIAL | PRIMARY KEY | 自動採番 |
| title | VARCHAR(255) | NOT NULL | 列のタイトル |
| position | INTEGER | NOT NULL | 表示順（昇順） |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL DEFAULT NOW() | 更新日時 |

### `cards`（カード）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自動採番 |
| column_id | BIGINT | NOT NULL, FK → columns.id | 所属する列 |
| title | VARCHAR(255) | NOT NULL | タイトル（空文字不可） |
| description | TEXT | | 説明（任意） |
| position | INTEGER | NOT NULL | 列内の表示順（昇順） |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL DEFAULT NOW() | 更新日時 |

**外部キー制約:** `cards.column_id` → `columns.id` ON DELETE CASCADE（列削除時にカードも削除）

---

## ER 図

```
columns
┌─────────────┐
│ id (PK)     │
│ title       │
│ position    │
│ created_at  │
│ updated_at  │
└──────┬──────┘
       │ 1
       │
       │ *
┌──────┴──────┐
│ cards       │
│ id (PK)     │
│ column_id   │
│ title       │
│ description │
│ position    │
│ created_at  │
│ updated_at  │
└─────────────┘
```

---

## REST API エンドポイント設計

### 列（Column）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/columns | 全列を position 昇順で取得（カード一覧を含む） |
| POST | /api/columns | 列を追加 |
| PATCH | /api/columns/{id} | 列のタイトルを更新 |
| PATCH | /api/columns/{id}/position | 列の表示順を更新 |
| DELETE | /api/columns/{id} | 列を削除（配下のカードも CASCADE 削除） |

### カード（Card）

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /api/columns/{columnId}/cards | カードを追加 |
| PATCH | /api/cards/{id} | カードのタイトル・説明を更新 |
| PATCH | /api/cards/{id}/position | カードの列・表示順を更新（列間移動含む） |
| DELETE | /api/cards/{id} | カードを削除 |

---

## レスポンス例

### GET /api/columns

```json
[
  {
    "id": 1,
    "title": "To Do",
    "position": 0,
    "cards": [
      {
        "id": 1,
        "title": "サンプルタスク",
        "description": "これはサンプルです",
        "position": 0
      }
    ]
  },
  {
    "id": 2,
    "title": "In Progress",
    "position": 1,
    "cards": []
  },
  {
    "id": 3,
    "title": "Done",
    "position": 2,
    "cards": []
  }
]
```

---

## 初期データ（Flyway マイグレーション）

`src/main/resources/db/migration/V1__init.sql` にて定義。

- 列：To Do / In Progress / Done の 3 列（position: 0, 1, 2）
- カード：「サンプルタスク」（説明あり）を「To Do」列に 1 件（position: 0）
