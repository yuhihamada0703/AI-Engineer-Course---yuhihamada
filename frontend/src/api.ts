import type { BoardData, Priority } from './types'

const BASE = '/api'

export async function getBoard(): Promise<BoardData> {
  const res = await fetch(`${BASE}/board`)
  if (!res.ok) throw new Error('Failed to load board')
  return res.json() as Promise<BoardData>
}

export async function addColumn(id: string, title: string): Promise<void> {
  const res = await fetch(`${BASE}/columns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title }),
  })
  if (!res.ok) throw new Error(`Failed to add column: ${res.status}`)
}

export async function renameColumn(id: string, title: string): Promise<void> {
  const res = await fetch(`${BASE}/columns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error(`Failed to rename column: ${res.status}`)
}

export async function deleteColumn(id: string): Promise<void> {
  const res = await fetch(`${BASE}/columns/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete column: ${res.status}`)
}

export async function addCard(id: string, title: string, description: string, columnId: string, priority: Priority): Promise<void> {
  const res = await fetch(`${BASE}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, description, columnId, priority }),
  })
  if (!res.ok) throw new Error(`Failed to add card: ${res.status}`)
}

export async function editCard(id: string, title: string, description: string, priority: Priority): Promise<void> {
  const res = await fetch(`${BASE}/cards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority }),
  })
  if (!res.ok) throw new Error(`Failed to edit card: ${res.status}`)
}

export async function deleteCard(id: string): Promise<void> {
  const res = await fetch(`${BASE}/cards/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete card: ${res.status}`)
}

export async function reorder(columns: Record<string, string[]>): Promise<void> {
  const res = await fetch(`${BASE}/board/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns }),
  })
  if (!res.ok) throw new Error(`Failed to reorder: ${res.status}`)
}

export async function searchBoard(keyword: string): Promise<BoardData> {
  const res = await fetch(`${BASE}/board/search?q=${encodeURIComponent(keyword)}`)
  if (!res.ok) throw new Error('Failed to search')
  return res.json() as Promise<BoardData>
}
