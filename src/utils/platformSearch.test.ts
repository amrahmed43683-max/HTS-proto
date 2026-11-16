import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cloneDefaultRoleSeeds,
  cloneDefaultSharedData,
} from '../storage/defaultSeeds';
import {
  buildGlobalSearchIndex,
  buildUnifiedNotifications,
  searchPlatformItems,
} from './platformSearch';

test('patient role search index is strictly isolated from doctor, hospital, and other roles', () => {
  const seeds = cloneDefaultRoleSeeds();
  const shared = cloneDefaultSharedData();
  shared.prescriptions.push({
    id: 'RX-99',
    patient: 'سالم المنصور',
    drug: 'Atorvastatin',
    dose: '20mg',
    status: 'جديدة',
  });

  const patientIndex = buildGlobalSearchIndex(seeds, shared, 'patient');
  assert.ok(patientIndex.length > 0);
  assert.equal(
    patientIndex.every((item) => item.role === 'patient'),
    true
  );

  // Patient searching for doctor's clinical pages or pharmacy-only items must not leak other roles
  const hospitalMatches = searchPlatformItems(patientIndex, 'طوابير المستشفيات');
  assert.equal(hospitalMatches.length, 0);

  const sharedPharmMatches = searchPlatformItems(patientIndex, 'Atorvastatin');
  assert.equal(sharedPharmMatches.length, 0);
});

test('doctor role search index finds doctor patients and stays isolated to doctor', () => {
  const seeds = cloneDefaultRoleSeeds();
  const shared = cloneDefaultSharedData();
  const doctorIndex = buildGlobalSearchIndex(seeds, shared, 'doctor');

  assert.equal(
    doctorIndex.every((item) => item.role === 'doctor'),
    true
  );
  const patientMatches = searchPlatformItems(doctorIndex, 'أحمد محمد');
  assert.ok(patientMatches.some((m) => m.role === 'doctor' && m.page === 'patients'));
});

test('unified notifications are strictly isolated per role', () => {
  const seeds = cloneDefaultRoleSeeds();
  const shared = cloneDefaultSharedData();
  shared.labOrders.push({
    id: 'LAB-77',
    patient: 'فاطمة حسن',
    type: 'Lipid Profile',
    priority: 'urgent',
    createdAt: '2026-11-16',
  });

  const patientNotifs = buildUnifiedNotifications(seeds, shared, 'patient');
  assert.ok(patientNotifs.length > 0);
  assert.equal(
    patientNotifs.every((n) => n.role === 'patient'),
    true
  );

  const doctorNotifs = buildUnifiedNotifications(seeds, shared, 'doctor');
  assert.ok(doctorNotifs.length > 0);
  assert.equal(
    doctorNotifs.every((n) => n.role === 'doctor'),
    true
  );

  const labNotifs = buildUnifiedNotifications(seeds, shared, 'lab');
  assert.equal(
    labNotifs.every((n) => n.role === 'lab'),
    true
  );
  const urgentLab = labNotifs.find((n) => n.id === 'sh-lab-LAB-77');
  assert.ok(urgentLab);
  assert.equal(urgentLab.role, 'lab');
  assert.equal(urgentLab.severity, 'danger');
});
