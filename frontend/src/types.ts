export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Card {
  id: string
  title: string
  description: string
  priority: Priority
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
