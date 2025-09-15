import React, { useState, useEffect } from "react"
import { Sidebar } from "./components/sidebar"
import { Toolbar } from "./components/toolbar"
import { Editor } from "./components/editor"
import { AIPanel } from "./components/ai-panel"
import { LoadingSpinner } from "./components/loading-spinner"
import { NotesProvider } from "./contexts/notes-context"
import { Menu, X, Sparkles, FileText, BookOpen, PenTool } from "lucide-react"
import { Button } from "./components/ui/button"

function App() {
  console.log('App component loaded successfully')
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editorFormat, setEditorFormat] = useState(null)
  const [fontSize, setFontSize] = useState(16)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)

      // Auto-close panels on mobile when screen size changes
      if (width < 768) {
        setSidebarOpen(false)
        setAiPanelOpen(false)
      } else if (width >= 1024) {
        // Auto-open panels on desktop
        setSidebarOpen(false) // Sidebar is always visible on desktop
        // setAiPanelOpen(false) // AI panel is always visible on desktop
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    // Simulate initial loading
    setTimeout(() => setIsLoading(false), 1000)

    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleSelectNote = (noteId) => {
    setSelectedNoteId(noteId)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleFormat = (command, value) => {
    if (command === "fontSize") {
      const size = Number.parseInt(value?.replace("px", "") || "16")
      setFontSize(size)
    }
    setEditorFormat({ command, value })
  }

  const handleExportPDF = () => {
    if (selectedNoteId) {
      // Create a new window with the note content for printing
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        const editorElement = document.querySelector("[contenteditable]")
        const titleElement = document.querySelector('input[type="text"]')

        if (editorElement && titleElement) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${titleElement.value || "Untitled Note"}</title>
              <style>
                body { 
                  font-family: system-ui, -apple-system, sans-serif; 
                  line-height: 1.6; 
                  max-width: 800px; 
                  margin: 0 auto; 
                  padding: 40px 20px;
                  color: #333;
                }
                h1 { 
                  font-size: 2rem; 
                  margin-bottom: 1rem; 
                  color: #1a1a1a;
                }
                .content { 
                  font-size: ${fontSize}px; 
                }
                blockquote {
                  border-left: 4px solid #6366f1;
                  padding-left: 1rem;
                  font-style: italic;
                  margin: 1rem 0;
                }
                pre {
                  background: #f5f5f5;
                  padding: 1rem;
                  border-radius: 8px;
                  font-family: 'Courier New', monospace;
                  overflow-x: auto;
                }
                ul, ol { margin-left: 1.5rem; }
                li { margin-bottom: 0.25rem; }
                a { color: #6366f1; text-decoration: underline; }
                img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
              </style>
            </head>
            <body>
              <h1>${titleElement.value || "Untitled Note"}</h1>
              <div class="content">${editorElement.innerHTML}</div>
            </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.print()
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full glass neumorphic flex items-center justify-center animate-float">
            <LoadingSpinner size="lg" />
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              {/* Logo container with gradient background */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <div className="relative">
                  {/* Main document icon */}
                  <FileText className="w-6 h-6 text-white" />
                  {/* Small pen overlay */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <PenTool className="w-2 h-2 text-white" />
                  </div>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-30 blur-lg -z-10"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-shimmer">Shareable Notes</h1>
              <p className="text-muted-foreground animate-pulse-slow text-sm">Loading your workspace...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <NotesProvider>
      <div className="flex h-screen overflow-hidden animate-fade-in bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`
          ${
            isMobile
              ? `fixed left-0 top-0 z-50 h-full w-80 transform transition-modern ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : isTablet
                ? `${sidebarOpen ? "w-80" : "w-0"} transition-modern overflow-hidden`
                : "w-80"
          } 
          h-full animate-slide-in sidebar-modern shadow-modern
        `}
        >
          <Sidebar
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            isMobile={isMobile}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col animate-slide-in-delayed min-w-0">
          <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-visible bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <div className="h-full flex items-center overflow-visible">
              {/* Mobile menu buttons */}
              {(isMobile || isTablet) && (
                <div className="flex items-center gap-2 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="glass hover:bg-primary/20"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex-1 overflow-visible">
                <Toolbar
                  onFormat={handleFormat}
                  onExportPDF={handleExportPDF}
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              </div>

              <div className="px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiPanelOpen(!aiPanelOpen)}
                  className={`glass hover:bg-accent/20 transition-all duration-200 ${
                    aiPanelOpen ? "bg-accent/10 text-accent" : ""
                  }`}
                  title="Toggle AI Assistant"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex min-h-0">
            <div
              className={`flex-1 animate-fade-in-delayed min-w-0 transition-all duration-300 ${
                !aiPanelOpen && !isMobile ? "mr-0" : ""
              }`}
            >
              <Editor
                noteId={selectedNoteId}
                formatCommand={editorFormat}
                fontSize={fontSize}
                onFormatApplied={() => setEditorFormat(null)}
              />
            </div>

            {aiPanelOpen && (
              <>
                {isMobile ? (
                  // Mobile: AI Panel as overlay
                  <>
                    <div
                      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
                      onClick={() => setAiPanelOpen(false)}
                    />
                    <div className="fixed right-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 animate-slide-in">
                      <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-border/30 glass-strong">
                          <h2 className="font-semibold">AI Assistant</h2>
                          <Button variant="ghost" size="sm" onClick={() => setAiPanelOpen(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <AIPanel noteId={selectedNoteId} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Desktop & Tablet: Side panel
                  <div className="w-80 border-l border-gray-200 dark:border-gray-700 animate-slide-in-delayed ai-panel-modern shadow-modern">
                    <AIPanel noteId={selectedNoteId} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </NotesProvider>
  )
}

export default App