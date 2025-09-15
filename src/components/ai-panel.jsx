// ================= AI PANEL =================
import { useState, useEffect } from "react"
import {
  Sparkles,
  FileText,
  Tags,
  CheckCircle,
  Languages,
  Lightbulb,
  Zap,
  ChevronDown,
  X,
  Loader2,
  AlertTriangle,
  BadgeInfo,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useNotes } from "../contexts/notes-context"
import { APIService } from "../lib/api"
import { cn } from "../lib/utils"

// Section Component
const Section = ({ title, icon: Icon, expanded, onToggle, children, className }) => (
  <motion.div
    initial={false}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={cn("space-y-2 sm:space-y-3", className)}
  >
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-zinc-800/50 sm:p-0 sm:hover:bg-transparent"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-medium text-white sm:text-base">{title}</h3>
      </div>
      <motion.div
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </motion.div>
    </button>
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

// Main AI Panel
export function AIPanel({ noteId }) {
  const { getNote, updateNote } = useNotes()
  const [isGenerating, setIsGenerating] = useState(false)
  const [analysisData, setAnalysisData] = useState({
    summary: "",
    suggestedTags: [],
    grammarIssues: [],
    glossaryTerms: [],
    aiInsights: [],
  })
  const [expandedSections, setExpandedSections] = useState(new Set(["summary", "tags"]))
  const [translationResult, setTranslationResult] = useState(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [error, setError] = useState(null)

  const note = noteId ? getNote(noteId) : null

  useEffect(() => {
    if (note?.content) {
      analyzeContent(note.content)
    } else {
      resetAnalysis()
    }

    const checkRateLimit = () => {
      const data = localStorage.getItem("gemini_rate_limit")
      if (data) {
        const { timestamp, count } = JSON.parse(data)
        const now = Date.now()
        const day = 24 * 60 * 60 * 1000
        setRateLimited(now - timestamp < day && count >= 50)
      } else {
        setRateLimited(false)
      }
    }
    checkRateLimit()
  }, [note?.content])

  const resetAnalysis = () => {
    setAnalysisData({
      summary: "",
      suggestedTags: [],
      grammarIssues: [],
      glossaryTerms: [],
      aiInsights: [],
    })
    setTranslationResult(null)
    setError(null)
  }

  // ✅ FIXED: trust APIService output (no extra parsing)
  const analyzeContent = async (content) => {
    if (!content.trim()) {
      resetAnalysis()
      return
    }

    setIsGenerating(true)
    setError(null)
    try {
      const plainText = content.replace(/<[^>]*>/g, "").trim()
      const data = await APIService.analyzeContent(plainText)

      setAnalysisData({
        summary: data.summary || "No summary available.",
        suggestedTags: Array.isArray(data.tags) ? data.tags : [],
        grammarIssues: Array.isArray(data.grammarIssues) ? data.grammarIssues : [],
        glossaryTerms: Array.isArray(data.glossaryTerms) ? data.glossaryTerms : [],
        aiInsights: Array.isArray(data.insights) ? data.insights : [],
      })
    } catch (err) {
      console.error("AI analysis failed:", err)
      setError("AI analysis failed. Please try again or check limit quota.")
      setAnalysisData({
        summary: "Analysis failed. Please try again.",
        suggestedTags: [],
        grammarIssues: [],
        glossaryTerms: [],
        aiInsights: [],
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(section)) newExpanded.delete(section)
      else newExpanded.add(section)
      return newExpanded
    })
  }

  const addTag = (tag) => {
    if (noteId && note) {
      const currentTags = note.tags || []
      if (!currentTags.includes(tag)) {
        updateNote(noteId, { tags: [...currentTags, tag] })
      }
    }
  }

  const translateNote = async (language) => {
    if (!note?.content) return

    setIsGenerating(true)
    setError(null)
    try {
      const plainText = note.content.replace(/<[^>]*>/g, "").trim()
      const response = await APIService.translateText(plainText, language)

      let translatedText = "Translation failed."
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        translatedText = response.candidates[0].content.parts[0].text.trim()
      }

      setTranslationResult({
        original: plainText,
        translated: translatedText,
        language: language.toUpperCase(),
      })
    } catch (err) {
      console.error("Translation failed:", err)
      setError("Translation failed. Please try again.")
      setTranslationResult({
        original: note.content.replace(/<[^>]*>/g, "").trim(),
        translated: "Translation failed. Please try again.",
        language: language.toUpperCase(),
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (!noteId) {
    return (
      <div className="flex h-full items-center justify-center border-l border-zinc-700/50 bg-zinc-950/70 p-6 backdrop-blur-3xl">
        <div className="space-y-4 text-center text-zinc-400">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50"
          >
            <Sparkles className="h-8 w-8 text-blue-400" />
          </motion.div>
          <div>
            <h3 className="mb-2 text-base font-semibold text-white">
              AI Assistant
            </h3>
            <p className="text-sm">
              Select a note to unlock AI-powered insights and suggestions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { summary, suggestedTags, grammarIssues, glossaryTerms, aiInsights } = analysisData

  return (
    <div className="flex h-full flex-col border-l border-zinc-700/50 bg-zinc-950/70 backdrop-blur-3xl">
      <div className="flex items-center gap-2 border-b border-zinc-800 p-4">
        <Sparkles className="h-4 w-4 text-blue-400" />
        <h2 className="text-sm font-medium text-white sm:text-base">AI Assistant</h2>
        {rateLimited && (
          <div className="ml-auto flex items-center gap-1 rounded-full bg-amber-900/40 px-2 py-1 text-xs text-amber-300">
            <AlertTriangle className="h-3 w-3" />
            Rate Limited
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-zinc-400"
            >
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Generating insights...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300"
          >
            <BadgeInfo className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* --- Summary Section --- */}
        <Section
          title="Summary"
          icon={FileText}
          expanded={expandedSections.has("summary")}
          onToggle={() => toggleSection("summary")}
        >
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4 text-sm text-zinc-300">
            <p className="leading-relaxed">
              {summary || "Start writing to generate a summary."}
            </p>
          </div>
        </Section>

        {/* --- Suggested Tags --- */}
        <Section
          title="Suggested Tags"
          icon={Tags}
          expanded={expandedSections.has("tags")}
          onToggle={() => toggleSection("tags")}
        >
          {suggestedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="cursor-pointer rounded-full bg-zinc-700/50 px-3 py-1 text-xs text-zinc-200 transition-colors hover:bg-zinc-600/70"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 text-center text-xs text-zinc-500">
              <p>No tag suggestions available.</p>
            </div>
          )}
        </Section>

        {/* --- Grammar Check --- */}
        <Section
          title="Grammar Check"
          icon={CheckCircle}
          expanded={expandedSections.has("grammar")}
          onToggle={() => toggleSection("grammar")}
        >
          {grammarIssues.length > 0 ? (
            <div className="space-y-3">
              {grammarIssues.map((issue, index) => (
                <div key={index} className="rounded-lg border border-red-500/20 bg-red-900/20 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="break-all font-mono text-xs text-red-300">
                      {issue.text}
                    </span>
                    <span className="text-xs text-white">
                      → <span className="text-green-300">{issue.suggestion}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-green-500/20 bg-green-900/20 p-4 text-center text-sm text-green-300">
              <CheckCircle className="mx-auto mb-2 h-6 w-6" />
              <p>No grammar issues found!</p>
            </div>
          )}
        </Section>

        {/* --- Glossary --- */}
        <Section
          title="Glossary"
          icon={Lightbulb}
          expanded={expandedSections.has("glossary")}
          onToggle={() => toggleSection("glossary")}
        >
          {glossaryTerms.length > 0 ? (
            <div className="space-y-3">
              {glossaryTerms.map((term, index) => (
                <div key={index} className="rounded-lg border border-zinc-700/50 bg-zinc-800/40 p-3">
                  <h4 className="mb-1 text-sm font-medium text-white">{term.term}</h4>
                  <p className="text-xs text-zinc-400">{term.definition}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 text-center text-xs text-zinc-500">
              <p>No technical terms detected.</p>
            </div>
          )}
        </Section>

        {/* --- Translate --- */}
        <Section
          title="Translate"
          icon={Languages}
          expanded={expandedSections.has("translate")}
          onToggle={() => toggleSection("translate")}
        >
          <div className="space-y-4">
            <select
              onChange={(e) => translateNote(e.target.value)}
              className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/40 p-2 text-sm text-zinc-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              defaultValue=""
            >
              <option value="" disabled>Select language</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh">Chinese</option>
            </select>

            {translationResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 rounded-lg border border-blue-500/20 bg-blue-900/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-blue-400">
                    Translation ({translationResult.language})
                  </h4>
                  <button
                    onClick={() => setTranslationResult(null)}
                    className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-blue-800/30 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-zinc-400">Original:</p>
                  <div className="rounded border border-zinc-700/50 bg-zinc-900/40 p-2 text-xs text-zinc-300">
                    {translationResult.original}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-blue-300">Translated:</p>
                  <div className="rounded border border-blue-500/20 bg-blue-900/40 p-2 text-sm font-medium text-blue-300">
                    {translationResult.translated}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Section>

        {/* --- Insights --- */}
        <Section
          title="AI Insights"
          icon={Zap}
          expanded={expandedSections.has("insights")}
          onToggle={() => toggleSection("insights")}
        >
          {aiInsights.length > 0 ? (
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="rounded-lg border border-orange-500/20 bg-orange-900/20 p-3">
                  <h4 className="mb-1 text-sm font-medium text-orange-400">{insight.title}</h4>
                  <p className="text-xs text-zinc-400">{insight.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 text-center text-xs text-zinc-500">
              <p>No insights available.</p>
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}
