'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from './NotificationsProvider'
import { CheckCircle2, MessageCircle, Star, Trophy, Info, X, Eye, MessageCircleQuestion, Bell } from 'lucide-react'
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
      case 'proposal':
        return <MessageCircle className="w-5 h-5 text-emerald-500" />
      case 'question':
      case 'qa_answer':
        return <MessageCircleQuestion className="w-5 h-5 text-orange-500" />
      case 'view':
      case 'visit':
        return <Eye className="w-5 h-5 text-blue-500" />
      case 'review':
        return <Star className="w-5 h-5 text-amber-500" />
      case 'wellpoints':
      case 'challenge':
        return <Trophy className="w-5 h-5 text-orange-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  // Agrupador de visitas (UX de la carga)
  const groupedNotifications = useMemo(() => {
    const groups: any[] = []
    let currentViewGroup: any = null

    notifications.forEach((notif) => {
      const type = notif.type?.toLowerCase() || ''
      if (type === 'view' || type === 'visit') {
        const date = new Date(notif.created_at).toDateString()
        // Agrupar si es del mismo tipo, mismo título y misma fecha
        if (currentViewGroup && currentViewGroup.title === notif.title && currentViewGroup.date === date) {
          currentViewGroup.count += 1
          currentViewGroup.ids.push(notif.id)
          if (!notif.is_read) currentViewGroup.unreadCount += 1
        } else {
          if (currentViewGroup) groups.push(currentViewGroup)
          currentViewGroup = {
            isGroup: true,
            type: type,
            title: notif.title, // Suele tener el nombre de la vivienda
            content: `Varias personas han estado viendo tu publicación hoy.`,
            date: date,
            created_at: notif.created_at,
            count: 1,
            unreadCount: notif.is_read ? 0 : 1,
            ids: [notif.id],
            link: notif.link,
          }
        }
      } else {
        if (currentViewGroup) {
          groups.push(currentViewGroup)
          currentViewGroup = null
        }
        groups.push(notif)
      }
    })
    if (currentViewGroup) groups.push(currentViewGroup)
    return groups
  }, [notifications])

  const handleNotificationClick = async (item: any) => {
    if (item.isGroup) {
      if (item.unreadCount > 0) {
        // Fire and forget
        item.ids.forEach((id: string) => markAsRead(id))
      }
    } else {
      if (!item.is_read) {
        markAsRead(item.id)
      }
    }
    
    onClose()
    if (item.link) {
      router.push(item.link)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[50] sm:hidden" onClick={onClose} />
      <div className="fixed inset-0 top-0 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-full sm:w-[420px] bg-white sm:rounded-2xl shadow-2xl sm:border border-gray-100 overflow-hidden z-[60] flex flex-col h-full sm:h-auto sm:max-h-[85vh]">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="font-fraunces font-bold text-xl sm:text-lg text-ink-teal-900 flex items-center gap-2">
            Notificaciones
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-[#0f766e] hover:text-[#0d635c] font-semibold transition-colors"
              >
                Marcar leídas
              </button>
            )}
            <button onClick={onClose} className="p-1.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors sm:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 bg-white">
          {groupedNotifications.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center text-gray-400 h-full">
              <Bell className="w-12 h-12 mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-600">No tienes notificaciones aún.</p>
              <p className="text-xs mt-1">Aquí verás mensajes, preguntas y actualizaciones.</p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {groupedNotifications.map((item, idx) => {
                const isUnread = item.isGroup ? item.unreadCount > 0 : !item.is_read
                const type = item.type?.toLowerCase() || ''
                const isMessageOrQuestion = type === 'message' || type === 'proposal' || type === 'question' || type === 'qa_answer'
                const displayTitle = item.isGroup ? `Tienes ${item.count} nuevas visitas hoy` : item.title

                return (
                  <li
                    key={item.isGroup ? `group-${item.ids[0]}` : item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`px-5 py-4 cursor-pointer transition-colors border-b border-[#f0f0f0] last:border-0 hover:bg-gray-50 flex gap-4 ${
                      isUnread ? 'bg-[#f9f9f9]' : 'bg-white'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isUnread ? 'bg-white shadow-sm border border-gray-100' : 'bg-gray-50'
                      }`}>
                        {getIconForType(type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${isUnread ? 'font-bold text-ink-teal-900' : 'font-medium text-gray-700'}`}>
                          {displayTitle}
                        </p>
                        <span className="text-[10px] font-medium text-gray-400 flex-shrink-0 whitespace-nowrap pt-0.5">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      
                      {item.content && (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-snug">
                          {item.content}
                        </p>
                      )}

                      {/* Acción Directa */}
                      {isMessageOrQuestion && item.link && (
                        <div className="mt-2.5">
                          <button 
                            className="inline-flex items-center text-xs font-bold text-[#0f766e] bg-[#0f766e]/10 px-3 py-1.5 rounded-lg hover:bg-[#0f766e]/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNotificationClick(item)
                            }}
                          >
                            Responder
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {isUnread && (
                      <div className="flex-shrink-0 flex items-center ml-1">
                        <div className="w-2 h-2 bg-rose-500 rounded-full shadow-sm"></div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
