import React from 'react';
import Modal from '../common/Modal';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import { Bell, CheckCheck, ArrowDownLeft, Trophy, Receipt } from 'lucide-react';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'P2P_RECEIVE':
      case 'P2P_RECEIVED':
        return <ArrowDownLeft size={15} className="text-emerald-700" />;
      case 'GOAL_PROGRESS':
        return <Trophy size={15} className="text-amber-600" />;
      case 'REQUEST_PAID':
      case 'BILL_SPLIT':
        return <Receipt size={15} className="text-[#1D4ED8]" />;
      default:
        return <Bell size={15} className="text-slate-600" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <span className="text-xs text-slate-500 font-medium">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-[#1D4ED8] hover:text-[#1E40AF] font-semibold transition"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-lg border transition ${
                  n.isRead
                    ? 'bg-white border-slate-200 text-slate-600'
                    : 'bg-blue-50/50 border-blue-200 text-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-slate-100 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {n.message || n.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
