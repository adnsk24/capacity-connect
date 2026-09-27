import { fetchJson } from "./api"

export interface NotificationItem {
  id: string
  title: string
  message: string
  notification_type: string
  link_url?: string | null
  is_read: boolean
  created_at: string
}

export interface NotificationListResponse {
  unread_count: number
  items: NotificationItem[]
}

export const notificationsService = {
  listNotifications: (limit = 50) =>
    fetchJson<NotificationListResponse>(`/notifications?limit=${limit}`),

  markAsRead: (notificationId: string) =>
    fetchJson<NotificationItem>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    fetchJson<{ message: string }>("/notifications/mark-all-read", {
      method: "POST",
    }),
}
