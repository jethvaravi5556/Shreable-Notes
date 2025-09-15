import { createContext, useContext, useState, useEffect } from "react"

export const NotesContext = createContext(undefined)

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("shareable-notes")
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes)
        setNotes(
          parsed.map((note) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            versions:
              note.versions?.map((v) => ({
                ...v,
                timestamp: new Date(v.timestamp),
              })) || [],
          })),
        )
      } catch (error) {
        console.error("Failed to load notes:", error)
      }
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("shareable-notes", JSON.stringify(notes))
  }, [notes])

  const createNote = () => {
    const newNote = {
      id: crypto.randomUUID(),
      title: "Untitled Note",
      content: "",
      isPinned: false,
      isEncrypted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      versions: [],
    }

    setNotes((prev) => [newNote, ...prev])
    return newNote
  }

  const updateNote = (id, updates) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === id) {
          const updatedNote = {
            ...note,
            ...updates,
            updatedAt: new Date(),
          }

          // Add to version history if content changed
          if (updates.content && updates.content !== note.content) {
            updatedNote.versions = [
              ...note.versions,
              {
                id: crypto.randomUUID(),
                content: note.content,
                timestamp: new Date(),
              },
            ].slice(-10) // Keep only last 10 versions
          }

          return updatedNote
        }
        return note
      }),
    )
  }

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const togglePin = (id) => {
    updateNote(id, { isPinned: !notes.find((n) => n.id === id)?.isPinned })
  }

  const searchNotes = (query) => {
    if (!query.trim()) return notes

    const lowercaseQuery = query.toLowerCase()
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    )
  }

  const getNote = (id) => {
    return notes.find((note) => note.id === id)
  }

  return (
    <NotesContext.Provider
      value={{
        notes,
        createNote,
        updateNote,
        deleteNote,
        togglePin,
        searchNotes,
        getNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider")
  }
  return context
}
