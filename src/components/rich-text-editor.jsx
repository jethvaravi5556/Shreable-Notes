import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Palette,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

// A map for font size conversions since document.execCommand('fontSize', ...) uses a relative size
const FONT_SIZE_MAP = {
  "12px": "1",
  "14px": "2",
  "16px": "3",
  "18px": "4",
  "20px": "5",
  "24px": "6",
  "28px": "7",
  "32px": "7",
};

// New font size scale for increment/decrement
const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
];

export const RichTextEditor = forwardRef(
  (
    {
      content,
      onChange,
      placeholder = "Start writing...",
      className,
      fontSize = "16px",
    },
    ref
  ) => {
    const editorRef = useRef(null);
    const [activeFormats, setActiveFormats] = useState(new Set());
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [showColorDialog, setShowColorDialog] = useState(false);
    const [lastAppliedFontSize, setLastAppliedFontSize] = useState(fontSize);

    // FIX: Define handleInput and updateActiveFormats first to avoid 'Cannot access before initialization' errors.
    const handleInput = useCallback(() => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        onChange(newContent);
      }
    }, [onChange]);

    const updateActiveFormats = useCallback(() => {
      const formats = new Set();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setActiveFormats(formats);
        return;
      }

      try {
        if (document.queryCommandState("bold")) formats.add("bold");
        if (document.queryCommandState("italic")) formats.add("italic");
        if (document.queryCommandState("underline")) formats.add("underline");
        if (document.queryCommandState("justifyLeft")) formats.add("justifyLeft");
        if (document.queryCommandState("justifyCenter")) formats.add("justifyCenter");
        if (document.queryCommandState("justifyRight")) formats.add("justifyRight");
        if (document.queryCommandState("insertUnorderedList")) formats.add("insertUnorderedList");
        if (document.queryCommandState("insertOrderedList")) formats.add("insertOrderedList");

        // Get the font size of the parent node to keep track
        let currentFontSize = selection.anchorNode?.parentNode?.style?.fontSize || fontSize;
        setLastAppliedFontSize(currentFontSize);
      } catch (error) {
        // Ignore errors from queryCommandState
      }

      setActiveFormats(formats);
    }, [fontSize]);

    // Now, define handleFormat which depends on the functions above
    const handleFormat = useCallback((command, value) => {
      if (command === "createLink") {
        setShowLinkDialog(true);
        return;
      }

      if (command === "fontSize") {
        if (value) {
          // Use styleWithCSS to ensure inline styles are applied
          document.execCommand("styleWithCSS", false, true);
          document.execCommand("fontSize", false, FONT_SIZE_MAP[value]);
          document.execCommand("styleWithCSS", false, false); // Reset to default behavior
          setLastAppliedFontSize(value);
          handleInput();
        }
        return;
      }

      if (command === "foreColor") {
        if (value) {
          document.execCommand("styleWithCSS", false, true);
          document.execCommand("foreColor", false, value);
          document.execCommand("styleWithCSS", false, false); // Reset to default behavior
          updateActiveFormats();
          editorRef.current?.focus();
        }
        return;
      }

      if (command === "formatBlock" && value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false, value);
      }

      updateActiveFormats();
      editorRef.current?.focus();
    }, [handleInput, updateActiveFormats]);

    useImperativeHandle(ref, () => ({
      applyFormat: handleFormat,
    }));

    useEffect(() => {
      if (editorRef.current && editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }

      if (typeof window !== "undefined") {
        window.removeTranslation = (translationId) => {
          const translationBlock = document.querySelector(
            `[data-translation-id="${translationId}"]`
          );
          if (translationBlock) {
            translationBlock.remove();
            handleInput();
          }
        };
      }
    }, [content, handleInput]);

    const handleKeyDown = useCallback(
      (e) => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;
          const element =
            container.nodeType === Node.TEXT_NODE
              ? container.parentElement
              : container;

          const translationBlock = element?.closest(".translation-block");
          if (translationBlock) {
            e.preventDefault();
            return;
          }
        }

        // Font size shortcuts (Ctrl + + and Ctrl + -)
        if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "-")) {
          e.preventDefault();
          const currentIndex = FONT_SIZES.indexOf(lastAppliedFontSize);
          let newIndex;
          if (e.key === "+") {
            newIndex = Math.min(currentIndex + 1, FONT_SIZES.length - 1);
          } else {
            newIndex = Math.max(currentIndex - 1, 0);
          }
          handleFormat("fontSize", FONT_SIZES[newIndex]);
          return;
        }

        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case "b":
              e.preventDefault();
              handleFormat("bold");
              break;
            case "i":
              e.preventDefault();
              handleFormat("italic");
              break;
            case "u":
              e.preventDefault();
              handleFormat("underline");
              break;
            case "z":
              e.preventDefault();
              if (e.shiftKey) {
                handleFormat("redo");
              } else {
                handleFormat("undo");
              }
              break;
            default:
              break;
          }
        }

        if (e.key === "Enter") {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const blockElement =
              container.nodeType === Node.TEXT_NODE
                ? container.parentElement
                : container;

            if (blockElement && blockElement.nodeType === Node.ELEMENT_NODE) {
              const el = blockElement;
              if (el.tagName === "BLOCKQUOTE" || el.tagName === "PRE") {
                if (e.shiftKey) {
                  e.preventDefault();
                  document.execCommand("insertHTML", false, "<br>");
                }
              }
            }
          }
        }
      },
      [handleFormat, lastAppliedFontSize]
    );

    const handlePaste = useCallback((e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    }, []);

    const insertLink = () => {
      if (linkUrl && linkText) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const linkElement = document.createElement("a");
          linkElement.href = linkUrl;
          linkElement.textContent = linkText;
          linkElement.className =
            "text-primary hover:text-accent underline transition-colors";
          linkElement.target = "_blank";
          linkElement.rel = "noopener noreferrer";

          try {
            range.deleteContents();
            range.insertNode(linkElement);
            range.setStartAfter(linkElement);
            range.setEndAfter(linkElement);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (error) {
            document.execCommand(
              "insertHTML",
              false,
              `<a href="${linkUrl}" class="text-primary hover:text-accent underline transition-colors" target="_blank" rel="noopener noreferrer">${linkText}</a>`
            );
          }
        } else {
          if (editorRef.current) {
            const linkElement = document.createElement("a");
            linkElement.href = linkUrl;
            linkElement.textContent = linkText;
            linkElement.className =
              "text-primary hover:text-accent underline transition-colors";
            linkElement.target = "_blank";
            linkElement.rel = "noopener noreferrer";
            editorRef.current.appendChild(linkElement);
          }
        }

        setLinkUrl("");
        setLinkText("");
        setShowLinkDialog(false);
        editorRef.current?.focus();
        handleInput();
      }
    };

    const insertImage = () => {
      const url = prompt("Enter image URL:");
      if (url) {
        const imageHtml = `<img src="${url}" alt="Image" class="max-w-full h-auto rounded-lg my-4" />`;
        document.execCommand("insertHTML", false, imageHtml);
        editorRef.current?.focus();
      }
    };

    const applyTextColor = (color) => {
      handleFormat("foreColor", color);
      setShowColorDialog(false);
    };



    const textColors = [
      { name: "Default", value: "#ffffff" },
      { name: "Red", value: "#ef4444" },
      { name: "Orange", value: "#f97316" },
      { name: "Yellow", value: "#eab308" },
      { name: "Green", value: "#22c55e" },
      { name: "Blue", value: "#3b82f6" },
      { name: "Purple", value: "#a855f7" },
      { name: "Pink", value: "#ec4899" },
      { name: "Gray", value: "#6b7280" },
      { name: "Cyan", value: "#06b6d4" },
      { name: "Lime", value: "#84cc16" },
      { name: "Indigo", value: "#6366f1" },
    ];

    return (
      <div
        className={cn(
          "border border-border/30 rounded-2xl glass overflow-hidden",
          className
        )}
      >
        <div className="flex items-center gap-1 p-3 border-b border-border/30 bg-card/50 flex-wrap">
          <div className="flex items-center gap-1">
            {[
              {
                command: "bold",
                icon: Bold,
                label: "Bold",
                shortcut: "Ctrl+B",
              },
              {
                command: "italic",
                icon: Italic,
                label: "Italic",
                shortcut: "Ctrl+I",
              },
              {
                command: "underline",
                icon: Underline,
                label: "Underline",
                shortcut: "Ctrl+U",
              },
            ].map(({ command, icon: Icon, label, shortcut }) => (
              <Button
                key={command}
                size="sm"
                variant="ghost"
                onClick={() => handleFormat(command)}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200",
                  activeFormats.has(command) && "bg-primary/30 text-primary"
                )}
                title={`${label} (${shortcut})`}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* <div className="w-px h-6 bg-border/50 mx-1" />

          <div className="flex items-center gap-1">
            <Popover open={showColorDialog} onOpenChange={setShowColorDialog}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200"
                  title="Text Color"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 glass-strong border-border/50">
                <div className="space-y-3">
                  <h4 className="font-medium">Text Color</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {textColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => applyTextColor(color.value)}
                        className="w-12 h-8 rounded border border-border/30 hover:scale-110 transition-transform flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: color.value,
                          color: color.value === "#ffffff" ? "#000" : "#fff",
                        }}
                        title={color.name}
                      >
                        A
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowColorDialog(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div> */}

          <div className="w-px h-6 bg-border/50 mx-1" />

          {/* Font size controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const currentIndex = FONT_SIZES.indexOf(lastAppliedFontSize);
                const newIndex = Math.max(currentIndex - 1, 0);
                handleFormat("fontSize", FONT_SIZES[newIndex]);
              }}
              className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200"
              title="Decrease Font Size (Ctrl+-)"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const currentIndex = FONT_SIZES.indexOf(lastAppliedFontSize);
                const newIndex = Math.min(
                  currentIndex + 1,
                  FONT_SIZES.length - 1
                );
                handleFormat("fontSize", FONT_SIZES[newIndex]);
              }}
              className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200"
              title="Increase Font Size (Ctrl++)"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border/50 mx-1" />

          <div className="flex items-center gap-1">
            {[
              { command: "justifyLeft", icon: AlignLeft, label: "Align Left" },
              {
                command: "justifyCenter",
                icon: AlignCenter,
                label: "Align Center",
              },
              {
                command: "justifyRight",
                icon: AlignRight,
                label: "Align Right",
              },
            ].map(({ command, icon: Icon, label }) => (
              <Button
                key={command}
                size="sm"
                variant="ghost"
                onClick={() => handleFormat(command)}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200",
                  activeFormats.has(command) && "bg-primary/30 text-primary"
                )}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <div className="w-px h-6 bg-border/50 mx-1" />

          <div className="flex items-center gap-1">
            {[
              {
                command: "insertUnorderedList",
                icon: List,
                label: "Bullet List",
              },
              {
                command: "insertOrderedList",
                icon: ListOrdered,
                label: "Numbered List",
              },
            ].map(({ command, icon: Icon, label }) => (
              <Button
                key={command}
                size="sm"
                variant="ghost"
                onClick={() => handleFormat(command)}
                className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200"
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <div className="w-px h-6 bg-border/50 mx-1" />

          <div className="flex items-center gap-1">
            {[
              {
                command: "formatBlock",
                value: "blockquote",
                icon: Quote,
                label: "Quote",
              },
              {
                command: "formatBlock",
                value: "pre",
                icon: Code,
                label: "Code Block",
              },
            ].map(({ command, value, icon: Icon, label }) => (
              <Button
                key={`${command}-${value}`}
                size="sm"
                variant="ghost"
                onClick={() => handleFormat(command, value)}
                className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200"
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <div className="w-px h-6 bg-border/50 mx-1" />

          <div className="flex items-center gap-1">
            <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
              <PopoverTrigger asChild>
                {/* <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200"
                  title="Insert Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button> */}
              </PopoverTrigger>
              <PopoverContent className="w-80 glass-strong border-border/50">
                <div className="space-y-3">
                  <h4 className="font-medium">Insert Link</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Link text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      className="glass neumorphic-inset"
                    />
                    <Input
                      placeholder="URL"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="glass neumorphic-inset"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowLinkDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={insertLink}
                      disabled={!linkUrl || !linkText}
                    >
                      Insert
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              size="sm"
              variant="ghost"
              onClick={insertImage}
              className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200"
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border/50 mx-1" />

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFormat("undo")}
              className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFormat("redo")}
              className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={cn(
            "min-h-[300px] p-6 focus:outline-none",
            "prose prose-invert max-w-none",
            "text-foreground leading-relaxed",
            "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic",
            "[&_pre]:bg-muted/50 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-sm",
            "[&_ul]:list-disc [&_ul]:ml-6",
            "[&_ol]:list-decimal [&_ol]:ml-6",
            "[&_li]:mb-1",
            "[&_a]:text-primary [&_a]:hover:text-accent [&_a]:underline [&_a]:transition-colors",
            "[&_.translation-block]:select-none [&_.translation-block]:cursor-default",
            "[&_.translation-remove]:opacity-0 [&_.translation-block:hover_.translation-remove]:opacity-100"
          )}
          data-placeholder={placeholder}
          style={{
            lineHeight: "1.6",
            fontSize: `${fontSize}`
          }}
        />

        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: rgb(148 163 184);
            pointer-events: none;
          }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";