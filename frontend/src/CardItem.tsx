import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import type { Card } from './types'

interface Props {
  card: Card
  index: number
  onDelete: (cardId: string) => void
  onEdit: (cardId: string, title: string, description: string) => void
}

export default function CardItem({ card, index, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)

  function handleSave() {
    if (title.trim()) {
      onEdit(card.id, title.trim(), description.trim())
      setEditing(false)
    }
  }

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            background: snapshot.isDragging ? '#e0e7ff' : 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            padding: '8px 10px',
            marginBottom: 8,
            boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.06)',
            cursor: 'grab',
            ...provided.draggableProps.style,
          }}
        >
          {editing ? (
            <div>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={inputStyle}
                placeholder="タイトル"
              />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
                placeholder="説明（任意）"
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button onClick={handleSave} style={btnPrimary}>保存</button>
                <button onClick={() => { setEditing(false); setTitle(card.title); setDescription(card.description) }} style={btnGhost}>キャンセル</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: description ? 4 : 0 }}>{card.title}</div>
              {card.description && <div style={{ fontSize: 12, color: '#64748b' }}>{card.description}</div>}
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button onClick={() => setEditing(true)} style={btnSmall}>編集</button>
                <button onClick={() => onDelete(card.id)} style={{ ...btnSmall, color: '#ef4444' }}>削除</button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 6px',
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
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
}
const btnGhost: React.CSSProperties = {
  background: 'transparent',
  color: '#64748b',
  border: '1px solid #cbd5e1',
  borderRadius: 4,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
}
const btnSmall: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#3b82f6',
  fontSize: 11,
  cursor: 'pointer',
  padding: 0,
}
