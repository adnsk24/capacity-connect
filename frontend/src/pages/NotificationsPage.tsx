import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  CheckCheck,
  Check,
  ArrowRight,
  ClipboardCheck,
  BookOpen,
  Info,
  Clock,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { notificationsService, NotificationItem } from "@/services/notifications"

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsService.listNotifications(),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const notifications = data?.items || []
  const unreadCount = data?.unread_count || 0

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ASSESSMENT_RESULT":
      case "ASSESSMENT_AVAILABLE":
        return <ClipboardCheck className="h-5 w-5 text-blue-500" />
      case "COURSE_ENROLLMENT":
      case "COURSE_PUBLISHED":
        return <BookOpen className="h-5 w-5 text-emerald-500" />
      default:
        return <Info className="h-5 w-5 text-purple-500" />
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1557A6] text-white text-[11px] font-semibold">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Assessment results, course enrollment updates, and system alerts.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<CheckCheck className="h-8 w-8 text-emerald-500" />}
          title="You're all caught up"
          description="You have no new notifications right now. Alerts regarding course enrollments, assessments, and competency updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n: NotificationItem) => (
            <Card
              key={n.id}
              className={`border transition-colors ${
                n.is_read
                  ? "border-slate-200 bg-white"
                  : "border-blue-300 bg-blue-50/40 shadow-xs"
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {getNotificationIcon(n.notification_type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900">
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(n.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {n.link_url && (
                        <Link
                          to={n.link_url}
                          className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                        >
                          View Details <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!n.is_read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markReadMutation.mutate(n.id)}
                    className="h-7 text-xs text-slate-500 hover:text-slate-900"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
