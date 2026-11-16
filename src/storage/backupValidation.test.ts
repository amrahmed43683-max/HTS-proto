import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBackupPayload,
  sanitizePreferences,
  validateBackupPayload,
} from './backupValidation';
import {
  cloneDefaultRoleSeeds,
  cloneDefaultSharedData,
} from './defaultSeeds';
import { HTS_BACKUP_APP, HTS_BACKUP_VERSION } from './types';

test('buildBackupPayload and validateBackupPayload round-trip cleanly', () => {
  const seeds = cloneDefaultRoleSeeds();
  const shared = cloneDefaultSharedData();
  shared.prescriptions.push({
    id: 'REQ-1001',
    patient: 'سالم العتيبي',
    drug: 'Metformin',
    dose: '500 mg',
    status: 'جديدة',
  });

  const payload = buildBackupPayload(
    seeds,
    shared,
    {
      isLoggedIn: true,
      activeRole: 'pharmacy',
      lastUsername: 'dr.ahmed',
      activePageByRole: { doctor: 'patients', pharmacy: 'orders' },
    },
    '2026-05-01T10:00:00.000Z'
  );

  const json = JSON.stringify(payload);
  const result = validateBackupPayload(json);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.backup.app, HTS_BACKUP_APP);
    assert.equal(result.backup.schemaVersion, HTS_BACKUP_VERSION);
    assert.equal(result.backup.data.sharedData.prescriptions.length, 1);
    assert.equal(result.backup.preferences?.activeRole, 'pharmacy');
    assert.equal(
      (result.backup.data.roleStates.doctor.patients as unknown[]).length,
      (seeds.doctor.patients as unknown[]).length
    );
  }
});

test('validateBackupPayload rejects empty input and malformed JSON', () => {
  const emptyRes = validateBackupPayload('   ');
  assert.equal(emptyRes.ok, false);
  if (!emptyRes.ok) {
    assert.equal(emptyRes.code, 'EMPTY_INPUT');
  }

  const badJsonRes = validateBackupPayload('{invalid json');
  assert.equal(badJsonRes.ok, false);
  if (!badJsonRes.ok) {
    assert.equal(badJsonRes.code, 'INVALID_JSON');
  }
});

test('validateBackupPayload rejects non-HTS files and unsupported schema versions', () => {
  const wrongApp = validateBackupPayload(
    JSON.stringify({
      app: 'OTHER_APP',
      schemaVersion: 1,
      data: {},
    })
  );
  assert.equal(wrongApp.ok, false);
  if (!wrongApp.ok) {
    assert.equal(wrongApp.code, 'INVALID_APP');
  }

  const wrongVersion = validateBackupPayload(
    JSON.stringify({
      app: HTS_BACKUP_APP,
      schemaVersion: 99,
      data: {},
    })
  );
  assert.equal(wrongVersion.ok, false);
  if (!wrongVersion.ok) {
    assert.equal(wrongVersion.code, 'UNSUPPORTED_VERSION');
  }
});

test('validateBackupPayload rejects missing role data or corrupt record arrays', () => {
  const seeds = cloneDefaultRoleSeeds();
  const payload = buildBackupPayload(seeds, cloneDefaultSharedData());

  // Corrupt doctor.patients to non-array
  const brokenDoctor = JSON.parse(JSON.stringify(payload));
  brokenDoctor.data.roleStates.doctor.patients = { bad: true };
  const res1 = validateBackupPayload(brokenDoctor);
  assert.equal(res1.ok, false);
  if (!res1.ok) {
    assert.equal(res1.code, 'INVALID_ROLE_STATES');
  }

  // Corrupt item inside sharedData.labOrders to primitive
  const brokenShared = JSON.parse(JSON.stringify(payload));
  brokenShared.data.sharedData.labOrders = ['not-an-object'];
  const res2 = validateBackupPayload(brokenShared);
  assert.equal(res2.ok, false);
  if (!res2.ok) {
    assert.equal(res2.code, 'INVALID_SHARED_DATA');
  }

  // Missing patient.appointments.upcoming
  const brokenPatientAppts = JSON.parse(JSON.stringify(payload));
  brokenPatientAppts.data.roleStates.patient.appointments = { past: [] };
  const res3 = validateBackupPayload(brokenPatientAppts);
  assert.equal(res3.ok, false);
  if (!res3.ok) {
    assert.equal(res3.code, 'INVALID_ROLE_STATES');
  }
});

test('validateBackupPayload strips dangerous prototype keys and sanitizes invalid preferences', () => {
  const seeds = cloneDefaultRoleSeeds();
  const payload = buildBackupPayload(seeds, cloneDefaultSharedData());
  const rawWithProto = JSON.stringify({
    ...payload,
    data: {
      ...payload.data,
      sharedData: {
        ...payload.data.sharedData,
        prescriptions: [
          JSON.parse('{"id":"RX-1","drug":"Aspirin","__proto__":{"polluted":true}}'),
        ],
      },
    },
  });

  const validated = validateBackupPayload(rawWithProto);
  assert.equal(validated.ok, true);
  if (validated.ok) {
    const rx = validated.backup.data.sharedData.prescriptions[0];
    assert.equal(Object.prototype.hasOwnProperty.call(rx, '__proto__'), false);
    assert.equal(rx.drug, 'Aspirin');
  }

  const sanitizedPrefs = sanitizePreferences({
    isLoggedIn: 'yes',
    activeRole: 'admin_hack',
    lastUsername: 'nurse',
    activePageByRole: { doctor: 'patients', invalid: 'foo' },
    theme: 'dark',
  });
  assert.equal(sanitizedPrefs.isLoggedIn, false);
  assert.equal(sanitizedPrefs.activeRole, 'doctor');
  assert.equal(sanitizedPrefs.lastUsername, 'nurse');
  assert.deepEqual(sanitizedPrefs.activePageByRole, { doctor: 'patients' });
  assert.equal(sanitizedPrefs.theme, 'dark');

  const fallbackTheme = sanitizePreferences({ theme: 'neon' });
  assert.equal(fallbackTheme.theme, 'light');
});
