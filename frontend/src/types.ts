export interface Card {
  id: string
  title: string
  description: string
}

export interface Column {
  id: string
  title: string
  cardIds: string[]
}

export interface BoardData {
  columns: Record<string, Column>
  cards: Record<string, Card>
  columnOrder: string[]
}
