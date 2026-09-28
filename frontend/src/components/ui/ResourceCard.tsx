import React from "react"
import {
  Play,
  FileText,
  Headphones,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ResourceItem } from "@/services/courses"

interface ResourceCardProps {
  resource: ResourceItem
  isTrainer?: boolean
  onPlay?: (resource: ResourceItem) => void
  onOpen?: (resource: ResourceItem) => void
  onComplete?: (resource: ResourceItem) => void
  onEdit?: (resource: ResourceItem) => void
  onDelete?: (resource: ResourceItem) => void
  onTogglePublish?: (resource: ResourceItem) => void
  onMoveUp?: (resource: ResourceItem) => void
  onMoveDown?: (resource: ResourceItem) => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

export const formatDuration = (seconds?: number | null): string => {
  if (!seconds || seconds <= 0) return ""
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

export const getResourceIcon = (type: string) => {
  const t = type.toUpperCase()
  switch (t) {
    case "VIDEO":
    case "EXTERNAL_VIDEO":
      return <Play className="h-4 w-4 text-rose-600 shrink-0" />
    case "AUDIO":
      return <Headphones className="h-4 w-4 text-purple-600 shrink-0" />
    case "PRESENTATION":
    case "PPT":
      return <FileSpreadsheet className="h-4 w-4 text-amber-600 shrink-0" />
    case "DOCUMENT":
    case "PDF":
    default:
      return <FileText className="h-4 w-4 text-[#1557A6] shrink-0" />
  }
}

export const getResourceTypeBadge = (type: string) => {
  const t = type.toUpperCase()
  switch (t) {
    case "VIDEO":
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">VIDEO</Badge>
    case "EXTERNAL_VIDEO":
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">EXTERNAL VIDEO</Badge>
    case "AUDIO":
      return <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">AUDIO</Badge>
    case "PRESENTATION":
    case "PPT":
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">PRESENTATION</Badge>
    case "DOCUMENT":
    case "PDF":
    default:
      return <Badge className="bg-blue-50 text-[#1557A6] border-blue-200 text-[10px] font-bold">DOCUMENT</Badge>
  }
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isTrainer = false,
  onPlay,
  onOpen,
  onComplete,
  onEdit,
  onDelete,
  onTogglePublish,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}) => {
  const isMedia = ["VIDEO", "EXTERNAL_VIDEO", "AUDIO"].includes(resource.resource_type.toUpperCase())
  const durationStr = formatDuration(resource.duration_seconds)

  return (
    <div
      data-testid={`resource-card-${resource.id}`}
      className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
    >
      {/* Left: Thumbnail & Details */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Thumbnail or Fallback Icon Box */}
        {resource.thumbnail_url ? (
          <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative group">
            <img
              src={resource.thumbnail_url}
              alt={resource.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {isMedia && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                <Play className="h-3.5 w-3.5 fill-current" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            {getResourceIcon(resource.resource_type)}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            {getResourceTypeBadge(resource.resource_type)}

            {durationStr && (
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {durationStr}
              </span>
            )}

            {isTrainer && (
              <Badge
                variant="outline"
                className={`text-[9px] uppercase font-bold ${
                  resource.is_published
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {resource.is_published ? "PUBLISHED" : "DRAFT"}
              </Badge>
            )}
          </div>

          <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-900 truncate">
            {resource.title}
          </h4>

          {resource.description && (
            <p className="text-[11.5px] text-slate-600 line-clamp-1 leading-normal font-normal">
              {resource.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {!isTrainer ? (
          <>
            {/* Trainee Actions */}
            {isMedia ? (
              <Button
                size="sm"
                onClick={() => onPlay?.(resource)}
                className="bg-[#1557A6] hover:bg-[#0B3D91] text-white text-xs font-semibold h-8 px-3 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play</span>
              </Button>
            ) : (
              <a
                href={resource.storage_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpen?.(resource)}
                className="inline-flex"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold h-8 px-3 border-slate-300 text-[#062B73] hover:bg-slate-50 rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open</span>
                </Button>
              </a>
            )}

            {/* Completion indicator / Toggle */}
            {resource.is_completed ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Completed</span>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onComplete?.(resource)}
                className="text-[11px] h-8 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 cursor-pointer"
                title="Mark this resource as completed"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Mark Complete</span>
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Trainer Actions */}
            {/* Move Up / Move Down */}
            {onMoveUp && (
              <Button
                size="sm"
                variant="ghost"
                disabled={!canMoveUp}
                onClick={() => onMoveUp(resource)}
                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                title="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                size="sm"
                variant="ghost"
                disabled={!canMoveDown}
                onClick={() => onMoveDown(resource)}
                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                title="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Toggle Publish */}
            {onTogglePublish && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTogglePublish(resource)}
                className="h-8 px-2.5 text-[11px] font-medium border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                title={resource.is_published ? "Set to Draft" : "Publish Resource"}
              >
                {resource.is_published ? (
                  <span className="flex items-center gap-1 text-slate-600">
                    <EyeOff className="h-3 w-3" />
                    <span className="hidden sm:inline">Unpublish</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">Publish</span>
                  </span>
                )}
              </Button>
            )}

            {/* Edit */}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(resource)}
                className="h-8 w-8 p-0 text-slate-600 hover:text-[#1557A6] border-slate-200 cursor-pointer"
                title="Edit Resource"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Delete */}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(resource)}
                className="h-8 w-8 p-0 text-slate-600 hover:text-red-600 hover:border-red-200 cursor-pointer"
                title="Delete Resource"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
