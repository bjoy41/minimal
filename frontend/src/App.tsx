import { useState, useEffect } from 'react'
import { Container, Title, TextInput, Button, Group, Checkbox, Text, Stack, ActionIcon } from '@mantine/core'

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
    <Container size="xs" py="xl">
      <Title order={1} mb="lg">Minimal App</Title>

      <form onSubmit={addItem}>
        <Group mb="lg">
          <TextInput
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            placeholder="Add an item..."
            style={{ flex: 1 }}
            autoFocus
          />
          <Button type="submit">Add</Button>
        </Group>
      </form>

      <Stack gap="xs">
        {items.map((item) => (
          <Group key={item.id} justify="space-between" wrap="nowrap">
            <Checkbox
              checked={item.done}
              onChange={() => toggleItem(item)}
              label={item.name}
              styles={item.done ? { label: { textDecoration: 'line-through', color: 'var(--mantine-color-dimmed)' } } : undefined}
            />
            <ActionIcon variant="subtle" color="red" onClick={() => deleteItem(item.id)}>
              ✕
            </ActionIcon>
          </Group>
        ))}
      </Stack>

      {items.length === 0 && (
        <Text c="dimmed" ta="center" mt="xl">No items yet</Text>
      )}
    </Container>
  )
}

export default App
