import { Router } from 'express'
import db from '../db'

const router = Router()

// GET /api/board — full board state
router.get('/board', (_req, res) => {
  const cols  = db.prepare('SELECT id, title FROM columns ORDER BY position').all() as { id: string; title: string }[]
  const cards = db.prepare('SELECT id, title, description, column_id FROM cards ORDER BY position').all() as {
    id: string; title: string; description: string; column_id: string
  }[]

  const columns: Record<string, { id: string; title: string; cardIds: string[] }> = {}
  const cardsMap: Record<string, { id: string; title: string; description: string }> = {}
  const columnOrder: string[] = []

  for (const col of cols) {
    columns[col.id] = { id: col.id, title: col.title, cardIds: [] }
    columnOrder.push(col.id)
  }
  for (const card of cards) {
    cardsMap[card.id] = { id: card.id, title: card.title, description: card.description }
    columns[card.column_id]?.cardIds.push(card.id)
  }

  res.json({ columns, cards: cardsMap, columnOrder })
})

// PUT /api/board/reorder — batch update positions after D&D
router.put('/board/reorder', (req, res) => {
  const { columns } = req.body as { columns: Record<string, string[]> }
  const update = db.prepare('UPDATE cards SET column_id = ?, position = ? WHERE id = ?')

  db.exec('BEGIN')
  try {
    for (const [columnId, cardIds] of Object.entries(columns)) {
      cardIds.forEach((cardId, index) => {
        update.run(columnId, index, cardId)
      })
    }
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }

  res.json({ success: true })
})

export default router
