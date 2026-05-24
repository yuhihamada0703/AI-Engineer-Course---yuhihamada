# タスクボード

カンバン方式のタスク管理 Web アプリ。列（カラム）とカードをドラッグ&ドロップで直感的に操作でき、データは PostgreSQL にリアルタイムで永続化される。

---

## 機能

| 区分 | 機能 |
|------|------|
| 列管理 | 列の追加・削除・タイトル変更・カード枚数バッジ表示 |
| カード管理 | カードの追加・編集・削除・説明文の表示 |
| ドラッグ&ドロップ | 列内の並び替え・列間移動・ドロップゾーンのハイライト |
| 検索 | キーワードでカードをリアルタイム絞り込み |
| データ永続化 | すべての操作が即座に PostgreSQL へ反映 |

---

## 技術スタック

### フロントエンド

| 技術 | バージョン |
|------|-----------|
| React | 19.2.6 |
| TypeScript | 6.0.3 |
| Vite | 8.0.14 |
| @hello-pangea/dnd | 18.0.1 |
| Express（開発用プロキシ） | 4.21.2 |

### バックエンド

| 技術 | バージョン |
|------|-----------|
| Java | 25 |
| Spring Boot | 4.0.6 |
| Gradle | 9.5.1 |
| SpringDoc OpenAPI (Swagger UI) | 2.8.8 |
| Flyway | Spring Boot 同梱 |
| Lombok | Spring Boot 同梱 |

### インフラ

| 技術 | バージョン |
|------|-----------|
| PostgreSQL | 17-alpine |
| Docker Compose | 最新 |

---

## アーキテクチャ

```
[ブラウザ]
  React + Vite (Port: 5173)
       |
       | REST API（JSON）
       ↓
[Spring Boot] (Port: 8080)
  ├─ Controller（REST エンドポイント）
  ├─ Service（ビジネスロジック）
  ├─ Repository（Spring Data JPA）
  └─ Entity（Hibernate マッピング）
       |
       ↓
[PostgreSQL] (Port: 5432, Docker)
```

- CORS: Spring Boot 側で `http://localhost:5173` を許可
- 認証: なし（シングルユーザー想定）
- DB マイグレーション: Flyway が起動時に `V1__init.sql` を自動適用

---

## 前提条件

- Node.js（npm）
- Java 25
- Docker / Docker Compose

---

## セットアップ・起動手順

### 1. PostgreSQL を起動する

```bash
docker compose up -d
```

### 2. バックエンドを起動する

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=postgres'
```

起動後、Swagger UI は http://localhost:8080/swagger-ui.html で確認できる。

### 3. フロントエンドを起動する

```bash
cd frontend
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

---

## 開発コマンド

```bash
# TypeScript ビルド確認
cd frontend && npm run build

# バックエンドテスト
cd backend && ./gradlew test
```

---

## API エンドポイント

### 列（Column）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/columns | 全列をカード一覧込みで取得（position 昇順） |
| POST | /api/columns | 列を追加 |
| PATCH | /api/columns/{id} | 列のタイトルを更新 |
| PATCH | /api/columns/{id}/position | 列の表示順を更新 |
| DELETE | /api/columns/{id} | 列を削除（配下カードも CASCADE 削除） |

### カード（Card）

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /api/columns/{columnId}/cards | カードを追加 |
| PATCH | /api/cards/{id} | カードのタイトル・説明を更新 |
| PATCH | /api/cards/{id}/position | カードの列・表示順を更新（列間移動含む） |
| DELETE | /api/cards/{id} | カードを削除 |
| GET | /api/cards/search?keyword={keyword} | キーワードでカードを検索 |

---

## データモデル

```
columns
┌─────────────────────┐
│ id          BIGSERIAL│ PK
│ title       VARCHAR │
│ position    INTEGER │
│ created_at  TIMESTAMP│
│ updated_at  TIMESTAMP│
└──────────┬──────────┘
           │ 1 : *
┌──────────┴──────────┐
│ cards               │
│ id          BIGSERIAL│ PK
│ column_id   BIGINT  │ FK → columns.id (CASCADE)
│ title       VARCHAR │
│ description TEXT    │
│ position    INTEGER │
│ created_at  TIMESTAMP│
│ updated_at  TIMESTAMP│
└─────────────────────┘
```

---

## プロジェクト構成

```
taskmanegement/
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── ColumnItem.tsx
│   │   ├── CardItem.tsx
│   │   ├── SearchBar.tsx
│   │   ├── api.ts          # バックエンド API クライアント
│   │   ├── types.ts        # 共通型定義
│   │   └── storage.ts
│   └── server/             # Express 開発用プロキシ
├── backend/                # Spring Boot + Java
│   └── src/main/java/com/taskboard/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── entity/
│       ├── dto/
│       └── config/
├── docs/                   # 設計ドキュメント
│   ├── requirements.md         # 要件定義
│   ├── functional-requirements.md  # 機能要件
│   ├── screen-requirements.md  # 画面要件
│   ├── data-design.md          # データ設計・API 設計
│   └── tech-stack.md           # 技術スタック（バージョン一覧）
├── docker-compose.yml      # PostgreSQL コンテナ
└── CLAUDE.md               # Claude Code 作業ルール
```

---

## ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [要件定義](docs/requirements.md) | プロジェクト概要・非機能要件・制約・スコープ外 |
| [機能要件](docs/functional-requirements.md) | 機能一覧・詳細要件・ユースケースフロー |
| [画面要件](docs/screen-requirements.md) | UI/UX 要件・レイアウト仕様・コンポーネント仕様 |
| [データ設計](docs/data-design.md) | DB テーブル設計・ER 図・REST API 設計・レスポンス例 |
| [技術スタック](docs/tech-stack.md) | 採用技術・ライブラリ・バージョン一覧・採用理由 |

---

## 開発ワークフロー

1. GitHub Issue を作成する
2. `feature/issue-{番号}-{説明}` ブランチを切る
3. 実装 → コミット（`feat(scope): 説明 (#番号)` 形式）
4. Pull Request を作成し Issue にリンクする（`Closes #番号`）
5. main にマージ → Issue が自動クローズ
