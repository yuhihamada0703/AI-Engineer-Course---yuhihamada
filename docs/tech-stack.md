# 技術スタック

**プロジェクト:** タスクボード  
**最終更新:** 2026-05-26

---

## フロントエンド

| 区分 | 技術 | バージョン | 採用理由 |
|------|------|-----------|---------|
| UI フレームワーク | React | 19.2.6 | コンポーネントベースで UI の状態管理が容易 |
| 言語 | TypeScript | 6.0.3 | 型安全性により実装ミスを早期発見。IDE 補完・リファクタリング支援が強力 |
| ビルドツール | Vite | 8.0.14 | 起動・HMR（ホットリロード）が高速で開発効率を最大化 |
| スタイリング | React インラインスタイル | — | 外部ライブラリ不要。コンポーネントとスタイルを同一ファイルで管理 |
| D&D ライブラリ | @hello-pangea/dnd | 18.0.1 | react-beautiful-dnd のアクティブメンテナンス継続フォーク。アクセシブルな D&D を実現 |
| 開発用プロキシサーバー | Express | 4.21.2 | Vite dev と並走する Node.js プロキシ。CORS を回避しつつ API を転送 |
| Lint | ESLint（v9 flat config） | typescript-eslint 同梱 | 静的解析でコードの問題を早期発見。TypeScript strict ルール + React Hooks ルールを適用 |
| ESLint プラグイン | typescript-eslint | — | TypeScript 対応の ESLint ルールセット（strict モード） |
| ESLint プラグイン | eslint-plugin-react-hooks | — | React Hooks の使用規則（依存配列漏れ等）を自動検出 |

## バックエンド

| 区分 | 技術 | バージョン | 採用理由 |
|------|------|-----------|---------|
| 言語 | Java | 25 | 最新リリース。最新の言語機能と JVM パフォーマンス改善を享受 |
| フレームワーク | Spring Boot | 4.0.6 | Auto-configuration で設定コストを最小化。Spring エコシステムを統合 |
| ORM | Spring Data JPA + Hibernate | Spring Boot 同梱 | JPA でエンティティ操作を抽象化し、SQL ボイラープレートを排除 |
| DB 接続プール | HikariCP | Spring Boot 同梱 | Spring Boot 標準。高パフォーマンスな接続プール |
| DB マイグレーション | Flyway | Spring Boot 同梱（flyway-database-postgresql） | SQL ファイルでスキーマ変更を管理。Liquibase より学習コストが低い |
| ビルドツール | Gradle | 9.5.1 | Maven より記述量が少なく、ビルドが速い |
| ボイラープレート削減 | Lombok | Spring Boot 同梱 | getter / setter / constructor を自動生成し、コード量を削減 |
| API 仕様書 | SpringDoc OpenAPI（Swagger UI） | 2.8.8 | REST API ドキュメントの自動生成と動作確認用 UI |
| 入力バリデーション | spring-boot-starter-validation | Spring Boot 同梱 | Bean Validation（`@Valid`、`@NotBlank`、`@Size`）で DTO のバリデーションを宣言的に定義 |
| 静的解析 | Checkstyle | 10.21.4 | Google Java Style ベースのコードスタイル規約を自動チェック |
| 静的解析 | SpotBugs | 6.1.11 | バイトコード解析によるバグパターン検出（Java 25 対応のためレポートのみ生成） |

## データベース・インフラ

| 区分 | 技術 | バージョン | 採用理由 |
|------|------|-----------|---------|
| DB | PostgreSQL | 17-alpine | 高信頼性の OSS リレーショナル DB。JSON 型など拡張性も高い |
| ローカル環境 | Docker Compose | 最新 | PostgreSQL をコンテナで管理し、環境差分をなくす |

---

## アーキテクチャ概要

```
[ブラウザ]
  React + Vite (Port: 5173)
       |
       | REST API（JSON）
       |
[Spring Boot] (Port: 8080)
  ├─ Controller（REST エンドポイント）
  ├─ Service（ビジネスロジック）
  ├─ Repository（Spring Data JPA）
  └─ Entity（Hibernate マッピング）
       |
[PostgreSQL] (Port: 5432)
```

- CORS: Spring Boot 側で `http://localhost:5173` を許可
- 認証: なし（シングルユーザー想定）
- DB マイグレーション: Flyway が起動時に `src/main/resources/db/migration/` を自動適用

---

## AWS デプロイ構成（無料枠）

| 区分 | 技術 | バージョン | 採用理由 |
|------|------|-----------|---------|
| IaC ツール | Terraform | 1.5 以上 | HCL でインフラをコード管理。マルチクラウド対応・宣言的構文 |
| CDN | AWS CloudFront | - | HTTPS 化・キャッシュによる高速配信（無料枠: 1TB/月） |
| 静的ホスティング | AWS S3 | - | React ビルド済みファイルの配信（無料枠: 5GB/月） |
| アプリサーバー | AWS EC2 t2.micro | - | Spring Boot の実行基盤（無料枠: 750h/月・12 ヶ月） |
| データベース | AWS RDS db.t3.micro | PostgreSQL 16 | マネージド PostgreSQL（無料枠: 750h/月・12 ヶ月） |
| ネットワーク | AWS VPC | - | プライベートネットワーク（無料） |

### 本番環境アーキテクチャ概要

```
[ブラウザ]
     │
[CloudFront] ─── /api/* ──→ [EC2 t2.micro]
     │                       Spring Boot (Port: 8080)
     │                             │
  [S3 バケット]              [RDS db.t3.micro]
  React 静的ファイル          PostgreSQL (Port: 5432)
                             （プライベートサブネット）
```

- 詳細は [deployment-guide.md](deployment-guide.md) を参照
