import React from 'react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: 'البحث والتنقل السريع',
    items: [
      {
        keys: ['Ctrl', 'K'],
        description: 'فتح أو إغلاق نافذة البحث الشامل داخل بوابتك الحالية',
      },
      {
        keys: ['↑', '↓'],
        description: 'التحرك بين نتائج البحث السريع',
      },
      {
        keys: ['Enter'],
        description: 'فتح الصفحة المحددة من نتائج البحث',
      },
      {
        keys: ['Alt', '←'],
        description: 'الانتقال إلى الصفحة التالية في البوابة (مع التمرير لأعلى)',
      },
      {
        keys: ['Alt', '→'],
        description: 'الرجوع إلى الصفحة السابقة في البوابة (مع التمرير لأعلى)',
      },
    ],
  },
  {
    title: 'أدوات المنصة والنوافذ',
    items: [
      {
        keys: ['?'],
        description: 'إظهار أو إخفاء قائمة اختصارات لوحة المفاتيح',
      },
      {
        keys: ['Alt', 'N'],
        description: 'فتح أو إغلاق مركز التنبيهات الموحد',
      },
      {
        keys: ['Alt', 'T'],
        description: 'التبديل السريع بين الوضع الفاتح والوضع الداكن',
      },
      {
        keys: ['Alt', 'P'],
        description: 'معاينة وطباعة تقرير الصفحة الحالية',
      },
      {
        keys: ['Esc'],
        description: 'إغلاق أي نافذة منبثقة أو درج تنبيهات مفتوح',
      },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="hts-modal-backdrop"
      id="keyboardShortcutsModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="hts-modal-card hts-shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-label="اختصارات لوحة المفاتيح"
      >
        <div className="hts-modal-head">
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              ⌨️ اختصارات لوحة المفاتيح
            </h2>
            <p className="hts-shortcuts-subtitle">
              اختصارات سريعة للتنقل وإدارة النوافذ داخل المنصة الصحية المتكاملة
            </p>
          </div>
          <button
            type="button"
            className="hts-icon-close-btn"
            onClick={onClose}
            aria-label="إغلاق قائمة الاختصارات"
          >
            ✕
          </button>
        </div>

        <div className="hts-shortcuts-sections">
          {SHORTCUT_SECTIONS.map((section) => (
            <section key={section.title} className="hts-shortcuts-section">
              <h3 className="hts-shortcuts-section-title">{section.title}</h3>
              <div className="hts-shortcuts-list">
                {section.items.map((item) => (
                  <div key={item.description} className="hts-shortcut-row">
                    <span className="hts-shortcut-desc">{item.description}</span>
                    <span className="hts-shortcut-keys" dir="ltr">
                      {item.keys.map((keyLabel, idx) => (
                        <React.Fragment key={keyLabel}>
                          {idx > 0 && <span className="hts-key-plus">+</span>}
                          <kbd className="hts-kbd hts-kbd-strong">{keyLabel}</kbd>
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="hts-shortcuts-footer">
          <span>تلميح: يعمل زر <kbd className="hts-kbd" dir="ltr">?</kbd> (أو <kbd className="hts-kbd">؟</kbd> بالعربية) في أي وقت خارج حقول الكتابة.</span>
          <button
            type="button"
            className="login-backup-btn"
            onClick={onClose}
          >
            إغلاق (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
