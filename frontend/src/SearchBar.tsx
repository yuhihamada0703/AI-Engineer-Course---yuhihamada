import { useState, type KeyboardEvent } from 'react'

interface Props {
  onSearch: (keyword: string) => void
  onClear: () => void
  isSearching: boolean
}

export default function SearchBar({ onSearch, onClear, isSearching }: Props) {
  const [value, setValue] = useState('')

  const handleSearch = () => {
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  const handleClear = () => {
    setValue('')
    onClear()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') handleClear()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="カードを検索..."
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid #d6c5a8',
          background: 'rgba(255,255,255,0.85)',
          fontSize: '14px',
          width: '200px',
          outline: 'none',
        }}
      />
      <button
        onClick={handleSearch}
        disabled={!value.trim()}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          background: value.trim() ? '#3b82f6' : '#cbd5e1',
          color: '#fff',
          fontSize: '14px',
          cursor: value.trim() ? 'pointer' : 'default',
        }}
      >
        検索
      </button>
      {isSearching && (
        <button
          onClick={handleClear}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #d6c5a8',
            background: 'rgba(255,255,255,0.85)',
            fontSize: '14px',
            cursor: 'pointer',
            color: '#92400e',
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
