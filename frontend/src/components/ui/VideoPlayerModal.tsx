import React, { useRef, useState, useEffect } from "react"
import { X, CheckCircle2, Video as VideoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResourceItem } from "@/services/courses"

interface VideoPlayerModalProps {
  resource: ResourceItem | null
  isOpen?: boolean
  onClose: () => void
  onComplete?: (resource: ResourceItem) => void
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v")
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`
      // check embed path
      if (parsed.pathname.startsWith("/embed/")) {
        return `https://www.youtube-nocookie.com${parsed.pathname}`
      }
    } else if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace(/^\//, "")
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }
  } catch {
    return null
  }
  return null
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  resource,
  isOpen = true,
  onClose,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    if (resource) {
      setHasCompleted(!!resource.is_completed)
    }
  }, [resource])

  if (!isOpen || !resource) return null

  const targetUrl = resource.media_url || resource.storage_url || ""
  const ytEmbed = getYouTubeEmbedUrl(targetUrl)

  const handleTimeUpdate = () => {
    if (!videoRef.current || hasCompleted) return
    const cur = videoRef.current.currentTime
    const dur = videoRef.current.duration
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <VideoIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {resource.title}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Official Meteorological Instructional Media
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasCompleted && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Completed</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Player Container */}
        <div className="p-4 sm:p-6 bg-slate-950 flex justify-center items-center">
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center relative">
            {ytEmbed ? (
              <iframe
                src={`${ytEmbed}?autoplay=0&rel=0&modestbranding=1`}
                title={resource.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={targetUrl}
                controls
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video playback.
              </video>
            )}
          </div>
        </div>

        {/* Footer info & manual complete */}
        <div className="p-4 sm:px-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
          <div className="text-xs text-slate-600 line-clamp-2 max-w-xl">
            {resource.description || "Instructional video clip for meteorological competency building."}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {!hasCompleted && onComplete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setHasCompleted(true)
                  onComplete(resource)
                }}
                className="text-xs border-slate-300 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark as Completed</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={onClose}
              className="bg-[#1557A6] hover:bg-[#0B3D91] text-white text-xs font-semibold px-4 cursor-pointer"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
