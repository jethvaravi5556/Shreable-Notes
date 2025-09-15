import { useState, useEffect, useRef } from "react"
import toast, { Toaster } from "react-hot-toast"
import { useNotes } from "../contexts/notes-context"
import { RichTextEditor } from "./rich-text-editor"
import { cn } from "../lib/utils"
import { FileText, Sparkles, Clock, Calendar, History, Edit3, Save, Share2, Download, CheckCircle } from "lucide-react"

export function Editor({ noteId, formatCommand, fontSize = 16, onFormatApplied }) {
  const { getNote, updateNote } = useNotes()
  const [title, setTitle] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showMetadata, setShowMetadata] = useState(true)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const editorRef = useRef(null)
  const titleRef = useRef(null)

  const note = noteId ? getNote(noteId) : null

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    if (note) {
      setTitle(note.title)
    } else {
      setTitle("")
    }
  }, [note])

  useEffect(() => {
    if (formatCommand && editorRef.current) {
      editorRef.current.applyFormat(formatCommand.command, formatCommand.value)
      onFormatApplied?.()
    }
  }, [formatCommand, onFormatApplied])

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle)
    setIsTyping(true)
    
    // Clear typing indicator after 1 second of no typing
    const timeoutId = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
    
    if (noteId) {
      updateNote(noteId, { title: newTitle })
    }
    
    return () => clearTimeout(timeoutId)
  }

  const handleContentChange = (newContent) => {
    if (noteId) {
      updateNote(noteId, { content: newContent })
      
      // Update word and character count
      const words = newContent.trim().split(/\s+/).filter(Boolean).length
      const chars = newContent.length
      setWordCount(words)
      setCharCount(chars)
    }
  }

  const handleTitleFocus = () => {
    titleRef.current?.select()
  }

  if (!noteId) {
    return (
      <div className="h-full flex items-center justify-center relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 via-indigo-50/20 to-purple-50/30 dark:from-violet-950/10 dark:via-indigo-950/5 dark:to-purple-950/10" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000" />
        
        <div className="text-center space-y-8 animate-fade-in container-responsive z-10">
          <div className="relative">
            <div
              className={cn(
                "mx-auto rounded-2xl backdrop-blur-sm border border-white/20 dark:border-white/10",
                "bg-gradient-to-br from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-900/20",
                "shadow-2xl shadow-violet-500/10 dark:shadow-violet-400/5",
                "flex items-center justify-center relative overflow-hidden",
                "hover:shadow-violet-500/20 dark:hover:shadow-violet-400/10 transition-all duration-500",
                isMobile ? "w-20 h-20" : isTablet ? "w-24 h-24" : "w-28 h-28",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 animate-pulse" />
              <FileText
                className={cn(
                  "text-violet-600 dark:text-violet-400",
                  isMobile ? "w-8 h-8" : isTablet ? "w-10 h-10" : "w-12 h-12",
                )}
              />
              <Sparkles
                className={cn(
                  "absolute top-2 right-2 text-purple-500 dark:text-purple-400 animate-bounce",
                  isMobile ? "w-3 h-3" : "w-4 h-4",
                )}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Edit3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3
                className={cn(
                  "font-bold bg-gradient-to-r from-violet-700 to-purple-700 dark:from-violet-300 dark:to-purple-300",
                  "bg-clip-text text-transparent text-balance",
                  isMobile ? "text-xl" : isTablet ? "text-2xl" : "text-2xl",
                )}
              >
                Ready to Create Something Amazing?
              </h3>
            </div>
            
            <p className={cn(
              "text-pretty text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto",
              isMobile ? "text-sm" : "text-base",
            )}>
              Select a note from the sidebar to begin your writing journey, or create a new masterpiece
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Ready to edit
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-full flex flex-col animate-fade-in relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white/30 to-indigo-50/30 dark:from-slate-950/50 dark:via-gray-950/30 dark:to-indigo-950/20 pointer-events-none" />
        
        {/* Editor Content */}
        <div
          className={cn(
            "flex-1 overflow-y-auto scroll-smooth relative z-10",
            "scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent",
            isMobile ? "mobile-padding px-4 py-6" : isTablet ? "tablet-padding px-8 py-8" : "desktop-padding px-12 py-10",
          )}
        >
          <div className={cn(
            "mx-auto space-y-8",
            isMobile ? "max-w-full" : isTablet ? "max-w-3xl" : "max-w-4xl",
          )}>
            {/* Title Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="absolute -top-6 left-0 flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-violet-500 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-violet-500 rounded-full animate-bounce delay-100" />
                      <div className="w-1 h-1 bg-violet-500 rounded-full animate-bounce delay-200" />
                    </div>
                    <span>Saving...</span>
                  </div>
                )}
                
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onFocus={handleTitleFocus}
                  placeholder="✨ Give your masterpiece a title..."
                  className={cn(
                    "w-full font-black bg-transparent border-none outline-none",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    "text-slate-800 dark:text-slate-100",
                    "focus:ring-0 focus:border-none",
                    "transition-all duration-300 ease-out",
                    "hover:text-violet-700 dark:hover:text-violet-300",
                    "focus:text-violet-800 dark:focus:text-violet-200",
                    "bg-gradient-to-r from-transparent via-violet-50/30 to-transparent dark:via-violet-950/20",
                    "px-4 py-3 rounded-lg",
                    isMobile
                      ? "text-2xl leading-tight"
                      : isTablet
                        ? "text-3xl leading-tight"
                        : "text-4xl leading-tight",
                  )}
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={cn(
                "relative backdrop-blur-sm",
                "border border-slate-200/60 dark:border-slate-700/60",
                "bg-white/40 dark:bg-slate-900/40",
                "rounded-2xl shadow-lg shadow-slate-500/5 dark:shadow-slate-900/20",
                "hover:shadow-xl hover:shadow-slate-500/10 dark:hover:shadow-slate-900/30",
                "transition-all duration-500 ease-out",
                "overflow-hidden",
              )}>
                <RichTextEditor
                  ref={editorRef}
                  content={note?.content || ""}
                  onChange={handleContentChange}
                  placeholder="🚀 Start crafting your ideas here... Let your creativity flow!"
                  className={cn(
                    "animate-scale-in min-h-[400px]",
                    "prose prose-slate dark:prose-invert prose-lg max-w-none",
                    "focus-within:prose-violet",
                    isMobile ? "editor-mobile p-4" : isTablet ? "editor-tablet p-6" : "editor-desktop p-8",
                  )}
                  fontSize={fontSize}
                />
              </div>
            </div>

            {/* Enhanced Metadata */}
            {note && (
              <div
                className={cn(
                  "relative group cursor-pointer",
                  "backdrop-blur-sm bg-gradient-to-r from-slate-50/80 to-indigo-50/80 dark:from-slate-800/80 dark:to-indigo-900/40",
                  "border border-slate-200/60 dark:border-slate-700/60",
                  "rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300",
                  "animate-fade-in",
                )}
                onClick={() => setShowMetadata(!showMetadata)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className={cn(
                  "relative flex items-center justify-between",
                  isMobile ? "flex-col gap-3 items-start" : "flex-row",
                )}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Created {note.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Modified {note.updatedAt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {note.versions.length > 0 && (
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                      <History className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {note.versions.length} version{note.versions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Word Count & Reading Time */}
                {showMetadata && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="font-medium">{wordCount} words</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <span className="font-medium">{charCount} characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="font-medium">{Math.ceil(wordCount / 200)} min read</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Auto-saved</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}