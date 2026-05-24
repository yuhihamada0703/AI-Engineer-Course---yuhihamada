# 技術スタック

**プロジェクト:** タスクボード  
**最終更新:** 2026-05-24

---

## フロントエンド

| 区分 | 技術 | バージョン | 採用理由 |
|------|------|-----------|---------|
| UI フレームワーク | React | 19.x | コンポーネントベースで UI の状態管理が容易 |
| 言語 | TypeScript | 5.x | 型安全性により実装ミスを早期発見。IDE 補完・リファクタリング支援が強力 |
| ビルドツール | Vite | 6.x | 起動・HMR（ホットリロード）が高速で開発効率を最大化 |
| サーバー状態管理 | TanStack Query（React Query） | 5.x | API 呼び出し・キャッシュ・ローディング / エラー状態を一元管理 |
| HTTP クライアント | Axios | 1.x | インターセプターでエラーハンドリングを統一。型付きレスポンスが扱いやすい |
| スタイリング | Tailwind CSS | 4.x | ユーティリティクラスで高速にスタイリング。React + Vite との相性が良い |
| D&D ライブラリ | @hello-pangea/dnd | 最新 | react-beautiful-dnd のアクティブメンテナンス継続フォーク。アクセシブルな D&D を実現 |

## バックエンド

| 区分 | 技術 | バージョン | 採用理由 |
|------|------|-----------|---------|
| 言語 | Java | 21（LTS） | 最新LTS。Virtual Threads による軽量並行処理が使える |
| フレームワーク | Spring Boot | 3.5.x | Auto-configuration で設定コストを最小化。Spring エコシステムを統合 |
| ORM | Spring Data JPA + Hibernate | Spring Boot 同梱 | JPAでエンティティ操作を抽象化し、SQL ボイラープレートを排除 |
| DB 接続プール | HikariCP | Spring Boot 同梱 | Spring Boot 標準。高パフォーマンスな接続プール |
| DB マイグレーション | Flyway | Spring Boot 同梱 | SQL ファイルでスキーマ変更を管理。Liquibase より学習コストが低い |
| ビルドツール | Gradle | 8.x | Maven より記述量が少なく、ビルドが速い |
| ボイラープレート削減 | Lombok | 最新 | getter / setter / constructor を自動生成し、コード量を削減 |
| API 仕様書 | SpringDoc OpenAPI（Swagger UI） | 2.x | REST API ドキュメントの自動生成と動作確認用 UI |

## データベース・インフラ

| 区分 | 技術 | バージョン | 採用理由 |
|------|------|-----------|---------|
| DB | PostgreSQL | 16.x | 高信頼性の OSSリレーショナル DB。JSON 型など拡張性も高い |
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
