import {
  AllRoleStates,
  BackupPayload,
  BackupValidationResult,
  HTS_BACKUP_APP,
  HTS_BACKUP_VERSION,
  ROLE_IDS,
  RoleId,
  SharedData,
  ThemeMode,
  UserPreferences,
} from './types';

export const DEFAULT_PREFERENCES: UserPreferences = {
  isLoggedIn: false,
  activeRole: 'doctor',
  lastUsername: '',
  activePageByRole: {},
  theme: 'light',
};

export const ROLE_STATE_SHAPE: Record<
  RoleId,
  Record<string, 'array' | 'object'>
> = {
  doctor: {
    patients: 'array',
    prescriptions: 'array',
    labOrders: 'array',
    labResults: 'array',
    imagingOrders: 'array',
    pendingRequests: 'array',
    parallelWorkflows: 'array',
  },
  patient: {
    patient: 'object',
    appointments: 'object',
    prescriptions: 'array',
    labResults: 'array',
    imagingResults: 'array',
    reports: 'array',
    notifications: 'array',
    complaints: 'array',
    visitHistory: 'array',
    doctorVisits: 'array',
    queue: 'array',
  },
  pharmacy: {
    orders: 'array',
    inventory: 'array',
    issues: 'array',
    bottlenecks: 'array',
    pendingRequests: 'array',
    parallelWorkflows: 'array',
  },
  lab: {
    orders: 'array',
    issues: 'array',
    bottlenecks: 'array',
    parallelWorkflows: 'array',
  },
  insurance: {
    appointments: 'array',
    clinics: 'array',
    queues: 'object',
    claims: 'array',
    reviewHistory: 'array',
    parallelWorkflows: 'array',
    patientJourneys: 'array',
    bottlenecks: 'array',
  },
  hospital: {
    clinics: 'array',
    appointments: 'array',
    parallelWorkflows: 'array',
    patientJourneys: 'array',
    bottlenecks: 'array',
    pendingRequests: 'array',
    queues: 'object',
  },
};

const ROLE_LABELS_AR: Record<RoleId, string> = {
  doctor: 'الطبيب',
  patient: 'المريض',
  pharmacy: 'الصيدلية',
  lab: 'التحاليل',
  insurance: 'التأمين',
  hospital: 'المستشفى',
};

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function isValidRoleId(value: unknown): value is RoleId {
  return typeof value === 'string' && (ROLE_IDS as readonly string[]).includes(value);
}

export function sanitizeValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as unknown as T;
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (DANGEROUS_KEYS.has(k)) continue;
      out[k] = sanitizeValue(v);
    }
    return out as T;
  }
  return value;
}

export function hasDangerousKeys(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => hasDangerousKeys(item));
  }
  if (typeof value === 'object' && value !== null) {
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.has(key)) return true;
      if (hasDangerousKeys((value as Record<string, unknown>)[key])) return true;
    }
  }
  return false;
}

export function sanitizePreferences(raw: unknown): UserPreferences {
  if (!isPlainObject(raw)) {
    return { ...DEFAULT_PREFERENCES, activePageByRole: {} };
  }

  const activeRole: RoleId = isValidRoleId(raw.activeRole)
    ? raw.activeRole
    : DEFAULT_PREFERENCES.activeRole;

  const isLoggedIn = typeof raw.isLoggedIn === 'boolean' ? raw.isLoggedIn : false;

  const lastUsername =
    typeof raw.lastUsername === 'string'
      ? raw.lastUsername.slice(0, 120)
      : '';

  const activePageByRole: Partial<Record<RoleId, string>> = {};
  if (isPlainObject(raw.activePageByRole)) {
    for (const role of ROLE_IDS) {
      const pageVal = raw.activePageByRole[role];
      if (typeof pageVal === 'string' && pageVal.trim().length > 0 && pageVal.length <= 64) {
        activePageByRole[role] = pageVal.trim();
      }
    }
  }

  const theme: ThemeMode = raw.theme === 'dark' ? 'dark' : 'light';

  return {
    isLoggedIn,
    activeRole,
    lastUsername,
    activePageByRole,
    theme,
  };
}

export function buildBackupPayload(
  roleStates: AllRoleStates,
  sharedData: SharedData,
  preferences?: Partial<UserPreferences>,
  exportedAt: string = new Date().toISOString()
): BackupPayload {
  return sanitizeValue({
    app: HTS_BACKUP_APP,
    schemaVersion: HTS_BACKUP_VERSION,
    exportedAt,
    ...(preferences ? { preferences: sanitizePreferences(preferences) } : {}),
    data: {
      roleStates,
      sharedData: {
        prescriptions: Array.isArray(sharedData.prescriptions) ? sharedData.prescriptions : [],
        labOrders: Array.isArray(sharedData.labOrders) ? sharedData.labOrders : [],
        pharmacyRequests: Array.isArray(sharedData.pharmacyRequests) ? sharedData.pharmacyRequests : [],
        events: Array.isArray(sharedData.events) ? sharedData.events : [],
        ...(sharedData.updatedAt ? { updatedAt: sharedData.updatedAt } : {}),
      },
    },
  });
}

export function validateBackupPayload(rawInput: unknown): BackupValidationResult {
  let parsed: unknown = rawInput;

  if (typeof rawInput === 'string') {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return {
        ok: false,
        code: 'EMPTY_INPUT',
        error: 'ملف النسخة الاحتياطية فارغ.',
      };
    }
    try {
      // Check raw text for forbidden prototype keys before assigning after JSON.parse
      parsed = JSON.parse(trimmed);
    } catch (err) {
      return {
        ok: false,
        code: 'INVALID_JSON',
        error: 'تعذر قراءة الملف: صيغة JSON غير صالحة أو تالفة.',
        details: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (!isPlainObject(parsed)) {
    return {
      ok: false,
      code: 'INVALID_ROOT',
      error: 'بنية ملف النسخة الاحتياطية غير صحيحة (يجب أن يكون كائن JSON رئيسي).',
    };
  }

  if (parsed.app !== HTS_BACKUP_APP) {
    return {
      ok: false,
      code: 'INVALID_APP',
      error: 'هذا الملف لا يخص المنصة الصحية المتكاملة (معرّف التطبيق غير متطابق).',
      details: `Expected app=${HTS_BACKUP_APP}`,
    };
  }

  if (
    typeof parsed.schemaVersion !== 'number' ||
    !Number.isInteger(parsed.schemaVersion) ||
    parsed.schemaVersion !== HTS_BACKUP_VERSION
  ) {
    return {
      ok: false,
      code: 'UNSUPPORTED_VERSION',
      error: `إصدار مخطط النسخة الاحتياطية غير مدعوم (${String(parsed.schemaVersion ?? 'غير محدد')}).`,
    };
  }

  if (!isPlainObject(parsed.data)) {
    return {
      ok: false,
      code: 'MISSING_DATA',
      error: 'ملف النسخة الاحتياطية يفتقد قسم البيانات (data).',
    };
  }

  const rawData = parsed.data;
  if (!isPlainObject(rawData.roleStates)) {
    return {
      ok: false,
      code: 'INVALID_ROLE_STATES',
      error: 'بيانات الحسابات (roleStates) مفقودة أو غير صالحة.',
    };
  }

  const validatedRoleStates = {} as AllRoleStates;

  for (const role of ROLE_IDS) {
    const roleData = rawData.roleStates[role];
    const roleLabel = ROLE_LABELS_AR[role];

    if (!isPlainObject(roleData)) {
      return {
        ok: false,
        code: 'INVALID_ROLE_STATES',
        error: `بيانات قسم "${roleLabel}" (${role}) مفقودة أو تالفة.`,
      };
    }

    const expectedFields = ROLE_STATE_SHAPE[role];
    const cleanRoleData: Record<string, unknown> = {};

    for (const [fieldKey, expectedKind] of Object.entries(expectedFields)) {
      const val = roleData[fieldKey];
      if (expectedKind === 'array') {
        if (!Array.isArray(val)) {
          return {
            ok: false,
            code: 'INVALID_ROLE_STATES',
            error: `الحقل "${fieldKey}" في قسم "${roleLabel}" يجب أن يكون قائمة (Array).`,
          };
        }
        for (let i = 0; i < val.length; i++) {
          if (!isPlainObject(val[i])) {
            return {
              ok: false,
              code: 'INVALID_ROLE_STATES',
              error: `العنصر رقم ${i + 1} داخل "${fieldKey}" في قسم "${roleLabel}" غير صالح.`,
            };
          }
        }
        cleanRoleData[fieldKey] = sanitizeValue(val);
      } else {
        if (!isPlainObject(val)) {
          return {
            ok: false,
            code: 'INVALID_ROLE_STATES',
            error: `الحقل "${fieldKey}" في قسم "${roleLabel}" يجب أن يكون كائناً صالحاً.`,
          };
        }
        cleanRoleData[fieldKey] = sanitizeValue(val);
      }
    }

    // Special structural guard for patient.appointments ({ upcoming: [], past: [] })
    if (role === 'patient') {
      const appts = cleanRoleData.appointments as Record<string, unknown>;
      if (!Array.isArray(appts.upcoming) || !Array.isArray(appts.past)) {
        return {
          ok: false,
          code: 'INVALID_ROLE_STATES',
          error: 'بيانات مواعيد المريض (upcoming / past) غير مكتملة.',
        };
      }
    }

    validatedRoleStates[role] = cleanRoleData;
  }

  if (!isPlainObject(rawData.sharedData)) {
    return {
      ok: false,
      code: 'INVALID_SHARED_DATA',
      error: 'بيانات الطلبات المشتركة (sharedData) مفقودة أو غير صالحة.',
    };
  }

  const rawShared = rawData.sharedData;
  const sharedKeys: Array<keyof Pick<SharedData, 'prescriptions' | 'labOrders' | 'pharmacyRequests' | 'events'>> = [
    'prescriptions',
    'labOrders',
    'pharmacyRequests',
    'events',
  ];

  for (const key of sharedKeys) {
    const arr = rawShared[key];
    if (!Array.isArray(arr)) {
      return {
        ok: false,
        code: 'INVALID_SHARED_DATA',
        error: `القائمة المشتركة "${key}" غير صالحة في ملف النسخة الاحتياطية.`,
      };
    }
    for (let i = 0; i < arr.length; i++) {
      if (!isPlainObject(arr[i])) {
        return {
          ok: false,
          code: 'INVALID_SHARED_DATA',
          error: `سجل غير صالح داخل القائمة المشتركة "${key}" (فهرس ${i}).`,
        };
      }
    }
  }

  let validatedPreferences: Partial<UserPreferences> | undefined;
  if (parsed.preferences !== undefined) {
    if (!isPlainObject(parsed.preferences)) {
      return {
        ok: false,
        code: 'INVALID_PREFERENCES',
        error: 'تفضيلات المستخدم (preferences) في النسخة الاحتياطية غير صالحة.',
      };
    }
    if (
      parsed.preferences.activeRole !== undefined &&
      !isValidRoleId(parsed.preferences.activeRole)
    ) {
      return {
        ok: false,
        code: 'INVALID_PREFERENCES',
        error: `الدور المحفوظ في التفضيلات غير معروف (${String(parsed.preferences.activeRole)}).`,
      };
    }
    validatedPreferences = sanitizePreferences(parsed.preferences);
  }

  const exportedAt =
    typeof parsed.exportedAt === 'string' && parsed.exportedAt.trim().length > 0
      ? parsed.exportedAt
      : new Date().toISOString();

  return {
    ok: true,
    backup: {
      app: HTS_BACKUP_APP,
      schemaVersion: HTS_BACKUP_VERSION,
      exportedAt,
      ...(validatedPreferences ? { preferences: validatedPreferences } : {}),
      data: {
        roleStates: validatedRoleStates,
        sharedData: {
          prescriptions: sanitizeValue(rawShared.prescriptions as Record<string, unknown>[]),
          labOrders: sanitizeValue(rawShared.labOrders as Record<string, unknown>[]),
          pharmacyRequests: sanitizeValue(rawShared.pharmacyRequests as Record<string, unknown>[]),
          events: sanitizeValue(rawShared.events as Record<string, unknown>[]),
          ...(typeof rawShared.updatedAt === 'string' ? { updatedAt: rawShared.updatedAt } : {}),
        },
      },
    },
  };
}
