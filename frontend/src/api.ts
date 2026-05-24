import type { BoardData } from './types'

const BASE = '/api'

export async function getBoard(): Promise<BoardData> {
  const res = await fetch(`${BASE}/board`)
  if (!res.ok) throw new Error('Failed to load board')
  return res.json()
}

export async function addColumn(id: string, title: string): Promise<void> {
  await fetch(`${BASE}/columns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title }),
  })
}

export async function renameColumn(id: string, title: string): Promise<void> {
  await fetch(`${BASE}/columns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

export async function deleteColumn(id: string): Promise<void> {
  await fetch(`${BASE}/columns/${id}`, { method: 'DELETE' })
}

export async function addCard(id: string, title: string, description: string, columnId: string): Promise<void> {
  await fetch(`${BASE}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, description, columnId }),
  })
}

export async function editCard(id: string, title: string, description: string): Promise<void> {
  await fetch(`${BASE}/cards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  })
}

export async function deleteCard(id: string): Promise<void> {
  await fetch(`${BASE}/cards/${id}`, { method: 'DELETE' })
}

export async function reorder(columns: Record<string, string[]>): Promise<void> {
  await fetch(`${BASE}/board/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns }),
  })
}

export async function searchBoard(keyword: string): Promise<BoardData> {
  const res = await fetch(`${BASE}/board/search?q=${encodeURIComponent(keyword)}`)
  if (!res.ok) throw new Error('Failed to search')
  return res.json()
}
