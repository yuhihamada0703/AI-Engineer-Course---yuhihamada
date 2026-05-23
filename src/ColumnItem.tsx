import { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import type { Column, Card } from './types'
import CardItem from './CardItem'

interface Props {
  column: Column
  cards: Card[]
  onAddCard: (columnId: string, title: string, description: string) => void
  onDeleteCard: (columnId: string, cardId: string) => void
  onEditCard: (cardId: string, title: string, description: string) => void
  onDeleteColumn: (columnId: string) => void
  onRenameColumn: (columnId: string, title: string) => void
}

export default function ColumnItem({ column, cards, onAddCard, onDeleteCard, onEditCard, onDeleteColumn, onRenameColumn }: Props) {
  const [addingCard, setAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardDesc, setNewCardDesc] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [colTitle, setColTitle] = useState(column.title)

  function handleAddCard() {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim(), newCardDesc.trim())
      setNewCardTitle('')
      setNewCardDesc('')
      setAddingCard(false)
    }
  }

  function handleRename() {
    if (colTitle.trim()) {
      onRenameColumn(column.id, colTitle.trim())
      setEditingTitle(false)
    }
  }

  return (
    <div style={{
      background: '#f1f5f9',
      borderRadius: 10,
      padding: 12,
      width: 280,
      minWidth: 280,
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 120px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 6 }}>
        {editingTitle ? (
          <>
            <input
              autoFocus
              value={colTitle}
              onChange={e => setColTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              style={{ flex: 1, fontWeight: 700, fontSize: 15, padding: '2px 6px', border: '1px solid #94a3b8', borderRadius: 4 }}
            />
          </>
        ) : (
          <h3
            onClick={() => setEditingTitle(true)}
            style={{ flex: 1, margin: 0, fontSize: 15, fontWeight: 700, cursor: 'pointer', color: '#1e293b' }}
            title="クリックして名前を変更"
          >
            {column.title}
          </h3>
        )}
        <span style={{ background: '#cbd5e1', borderRadius: 12, fontSize: 11, padding: '1px 7px', color: '#475569' }}>
          {cards.length}
        </span>
        <button
          onClick={() => onDeleteColumn(column.id)}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
          title="列を削除"
        >
          ×
        </button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 8,
              background: snapshot.isDraggingOver ? '#dbeafe' : 'transparent',
              borderRadius: 6,
              transition: 'background 0.15s',
              padding: 2,
            }}
          >
            {cards.map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index}
                onDelete={(cardId) => onDeleteCard(column.id, cardId)}
                onEdit={onEditCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {addingCard ? (
        <div style={{ marginTop: 8 }}>
          <input
            autoFocus
            value={newCardTitle}
            onChange={e => setNewCardTitle(e.target.value)}
            placeholder="カードのタイトル"
            style={inputStyle}
          />
          <textarea
            value={newCardDesc}
            onChange={e => setNewCardDesc(e.target.value)}
            placeholder="説明（任意）"
            style={{ ...inputStyle, resize: 'vertical', minHeight: 50 }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button onClick={handleAddCard} style={btnPrimary}>追加</button>
            <button onClick={() => { setAddingCard(false); setNewCardTitle(''); setNewCardDesc('') }} style={btnGhost}>キャンセル</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingCard(true)} style={addCardBtn}>+ カードを追加</button>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  border: '1px solid #cbd5e1',
  borderRadius: 4,
  fontSize: 13,
  marginBottom: 4,
  boxSizing: 'border-box',
}
const btnPrimary: React.CSSProperties = {
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  padding: '5px 12px',
  fontSize: 12,
  cursor: 'pointer',
}
const btnGhost: React.CSSProperties = {
  background: 'transparent',
  color: '#64748b',
  border: '1px solid #cbd5e1',
  borderRadius: 4,
  padding: '5px 12px',
  fontSize: 12,
  cursor: 'pointer',
}
const addCardBtn: React.CSSProperties = {
  marginTop: 8,
  width: '100%',
  background: 'transparent',
  border: '1px dashed #94a3b8',
  borderRadius: 6,
  padding: '7px 0',
  color: '#64748b',
  fontSize: 13,
  cursor: 'pointer',
}
