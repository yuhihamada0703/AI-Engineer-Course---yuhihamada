# 技術スタック

**プロジェクト:** タスクボード  
**最終更新:** 2026-05-24

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
