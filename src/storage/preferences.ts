import { DEFAULT_PREFERENCES, sanitizePreferences } from './backupValidation';
import { RoleId, SharedData, UserPreferences } from './types';

export const PREFERENCES_STORAGE_KEY = 'hts_user_preferences_v1';
const LEGACY_SHARED_KEY = 'healthPlatformSharedData_v2';

function getSafeLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPreferences(): UserPreferences {
  const ls = getSafeLocalStorage();
  if (!ls) {
    return { ...DEFAULT_PREFERENCES, activePageByRole: {} };
  }

  try {
    const raw = ls.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES, activePageByRole: {} };
    }
    const parsed = JSON.parse(raw);
    return sanitizePreferences(parsed);
  } catch {
    return { ...DEFAULT_PREFERENCES, activePageByRole: {} };
  }
}

export function savePreferences(
  patch: Partial<UserPreferences>
): { ok: boolean; preferences: UserPreferences; error?: string } {
  const current = loadPreferences();
  const merged = sanitizePreferences({
    ...current,
    ...patch,
    activePageByRole: {
      ...current.activePageByRole,
      ...(patch.activePageByRole || {}),
    },
  });

  const ls = getSafeLocalStorage();
  if (!ls) {
    return {
      ok: false,
      preferences: merged,
      error: 'تعذر الوصول إلى Local Storage لحفظ التفضيلات.',
    };
  }

  try {
    ls.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(merged));
    return { ok: true, preferences: merged };
  } catch (err) {
    return {
      ok: false,
      preferences: merged,
      error:
        err instanceof Error
          ? err.message
          : 'تعذر حفظ التفضيلات في Local Storage.',
    };
  }
}

export function setRoleActivePagePreference(role: RoleId, page: string): UserPreferences {
  const current = loadPreferences();
  const res = savePreferences({
    activePageByRole: {
      ...current.activePageByRole,
      [role]: page,
    },
  });
  return res.preferences;
}

/**
 * Ensures Local Storage is used ONLY for simple preferences.
 * If legacy shared medical requests exist in `healthPlatformSharedData_v2`,
 * extracts them once for migration into IndexedDB and deletes the legacy key.
 */
export function extractAndCleanLegacyDomainLocalStorage(): SharedData | null {
  const ls = getSafeLocalStorage();
  if (!ls) return null;

  try {
    const raw = ls.getItem(LEGACY_SHARED_KEY);
    if (!raw) return null;

    let migrated: SharedData | null = null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        migrated = {
          prescriptions: Array.isArray(parsed.prescriptions) ? parsed.prescriptions : [],
          labOrders: Array.isArray(parsed.labOrders) ? parsed.labOrders : [],
          pharmacyRequests: Array.isArray(parsed.pharmacyRequests) ? parsed.pharmacyRequests : [],
          events: Array.isArray(parsed.events) ? parsed.events : [],
        };
      }
    } catch {
      migrated = null;
    }

    ls.removeItem(LEGACY_SHARED_KEY);
    return migrated;
  } catch {
    return null;
  }
}
