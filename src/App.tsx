import { useState, useCallback } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import type { BoardData } from './types'
import { loadBoard, saveBoard } from './storage'
import ColumnItem from './ColumnItem'

function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function App() {
  const [board, setBoard] = useState<BoardData>(loadBoard)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')

  function update(next: BoardData) {
    setBoard(next)
    saveBoard(next)
  }

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const srcCol = board.columns[source.droppableId]
    const dstCol = board.columns[destination.droppableId]

    if (srcCol.id === dstCol.id) {
      const newIds = Array.from(srcCol.cardIds)
      newIds.splice(source.index, 1)
      newIds.splice(destination.index, 0, draggableId)
      update({
        ...board,
        columns: { ...board.columns, [srcCol.id]: { ...srcCol, cardIds: newIds } },
      })
    } else {
      const srcIds = Array.from(srcCol.cardIds)
      const dstIds = Array.from(dstCol.cardIds)
      srcIds.splice(source.index, 1)
      dstIds.splice(destination.index, 0, draggableId)
      update({
        ...board,
        columns: {
          ...board.columns,
          [srcCol.id]: { ...srcCol, cardIds: srcIds },
          [dstCol.id]: { ...dstCol, cardIds: dstIds },
        },
      })
    }
  }, [board])

  function addColumn() {
    if (!newColTitle.trim()) return
    const id = generateId()
    update({
      ...board,
      columnOrder: [...board.columnOrder, id],
      columns: { ...board.columns, [id]: { id, title: newColTitle.trim(), cardIds: [] } },
    })
    setNewColTitle('')
    setAddingColumn(false)
  }

  function deleteColumn(columnId: string) {
    const col = board.columns[columnId]
    const newCards = { ...board.cards }
    col.cardIds.forEach(id => delete newCards[id])
    const newColumns = { ...board.columns }
    delete newColumns[columnId]
    update({
      ...board,
      columnOrder: board.columnOrder.filter(id => id !== columnId),
      columns: newColumns,
      cards: newCards,
    })
  }

  function renameColumn(columnId: string, title: string) {
    update({ ...board, columns: { ...board.columns, [columnId]: { ...board.columns[columnId], title } } })
  }

  function addCard(columnId: string, title: string, description: string) {
    const id = generateId()
    const col = board.columns[columnId]
    update({
      ...board,
      cards: { ...board.cards, [id]: { id, title, description } },
      columns: { ...board.columns, [columnId]: { ...col, cardIds: [...col.cardIds, id] } },
    })
  }

  function deleteCard(columnId: string, cardId: string) {
    const col = board.columns[columnId]
    const newCards = { ...board.cards }
    delete newCards[cardId]
    update({
      ...board,
      cards: newCards,
      columns: { ...board.columns, [columnId]: { ...col, cardIds: col.cardIds.filter(id => id !== cardId) } },
    })
  }

  function editCard(cardId: string, title: string, description: string) {
    update({ ...board, cards: { ...board.cards, [cardId]: { ...board.cards[cardId], title, description } } })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fef9f0', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 60px)',
        gridTemplateRows: 'repeat(auto-fill, 60px)',
        gap: 0,
        opacity: 0.18,
        fontSize: 36,
        lineHeight: '60px',
        textAlign: 'center',
        userSelect: 'none',
        overflow: 'hidden',
      }}>
        {Array.from({ length: 300 }).map((_, i) => {
          const animals = ['🐱', '🐶', '🐼', '🐨', '🦊', '🐰', '🐸', '🐧', '🦁', '🐯']
          return <span key={i}>{animals[i % animals.length]}</span>
        })}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
      <header style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e2c98a', background: 'rgba(255,248,225,0.85)', backdropFilter: 'blur(4px)' }}>
        <h1 style={{ margin: 0, color: '#92400e', fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>🐾 タスクボード</h1>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 16, padding: 20, overflowX: 'auto', alignItems: 'flex-start' }}>
          {board.columnOrder.map(colId => {
            const col = board.columns[colId]
            const cards = col.cardIds.map(id => board.cards[id]).filter(Boolean)
            return (
              <ColumnItem
                key={colId}
                column={col}
                cards={cards}
                onAddCard={addCard}
                onDeleteCard={deleteCard}
                onEditCard={editCard}
                onDeleteColumn={deleteColumn}
                onRenameColumn={renameColumn}
              />
            )
          })}

          {addingColumn ? (
            <div style={{ background: '#f1f5f9', borderRadius: 10, padding: 12, width: 280, minWidth: 280 }}>
              <input
                autoFocus
                value={newColTitle}
                onChange={e => setNewColTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addColumn()}
                placeholder="列のタイトル"
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={addColumn} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>追加</button>
                <button onClick={() => { setAddingColumn(false); setNewColTitle('') }} style={{ background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>キャンセル</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              style={{ background: 'rgba(255,248,225,0.7)', border: '1px solid #e2c98a', borderRadius: 10, padding: '10px 20px', color: '#92400e', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 200 }}
            >
              + 列を追加
            </button>
          )}
        </div>
      </DragDropContext>
      </div>
    </div>
  )
}
