# タスクボード アプリ 設計資料

**プロジェクト名:** タスクボード (🐾 タスクボード)  
**作成日:** 2026-05-23  
**バージョン:** 1.0.0  
**最終更新:** 2026-05-26

---

## 1. ER 図

データベースのテーブル構造と関連を示す。

```mermaid
erDiagram
    columns {
        string id PK "ユニークID（VARCHAR 255）"
        string title "列タイトル（NOT NULL）"
        int position "表示順（昇順）"
    }
    cards {
        string id PK "ユニークID（VARCHAR 255）"
        string title "カードタイトル（NOT NULL）"
        string description "説明（空文字可、DEFAULT ''）"
        string column_id FK "所属列のID"
        int position "列内の表示順（昇順）"
        string priority "優先度（HIGH/MEDIUM/LOW、DEFAULT MEDIUM）"
    }
    columns ||--o{ cards : "1つの列に複数のカードが属する"
```

**設計のポイント:**
- `columns.position` / `cards.position` で表示順序を管理する
- カードの列移動・並び替えはこの `position` を一括更新する
- `columns` を削除すると `cards` も CASCADE 削除される（外部キー制約）

---

## 2. テーブル定義

### 2.1 `columns` テーブル（列）

| カラム名 | データ型 | 制約 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| `id` | VARCHAR(255) | PRIMARY KEY | — | ユニークID（例: `"col-1"`, `"id-1748000000000-ab3cd"`） |
| `title` | VARCHAR(255) | NOT NULL | — | 列タイトル。空文字は許容しない |
| `position` | INTEGER | NOT NULL | `0` | 表示順序。昇順で並べる（0始まり） |

**制約まとめ:**
- `id` の重複は不可（PRIMARY KEY）
- `title` は必須（NOT NULL）
- `position` が同じ値になっても動作上は問題ないが、`ORDER BY position` で常に一意な順序になるよう API 側で管理する

---

### 2.2 `cards` テーブル（カード）

| カラム名 | データ型 | 制約 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| `id` | VARCHAR(255) | PRIMARY KEY | — | ユニークID（例: `"card-1"`, `"id-1748000000000-xy9zw"`） |
| `title` | VARCHAR(255) | NOT NULL | — | カードタイトル。空文字は許容しない |
| `description` | VARCHAR(4096) | NOT NULL | `''` | 説明文。空文字可（省略時は空文字として保存） |
| `column_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → `columns(id)` ON DELETE CASCADE | — | 所属する列の ID |
| `position` | INTEGER | NOT NULL | `0` | 列内の表示順序。昇順で並べる（0始まり） |
| `priority` | VARCHAR(10) | NOT NULL | `'MEDIUM'` | 優先度。`HIGH` / `MEDIUM` / `LOW` の 3 値 |

**制約まとめ:**
- `column_id` は `columns.id` への外部キー。参照先の列が削除されると、その列に属するカードも自動的に削除される（CASCADE）
- `position` は同一列内での順序を表す。D&D 操作後に `PUT /api/board/reorder` で一括更新される

---

### 2.3 テーブル間のリレーション

| 関係 | 種別 | 説明 |
|------|------|------|
| `columns` → `cards` | 1 対 多 | 1 つの列に 0 件以上のカードが属する |

---

## 3. 画面遷移図

ユーザー操作に応じた画面・状態の遷移を示す。

```mermaid
flowchart TD
    Start([アプリ起動]) --> Load[GET /api/board でボードデータ取得]
    Load --> Board[ボード画面]

    Board --> Search[検索バーにキーワード入力]
    Search -->|Enter or 検索ボタン| SearchResult[GET /api/board/search?q=キーワード]
    SearchResult --> SearchView[検索結果画面]
    SearchView -->|クリアボタン| Board

    Board --> AC[+ 列を追加 クリック]
    AC --> ACForm[列タイトル入力フォーム表示]
    ACForm -->|追加 or Enter| PostCol[POST /api/columns]
    ACForm -->|キャンセル| Board
    PostCol --> Board

    Board --> RC[列タイトルをクリック]
    RC --> RCEdit[列タイトルのインライン編集]
    RCEdit -->|Enter or フォーカスアウト| PatchCol[PATCH /api/columns/:id]
    RCEdit -->|空文字| Board
    PatchCol --> Board

    Board --> DC[列の × ボタンクリック]
    DC --> DelCol[DELETE /api/columns/:id]
    DelCol --> Board

    Board --> Sort[列の 優先度順 ボタンクリック]
    Sort --> Reorder2[PUT /api/board/reorder]
    Reorder2 --> Board

    Board --> AK[+ カードを追加 クリック]
    AK --> AKForm[タイトル・説明・優先度の入力フォーム表示]
    AKForm -->|追加| PostCard[POST /api/cards]
    AKForm -->|キャンセル| Board
    PostCard --> Board

    Board --> EK[カードの編集ボタンクリック]
    EK --> EKForm[タイトル・説明・優先度のインライン編集]
    EKForm -->|保存| PatchCard[PATCH /api/cards/:id]
    EKForm -->|キャンセル| Board
    PatchCard --> Board

    Board --> DK[カードの削除ボタンクリック]
    DK --> DelCard[DELETE /api/cards/:id]
    DelCard --> Board

    Board --> DnD[カードをドラッグ&ドロップ]
    DnD -->|列内または列間に移動| Reorder[PUT /api/board/reorder]
    Reorder --> Board
```

---

## 4. データフロー図

フロントエンド・バックエンド・DB 間のデータの流れを示す。

### 4.1 初回読み込み

```mermaid
sequenceDiagram
    participant Client as フロントエンド (React)
    participant Server as バックエンド (Spring Boot :8080)
    participant DB as PostgreSQL

    Client->>Server: GET /api/board
    Server->>DB: SELECT columns ORDER BY position
    Server->>DB: SELECT cards ORDER BY position
    DB-->>Server: columns rows / cards rows
    Server-->>Client: { columns, cards, columnOrder } (BoardData JSON)
    Client->>Client: setState → ボード画面を描画
```

### 4.2 カードの追加（楽観的更新）

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Client as フロントエンド (React)
    participant Server as バックエンド (Spring Boot :8080)
    participant DB as PostgreSQL

    User->>Client: 「追加」ボタンクリック
    Client->>Client: ① setState で即時 UI 更新（楽観的更新）
    Client->>Server: POST /api/cards { id, title, description, columnId, priority }
    Server->>DB: INSERT INTO cards ...
    DB-->>Server: OK
    Server-->>Client: { success: true }
```

### 4.3 ドラッグ&ドロップによる並び替え

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Client as フロントエンド (React)
    participant Server as バックエンド (Spring Boot :8080)
    participant DB as PostgreSQL

    User->>Client: カードをドラッグ & ドロップ
    Client->>Client: ① setState で即時 UI 更新（楽観的更新）
    Client->>Server: PUT /api/board/reorder { columns: { colId: [cardId...] } }
    Server->>DB: BEGIN TRANSACTION
    Server->>DB: UPDATE cards SET column_id=?, position=? WHERE id=? （全カード分）
    DB-->>Server: OK
    Server->>DB: COMMIT
    Server-->>Client: { success: true }
```

---

## 5. システム構成図

```mermaid
graph LR
    subgraph Browser
        React[React フロントエンド\nVite :5173]
    end
    subgraph Server
        SpringBoot[Spring Boot\nJava :8080]
    end
    subgraph Database
        PG[(PostgreSQL\n:5432)]
    end

    React -->|REST API /api/*| SpringBoot
    SpringBoot -->|JPA / Hibernate| PG
    PG -->|結果| SpringBoot
    SpringBoot -->|JSON レスポンス| React
```

**CORS 設定:**  
Spring Boot 側で `http://localhost:5173` を許可。Vite の `proxy` 設定により、開発時の `/api/*` リクエストは `http://localhost:8080` へ自動転送される。

---

## 6. REST API 一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/board` | ボード全体（列・カード・列順序）を取得 |
| PUT | `/api/board/reorder` | D&D 後・優先度順ソート後のカード位置・列を一括更新 |
| GET | `/api/board/search` | キーワードでカードを全文検索（`?q=キーワード`） |
| POST | `/api/columns` | 列を追加 |
| PATCH | `/api/columns/:id` | 列名を変更 |
| DELETE | `/api/columns/:id` | 列を削除（カードも CASCADE 削除） |
| POST | `/api/cards` | カードを追加 |
| PATCH | `/api/cards/:id` | カードを編集（タイトル・説明・優先度） |
| DELETE | `/api/cards/:id` | カードを削除 |
