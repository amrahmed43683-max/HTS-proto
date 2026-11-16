export const ROLE_IDS = [
  'doctor',
  'patient',
  'pharmacy',
  'lab',
  'insurance',
  'hospital',
] as const;

export type RoleId = (typeof ROLE_IDS)[number];

export const HTS_BACKUP_APP = 'HTS_HEALTH_PLATFORM' as const;
export const HTS_BACKUP_VERSION = 1 as const;

export interface SharedData {
  prescriptions: Record<string, unknown>[];
  labOrders: Record<string, unknown>[];
  pharmacyRequests: Record<string, unknown>[];
  events: Record<string, unknown>[];
  updatedAt?: string;
}

export type ThemeMode = 'light' | 'dark';

export interface UserPreferences {
  isLoggedIn: boolean;
  activeRole: RoleId;
  lastUsername: string;
  activePageByRole: Partial<Record<RoleId, string>>;
  theme: ThemeMode;
}

export type RoleStateData = Record<string, unknown>;
export type AllRoleStates = Record<RoleId, RoleStateData>;

export interface BackupPayload {
  app: typeof HTS_BACKUP_APP;
  schemaVersion: typeof HTS_BACKUP_VERSION;
  exportedAt: string;
  preferences?: Partial<UserPreferences>;
  data: {
    roleStates: AllRoleStates;
    sharedData: SharedData;
  };
}

export type BackupValidationResult =
  | {
      ok: true;
      backup: BackupPayload;
    }
  | {
      ok: false;
      code:
        | 'EMPTY_INPUT'
        | 'INVALID_JSON'
        | 'INVALID_ROOT'
        | 'INVALID_APP'
        | 'UNSUPPORTED_VERSION'
        | 'MISSING_DATA'
        | 'INVALID_ROLE_STATES'
        | 'INVALID_SHARED_DATA'
        | 'INVALID_PREFERENCES';
      error: string;
      details?: string;
    };

export interface StorageStatusInfo {
  dbName: string;
  schemaVersion: number;
  indexedDbSupported: boolean;
  ready: boolean;
  persisted: boolean | null;
  persistSupported: boolean;
  usageBytes: number | null;
  quotaBytes: number | null;
  initializedAt: string | null;
  lastUpdatedAt: string | null;
  lastBackupAt: string | null;
  recordCounts: Record<RoleId, number>;
  sharedCount: number;
  lastError: string | null;
}
