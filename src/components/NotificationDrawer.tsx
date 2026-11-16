import React from 'react';
import { RoleId } from '../storage/types';
import { ROLE_META, UnifiedNotification } from '../utils/platformSearch';

interface NotificationDrawerProps {
  open: boolean;
  activeRole: RoleId;
  notifications: UnifiedNotification[];
  readIds: Set<string>;
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectNotification: (page: string, id: string) => void;
}

const SEVERITY_LABEL: Record<UnifiedNotification['severity'], string> = {
  danger: 'عاجل',
  warning: 'معلق',
  success: 'جديد',
  info: 'تحديث',
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  activeRole,
  notifications,
  readIds,
  onClose,
  onMarkAllRead,
  onSelectNotification,
}) => {
  if (!open) return null;

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const roleLabel = ROLE_META[activeRole].label;

  return (
    <div
      className="hts-drawer-backdrop"
      id="notificationDrawerBackdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className="hts-drawer"
        id="notificationDrawer"
        role="dialog"
        aria-modal="true"
        aria-label={`تنبيهات بوابة ${roleLabel}`}
      >
        <div className="hts-drawer-head">
          <div>
            <h3>🔔 تنبيهات بوابة {roleLabel}</h3>
            <p className="tabular-nums">
              {unreadCount > 0
                ? `${unreadCount} تنبيه غير مقروء من أصل ${notifications.length}`
                : `تمت مراجعة جميع التنبيهات (${notifications.length})`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                className="hts-drawer-mark-btn"
                onClick={onMarkAllRead}
              >
                ✓ تحديد كمقروء
              </button>
            )}
            <button
              type="button"
              className="hts-icon-close-btn"
              onClick={onClose}
              aria-label="إغلاق مركز الإشعارات"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="hts-drawer-body">
          {notifications.length === 0 ? (
            <div className="hts-search-empty">
              لا توجد إشعارات أو طلبات معلقة في بوابة {roleLabel} حالياً.
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = readIds.has(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  className={`hts-notif-item ${n.severity} ${isRead ? 'read' : ''}`}
                  onClick={() => onSelectNotification(n.page, n.id)}
                >
                  <div className="hts-notif-top">
                    <span className="hts-notif-title">{n.title}</span>
                    <span className={`hts-notif-tag ${n.severity}`}>
                      {SEVERITY_LABEL[n.severity]}
                    </span>
                  </div>
                  {n.detail && <div className="hts-notif-detail">{n.detail}</div>}
                  <div className="hts-notif-meta tabular-nums">
                    <span>بوابة {n.roleLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{n.time}</span>
                    <span aria-hidden="true">·</span>
                    <span className="hts-notif-cta">فتح الصفحة ←</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};
