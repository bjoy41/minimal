import { useState, useEffect } from 'react'

interface Item {
  id: number
  name: string
  done: boolean
}

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetch('/api/items')
      .then((res) => res.json())
      .then(setItems)
  }, [])

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), done: false }),
    })
    const item: Item = await res.json()
    setItems((prev) => [...prev, item])
    setNewName('')
  }

  const toggleItem = async (item: Item) => {
    const updated = { ...item, done: !item.done }
    await fetch('/api/items', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
  }

  const deleteItem = async (id: number) => {
    await fetch('/api/items', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Minimal App</h1>

      <form onSubmit={addItem} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add an item..."
          style={{ flex: 1, padding: '8px 12px', fontSize: 14 }}
          autoFocus
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Add</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <input type="checkbox" checked={item.done} onChange={() => toggleItem(item)} />
            <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? '#999' : '#333' }}>
              {item.name}
            </span>
            <button onClick={() => deleteItem(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
              x
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>No items yet</p>}
    </div>
  )
}

export default App
