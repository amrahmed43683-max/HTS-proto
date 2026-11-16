import {
  buildBackupPayload,
  sanitizeValue,
  validateBackupPayload,
} from './backupValidation';
import {
  cloneDefaultRoleSeeds,
  cloneDefaultSharedData,
} from './defaultSeeds';
import {
  extractAndCleanLegacyDomainLocalStorage,
  loadPreferences,
  savePreferences,
  setRoleActivePagePreference,
} from './preferences';
import {
  AllRoleStates,
  BackupPayload,
  HTS_BACKUP_VERSION,
  ROLE_IDS,
  RoleId,
  RoleStateData,
  SharedData,
  StorageStatusInfo,
  ThemeMode,
} from './types';

export const HTS_DB_NAME = 'HTSHealthPlatformDB';
export const HTS_DB_VERSION = 1;
const STORE_ROLE_STATES = 'roleStates';
const STORE_SHARED_DATA = 'sharedData';
const STORE_METADATA = 'metadata';
const BROADCAST_CHANNEL_NAME = 'hts_indexeddb_sync_v1';

export type StorageEventNotice =
  | { type: 'init' }
  | { type: 'role-updated'; role: RoleId; source?: string }
  | { type: 'shared-updated'; source?: string }
  | { type: 'theme-changed'; theme: ThemeMode }
  | { type: 'import' }
  | { type: 'reset' }
  | { type: 'status-changed' }
  | { type: 'error'; message: string };

interface RoleStateRecord {
  role: RoleId;
  data: RoleStateData;
  updatedAt: string;
}

interface SharedDataRecord extends SharedData {
  id: 'main';
  updatedAt: string;
}

interface MetadataRecord {
  key: 'system';
  schemaVersion: number;
  initializedAt: string;
  lastUpdatedAt: string;
  lastBackupAt: string | null;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function formatStorageError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'name' in err) {
    const name = String((err as { name?: unknown }).name || '');
    if (name === 'QuotaExceededError') {
      return 'مساحة التخزين المحلية في المتصفح ممتلئة (QuotaExceededError). يرجى تصدير نسخة احتياطية وتفريغ مساحة على القرص.';
    }
    if (name === 'VersionError') {
      return 'تعارض في إصدار قاعدة البيانات المحلية IndexedDB. يرجى تحديث الصفحة.';
    }
    if (name === 'InvalidStateError' || name === 'TransactionInactiveError') {
      return 'تعذر إتمام عملية الحفظ في قاعدة البيانات المحلية (المعاملة غير نشطة).';
    }
  }
  if (err instanceof Error && err.message) {
    return `${fallback}: ${err.message}`;
  }
  return fallback;
}

function countRoleRecords(state: RoleStateData | undefined): number {
  if (!state || typeof state !== 'object') return 0;
  let total = 0;
  for (const val of Object.values(state)) {
    if (Array.isArray(val)) {
      total += val.length;
    } else if (val && typeof val === 'object') {
      total += Object.keys(val).length;
    }
  }
  return total;
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB request failed'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
  });
}

class HTSIndexedDbManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<StorageStatusInfo> | null = null;
  private roleStatesCache: AllRoleStates = cloneDefaultRoleSeeds();
  private sharedDataCache: SharedData = cloneDefaultSharedData();
  private metadataCache: MetadataRecord = {
    key: 'system',
    schemaVersion: HTS_BACKUP_VERSION,
    initializedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    lastBackupAt: null,
  };
  private ready = false;
  private indexedDbSupported = typeof indexedDB !== 'undefined';
  private persistSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.storage) &&
    typeof navigator.storage.persist === 'function';
  private persisted: boolean | null = null;
  private usageBytes: number | null = null;
  private quotaBytes: number | null = null;
  private lastError: string | null = null;
  private listeners = new Set<(ev: StorageEventNotice) => void>();
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (msg) => {
          const payload = msg.data as { kind?: string; role?: RoleId } | null;
          if (!payload || !this.db) return;
          void this.reloadFromDbAndNotify(payload.kind, payload.role);
        };
      } catch {
        this.channel = null;
      }
    }
  }

  private emit(ev: StorageEventNotice): void {
    for (const listener of this.listeners) {
      try {
        listener(ev);
      } catch {
        // Isolate subscriber errors
      }
    }
  }

  private postBroadcast(kind: string, role?: RoleId): void {
    try {
      this.channel?.postMessage({ kind, role });
    } catch {
      // Ignore broadcast channel errors
    }
  }

  public subscribe(listener: (ev: StorageEventNotice) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async init(): Promise<StorageStatusInfo> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.performInit();
    return this.initPromise;
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('المتصفح لا يدعم IndexedDB'));
        return;
      }

      const request = indexedDB.open(HTS_DB_NAME, HTS_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_ROLE_STATES)) {
          db.createObjectStore(STORE_ROLE_STATES, { keyPath: 'role' });
        }
        if (!db.objectStoreNames.contains(STORE_SHARED_DATA)) {
          db.createObjectStore(STORE_SHARED_DATA, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error || new Error('فشل فتح قاعدة البيانات IndexedDB'));
      request.onblocked = () =>
        reject(new Error('تم حظر فتح قاعدة البيانات من تبويب آخر'));
    });
  }

  private async performInit(): Promise<StorageStatusInfo> {
    this.indexedDbSupported = typeof indexedDB !== 'undefined';

    try {
      if (!this.indexedDbSupported) {
        throw new Error('المتصفح الحالي لا يدعم قاعدة البيانات المحلية IndexedDB.');
      }

      const db = await this.openDatabase();
      this.db = db;

      db.onversionchange = () => {
        db.close();
        this.db = null;
      };

      const legacyShared = extractAndCleanLegacyDomainLocalStorage();
      await this.ensureInitializedAndLoadCache(legacyShared);
      await this.requestPersistentStorageInternal();

      this.ready = true;
      this.lastError = null;
      this.emit({ type: 'init' });
      this.emit({ type: 'status-changed' });
      return this.getStatus();
    } catch (err) {
      this.ready = true;
      this.lastError = formatStorageError(
        err,
        'تعذر تهيئة قاعدة البيانات المحلية IndexedDB، تم استخدام البيانات الافتراضية في الذاكرة المؤقتة'
      );
      this.emit({ type: 'error', message: this.lastError });
      this.emit({ type: 'status-changed' });
      return this.getStatus();
    }
  }

  private async ensureInitializedAndLoadCache(
    legacyShared: SharedData | null
  ): Promise<void> {
    if (!this.db) return;

    const txRead = this.db.transaction(
      [STORE_ROLE_STATES, STORE_SHARED_DATA, STORE_METADATA],
      'readonly'
    );
    const roleDocs = await reqToPromise(
      txRead.objectStore(STORE_ROLE_STATES).getAll() as IDBRequest<RoleStateRecord[]>
    );
    const sharedDoc = await reqToPromise(
      txRead.objectStore(STORE_SHARED_DATA).get('main') as IDBRequest<SharedDataRecord | undefined>
    );
    const metaDoc = await reqToPromise(
      txRead.objectStore(STORE_METADATA).get('system') as IDBRequest<MetadataRecord | undefined>
    );
    await txDone(txRead);

    const defaults = cloneDefaultRoleSeeds();
    const defaultShared = cloneDefaultSharedData();
    const nowIso = new Date().toISOString();

    const existingMap = new Map<RoleId, RoleStateRecord>();
    for (const rec of roleDocs) {
      if (rec && rec.role && rec.data) {
        existingMap.set(rec.role, rec);
      }
    }

    const missingRoles = ROLE_IDS.filter((r) => !existingMap.has(r));
    const needSharedSeed = !sharedDoc;
    const needMetaSeed = !metaDoc;

    if (missingRoles.length > 0 || needSharedSeed || needMetaSeed || legacyShared) {
      const txWrite = this.db.transaction(
        [STORE_ROLE_STATES, STORE_SHARED_DATA, STORE_METADATA],
        'readwrite'
      );
      const roleStore = txWrite.objectStore(STORE_ROLE_STATES);
      const sharedStore = txWrite.objectStore(STORE_SHARED_DATA);
      const metaStore = txWrite.objectStore(STORE_METADATA);

      for (const role of missingRoles) {
        const rec: RoleStateRecord = {
          role,
          data: defaults[role],
          updatedAt: nowIso,
        };
        roleStore.put(rec);
        existingMap.set(role, rec);
      }

      let finalShared: SharedDataRecord;
      if (!sharedDoc) {
        finalShared = {
          id: 'main',
          prescriptions: legacyShared?.prescriptions || defaultShared.prescriptions,
          labOrders: legacyShared?.labOrders || defaultShared.labOrders,
          pharmacyRequests: legacyShared?.pharmacyRequests || defaultShared.pharmacyRequests,
          events: legacyShared?.events || defaultShared.events,
          updatedAt: nowIso,
        };
        sharedStore.put(finalShared);
      } else if (legacyShared) {
        finalShared = {
          ...sharedDoc,
          id: 'main',
          prescriptions: [...legacyShared.prescriptions, ...(sharedDoc.prescriptions || [])],
          labOrders: [...legacyShared.labOrders, ...(sharedDoc.labOrders || [])],
          pharmacyRequests: [...legacyShared.pharmacyRequests, ...(sharedDoc.pharmacyRequests || [])],
          events: [...legacyShared.events, ...(sharedDoc.events || [])],
          updatedAt: nowIso,
        };
        sharedStore.put(finalShared);
      } else {
        finalShared = sharedDoc;
      }

      const finalMeta: MetadataRecord = metaDoc || {
        key: 'system',
        schemaVersion: HTS_BACKUP_VERSION,
        initializedAt: nowIso,
        lastUpdatedAt: nowIso,
        lastBackupAt: null,
      };
      if (needMetaSeed) {
        metaStore.put(finalMeta);
      }

      await txDone(txWrite);

      this.sharedDataCache = {
        prescriptions: deepClone(finalShared.prescriptions || []),
        labOrders: deepClone(finalShared.labOrders || []),
        pharmacyRequests: deepClone(finalShared.pharmacyRequests || []),
        events: deepClone(finalShared.events || []),
        updatedAt: finalShared.updatedAt,
      };
      this.metadataCache = finalMeta;
    } else if (sharedDoc && metaDoc) {
      this.sharedDataCache = {
        prescriptions: deepClone(sharedDoc.prescriptions || []),
        labOrders: deepClone(sharedDoc.labOrders || []),
        pharmacyRequests: deepClone(sharedDoc.pharmacyRequests || []),
        events: deepClone(sharedDoc.events || []),
        updatedAt: sharedDoc.updatedAt,
      };
      this.metadataCache = metaDoc;
    }

    const assembled = {} as AllRoleStates;
    for (const role of ROLE_IDS) {
      const rec = existingMap.get(role);
      assembled[role] = rec ? deepClone(rec.data) : defaults[role];
    }
    this.roleStatesCache = assembled;
  }

  private async reloadFromDbAndNotify(kind?: string, role?: RoleId): Promise<void> {
    if (!this.db) return;
    try {
      await this.ensureInitializedAndLoadCache(null);
      await this.refreshStorageEstimate();
      if (kind === 'role-updated' && role) {
        this.emit({ type: 'role-updated', role, source: 'broadcast' });
      } else if (kind === 'shared-updated') {
        this.emit({ type: 'shared-updated', source: 'broadcast' });
      } else if (kind === 'import') {
        this.emit({ type: 'import' });
      } else if (kind === 'reset') {
        this.emit({ type: 'reset' });
      }
      this.emit({ type: 'status-changed' });
    } catch {
      // Ignore transient cross-tab read issues
    }
  }

  private async requestPersistentStorageInternal(): Promise<boolean | null> {
    if (typeof navigator === 'undefined' || !navigator.storage) {
      this.persistSupported = false;
      this.persisted = null;
      return null;
    }

    this.persistSupported = typeof navigator.storage.persist === 'function';

    try {
      if (typeof navigator.storage.persisted === 'function') {
        const already = await navigator.storage.persisted();
        if (already) {
          this.persisted = true;
        } else if (this.persistSupported) {
          this.persisted = await navigator.storage.persist();
        }
      } else if (this.persistSupported) {
        this.persisted = await navigator.storage.persist();
      }
    } catch {
      this.persisted = null;
    }

    await this.refreshStorageEstimate();
    return this.persisted;
  }

  public async requestPersistentStorage(): Promise<boolean | null> {
    const res = await this.requestPersistentStorageInternal();
    this.emit({ type: 'status-changed' });
    return res;
  }

  public async refreshStorageEstimate(): Promise<void> {
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.storage &&
        typeof navigator.storage.estimate === 'function'
      ) {
        const est = await navigator.storage.estimate();
        this.usageBytes = typeof est.usage === 'number' ? est.usage : null;
        this.quotaBytes = typeof est.quota === 'number' ? est.quota : null;
      }
    } catch {
      // Optional API; ignore errors
    }
  }

  public getRoleStateSync(role: RoleId): RoleStateData {
    return deepClone(this.roleStatesCache[role]);
  }

  public getAllRoleStatesSync(): AllRoleStates {
    return deepClone(this.roleStatesCache);
  }

  public getSharedDataSync(): SharedData {
    return deepClone(this.sharedDataCache);
  }

  public getActivePagePreference(role: RoleId): string | undefined {
    const prefs = loadPreferences();
    return prefs.activePageByRole[role];
  }

  public setActivePagePreference(role: RoleId, page: string): void {
    setRoleActivePagePreference(role, page);
  }

  public getThemePreference(): ThemeMode {
    return loadPreferences().theme;
  }

  public setThemePreference(theme: ThemeMode): void {
    savePreferences({ theme });
    this.emit({ type: 'theme-changed', theme });
  }

  public async saveRoleState(role: RoleId, stateObj: RoleStateData): Promise<boolean> {
    const clean = sanitizeValue(deepClone(stateObj));
    const nowIso = new Date().toISOString();
    this.roleStatesCache[role] = clean;
    this.metadataCache.lastUpdatedAt = nowIso;
    this.emit({ type: 'role-updated', role, source: 'self' });

    if (!this.db) {
      return false;
    }

    try {
      const tx = this.db.transaction([STORE_ROLE_STATES, STORE_METADATA], 'readwrite');
      tx.objectStore(STORE_ROLE_STATES).put({
        role,
        data: clean,
        updatedAt: nowIso,
      } satisfies RoleStateRecord);
      tx.objectStore(STORE_METADATA).put({
        ...this.metadataCache,
        lastUpdatedAt: nowIso,
      } satisfies MetadataRecord);
      await txDone(tx);
      await this.refreshStorageEstimate();
      this.lastError = null;
      this.postBroadcast('role-updated', role);
      this.emit({ type: 'status-changed' });
      return true;
    } catch (err) {
      this.lastError = formatStorageError(
        err,
        'تعذر حفظ التعديلات في قاعدة البيانات المحلية IndexedDB'
      );
      this.emit({ type: 'error', message: this.lastError });
      this.emit({ type: 'status-changed' });
      return false;
    }
  }

  public async saveSharedData(shared: SharedData): Promise<boolean> {
    const nowIso = new Date().toISOString();
    const normalized: SharedDataRecord = {
      id: 'main',
      prescriptions: sanitizeValue(deepClone(shared.prescriptions || [])),
      labOrders: sanitizeValue(deepClone(shared.labOrders || [])),
      pharmacyRequests: sanitizeValue(deepClone(shared.pharmacyRequests || [])),
      events: sanitizeValue(deepClone(shared.events || [])),
      updatedAt: nowIso,
    };

    this.sharedDataCache = {
      prescriptions: deepClone(normalized.prescriptions),
      labOrders: deepClone(normalized.labOrders),
      pharmacyRequests: deepClone(normalized.pharmacyRequests),
      events: deepClone(normalized.events),
      updatedAt: nowIso,
    };
    this.metadataCache.lastUpdatedAt = nowIso;
    this.emit({ type: 'shared-updated', source: 'self' });

    if (!this.db) return false;

    try {
      const tx = this.db.transaction([STORE_SHARED_DATA, STORE_METADATA], 'readwrite');
      tx.objectStore(STORE_SHARED_DATA).put(normalized);
      tx.objectStore(STORE_METADATA).put({
        ...this.metadataCache,
        lastUpdatedAt: nowIso,
      } satisfies MetadataRecord);
      await txDone(tx);
      await this.refreshStorageEstimate();
      this.lastError = null;
      this.postBroadcast('shared-updated');
      this.emit({ type: 'status-changed' });
      return true;
    } catch (err) {
      this.lastError = formatStorageError(
        err,
        'تعذر حفظ الطلب المشترك في قاعدة البيانات المحلية IndexedDB'
      );
      this.emit({ type: 'error', message: this.lastError });
      this.emit({ type: 'status-changed' });
      return false;
    }
  }

  public addSharedRequest(
    type: 'prescriptions' | 'labOrders' | 'pharmacyRequests',
    item: Record<string, unknown>
  ): Record<string, unknown> {
    const next = deepClone(this.sharedDataCache);
    const enriched: Record<string, unknown> = {
      ...sanitizeValue(item),
      id:
        typeof item.id === 'string' && item.id
          ? item.id
          : `REQ-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      createdAt:
        typeof item.createdAt === 'string' && item.createdAt
          ? item.createdAt
          : new Date().toLocaleString('ar-EG'),
    };

    if (!Array.isArray(next[type])) {
      next[type] = [];
    }
    next[type].unshift(enriched);

    if (!Array.isArray(next.events)) {
      next.events = [];
    }
    next.events.unshift({
      type,
      id: enriched.id,
      time: enriched.createdAt,
    });

    void this.saveSharedData(next);
    return enriched;
  }

  public async exportBackupJson(): Promise<{
    ok: boolean;
    filename?: string;
    jsonString?: string;
    payload?: BackupPayload;
    error?: string;
  }> {
    try {
      await this.init();

      let roleStates = deepClone(this.roleStatesCache);
      let sharedData = deepClone(this.sharedDataCache);

      if (this.db) {
        const txRead = this.db.transaction(
          [STORE_ROLE_STATES, STORE_SHARED_DATA],
          'readonly'
        );
        const roleDocs = await reqToPromise(
          txRead.objectStore(STORE_ROLE_STATES).getAll() as IDBRequest<RoleStateRecord[]>
        );
        const sharedDoc = await reqToPromise(
          txRead.objectStore(STORE_SHARED_DATA).get('main') as IDBRequest<
            SharedDataRecord | undefined
          >
        );
        await txDone(txRead);

        if (roleDocs.length === ROLE_IDS.length) {
          const map = {} as AllRoleStates;
          for (const rec of roleDocs) {
            map[rec.role] = rec.data;
          }
          roleStates = map;
        }
        if (sharedDoc) {
          sharedData = {
            prescriptions: sharedDoc.prescriptions || [],
            labOrders: sharedDoc.labOrders || [],
            pharmacyRequests: sharedDoc.pharmacyRequests || [],
            events: sharedDoc.events || [],
            updatedAt: sharedDoc.updatedAt,
          };
        }
      }

      const prefs = loadPreferences();
      const nowIso = new Date().toISOString();
      const payload = buildBackupPayload(roleStates, sharedData, prefs, nowIso);
      const jsonString = JSON.stringify(payload, null, 2);

      if (this.db) {
        try {
          const txMeta = this.db.transaction([STORE_METADATA], 'readwrite');
          this.metadataCache.lastBackupAt = nowIso;
          txMeta.objectStore(STORE_METADATA).put({ ...this.metadataCache });
          await txDone(txMeta);
        } catch {
          // Non-fatal metadata update failure
        }
      }

      const stamp = nowIso.slice(0, 16).replace(/[:T]/g, '-');
      const filename = `hts-health-backup-${stamp}.json`;
      this.emit({ type: 'status-changed' });
      return { ok: true, filename, jsonString, payload };
    } catch (err) {
      const error = formatStorageError(
        err,
        'فشل تصدير النسخة الاحتياطية من قاعدة البيانات'
      );
      this.lastError = error;
      this.emit({ type: 'status-changed' });
      return { ok: false, error };
    }
  }

  public async importBackupJson(rawText: string): Promise<{
    ok: boolean;
    error?: string;
    details?: string;
    restoredRole?: RoleId;
  }> {
    const validation = validateBackupPayload(rawText);
    if (!validation.ok) {
      this.lastError = validation.error;
      this.emit({ type: 'status-changed' });
      return {
        ok: false,
        error: validation.error,
        details: validation.details,
      };
    }

    const { backup } = validation;
    const nowIso = new Date().toISOString();

    try {
      await this.init();

      if (this.db) {
        const tx = this.db.transaction(
          [STORE_ROLE_STATES, STORE_SHARED_DATA, STORE_METADATA],
          'readwrite'
        );
        const roleStore = tx.objectStore(STORE_ROLE_STATES);
        const sharedStore = tx.objectStore(STORE_SHARED_DATA);
        const metaStore = tx.objectStore(STORE_METADATA);

        for (const role of ROLE_IDS) {
          roleStore.put({
            role,
            data: deepClone(backup.data.roleStates[role]),
            updatedAt: nowIso,
          } satisfies RoleStateRecord);
        }

        sharedStore.put({
          id: 'main',
          prescriptions: deepClone(backup.data.sharedData.prescriptions),
          labOrders: deepClone(backup.data.sharedData.labOrders),
          pharmacyRequests: deepClone(backup.data.sharedData.pharmacyRequests),
          events: deepClone(backup.data.sharedData.events),
          updatedAt: nowIso,
        } satisfies SharedDataRecord);

        const nextMeta: MetadataRecord = {
          ...this.metadataCache,
          lastUpdatedAt: nowIso,
          lastBackupAt: backup.exportedAt || nowIso,
        };
        metaStore.put(nextMeta);
        await txDone(tx);
        this.metadataCache = nextMeta;
      }

      this.roleStatesCache = deepClone(backup.data.roleStates);
      this.sharedDataCache = deepClone(backup.data.sharedData);

      let restoredRole: RoleId | undefined;
      if (backup.preferences) {
        const currentPrefs = loadPreferences();
        savePreferences({
          ...backup.preferences,
          isLoggedIn: currentPrefs.isLoggedIn || Boolean(backup.preferences.isLoggedIn),
        });
        restoredRole = backup.preferences.activeRole;
      }

      await this.refreshStorageEstimate();
      this.lastError = null;
      this.postBroadcast('import');
      this.emit({ type: 'import' });
      this.emit({ type: 'shared-updated' });
      this.emit({ type: 'status-changed' });
      return { ok: true, restoredRole };
    } catch (err) {
      const error = formatStorageError(
        err,
        'تعذر استيراد النسخة الاحتياطية إلى IndexedDB (تم الإبقاء على البيانات الحالية دون تغيير)'
      );
      this.lastError = error;
      this.emit({ type: 'status-changed' });
      return { ok: false, error };
    }
  }

  public async resetDemoData(): Promise<{ ok: boolean; error?: string }> {
    const nowIso = new Date().toISOString();
    const freshRoles = cloneDefaultRoleSeeds();
    const freshShared = cloneDefaultSharedData();

    try {
      await this.init();

      if (this.db) {
        const tx = this.db.transaction(
          [STORE_ROLE_STATES, STORE_SHARED_DATA, STORE_METADATA],
          'readwrite'
        );
        const roleStore = tx.objectStore(STORE_ROLE_STATES);
        const sharedStore = tx.objectStore(STORE_SHARED_DATA);
        const metaStore = tx.objectStore(STORE_METADATA);

        for (const role of ROLE_IDS) {
          roleStore.put({
            role,
            data: deepClone(freshRoles[role]),
            updatedAt: nowIso,
          } satisfies RoleStateRecord);
        }

        sharedStore.put({
          id: 'main',
          ...freshShared,
          updatedAt: nowIso,
        } satisfies SharedDataRecord);

        const nextMeta: MetadataRecord = {
          ...this.metadataCache,
          initializedAt: nowIso,
          lastUpdatedAt: nowIso,
        };
        metaStore.put(nextMeta);
        await txDone(tx);
        this.metadataCache = nextMeta;
      }

      this.roleStatesCache = freshRoles;
      this.sharedDataCache = freshShared;
      await this.refreshStorageEstimate();
      this.lastError = null;
      this.postBroadcast('reset');
      this.emit({ type: 'reset' });
      this.emit({ type: 'shared-updated' });
      this.emit({ type: 'status-changed' });
      return { ok: true };
    } catch (err) {
      const error = formatStorageError(
        err,
        'تعذر إعادة تعيين البيانات التجريبية في IndexedDB'
      );
      this.lastError = error;
      this.emit({ type: 'status-changed' });
      return { ok: false, error };
    }
  }

  public getStatus(): StorageStatusInfo {
    const recordCounts = {} as Record<RoleId, number>;
    for (const role of ROLE_IDS) {
      recordCounts[role] = countRoleRecords(this.roleStatesCache[role]);
    }
    const sharedCount =
      (this.sharedDataCache.prescriptions?.length || 0) +
      (this.sharedDataCache.labOrders?.length || 0) +
      (this.sharedDataCache.pharmacyRequests?.length || 0);

    return {
      dbName: HTS_DB_NAME,
      schemaVersion: HTS_DB_VERSION,
      indexedDbSupported: this.indexedDbSupported,
      ready: this.ready,
      persisted: this.persisted,
      persistSupported: this.persistSupported,
      usageBytes: this.usageBytes,
      quotaBytes: this.quotaBytes,
      initializedAt: this.metadataCache.initializedAt || null,
      lastUpdatedAt: this.metadataCache.lastUpdatedAt || null,
      lastBackupAt: this.metadataCache.lastBackupAt || null,
      recordCounts,
      sharedCount,
      lastError: this.lastError,
    };
  }
}

export const htsStorage = new HTSIndexedDbManager();

declare global {
  interface Window {
    HTSStorage?: HTSIndexedDbManager;
  }
}

if (typeof window !== 'undefined') {
  window.HTSStorage = htsStorage;
}
