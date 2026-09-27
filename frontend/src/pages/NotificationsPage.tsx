import React from "react"
import { Bell, CheckCheck } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Bell className="h-6 w-6 text-blue-600" />
          <span>Notification Center</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Operational circulars, course announcements, and syllabus updates
        </p>
      </div>

      <EmptyState
        icon={<CheckCheck className="h-8 w-8 text-emerald-500" />}
        title="All Caught Up!"
        description="You have no unread operational alerts or course notices. As new training modules or announcements arrive, they will appear here."
      />
    </div>
  )
}
