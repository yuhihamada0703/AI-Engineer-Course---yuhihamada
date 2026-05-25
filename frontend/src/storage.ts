import type { BoardData } from './types'

const KEY = 'trello-board'

const defaultData: BoardData = {
  columnOrder: ['col-1', 'col-2', 'col-3'],
  columns: {
    'col-1': { id: 'col-1', title: 'To Do', cardIds: ['card-1'] },
    'col-2': { id: 'col-2', title: 'In Progress', cardIds: [] },
    'col-3': { id: 'col-3', title: 'Done', cardIds: [] },
  },
  cards: {
    'card-1': { id: 'card-1', title: 'サンプルタスク', description: 'ここにタスクの詳細を書きます', priority: 'MEDIUM' },
  },
}

export function loadBoard(): BoardData {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : defaultData
  } catch {
    return defaultData
  }
}

export function saveBoard(data: BoardData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}
