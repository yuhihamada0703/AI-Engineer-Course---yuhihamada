# データ設計

**プロジェクト:** タスクボード  
**最終更新:** 2026-05-23

---

## データ要件

| # | 要件 |
|---|------|
| Da-1 | すべてのデータ変更（追加・編集・削除・並び替え）は即座に localStorage へ反映する |
| Da-2 | localStorage のキー名は `trello-board` とする |
| Da-3 | localStorage のデータが破損（JSON パースエラー）している場合はデフォルトデータにフォールバックする |

---

## データ構造

```typescript
// カード
interface Card {
  id: string          // ユニークID（例: "id-1748000000000-ab3cd"）
  title: string       // タイトル（必須・空文字不可）
  description: string // 説明（任意、空文字可）
}

// 列（カラム）
interface Column {
  id: string        // ユニークID
  title: string     // 列のタイトル
  cardIds: string[] // カードIDの順序付きリスト
}

// ボード全体
interface BoardData {
  columns: Record<string, Column>  // 列のマップ
  cards: Record<string, Card>      // カードのマップ
  columnOrder: string[]            // 列の表示順序
}
```

---

## デフォルトデータ

初回起動時・データ破損時に適用される初期状態。

- 列：To Do / In Progress / Done の 3 列
- カード：「サンプルタスク」（説明あり）を「To Do」列に 1 件
