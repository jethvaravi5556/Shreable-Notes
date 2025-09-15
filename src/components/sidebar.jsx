import { useState } from "react"
import { Search, Plus, Pin, Trash2, Lock, Shield, ShieldCheck, X } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { PasswordDialog } from "./password-dialog"
import { useNotes } from "../contexts/notes-context"
import { EncryptionService } from "../lib/encryption"
import { cn } from "../lib/utils"

export function Sidebar({ selectedNoteId, onSelectNote, isMobile, onClose }) {
  const { notes, createNote, deleteNote, togglePin, searchNotes, updateNote } = useNotes()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilters, setSearchFilters] = useState({
    showPinned: true,
    showEncrypted: true,
    showRegular: true,
    sortBy: "modified", // modified, created, title, content
  })
  const [passwordDialog, setPasswordDialog] = useState({
    isOpen: false,
    mode: "encrypt",
    noteId: null,
  })

  // Enhanced search with filters
  const getFilteredNotes = () => {
    let filtered = notes

    // Apply search query
    if (searchQuery.trim()) {
      filtered = searchNotes(searchQuery)
    }

    // Apply filters
    if (!searchFilters.showPinned) {
      filtered = filtered.filter(note => !note.isPinned)
    }
    if (!searchFilters.showEncrypted) {
      filtered = filtered.filter(note => !note.isEncrypted)
    }
    if (!searchFilters.showRegular) {
      filtered = filtered.filter(note => note.isPinned || note.isEncrypted)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (searchFilters.sortBy) {
        case "created":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "title":
          return a.title.localeCompare(b.title)
        case "content":
          return (b.content || "").length - (a.content || "").length
        case "modified":
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
    })

    return filtered
  }

  const filteredNotes = getFilteredNotes()
  const pinnedNotes = filteredNotes.filter((note) => note.isPinned)
  const regularNotes = filteredNotes.filter((note) => !note.isPinned)

  const handleCreateNote = () => {
    const newNote = createNote()
    onSelectNote(newNote.id)
  }

  const handleToggleEncryption = (noteId) => {
    const note = notes.find((n) => n.id === noteId)
    if (!note) return

    if (note.isEncrypted) {
      // Decrypt note
      setPasswordDialog({
        isOpen: true,
        mode: "decrypt",
        noteId,
      })
    } else {
      // Encrypt note
      setPasswordDialog({
        isOpen: true,
        mode: "encrypt",
        noteId,
      })
    }
  }

  const handlePasswordConfirm = async (password) => {
    if (!passwordDialog.noteId) return

    const note = notes.find((n) => n.id === passwordDialog.noteId)
    if (!note) return

    try {
      if (passwordDialog.mode === "encrypt") {
        // Encrypt the note
        const encryptedContent = await EncryptionService.encrypt(note.content, password)
        const encryptedTitle = await EncryptionService.encrypt(note.title, password)

        updateNote(passwordDialog.noteId, {
          content: encryptedContent,
          title: encryptedTitle,
          isEncrypted: true,
          password: password, // In production, store hash instead
        })
      } else {
        // Decrypt the note
        const decryptedContent = await EncryptionService.decrypt(note.content, password)
        const decryptedTitle = await EncryptionService.decrypt(note.title, password)

        updateNote(passwordDialog.noteId, {
          content: decryptedContent,
          title: decryptedTitle,
          isEncrypted: false,
          password: undefined,
        })
      }
    } catch (error) {
      console.error("Encryption/Decryption failed:", error)
      // Handle error - show toast or alert
    }
  }

  const formatDate = (date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      <div className="h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gradient">
              Shareable Notes
            </h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateNote}
                size="sm"
                className="btn-modern hover-lift transition-modern"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {isMobile && onClose && (
                <Button onClick={onClose} size="sm" variant="ghost" className="glass hover:bg-destructive/20">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-violet-500 transition-colors duration-300" />
              <Input
                placeholder="Search notes, content, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 input-modern focus-modern bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60 border-2 border-white/30 dark:border-white/20 backdrop-blur-md hover:border-violet-300/50 focus:border-violet-400/50 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Filter Toggles */}
              <div className="flex gap-1">
                <button
                  onClick={() => setSearchFilters(prev => ({ ...prev, showPinned: !prev.showPinned }))}
                  className={cn(
                    "px-2 py-1 text-xs rounded-lg transition-all duration-200",
                    searchFilters.showPinned 
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" 
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  📌 Pinned
                </button>
                <button
                  onClick={() => setSearchFilters(prev => ({ ...prev, showEncrypted: !prev.showEncrypted }))}
                  className={cn(
                    "px-2 py-1 text-xs rounded-lg transition-all duration-200",
                    searchFilters.showEncrypted 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  🔒 Encrypted
                </button>
                <button
                  onClick={() => setSearchFilters(prev => ({ ...prev, showRegular: !prev.showRegular }))}
                  className={cn(
                    "px-2 py-1 text-xs rounded-lg transition-all duration-200",
                    searchFilters.showRegular 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  📝 Regular
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={searchFilters.sortBy}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-2 py-1 text-xs rounded-lg bg-white/60 dark:bg-gray-700/60 border border-white/30 dark:border-white/20 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200"
              >
                <option value="modified">🕒 Recently Modified</option>
                <option value="created">📅 Recently Created</option>
                <option value="title">🔤 Alphabetical</option>
                <option value="content">📄 By Length</option>
              </select>
            </div>

            {/* Search Results Count */}
            {searchQuery && (
              <div className="text-xs text-gray-500 dark:text-gray-400 animate-fade-in">
                Found {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} 
                {searchQuery && ` for "${searchQuery}"`}
              </div>
            )}
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Pin className="h-3 w-3" />
                Pinned
              </h3>
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  onSelect={() => onSelectNote(note.id)}
                  onDelete={() => deleteNote(note.id)}
                  onTogglePin={() => togglePin(note.id)}
                  onToggleEncryption={() => handleToggleEncryption(note.id)}
                  formatDate={formatDate}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}

          {/* Regular Notes */}
          {regularNotes.length > 0 && (
            <div className="space-y-2">
              {pinnedNotes.length > 0 && <h3 className="text-sm font-medium text-muted-foreground">Recent</h3>}
              {regularNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  onSelect={() => onSelectNote(note.id)}
                  onDelete={() => deleteNote(note.id)}
                  onTogglePin={() => togglePin(note.id)}
                  onToggleEncryption={() => handleToggleEncryption(note.id)}
                  formatDate={formatDate}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}

          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No notes found" : "No notes yet. Create your first note!"}
            </div>
          )}
        </div>
      </div>

      {/* Password Dialog */}
      <PasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog({ isOpen: false, mode: "encrypt", noteId: null })}
        onConfirm={handlePasswordConfirm}
        mode={passwordDialog.mode}
      />
    </>
  )
}

function NoteCard({
  note,
  isSelected,
  onSelect,
  onDelete,
  onTogglePin,
  onToggleEncryption,
  formatDate,
  searchQuery = "",
}) {
  const [isHovered, setIsHovered] = useState(false)

  const getPreview = (content) => {
    if (note.isEncrypted) {
      return "🔒 Encrypted content"
    }
    const plainText = content.replace(/<[^>]*>/g, "").trim()
    return plainText.length > 60 ? plainText.substring(0, 60) + "..." : plainText || "No content"
  }

  const getTitle = (title) => {
    if (note.isEncrypted) {
      return "🔒 Encrypted Note"
    }
    return title || "Untitled"
  }

  // Highlight search terms
  const highlightText = (text, query) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded">$1</mark>')
  }

  return (
    <div
      className={cn(
        "p-4 rounded-2xl cursor-pointer transition-all duration-300 animate-slide-in group relative overflow-hidden",
        "bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60",
        "border-2 border-white/30 dark:border-white/20 backdrop-blur-md",
        "hover:shadow-lg hover:shadow-violet-500/10 hover:scale-[1.02]",
        isSelected && "ring-2 ring-violet-500/50 border-violet-500/50 bg-gradient-to-br from-violet-50/80 to-violet-50/60 dark:from-violet-900/30 dark:to-violet-900/20 shadow-lg shadow-violet-500/20",
        isHovered && "hover-lift",
        note.isEncrypted && "border-amber-500/40 bg-gradient-to-br from-amber-50/80 to-amber-50/60 dark:from-amber-900/20 dark:to-amber-900/10",
        note.isPinned && "border-purple-500/40 bg-gradient-to-br from-purple-50/80 to-purple-50/60 dark:from-purple-900/20 dark:to-purple-900/10",
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating particles on hover */}
      {isHovered && (
        <>
          <div className="absolute top-2 right-2 w-1 h-1 bg-violet-400/60 rounded-full animate-ping" style={{ animationDelay: "0s" }} />
          <div className="absolute top-4 right-4 w-1 h-1 bg-purple-400/60 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
        </>
      )}
      <div className="flex items-start justify-between mb-2 relative z-10">
        <h3 className="font-medium text-sm truncate flex-1 text-balance flex items-center gap-2">
          {note.isEncrypted && <Lock className="h-3 w-3 text-amber-400" />}
          {note.isPinned && <Pin className="h-3 w-3 text-purple-400" />}
          <span 
            dangerouslySetInnerHTML={{ 
              __html: highlightText(getTitle(note.title), searchQuery) 
            }} 
          />
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onToggleEncryption()
            }}
            className={cn(
              "h-6 w-6 p-0 hover:bg-amber-500/20",
              note.isEncrypted ? "text-amber-400" : "hover:text-amber-400",
            )}
            title={note.isEncrypted ? "Decrypt note" : "Encrypt note"}
          >
            {note.isEncrypted ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin()
            }}
            className={cn("h-6 w-6 p-0 hover:bg-primary/20", note.isPinned && "text-primary")}
          >
            <Pin className={cn("h-3 w-3", note.isPinned && "fill-current")} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <p 
        className="text-xs text-muted-foreground mb-2 line-clamp-2 text-pretty relative z-10"
        dangerouslySetInnerHTML={{ 
          __html: highlightText(getPreview(note.content), searchQuery) 
        }} 
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(note.updatedAt)}</span>
        <div className="flex items-center gap-1">
          {note.isEncrypted && <Lock className="h-3 w-3 text-amber-400" />}
          {note.tags.length > 0 && (
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full">{note.tags.length}</span>
          )}
        </div>
      </div>
    </div>
  )
}
