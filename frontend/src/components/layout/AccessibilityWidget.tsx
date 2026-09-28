import React, { useState, useEffect } from "react"
import { Accessibility, X, ZoomIn, ZoomOut, RotateCcw, Eye } from "lucide-react"

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSizeScale, setFontSizeScale] = useState<number>(100)
  const [highContrast, setHighContrast] = useState(false)

  const changeFontSize = (delta: number) => {
    setFontSizeScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 90), 125)
      document.documentElement.style.fontSize = `${(next / 100) * 14}px`
      return next
    })
  }

  const resetAll = () => {
    setFontSizeScale(100)
    setHighContrast(false)
    document.documentElement.style.fontSize = "14px"
    document.documentElement.classList.remove("high-contrast-mode")
  }

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add("high-contrast-mode")
      } else {
        document.documentElement.classList.remove("high-contrast-mode")
      }
      return next
    })
  }

  // Keyboard shortcut Ctrl+F2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "F2") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Popover Controls */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 bg-white border border-slate-300 rounded-lg shadow-xl p-4 text-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#082B73]">
              Accessibility Options
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
              aria-label="Close accessibility menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="font-semibold text-slate-700 mb-1.5 flex justify-between">
                <span>Text Sizing</span>
                <span className="text-slate-500 font-mono">{fontSizeScale}%</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => changeFontSize(-5)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <ZoomOut className="h-3.5 w-3.5" /> A-
                </button>
                <button
                  onClick={() => changeFontSize(0)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-center cursor-pointer"
                >
                  A
                </button>
                <button
                  onClick={() => changeFontSize(5)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <ZoomIn className="h-3.5 w-3.5" /> A+
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={toggleHighContrast}
                className={`w-full p-2 rounded font-semibold flex items-center justify-center gap-2 border cursor-pointer ${
                  highContrast
                    ? "bg-slate-900 text-yellow-300 border-slate-900"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                {highContrast ? "Disable High Contrast" : "Enable High Contrast"}
              </button>
            </div>

            <div>
              <button
                onClick={resetAll}
                className="w-full p-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset Defaults
              </button>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-100">
              Shortcut: Press <kbd className="px-1 py-0.5 bg-slate-100 rounded font-mono">Ctrl+F2</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button Styled Like Reference Screenshot */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-13 h-13 rounded-full bg-[#5C33CF] hover:bg-[#4E28B8] text-white flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-3 focus:ring-purple-300"
        aria-label="Accessibility settings (Ctrl+F2)"
        title="Accessibility Tools (Ctrl+F2)"
      >
        <Accessibility className="h-6 w-6" />
        <span className="text-[8px] font-bold tracking-tight -mt-0.5">Ctrl+F2</span>
      </button>
    </div>
  )
}
