# タスクボード プロジェクト - Claude Code 作業ルール

このファイルはClaude Codeがこのプロジェクトで作業する際に必ず従わなければならない強制ルールを定義する。
違反は許可されない。

---

## プロジェクト概要

- **フロントエンド**: React 19 + TypeScript + Vite (Port: 5173)
- **バックエンド**: Spring Boot + Java (Port: 8080)
- **データベース**: PostgreSQL 16 (Docker Compose, Port: 5432)
- **リポジトリ**: https://github.com/yuhihamada0703/AI-Engineer-Course---yuhihamada

---

## 開発コマンド

```bash
# フロントエンド起動
cd frontend && npm run dev

# バックエンド起動（Docker PostgreSQLが必要）
docker compose up -d
cd backend && ./gradlew bootRun --args='--spring.profiles.active=postgres'

# TypeScriptビルド確認
cd frontend && npm run build
```

---

## サーバー起動ルール - 絶対に従うこと

### ポート競合の解消と固定ポート起動

サーバーを起動する前に必ず以下の手順でポート競合を解消し、**必ずアプリで定義されたデフォルトポートで起動する**。
別のポートに変更して一時起動することは禁止する。

#### 起動前の必須チェックと解消手順

```bash
# 1. 使用中のプロセスを確認する
lsof -i:8080 -i:5173

# 2. 競合プロセスを停止する（PIDを指定）
kill <PID>

# 3. ポートが解放されたことを確認してから起動する
lsof -i:8080 -i:5173  # 何も表示されないことを確認
```

#### 固定ポート

| サービス | ポート |
|---------|--------|
| フロントエンド (Vite) | **5173** |
| バックエンド (Spring Boot) | **8080** |
| データベース (PostgreSQL) | **5432** |

これらのポート番号は変更禁止。競合した場合は競合プロセスを停止して同じポートで起動する。

---

## 必須ワークフロー - 絶対に従うこと

### ルール1: コーディング開始前に必ずGitHub Issueを作成する

いかなるコード変更も、対応するGitHub Issueが存在しない場合は開始してはならない。

```bash
# Issueを作成する例
gh issue create --title "タイトル" --body "詳細説明" --label "feature"
```

Issue番号を必ず記録し、以降のすべての作業でその番号を使用する。

### ルール2: ブランチ命名規則

ブランチは必ず以下の形式で作成する:

| 種別 | 形式 | 例 |
|------|------|----|
| 新機能 | `feature/issue-{番号}-{英語の短い説明}` | `feature/issue-12-add-card-deadline` |
| バグ修正 | `fix/issue-{番号}-{英語の短い説明}` | `fix/issue-8-fix-drag-drop-order` |
| ドキュメント | `docs/issue-{番号}-{英語の短い説明}` | `docs/issue-5-update-api-spec` |
| 雑務・設定 | `chore/issue-{番号}-{英語の短い説明}` | `chore/issue-3-setup-ci-workflow` |

```bash
# ブランチ作成例
git checkout -b feature/issue-12-add-card-deadline
```

### ルール3: mainブランチへの直接プッシュ禁止

`git push origin main` を実行してはならない。
すべての変更はフィーチャーブランチからPull Requestを通じてマージする。

### ルール4: コミットメッセージ形式

```
type(scope): 説明文 (#Issue番号)
```

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメント |
| `chore` | ビルド・設定・雑務 |
| `refactor` | リファクタリング |
| `test` | テスト追加・修正 |
| `style` | コードスタイル（機能変更なし） |

scope（任意）はファイル・モジュール・レイヤー名を使う: `frontend`, `backend`, `api`, `db`, `docker`, `card`, `column` など。

**例:**
```
feat(frontend): カードに期限日フィールドを追加する (#12)
fix(backend): ドラッグ後のカード順序が保存されないバグを修正する (#8)
docs: API仕様書にPATCHエンドポイントを追記する (#5)
chore(docker): PostgreSQL healthcheckのタイムアウトを調整する (#3)
```

### ルール5: Pull Requestの作成とIssueリンク

すべての作業完了後、必ずPull Requestを作成しIssueにリンクする。

```bash
gh pr create --title "feat: 説明 (#Issue番号)" --body "Closes #Issue番号"
```

PRのbodyには必ず `Closes #番号` または `Fixes #番号` を含め、マージ時にIssueが自動クローズされるようにする。

---

## ディレクトリ構成

```
taskmanegement/
├── frontend/               # Reactフロントエンド (TypeScript)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── CardItem.tsx
│   │   ├── ColumnItem.tsx
│   │   ├── api.ts          # バックエンドAPIクライアント
│   │   ├── types.ts        # 共通型定義
│   │   └── storage.ts
│   ├── server/             # Node.js開発用サーバー
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/                # Spring Bootバックエンド (Java)
│   └── src/main/java/com/taskboard/
│       ├── controller/     # RESTコントローラー
│       ├── service/        # ビジネスロジック
│       ├── repository/     # Spring Data JPA
│       ├── entity/         # Hibernateエンティティ
│       ├── dto/            # リクエスト/レスポンスDTO
│       └── config/         # CORS・Flyway設定
├── docs/                   # 設計ドキュメント
├── docker-compose.yml      # PostgreSQL
├── CLAUDE.md               # このファイル
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── feature_request.yml
    │   └── bug_report.yml
    └── pull_request_template.md
```

---

## コーディング規約

### フロントエンド (TypeScript/React)
- `tsconfig.json` の `"strict": true` を維持する
- `any` 型の使用禁止。不明な型は `unknown` を使い型ガードで絞り込む
- APIコールは `src/api.ts` に集約する
- コンポーネントは関数コンポーネント + React Hooksのみ使用する

### バックエンド (Java/Spring Boot)
- ControllerはHTTPの入出力のみ担当する（ビジネスロジックをServiceに委譲する）
- ServiceはRepositoryを通じてのみDBにアクセスする
- DTOとEntityを分離する（EntityをそのままAPIレスポンスに使わない）
- Lombokを活用してボイラープレートを削減する
- DBスキーマ変更は必ずFlywayマイグレーションファイルで管理する

### 共通
- コメントは「なぜそうしているか（WHY）」が非自明な場合のみ書く
- デバッグ用のログ・コメントアウトを残したままコミットしない
