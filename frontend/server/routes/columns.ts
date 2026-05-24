import { Router } from 'express'
import db from '../db'

const router = Router()

// POST /api/columns — add column
router.post('/', (req, res) => {
  const { id, title } = req.body as { id: string; title: string }
  const { maxPos } = db.prepare('SELECT COALESCE(MAX(position), -1) as maxPos FROM columns').get() as { maxPos: number }
  db.prepare('INSERT INTO columns (id, title, position) VALUES (?, ?, ?)').run(id, title, maxPos + 1)
  res.json({ success: true })
})

// PATCH /api/columns/:id — rename column
router.patch('/:id', (req, res) => {
  const { title } = req.body as { title: string }
  db.prepare('UPDATE columns SET title = ? WHERE id = ?').run(title, req.params.id)
  res.json({ success: true })
})

// DELETE /api/columns/:id — delete column (cards cascade via FK)
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM columns WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
