import { Router } from 'express'
import db from '../db'

const router = Router()

// POST /api/cards — add card
router.post('/', (req, res) => {
  const { id, title, description, columnId } = req.body as {
    id: string; title: string; description: string; columnId: string
  }
  const { maxPos } = db.prepare(
    'SELECT COALESCE(MAX(position), -1) as maxPos FROM cards WHERE column_id = ?'
  ).get(columnId) as { maxPos: number }
  db.prepare(
    'INSERT INTO cards (id, title, description, column_id, position) VALUES (?, ?, ?, ?, ?)'
  ).run(id, title, description, columnId, maxPos + 1)
  res.json({ success: true })
})

// PATCH /api/cards/:id — edit card
router.patch('/:id', (req, res) => {
  const { title, description } = req.body as { title: string; description: string }
  db.prepare('UPDATE cards SET title = ?, description = ? WHERE id = ?').run(title, description, req.params.id)
  res.json({ success: true })
})

// DELETE /api/cards/:id — delete card
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
