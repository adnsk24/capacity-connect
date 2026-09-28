import React, { useRef, useState, useEffect } from "react"
import { X, CheckCircle2, Headphones, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResourceItem } from "@/services/courses"

interface AudioPlayerModalProps {
  resource: ResourceItem | null
  isOpen?: boolean
  onClose: () => void
  onComplete?: (resource: ResourceItem) => void
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  resource,
  isOpen = true,
  onClose,
  onComplete,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    if (resource) {
      setHasCompleted(!!resource.is_completed)
    }
  }, [resource])

  if (!isOpen || !resource) return null

  const targetUrl = resource.media_url || resource.storage_url || ""

  const handleTimeUpdate = () => {
    if (!audioRef.current || hasCompleted) return
    const cur = audioRef.current.currentTime
    const dur = audioRef.current.duration
    if (dur && dur > 0 && cur / dur >= 0.9) {
      setHasCompleted(true)
      onComplete?.(resource)
    }
  }

  const handleEnded = () => {
    if (!hasCompleted) {
      setHasCompleted(true)
      onComplete?.(resource)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-purple-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
              <Headphones className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {resource.title}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Audio Commentary &amp; Lecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Audio Content & Player */}
        <div className="p-6 space-y-4 bg-white">
          {resource.description && (
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {resource.description}
            </p>
          )}

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Volume2 className="h-4 w-4 text-purple-600" />
              <span>Playback Control</span>
            </div>

            <audio
              ref={audioRef}
              src={targetUrl}
              controls
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              className="w-full h-10"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
          <div>
            {hasCompleted ? (
              <div className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Audio Completed</span>
              </div>
            ) : onComplete ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setHasCompleted(true)
                  onComplete(resource)
                }}
                className="text-xs text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark as Completed</span>
              </Button>
            ) : null}
          </div>

          <Button
            size="sm"
            onClick={onClose}
            className="bg-[#1557A6] hover:bg-[#0B3D91] text-white text-xs font-semibold px-4 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
