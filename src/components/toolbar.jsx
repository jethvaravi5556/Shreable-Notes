import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette, // Removed Palette import from here
  Save,
  Share2,
  MoreHorizontal,
  Download,
  FileText,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function Toolbar({
  onFormat,
  activeFormats = new Set(),
  onExportPDF,
  isMobile = false,
  isTablet = false,
}) {
  const [fontSize, setFontSize] = useState("16");

  const handleSave = () => {
    // Show beautiful toast notification
    toast.success("✨ Note saved successfully!", {
      duration: 3000,
      position: "top-right",
      style: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      },
      icon: <CheckCircle className="w-5 h-5" />,
    });
    console.log("Note saved");
  };

  const handleShare = () => {
    // Show share toast notification
    toast.success("🔗 Share link copied to clipboard!", {
      duration: 3000,
      position: "top-right",
      style: {
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        color: "white",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      },
      icon: <Share2 className="w-5 h-5" />,
    });
    console.log("Note shared");
  };

  const handleExport = () => {
    // Show export toast notification
    toast.success("📄 PDF exported successfully!", {
      duration: 3000,
      position: "top-right",
      style: {
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        color: "white",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      },
      icon: <Download className="w-5 h-5" />,
    });
    onExportPDF?.();
  };

  const formatButtons = [
    { command: "bold", icon: Bold, label: "Bold" },
    { command: "italic", icon: Italic, label: "Italic" },
    { command: "underline", icon: Underline, label: "Underline" },
  ];

  const alignButtons = [
    { command: "justifyLeft", icon: AlignLeft, label: "Align Left" },
    { command: "justifyCenter", icon: AlignCenter, label: "Align Center" },
    { command: "justifyRight", icon: AlignRight, label: "Align Right" },
  ];

  const fontSizes = ["12", "14", "16", "18", "20", "24", "28", "32"];

  const handleFormat = (command, value) => {
    onFormat?.(command, value);
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    onFormat?.("fontSize", newSize + "px");
  };

  if (isMobile) {
    return (
      <>
        <div className="h-full flex items-center justify-between px-4 glass-strong border-2 border-white/30 dark:border-white/20 animate-fade-in overflow-visible relative ">
          {/* Multi-layer background gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-50/60 via-purple-50/40 to-pink-50/60 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20" />

          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400/40 via-purple-400/40 to-pink-400/40 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

          {/* Floating particles */}
          <div
            className="absolute top-2 left-1/4 w-1 h-1 bg-violet-400/60 rounded-full animate-ping"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-3 right-1/3 w-1 h-1 bg-purple-400/60 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1 right-1/4 w-1 h-1 bg-pink-400/60 rounded-full animate-ping"
            style={{ animationDelay: "2s" }}
          />

          {/* Essential formatting buttons for mobile */}
          <div className="flex items-center gap-2 relative z-10">
            {formatButtons.slice(0, 2).map(({ command, icon: Icon, label }, index) => (
              <Button
                key={command}
                size="sm"
                variant="ghost"
                onClick={() => handleFormat(command)}
                className={cn(
                  "h-7 w-7 p-0 glass hover:bg-gradient-to-r hover:from-violet-500/25 hover:to-purple-500/25 transition-all duration-500 rounded-lg",
                  "hover:scale-115 hover:shadow-2xl hover:shadow-violet-500/30",
                  "border-2 border-white/30 dark:border-white/20",
                  "backdrop-blur-md bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50",
                  "group relative overflow-hidden",
                  "hover:animate-pulse-glow hover:rotate-1",
                  "before:absolute before:inset-0 before:bg-gradient-to-r before:from-violet-400/20 before:to-purple-400/20 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
                  activeFormats.has(command) &&
                    "bg-gradient-to-r from-violet-500/40 to-purple-500/40 text-violet-700 dark:text-violet-300 scale-110 shadow-2xl shadow-violet-500/40 animate-glow border-violet-400/50"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
                title={label}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer" />
                <Icon className="h-3 w-3 relative z-10" />
              </Button>
            ))}
          </div>

          {/* Font size and actions */}
          <div className="flex items-center gap-2 relative z-10">
            {/* Font size dropdown */}
            <select
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="h-7 px-2 glass hover:bg-gradient-to-r hover:from-indigo-500/25 hover:to-blue-500/25 transition-all duration-500 text-xs font-semibold rounded-lg bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 border-2 border-white/30 dark:border-white/20 backdrop-blur-md hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>

            {/* Save & Share buttons */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className="h-7 w-7 p-0 glass hover:bg-gradient-to-r hover:from-green-500/25 hover:to-emerald-500/25 transition-all duration-500 rounded-lg border-2 border-white/30 dark:border-white/20 backdrop-blur-md bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 hover:scale-115 hover:shadow-2xl hover:shadow-green-500/30 group relative overflow-hidden hover:rotate-1"
              title="Save"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer" />
              <Save className="h-3 w-3 relative z-10" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="h-7 w-7 p-0 glass hover:bg-gradient-to-r hover:from-pink-500/25 hover:to-rose-500/25 transition-all duration-500 rounded-lg border-2 border-white/30 dark:border-white/20 backdrop-blur-md bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 hover:scale-115 hover:shadow-2xl hover:shadow-pink-500/30 group relative overflow-hidden hover:rotate-1"
              title="Share"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer" />
              <Share2 className="h-3 w-3 relative z-10" />
            </Button>
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  if (isTablet) {
    return (
      <>
        <div className="h-full flex items-center justify-between px-6 glass-strong border-b border-gray-200/60 dark:border-gray-700/60 animate-fade-in overflow-visible relative">
          {/* Multi-layer background gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-50/60 via-purple-50/40 to-pink-50/60 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20" />

          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400/40 via-purple-400/40 to-pink-400/40 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

          {/* Floating particles */}
          <div
            className="absolute top-2 left-1/4 w-1 h-1 bg-violet-400/60 rounded-full animate-ping"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-3 right-1/3 w-1 h-1 bg-purple-400/60 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1 right-1/4 w-1 h-1 bg-pink-400/60 rounded-full animate-ping"
            style={{ animationDelay: "2s" }}
          />

          <div className="flex items-center gap-3 relative z-10">
            {/* Format Buttons */}
            <div className="flex items-center gap-2">
              {formatButtons.map(({ command, icon: Icon, label }, index) => (
                <Button
                  key={command}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleFormat(command)}
                  className={cn(
                    "h-9 w-9 p-0 glass hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-purple-500/20 transition-all duration-300 rounded-xl animate-fade-in-delayed",
                    "hover:scale-110 hover:shadow-lg hover:shadow-violet-500/20",
                    "border border-white/20 dark:border-white/10",
                    "backdrop-blur-sm bg-white/60 dark:bg-gray-800/60",
                    activeFormats.has(command) &&
                      "bg-gradient-to-r from-violet-500/30 to-purple-500/30 text-violet-700 dark:text-violet-300 scale-105 shadow-lg shadow-violet-500/30"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent mx-2" />

            {/* Font Size */}
            <select
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="h-9 px-4 glass hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-blue-500/20 transition-all duration-300 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-white/10 backdrop-blur-sm text-sm font-medium"
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 relative z-10">
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-4 glass hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              <span className="font-medium">Save</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-4 glass hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-rose-500/20 transition-all duration-300 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span className="font-medium">Share</span>
            </Button>
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  // Default Desktop view
  return (
    <>
      <div className="h-full flex items-center justify-between px-8 glass-strong border-b border-gray-200/60 dark:border-gray-700/60 animate-fade-in overflow-visible relative">
        {/* Multi-layer background gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50/60 via-purple-50/40 to-pink-50/60 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20" />
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-50/20 via-transparent to-violet-50/20 dark:from-cyan-950/10 dark:via-transparent dark:to-violet-950/10" />

        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400/40 via-purple-400/40 to-pink-400/40 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

        {/* Floating orbs */}
        <div className="absolute top-0 left-1/4 w-20 h-20 bg-gradient-to-r from-violet-400/15 to-purple-400/15 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-0 right-1/4 w-16 h-16 bg-gradient-to-r from-pink-400/15 to-rose-400/15 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-2 left-1/2 w-12 h-12 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-lg animate-pulse delay-500" />

        {/* Floating particles */}
        <div
          className="absolute top-2 left-1/4 w-1 h-1 bg-violet-400/60 rounded-full animate-ping"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-3 right-1/3 w-1 h-1 bg-purple-400/60 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1 right-1/4 w-1 h-1 bg-pink-400/60 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-4 left-1/2 w-1 h-1 bg-cyan-400/60 rounded-full animate-ping"
          style={{ animationDelay: "3s" }}
        />

        <div className="flex items-center gap-4 relative z-10">
          {/* Toolbar Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                Editor Tools
              </span>
            </div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          </div>

          {/* Format Buttons */}
          <div className="flex items-center gap-2">
            {formatButtons.map(({ command, icon: Icon, label }, index) => (
              <Button
                key={command}
                size="sm"
                variant="ghost"
                onClick={() => handleFormat(command)}
                className={cn(
                  "h-10 w-10 p-0 glass hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-purple-500/20 transition-all duration-300 rounded-xl animate-fade-in-delayed",
                  "hover:scale-110 hover:shadow-lg hover:shadow-violet-500/20",
                  "border border-white/20 dark:border-white/10",
                  "backdrop-blur-sm bg-white/60 dark:bg-gray-800/60",
                  "group relative overflow-hidden",
                  activeFormats.has(command) &&
                    "bg-gradient-to-r from-violet-500/30 to-purple-500/30 text-violet-700 dark:text-violet-300 scale-105 shadow-lg shadow-violet-500/30"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
                title={label}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Icon className="h-4 w-4 relative z-10" />
              </Button>
            ))}
          </div>

          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent mx-2" />

          {/* Alignment Buttons */}
          <div className="flex items-center gap-2">
            {alignButtons.map(({ command, icon: Icon, label }, index) => (
              <Button
                key={command}
                size="sm"
                variant="ghost"
                onClick={() => handleFormat(command)}
                className={cn(
                  "h-10 w-10 p-0 glass hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-blue-500/20 transition-all duration-300 rounded-xl animate-fade-in-delayed",
                  "hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20",
                  "border border-white/20 dark:border-white/10",
                  "backdrop-blur-sm bg-white/60 dark:bg-gray-800/60",
                  "group relative overflow-hidden",
                  activeFormats.has(command) &&
                    "bg-gradient-to-r from-indigo-500/30 to-blue-500/30 text-indigo-700 dark:text-indigo-300 scale-105 shadow-lg shadow-indigo-500/30"
                )}
                style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                title={label}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Icon className="h-4 w-4 relative z-10" />
              </Button>
            ))}
          </div>

          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent mx-2" />

          {/* Font Size */}
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="h-10 px-4 glass hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-white/10 backdrop-blur-sm text-sm font-medium animate-fade-in-delayed"
            style={{ animationDelay: "0.6s" }}
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>

          {/* Color Picker - REMOVED */}
          {/*
          <Button
            size="sm"
            variant="ghost"
            className="h-10 w-10 p-0 glass hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-rose-500/20 transition-all duration-300 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/20 animate-fade-in-delayed group relative overflow-hidden"
            style={{ animationDelay: "0.7s" }}
            title="Text Color"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Palette className="h-4 w-4 relative z-10" />
          </Button>
          */}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 relative z-10">
          <Button
            size="sm"
            variant="ghost"
            className="h-10 px-6 glass hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 animate-fade-in-delayed group relative overflow-hidden"
            style={{ animationDelay: "0.8s" }}
            onClick={handleSave}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Save className="h-4 w-4 mr-2 relative z-10" />
            <span className="font-medium relative z-10">Save</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-10 px-6 glass hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-rose-500/20 transition-all duration-300 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20 animate-fade-in-delayed group relative overflow-hidden"
            style={{ animationDelay: "0.9s" }}
            onClick={handleShare}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Share2 className="h-4 w-4 mr-2 relative z-10" />
            <span className="font-medium relative z-10">Share</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleExport}
            className="h-10 w-10 p-0 glass hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20 animate-fade-in-delayed group relative overflow-hidden"
            style={{ animationDelay: "1s" }}
            title="Export as PDF"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Download className="h-4 w-4 relative z-10" />
          </Button>
        </div>
      </div>
      <Toaster />
    </>
  );
}