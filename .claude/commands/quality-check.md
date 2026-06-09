# PR 前品質チェック

PR を作成する前に、フロントエンド・バックエンド・Terraform の品質チェックを実施する。
すべてのチェックが通過してから PR を作成すること。

## 1. フロントエンド

```bash
cd frontend

# TypeScript 型チェック
npx tsc --noEmit

# ESLint（コードスタイル・静的解析）
npx eslint src/
```

**合格基準**: エラー 0 件（warning は許容）

## 2. バックエンド

```bash
cd backend

# Checkstyle（コードスタイル）+ SpotBugs（バグ検出）
./gradlew checkstyleMain spotbugsMain
```

**合格基準**: BUILD SUCCESSFUL

## 3. Terraform

```bash
cd terraform

# フォーマットチェック（整形が必要な場合は terraform fmt で修正）
terraform fmt -check -recursive

# 構成の構文検証
terraform validate
```

**合格基準**:
- `fmt -check` → exit 0（差分なし）
- `validate` → `Success! The configuration is valid.`

## チェック結果の報告

各チェックの結果を以下の形式でまとめること：

| 対象 | チェック | 結果 |
|------|---------|------|
| フロントエンド | TypeScript | ✅ / ❌ |
| フロントエンド | ESLint | ✅ / ❌ |
| バックエンド | Checkstyle | ✅ / ❌ |
| バックエンド | SpotBugs | ✅ / ❌ |
| Terraform | fmt -check | ✅ / ❌ |
| Terraform | validate | ✅ / ❌ |

❌ がある場合はエラー内容を修正してから PR を作成する。
