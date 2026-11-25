import React from 'react';
import Modal from '../common/Modal';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import { Bell, CheckCheck, ArrowDownLeft, Trophy, Receipt } from 'lucide-react';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'P2P_RECEIVED':
        return <ArrowDownLeft size={16} className="text-[#15803D]" />;
      case 'GOAL_PROGRESS':
        return <Trophy size={16} className="text-amber-500" />;
      case 'BILL_SPLIT':
        return <Receipt size={16} className="text-[#1D4ED8]" />;
      default:
        return <Bell size={16} className="text-[#1D4ED8]" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activity & Notifications">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs text-[#64748B] font-semibold">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All alerts caught up'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-[#1D4ED8] hover:text-[#1E40AF] font-bold transition"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border transition ${
                  n.isRead
                    ? 'bg-[#F8FAFC] border-[#DCE7F9] text-[#64748B]'
                    : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#0F172A] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white shrink-0 shadow-sm">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#0F172A]">{n.title}</p>
                      <span className="text-[10px] text-[#64748B] font-mono">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#475569] mt-0.5">{n.body}</p>
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
