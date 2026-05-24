import { useState, useCallback, useEffect } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import type { BoardData } from './types'
import * as api from './api'
import ColumnItem from './ColumnItem'
import SearchBar from './SearchBar'

function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const ANIMALS = ['🐱', '🐶', '🐼', '🐨', '🦊', '🐰', '🐸', '🐧', '🦁', '🐯']
const emptyBoard: BoardData = { columns: {}, cards: {}, columnOrder: [] }

export default function App() {
  const [board, setBoard] = useState<BoardData>(emptyBoard)
  const [loading, setLoading] = useState(true)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResult, setSearchResult] = useState<BoardData | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    api.getBoard().then(data => {
      setBoard(data)
      setLoading(false)
    })
  }, [])

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const srcCol = board.columns[source.droppableId]
    const dstCol = board.columns[destination.droppableId]
    let next: BoardData

    if (srcCol.id === dstCol.id) {
      const newIds = Array.from(srcCol.cardIds)
      newIds.splice(source.index, 1)
      newIds.splice(destination.index, 0, draggableId)
      next = { ...board, columns: { ...board.columns, [srcCol.id]: { ...srcCol, cardIds: newIds } } }
    } else {
      const srcIds = Array.from(srcCol.cardIds)
      const dstIds = Array.from(dstCol.cardIds)
      srcIds.splice(source.index, 1)
      dstIds.splice(destination.index, 0, draggableId)
      next = {
        ...board,
        columns: {
          ...board.columns,
          [srcCol.id]: { ...srcCol, cardIds: srcIds },
          [dstCol.id]: { ...dstCol, cardIds: dstIds },
        },
      }
    }

    setBoard(next)
    api.reorder(
      Object.fromEntries(Object.values(next.columns).map(col => [col.id, col.cardIds]))
    ).catch(console.error)
  }, [board])

  function addColumn() {
    if (!newColTitle.trim()) return
    const id = generateId()
    setBoard(prev => ({
      ...prev,
      columnOrder: [...prev.columnOrder, id],
      columns: { ...prev.columns, [id]: { id, title: newColTitle.trim(), cardIds: [] } },
    }))
    api.addColumn(id, newColTitle.trim()).catch(console.error)
    setNewColTitle('')
    setAddingColumn(false)
  }

  function deleteColumn(columnId: string) {
    const col = board.columns[columnId]
    setBoard(prev => {
      const newCards = { ...prev.cards }
      col.cardIds.forEach(id => delete newCards[id])
      const newColumns = { ...prev.columns }
      delete newColumns[columnId]
      return { ...prev, columnOrder: prev.columnOrder.filter(id => id !== columnId), columns: newColumns, cards: newCards }
    })
    api.deleteColumn(columnId).catch(console.error)
  }

  function renameColumn(columnId: string, title: string) {
    setBoard(prev => ({
      ...prev,
      columns: { ...prev.columns, [columnId]: { ...prev.columns[columnId], title } },
    }))
    api.renameColumn(columnId, title).catch(console.error)
  }

  function addCard(columnId: string, title: string, description: string) {
    const id = generateId()
    setBoard(prev => ({
      ...prev,
      cards: { ...prev.cards, [id]: { id, title, description } },
      columns: { ...prev.columns, [columnId]: { ...prev.columns[columnId], cardIds: [...prev.columns[columnId].cardIds, id] } },
    }))
    api.addCard(id, title, description, columnId).catch(console.error)
  }

  function deleteCard(columnId: string, cardId: string) {
    setBoard(prev => {
      const newCards = { ...prev.cards }
      delete newCards[cardId]
      return {
        ...prev,
        cards: newCards,
        columns: { ...prev.columns, [columnId]: { ...prev.columns[columnId], cardIds: prev.columns[columnId].cardIds.filter(id => id !== cardId) } },
      }
    })
    api.deleteCard(cardId).catch(console.error)
  }

  async function handleSearch(keyword: string) {
    setSearching(true)
    try {
      const result = await api.searchBoard(keyword)
      setSearchResult(result)
      setSearchKeyword(keyword)
    } catch (e) {
      console.error(e)
    } finally {
      setSearching(false)
    }
  }

  function handleClear() {
    setSearchResult(null)
    setSearchKeyword('')
  }

  function editCard(cardId: string, title: string, description: string) {
    setBoard(prev => ({
      ...prev,
      cards: { ...prev.cards, [cardId]: { ...prev.cards[cardId], title, description } },
    }))
    api.editCard(cardId, title, description).catch(console.error)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fef9f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#92400e' }}>
        読み込み中...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fef9f0', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 60px)', gridTemplateRows: 'repeat(auto-fill, 60px)',
        gap: 0, opacity: 0.18, fontSize: 36, lineHeight: '60px', textAlign: 'center', userSelect: 'none', overflow: 'hidden',
      }}>
        {Array.from({ length: 300 }).map((_, i) => (
          <span key={i}>{ANIMALS[i % ANIMALS.length]}</span>
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e2c98a', background: 'rgba(255,248,225,0.85)', backdropFilter: 'blur(4px)' }}>
          <h1 style={{ margin: 0, color: '#92400e', fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>🐾 タスクボード</h1>
          <SearchBar onSearch={handleSearch} onClear={handleClear} isSearching={searchResult !== null} />
          {searching && <span style={{ fontSize: 13, color: '#92400e' }}>検索中...</span>}
        </header>

        {searchResult !== null ? (
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 12, fontSize: 14, color: '#92400e' }}>
              「{searchKeyword}」の検索結果: {Object.keys(searchResult.cards).length}件
            </div>
            {searchResult.columnOrder.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 14 }}>一致するカードが見つかりませんでした。</div>
            ) : (
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto', alignItems: 'flex-start' }}>
                {searchResult.columnOrder.map(colId => {
                  const col = searchResult.columns[colId]
                  const cards = col.cardIds.map(id => searchResult.cards[id]).filter(Boolean)
                  return (
                    <div key={colId} style={{ background: 'rgba(255,248,225,0.9)', borderRadius: 10, padding: '12px', width: 280, minWidth: 280, border: '1px solid #e2c98a' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#92400e', marginBottom: 10 }}>
                        {col.title}
                        <span style={{ marginLeft: 6, background: '#92400e', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 400 }}>{cards.length}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {cards.map(card => (
                          <div key={card.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px' }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{card.title}</div>
                            {card.description && (
                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{card.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
