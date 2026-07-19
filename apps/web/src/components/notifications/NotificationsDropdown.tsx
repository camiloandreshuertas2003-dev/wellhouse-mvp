'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from './NotificationsProvider'
import { CheckCircle2, MessageCircle, Star, Trophy, Info, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  onClose: () => void
}

export default function NotificationsDropdown({ onClose }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const router = useRouter()

  const getIconForType = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />
      case 'proposal':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'wellpoints':
      case 'challenge':
        return <Trophy className="w-5 h-5 text-orange-500" />
      case 'qa_answer':
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const handleNotificationClick = async (notif: typeof notifications[0]) => {
    if (!notif.is_read) {
      await markAsRead(notif.id)
    }
    onClose()
    if (notif.link) {
      router.push(notif.link)
    }
  }

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[80vh]">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          Notificaciones
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-ink-teal-600 hover:text-ink-teal-800 font-medium"
            >
              Marcar todo como leído
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 sm:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No tienes notificaciones aún.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${
                  !notif.is_read ? 'bg-blue-50/50' : 'opacity-70'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIconForType(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {notif.title}
                  </p>
                  {notif.content && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                      {notif.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="flex-shrink-0 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
