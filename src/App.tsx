import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import {
  PrintableReportPayload,
  PrintReportModal,
} from './components/PrintReportModal';
import { ROLE_FRAMES } from './data/roleFrames';
import { htsStorage } from './storage/htsIndexedDb';
import { loadPreferences, savePreferences } from './storage/preferences';
import { ROLE_IDS, RoleId, StorageStatusInfo, ThemeMode } from './storage/types';
import { buildUnifiedNotifications } from './utils/platformSearch';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface FrameWindow extends Window {
  __htsJumpToPage?: (page: string) => void;
  __htsStepPage?: (delta: 1 | -1) => void;
  __htsTeleportTop?: () => void;
  __htsSyncTheme?: (theme: ThemeMode) => void;
  __htsBuildCurrentReport?: () => PrintableReportPayload | null;
}

declare global {
  interface Window {
    HTSOpenPrintReport?: (report: PrintableReportPayload) => void;
    __htsHandleShortcut?: (action: string) => void;
  }
}

const ROLE_OPTIONS: Array<{ value: RoleId; label: string; shortLabel: string; icon: string }> = [
  { value: 'doctor', label: '👨‍⚕️ الطبيب', shortLabel: 'الطبيب', icon: '👨‍⚕️' },
  { value: 'patient', label: '🧑‍🦽 المريض', shortLabel: 'المريض', icon: '🧑‍🦽' },
  { value: 'pharmacy', label: '💊 الصيدلية', shortLabel: 'الصيدلية', icon: '💊' },
  { value: 'lab', label: '🧪 التحاليل', shortLabel: 'التحاليل', icon: '🧪' },
  { value: 'insurance', label: '🛡️ التأمين', shortLabel: 'التأمين', icon: '🛡️' },
  { value: 'hospital', label: '🏥 المستشفى', shortLabel: 'المستشفى', icon: '🏥' },
];

const ROLE_NAMES_AR: Record<RoleId, string> = {
  doctor: 'الطبيب',
  patient: 'المريض',
  pharmacy: 'الصيدلية',
  lab: 'التحاليل',
  insurance: 'التأمين',
  hospital: 'المستشفى',
};

function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) return 'غير متاح';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDateAr(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ar-EG');
  } catch {
    return iso;
  }
}

export default function App() {
  const initialPrefs = useRef(loadPreferences());

  const [dbReady, setDbReady] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(initialPrefs.current.theme || 'light');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    initialPrefs.current.isLoggedIn
  );
  const [activeRole, setActiveRole] = useState<RoleId>(
    initialPrefs.current.activeRole
  );

  // Login form states
  const [loginUser, setLoginUser] = useState<string>(
    initialPrefs.current.lastUsername || ''
  );
  const [loginPass, setLoginPass] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loginRole, setLoginRole] = useState<RoleId>(
    initialPrefs.current.activeRole
  );
  const [loginError, setLoginError] = useState<string>('');

  // Storage status, modals, drawers, toasts
  const [storageStatus, setStorageStatus] = useState<StorageStatusInfo>(() =>
    htsStorage.getStatus()
  );
  const [storageModalOpen, setStorageModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => new Set());
  const [notifTick, setNotifTick] = useState(0);
  const [printReport, setPrintReport] = useState<PrintableReportPayload | null>(null);

  const [modalError, setModalError] = useState<string | null>(null);
  const [confirmResetPending, setConfirmResetPending] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const frameRefs = useRef<Partial<Record<RoleId, HTMLIFrameElement | null>>>({});
  const pendingJumpRef = useRef<{ role: RoleId; page: string } | null>(null);
  const toastCounter = useRef(1);

  const pushToast = useCallback(
    (message: string, type: ToastItem['type'] = 'info') => {
      const id = toastCounter.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  // Sync theme to documentElement + all loaded iframes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    ROLE_IDS.forEach((role) => {
      const win = frameRefs.current[role]?.contentWindow as FrameWindow | null | undefined;
      try {
        win?.__htsSyncTheme?.(theme);
      } catch {
        // Ignore cross-frame timing errors before load
      }
    });
  }, [theme]);

  // Register global print bridge for iframes
  useEffect(() => {
    window.HTSOpenPrintReport = (payload: PrintableReportPayload) => {
      setPrintReport(payload);
    };
    return () => {
      delete window.HTSOpenPrintReport;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      htsStorage.setThemePreference(next);
      return next;
    });
  }, []);

  const handleOpenPrintCurrent = useCallback(() => {
    const win = frameRefs.current[activeRole]?.contentWindow as FrameWindow | null | undefined;
    if (win && typeof win.__htsBuildCurrentReport === 'function') {
      const report = win.__htsBuildCurrentReport();
      if (report) {
        setPrintReport(report);
        return;
      }
    }
    setPrintReport({
      title: `ملخص بيانات قسم ${ROLE_NAMES_AR[activeRole]}`,
      subtitle: 'تقرير حالة محلي مستخرج من قاعدة البيانات IndexedDB',
      roleLabel: ROLE_NAMES_AR[activeRole],
      metadata: [
        { label: 'عدد السجلات المخزنة', value: String(storageStatus.recordCounts[activeRole]) },
        { label: 'الطلبات المشتركة', value: String(storageStatus.sharedCount) },
        { label: 'آخر تحديث', value: formatDateAr(storageStatus.lastUpdatedAt) },
      ],
      notes: 'تم إنشاء هذا التقرير مباشرة من التخزين المحلي للمتصفح (IndexedDB).',
    });
  }, [activeRole, storageStatus]);

  const handleShortcutAction = useCallback(
    (action: string) => {
      if (action === 'search') {
        if (isLoggedIn) {
          setShortcutsOpen(false);
          setSearchOpen((prev) => !prev);
        }
        return;
      }
      if (action === 'shortcuts') {
        setSearchOpen(false);
        setShortcutsOpen((prev) => !prev);
        return;
      }
      if (action === 'notifications') {
        if (isLoggedIn) {
          setShortcutsOpen(false);
          setNotifOpen((prev) => !prev);
        }
        return;
      }
      if (action === 'theme') {
        toggleTheme();
        return;
      }
      if (action === 'print') {
        if (isLoggedIn && dbReady) {
          setShortcutsOpen(false);
          handleOpenPrintCurrent();
        }
        return;
      }
      if (action === 'escape') {
        if (shortcutsOpen) setShortcutsOpen(false);
        else if (printReport) setPrintReport(null);
        else if (searchOpen) setSearchOpen(false);
        else if (notifOpen) setNotifOpen(false);
        else if (storageModalOpen) setStorageModalOpen(false);
      }
    },
    [
      isLoggedIn,
      dbReady,
      shortcutsOpen,
      printReport,
      searchOpen,
      notifOpen,
      storageModalOpen,
      toggleTheme,
      handleOpenPrintCurrent,
    ]
  );

  useEffect(() => {
    window.__htsHandleShortcut = handleShortcutAction;
    return () => {
      delete window.__htsHandleShortcut;
    };
  }, [handleShortcutAction]);

  // Global keyboard shortcuts (Ctrl+K, ?, Esc, Alt+N/T/P/Arrows)
  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
      );
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') {
        if (isLoggedIn) {
          ev.preventDefault();
          handleShortcutAction('search');
        }
        return;
      }
      if (ev.key === 'Escape') {
        handleShortcutAction('escape');
        return;
      }
      if (isEditableTarget(ev.target)) return;

      const isQuestionMark =
        ev.key === '?' ||
        ev.key === '؟' ||
        (ev.shiftKey && ev.code === 'Slash' && !ev.ctrlKey && !ev.altKey && !ev.metaKey);

      if (isQuestionMark) {
        ev.preventDefault();
        handleShortcutAction('shortcuts');
        return;
      }

      if (ev.altKey && !ev.ctrlKey && !ev.metaKey) {
        const lower = ev.key.toLowerCase();
        if (lower === 'n') {
          ev.preventDefault();
          handleShortcutAction('notifications');
        } else if (lower === 't') {
          ev.preventDefault();
          handleShortcutAction('theme');
        } else if (lower === 'p') {
          ev.preventDefault();
          handleShortcutAction('print');
        } else if (ev.key === 'ArrowLeft' && isLoggedIn) {
          ev.preventDefault();
          const win = frameRefs.current[activeRole]?.contentWindow as FrameWindow | null | undefined;
          win?.__htsStepPage?.(1);
        } else if (ev.key === 'ArrowRight' && isLoggedIn) {
          ev.preventDefault();
          const win = frameRefs.current[activeRole]?.contentWindow as FrameWindow | null | undefined;
          win?.__htsStepPage?.(-1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLoggedIn, activeRole, handleShortcutAction]);

  useEffect(() => {
    let mounted = true;
    const unsub = htsStorage.subscribe((ev) => {
      if (!mounted) return;
      setStorageStatus(htsStorage.getStatus());
      if (
        ev.type === 'role-updated' ||
        ev.type === 'shared-updated' ||
        ev.type === 'import' ||
        ev.type === 'reset' ||
        ev.type === 'init'
      ) {
        setNotifTick((t) => t + 1);
      }
      if (ev.type === 'error') {
        pushToast(ev.message, 'error');
      }
    });

    void htsStorage.init().then((status) => {
      if (!mounted) return;
      setStorageStatus(status);
      setDbReady(true);
      setNotifTick((t) => t + 1);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [pushToast]);

  const notifications = useMemo(() => {
    void notifTick;
    return buildUnifiedNotifications(
      htsStorage.getAllRoleStatesSync(),
      htsStorage.getSharedDataSync(),
      activeRole
    );
  }, [notifTick, activeRole]);

  const unreadNotifCount = useMemo(
    () => notifications.filter((n) => !readNotifIds.has(n.id)).length,
    [notifications, readNotifIds]
  );

  const jumpWithinActiveRole = useCallback(
    (targetPage: string) => {
      pendingJumpRef.current = { role: activeRole, page: targetPage };
      window.setTimeout(() => {
        const win = frameRefs.current[activeRole]?.contentWindow as FrameWindow | null | undefined;
        if (!win) return;
        win.__htsSyncTheme?.(theme);
        if (typeof win.__htsJumpToPage === 'function') {
          win.__htsJumpToPage(targetPage);
          pendingJumpRef.current = null;
        }
      }, 40);
    },
    [activeRole, theme]
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError('من فضلك أدخل اسم المستخدم وكلمة المرور.');
      return;
    }

    setLoginError('');
    const selectedRole = loginRole;
    savePreferences({
      isLoggedIn: true,
      activeRole: selectedRole,
      lastUsername: loginUser.trim(),
    });
    setActiveRole(selectedRole);
    setIsLoggedIn(true);
    setLoginPass('');
  };

  const handleLogout = () => {
    savePreferences({ isLoggedIn: false });
    setIsLoggedIn(false);
    setSearchOpen(false);
    setNotifOpen(false);
    setShortcutsOpen(false);
    setPrintReport(null);
    setLoginPass('');
    setLoginError('');
  };

  const handleExportJson = async () => {
    setBusyAction(true);
    setModalError(null);
    try {
      const result = await htsStorage.exportBackupJson();
      if (!result.ok || !result.jsonString || !result.filename) {
        const errMsg = result.error || 'تعذر تصدير النسخة الاحتياطية.';
        setModalError(errMsg);
        pushToast(errMsg, 'error');
        return;
      }

      const blob = new Blob([result.jsonString], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setStorageStatus(htsStorage.getStatus());
      pushToast(`✓ تم تصدير النسخة الاحتياطية (${result.filename})`, 'success');
    } catch (err) {
      const msg =
        err instanceof Error
          ? `خطأ أثناء التصدير: ${err.message}`
          : 'حدث خطأ غير متوقع أثناء تصدير النسخة الاحتياطية.';
      setModalError(msg);
      pushToast(msg, 'error');
    } finally {
      setBusyAction(false);
    }
  };

  const triggerImportPicker = () => {
    setModalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleImportFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusyAction(true);
    setModalError(null);

    try {
      if (file.size === 0) {
        const msg = 'الملف المحدد فارغ (0 بايت).';
        setModalError(msg);
        pushToast(msg, 'error');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        const msg = 'حجم ملف النسخة الاحتياطية يتجاوز الحد المسموح (25 MB).';
        setModalError(msg);
        pushToast(msg, 'error');
        return;
      }

      const rawText = await file.text();
      const res = await htsStorage.importBackupJson(rawText);
      if (!res.ok) {
        const msg = res.error || 'فشل التحقق من صحة النسخة الاحتياطية.';
        setModalError(msg);
        pushToast(msg, 'error');
        return;
      }

      if (res.restoredRole && !isLoggedIn) {
        setActiveRole(res.restoredRole);
        setLoginRole(res.restoredRole);
      } else if (isLoggedIn) {
        // Keep the active logged-in session strictly locked to activeRole
        savePreferences({ activeRole });
      }
      setStorageStatus(htsStorage.getStatus());
      pushToast(
        '✓ تم استيراد النسخة الاحتياطية والتحقق منها وحفظها في IndexedDB بنجاح.',
        'success'
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? `تعذر قراءة ملف النسخة الاحتياطية: ${err.message}`
          : 'تعذر قراءة الملف المحدد.';
      setModalError(msg);
      pushToast(msg, 'error');
    } finally {
      setBusyAction(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRequestPersist = async () => {
    setModalError(null);
    const granted = await htsStorage.requestPersistentStorage();
    setStorageStatus(htsStorage.getStatus());
    if (granted === true) {
      pushToast('✓ تم تفعيل التخزين الدائم للمتصفح بنجاح.', 'success');
    } else if (granted === false) {
      pushToast(
        'لم يمنح المتصفح صلاحية التخزين الدائم حالياً؛ تبقى بيانات IndexedDB محفوظة محلياً.',
        'warning'
      );
    } else {
      pushToast('ميزة Storage Persist غير مدعومة في هذا المتصفح.', 'warning');
    }
  };

  const handleResetDemo = async () => {
    setBusyAction(true);
    setModalError(null);
    try {
      const res = await htsStorage.resetDemoData();
      if (!res.ok) {
        const msg = res.error || 'تعذر إعادة تعيين البيانات التجريبية.';
        setModalError(msg);
        pushToast(msg, 'error');
        return;
      }
      setConfirmResetPending(false);
      setStorageStatus(htsStorage.getStatus());
      pushToast(
        '✓ تمت إعادة تعيين البيانات التجريبية الافتراضية في IndexedDB.',
        'success'
      );
    } finally {
      setBusyAction(false);
    }
  };

  const persistLabel =
    storageStatus.persisted === true
      ? 'تخزين دائم ✓'
      : storageStatus.persisted === false
        ? 'تخزين محلي'
        : 'IndexedDB محلي';

  return (
    <>
      <input
        ref={fileInputRef}
        id="htsBackupFileInput"
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportFileChange}
      />

      {/* Toast Notifications */}
      <div className="hts-toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`hts-toast ${toast.type}`} role="status">
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              style={{
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                color: 'inherit',
                fontWeight: 700,
              }}
              aria-label="إغلاق التنبيه"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Login Page */}
      {!isLoggedIn && (
        <div id="loginPage" className="login-page">
          <div className="login-card">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-16px' }}>
              <button
                type="button"
                className="login-backup-btn"
                id="loginThemeToggleBtn"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              >
                {theme === 'dark' ? '☀️ فاتح' : '🌙 داكن'}
              </button>
            </div>
            <div className="login-logo">🏥</div>
            <h1>تسجيل الدخول</h1>
            <p>المنصة الصحية المتكاملة</p>
            <form id="loginForm" onSubmit={handleLoginSubmit}>
              <div className="login-group">
                <label htmlFor="loginUser">البريد الإلكتروني أو اسم المستخدم</label>
                <input
                  id="loginUser"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  autoComplete="username"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                />
              </div>
              <div className="login-group">
                <label htmlFor="loginPass">كلمة المرور</label>
                <div className="login-input-wrap">
                  <input
                    id="loginPass"
                    type={showPass ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-pass-btn"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPass ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </div>
              <div className="login-group">
                <label htmlFor="loginRole">نوع الحساب</label>
                <select
                  id="loginRole"
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value as RoleId)}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button className="login-btn" type="submit">
                دخول إلى المنصة
              </button>
              {loginError && (
                <div id="loginError" className="login-error">
                  {loginError}
                </div>
              )}
            </form>
            <p className="login-note">
              يتم حفظ جميع بيانات العرض التجريبي محلياً داخل متصفحك عبر IndexedDB دون أي خادم خارجي.
            </p>
            <div className="login-backup-row">
              <button
                type="button"
                className="login-backup-btn"
                id="loginImportBackupBtn"
                onClick={triggerImportPicker}
                disabled={busyAction}
              >
                ⬆️ استيراد نسخة JSON
              </button>
              <button
                type="button"
                className="login-backup-btn"
                id="loginStorageInfoBtn"
                onClick={() => {
                  setModalError(null);
                  setStorageModalOpen(true);
                }}
              >
                🗄️ حالة قاعدة البيانات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Shell */}
      <div
        className="shell"
        id="appShell"
        style={{ display: isLoggedIn ? 'flex' : 'none' }}
      >
        <header className="top" id="mainHeader">
          <div className="brand-group">
            <div className="brand">🏥 المنصة الصحية المتكاملة</div>
            <div className="active-role-chip" id="activeRoleBadge">
              <span>
                {ROLE_OPTIONS.find((o) => o.value === activeRole)?.icon || '👤'}
              </span>
              <span>بوابة {ROLE_NAMES_AR[activeRole]}</span>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              id="globalSearchBtn"
              className="header-tool-btn"
              onClick={() => setSearchOpen(true)}
              title="بحث شامل عبر المنصة (Ctrl+K)"
            >
              <span>🔍 بحث</span>
            </button>

            <button
              type="button"
              id="notificationsBtn"
              className="header-tool-btn"
              onClick={() => setNotifOpen(true)}
              title="مركز الإشعارات الموحد"
            >
              <span>🔔 تنبيهات</span>
              {unreadNotifCount > 0 && (
                <span className="notif-count-badge tabular-nums">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <button
              type="button"
              id="printSummaryBtn"
              className="header-tool-btn"
              onClick={handleOpenPrintCurrent}
              disabled={!dbReady}
              title="معاينة وطباعة تقرير طبي"
            >
              🖨️ طباعة
            </button>

            <button
              type="button"
              id="themeToggleBtn"
              className="header-tool-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح (Alt+T)' : 'التبديل إلى الوضع الداكن (Alt+T)'}
            >
              {theme === 'dark' ? '☀️ فاتح' : '🌙 داكن'}
            </button>

            <button
              type="button"
              id="shortcutsBtn"
              className="header-tool-btn"
              onClick={() => setShortcutsOpen(true)}
              title="اختصارات لوحة المفاتيح (?)"
              aria-label="اختصارات لوحة المفاتيح"
            >
              <span className="header-kbd">?</span>
              <span>اختصارات</span>
            </button>

            <button
              type="button"
              id="storageStatusBtn"
              className="storage-pill-btn"
              onClick={() => {
                setModalError(null);
                setConfirmResetPending(false);
                setStorageModalOpen(true);
              }}
              title="حالة التخزين المحلي وإدارة النسخ الاحتياطي"
            >
              <span
                className={`storage-dot ${
                  storageStatus.lastError
                    ? 'error'
                    : storageStatus.persisted
                      ? 'persisted'
                      : ''
                }`}
              />
              <span>🗄️ {persistLabel}</span>
            </button>

            <button
              type="button"
              id="exportBackupBtn"
              className="header-tool-btn"
              onClick={handleExportJson}
              disabled={busyAction || !dbReady}
              title="تصدير نسخة احتياطية JSON"
            >
              ⬇️ تصدير
            </button>

            <button
              type="button"
              id="importBackupBtn"
              className="header-tool-btn"
              onClick={triggerImportPicker}
              disabled={busyAction || !dbReady}
              title="استيراد نسخة احتياطية JSON"
            >
              ⬆️ استيراد
            </button>

            <button
              className="logout-btn"
              id="logoutBtn"
              type="button"
              onClick={handleLogout}
            >
              خروج
            </button>
          </div>
        </header>

        <main className="workspace">
          {dbReady && isLoggedIn && (
            <iframe
              key={activeRole}
              ref={(el) => {
                frameRefs.current[activeRole] = el;
              }}
              id={`frame-${activeRole}`}
              className="app-frame active"
              title={ROLE_NAMES_AR[activeRole]}
              srcDoc={ROLE_FRAMES[activeRole]}
              onLoad={() => {
                const win = frameRefs.current[activeRole]?.contentWindow as
                  | FrameWindow
                  | null
                  | undefined;
                if (!win) return;
                win.__htsSyncTheme?.(theme);
                const pending = pendingJumpRef.current;
                if (pending && pending.role === activeRole) {
                  win.__htsJumpToPage?.(pending.page);
                  pendingJumpRef.current = null;
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Global Search Modal (Ctrl+K) — Strictly Scoped to Active Role */}
      <GlobalSearchModal
        open={searchOpen}
        activeRole={activeRole}
        onClose={() => setSearchOpen(false)}
        onNavigate={(page) => {
          jumpWithinActiveRole(page);
        }}
      />

      {/* Unified Notification Drawer — Strictly Scoped to Active Role */}
      <NotificationDrawer
        open={notifOpen}
        activeRole={activeRole}
        notifications={notifications}
        readIds={readNotifIds}
        onClose={() => setNotifOpen(false)}
        onMarkAllRead={() => {
          setReadNotifIds(new Set(notifications.map((n) => n.id)));
        }}
        onSelectNotification={(page, id) => {
          setReadNotifIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
          setNotifOpen(false);
          jumpWithinActiveRole(page);
        }}
      />

      {/* Print-Friendly Medical Report Modal */}
      <PrintReportModal
        report={printReport}
        onClose={() => setPrintReport(null)}
      />

      {/* Keyboard Shortcuts Quick Reference Modal (?) */}
      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Local Storage & Backup Modal */}
      {storageModalOpen && (
        <div
          className="hts-modal-backdrop"
          id="storageModal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setStorageModalOpen(false);
          }}
        >
          <div className="hts-modal-card" role="dialog" aria-modal="true">
            <div className="hts-modal-head">
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                🗄️ إدارة قاعدة البيانات المحلية والنسخ الاحتياطي
              </h2>
              <button
                type="button"
                className="hts-icon-close-btn"
                onClick={() => setStorageModalOpen(false)}
                aria-label="إغلاق النافذة"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div
                id="backupModalError"
                className="hts-modal-error-banner"
              >
                ⚠️ {modalError}
              </div>
            )}

            <div className="hts-modal-stat-grid">
              <div className="hts-modal-stat-card">
                <div className="hts-modal-stat-label">محرك قاعدة البيانات</div>
                <div className="hts-modal-stat-val">
                  {storageStatus.indexedDbSupported
                    ? `IndexedDB (${storageStatus.dbName})`
                    : 'غير مدعوم'}
                </div>
              </div>

              <div className="hts-modal-stat-card">
                <div className="hts-modal-stat-label">التخزين الدائم (Persist API)</div>
                <div className="hts-modal-stat-val">
                  {storageStatus.persisted === true
                    ? 'مُفعّل ✓'
                    : storageStatus.persistSupported
                      ? 'متاح (اختياري)'
                      : 'غير مدعوم'}
                </div>
              </div>

              <div className="hts-modal-stat-card">
                <div className="hts-modal-stat-label">المساحة المستخدمة</div>
                <div className="hts-modal-stat-val tabular-nums">
                  {formatBytes(storageStatus.usageBytes)}
                </div>
              </div>
            </div>

            <div className="hts-modal-summary-box">
              <div className="tabular-nums">
                <strong>تاريخ التهيئة التلقائية:</strong>{' '}
                {formatDateAr(storageStatus.initializedAt)}
              </div>
              <div className="tabular-nums">
                <strong>آخر حفظ للبيانات:</strong>{' '}
                {formatDateAr(storageStatus.lastUpdatedAt)}
              </div>
              <div className="tabular-nums">
                <strong>آخر نسخة احتياطية:</strong>{' '}
                {formatDateAr(storageStatus.lastBackupAt)}
              </div>
              <div
                className="tabular-nums"
                style={{ marginTop: '6px', color: 'var(--hts-text-muted)' }}
              >
                {isLoggedIn ? (
                  <>
                    <strong>سجلات بوابة {ROLE_NAMES_AR[activeRole]} في IndexedDB:</strong>{' '}
                    {storageStatus.recordCounts[activeRole]} سجل
                  </>
                ) : (
                  <>
                    <strong>توزيع السجلات في IndexedDB:</strong>{' '}
                    {ROLE_IDS.map(
                      (r) => `${ROLE_NAMES_AR[r]} (${storageStatus.recordCounts[r]})`
                    ).join(' · ')}{' '}
                    · الطلبات المشتركة ({storageStatus.sharedCount})
                  </>
                )}
              </div>
              <div
                style={{
                  marginTop: '4px',
                  color: 'var(--hts-text-muted)',
                  fontSize: '11.5px',
                }}
              >
                يُستخدم Local Storage للتفضيلات البسيطة فقط (نوع الحساب، المظهر، والصفحة الأخيرة).
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={handleExportJson}
                disabled={busyAction}
                style={{
                  border: 0,
                  background: '#22223B',
                  color: '#fff',
                  padding: '10px 15px',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ⬇️ تصدير نسخة JSON
              </button>

              <button
                type="button"
                onClick={triggerImportPicker}
                disabled={busyAction}
                style={{
                  border: 0,
                  background: '#4A4E69',
                  color: '#fff',
                  padding: '10px 15px',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ⬆️ استيراد نسخة JSON
              </button>

              {storageStatus.persistSupported &&
                storageStatus.persisted !== true && (
                  <button
                    type="button"
                    onClick={handleRequestPersist}
                    disabled={busyAction}
                    className="login-backup-btn"
                  >
                    🔒 طلب التخزين الدائم
                  </button>
                )}

              {!confirmResetPending ? (
                <button
                  type="button"
                  id="resetDemoBtn"
                  onClick={() => setConfirmResetPending(true)}
                  disabled={busyAction}
                  className="hts-danger-soft-btn"
                >
                  ↺ إعادة تعيين البيانات التجريبية
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginRight: 'auto',
                  }}
                >
                  <button
                    type="button"
                    id="confirmResetDemoBtn"
                    onClick={handleResetDemo}
                    disabled={busyAction}
                    style={{
                      border: 0,
                      background: '#dc2626',
                      color: '#fff',
                      padding: '10px 12px',
                      borderRadius: '9px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    تأكيد إعادة التعيين
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetPending(false)}
                    className="login-backup-btn"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
