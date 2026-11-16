import { AllRoleStates, RoleId, SharedData } from '../storage/types';

export interface SearchEntry {
  id: string;
  title: string;
  subtitle: string;
  role: RoleId;
  roleLabel: string;
  page: string;
  category:
    | 'page'
    | 'patient'
    | 'prescription'
    | 'lab'
    | 'inventory'
    | 'claim'
    | 'clinic'
    | 'alert'
    | 'appointment';
  keywords: string;
}

export interface UnifiedNotification {
  id: string;
  title: string;
  detail: string;
  role: RoleId;
  roleLabel: string;
  page: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  time: string;
}

export const ROLE_META: Record<RoleId, { label: string; icon: string }> = {
  doctor: { label: 'الطبيب', icon: '👨‍⚕️' },
  patient: { label: 'المريض', icon: '🧑‍🦽' },
  pharmacy: { label: 'الصيدلية', icon: '💊' },
  lab: { label: 'التحاليل', icon: '🧪' },
  insurance: { label: 'التأمين', icon: '🛡️' },
  hospital: { label: 'المستشفى', icon: '🏥' },
};

export const ROLE_PAGE_CATALOG: Record<RoleId, Array<{ page: string; label: string }>> = {
  doctor: [
    { page: 'dashboard', label: 'لوحة التحكم' },
    { page: 'patients', label: 'مرضى اليوم' },
    { page: 'records', label: 'السجلات الطبية' },
    { page: 'examination', label: 'الكشف الطبي' },
    { page: 'prescriptions', label: 'الوصفات الطبية' },
    { page: 'labs', label: 'التحاليل الطبية' },
    { page: 'imaging', label: 'الأشعة' },
    { page: 'parallel', label: 'سير العمل الموازي' },
    { page: 'pending', label: 'الطلبات المعلقة' },
    { page: 'journey', label: 'رحلة المريض' },
  ],
  patient: [
    { page: 'dashboard', label: 'الرئيسية' },
    { page: 'queue', label: 'دوري الآن' },
    { page: 'appointments', label: 'المواعيد' },
    { page: 'doctor', label: 'طبيبي اليوم' },
    { page: 'profile', label: 'ملفي الصحي' },
    { page: 'prescriptions', label: 'الوصفات' },
    { page: 'results', label: 'التحاليل والتقارير' },
    { page: 'notifications', label: 'الإشعارات' },
    { page: 'complaints', label: 'الشكاوى' },
  ],
  pharmacy: [
    { page: 'dashboard', label: 'لوحة التحكم' },
    { page: 'orders', label: 'كل الوصفات' },
    { page: 'preparing', label: 'قيد التجهيز' },
    { page: 'ready', label: 'جاهز للاستلام' },
    { page: 'dispensed', label: 'سجل الصرف' },
    { page: 'unavailable', label: 'غير متوفر' },
    { page: 'journey', label: 'رحلة الوصفة' },
    { page: 'parallel', label: 'التشغيل الموازي' },
    { page: 'pending', label: 'الطلبات المعلقة' },
    { page: 'bottlenecks', label: 'الاختناقات' },
    { page: 'inventory', label: 'المخزون' },
    { page: 'issues', label: 'مشاكل الصيدلية' },
  ],
  lab: [
    { page: 'dashboard', label: 'لوحة التحكم' },
    { page: 'orders', label: 'طلبات التحاليل' },
    { page: 'journey', label: 'رحلة العينة' },
    { page: 'review', label: 'بانتظار الاعتماد' },
    { page: 'ready', label: 'النتائج الجاهزة' },
    { page: 'parallel', label: 'التشغيل الموازي' },
    { page: 'late', label: 'المتأخرات' },
    { page: 'bottlenecks', label: 'الاختناقات' },
    { page: 'issues', label: 'مشاكل المعمل' },
  ],
  insurance: [
    { page: 'dashboard', label: 'لوحة التحكم' },
    { page: 'appointments', label: 'مواعيد الشبكة' },
    { page: 'clinics', label: 'ضغط العيادات التابعة' },
    { page: 'queues', label: 'طوابير المستشفيات' },
    { page: 'claims', label: 'طلبات التأمين' },
    { page: 'incomplete', label: 'الطلبات الناقصة' },
    { page: 'late', label: 'الطلبات المتأخرة' },
    { page: 'parallel', label: 'التشغيل الموازي' },
    { page: 'journey', label: 'رحلة المريض' },
    { page: 'bottlenecks', label: 'الاختناقات' },
    { page: 'history', label: 'سجل المراجعة' },
  ],
  hospital: [
    { page: 'dashboard', label: 'الرئيسية' },
    { page: 'parallel', label: 'التشغيل الموازي' },
    { page: 'clinics', label: 'ضغط العيادات' },
    { page: 'appointments', label: 'المواعيد' },
    { page: 'queues', label: 'الطوابير' },
    { page: 'journey', label: 'رحلة المريض' },
    { page: 'pending', label: 'الطلبات المتوقفة' },
    { page: 'bottlenecks', label: 'الاختناقات' },
  ],
};

function asArr(v: unknown): Array<Record<string, unknown>> {
  return Array.isArray(v)
    ? v.filter((x): x is Record<string, unknown> => Boolean(x && typeof x === 'object'))
    : [];
}

function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
}

/**
 * Strictly indexes ONLY pages and records belonging to `allowedRole`.
 * Ensures a logged-in user (e.g., patient, doctor, hospital) can never
 * discover or navigate to any other role's workspace.
 */
export function buildGlobalSearchIndex(
  roleStates: AllRoleStates,
  sharedData: SharedData,
  allowedRole: RoleId
): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const roleLabel = `${ROLE_META[allowedRole].icon} ${ROLE_META[allowedRole].label}`;

  for (const pg of ROLE_PAGE_CATALOG[allowedRole]) {
    entries.push({
      id: `page-${allowedRole}-${pg.page}`,
      title: pg.label,
      subtitle: `صفحة في بوابة ${ROLE_META[allowedRole].label}`,
      role: allowedRole,
      roleLabel,
      page: pg.page,
      category: 'page',
      keywords: `${pg.label} ${pg.page} ${ROLE_META[allowedRole].label}`.toLowerCase(),
    });
  }

  if (allowedRole === 'doctor') {
    const doc = asObj(roleStates.doctor);
    asArr(doc.patients).forEach((p, idx) => {
      const name = str(p.name);
      if (!name) return;
      entries.push({
        id: `doc-pat-${idx}`,
        title: name,
        subtitle: `مريض · ${str(p.chronic) || 'ملف طبي'} · الساعة ${str(p.time) || '—'}`,
        role: 'doctor',
        roleLabel,
        page: 'patients',
        category: 'patient',
        keywords: `${name} ${str(p.phone)} ${str(p.allergy)} ${str(p.chronic)} ${str(p.meds)}`.toLowerCase(),
      });
    });

    asArr(doc.prescriptions).forEach((rx, idx) => {
      const drug = str(rx.drug);
      if (!drug) return;
      entries.push({
        id: `doc-rx-${idx}`,
        title: `وصفة: ${drug}`,
        subtitle: `للمريض ${str(rx.patient)} · ${str(rx.dose)}`,
        role: 'doctor',
        roleLabel,
        page: 'prescriptions',
        category: 'prescription',
        keywords: `${drug} ${str(rx.patient)} ${str(rx.dose)}`.toLowerCase(),
      });
    });

    asArr(doc.labOrders).forEach((lo, idx) => {
      const test = str(lo.type);
      if (!test) return;
      entries.push({
        id: `doc-lab-${idx}`,
        title: `تحليل: ${test}`,
        subtitle: `للمريض ${str(lo.patient)} · ${str(lo.status)}`,
        role: 'doctor',
        roleLabel,
        page: 'labs',
        category: 'lab',
        keywords: `${test} ${str(lo.patient)} ${str(lo.status)}`.toLowerCase(),
      });
    });
  } else if (allowedRole === 'patient') {
    const pat = asObj(roleStates.patient);
    const appts = asObj(pat.appointments);

    [...asArr(appts.upcoming), ...asArr(appts.past)].forEach((ap, idx) => {
      const title = str(ap.doctor || ap.clinic || ap.specialty);
      if (!title) return;
      entries.push({
        id: `pat-appt-${idx}`,
        title: `موعد: ${title}`,
        subtitle: `${str(ap.date)} · ${str(ap.time)} · ${str(ap.clinic || '')}`.trim(),
        role: 'patient',
        roleLabel,
        page: 'appointments',
        category: 'appointment',
        keywords: `${title} ${str(ap.clinic)} ${str(ap.date)} موعد`.toLowerCase(),
      });
    });

    asArr(pat.prescriptions).forEach((rx, idx) => {
      const drug = str(rx.drug || rx.name);
      if (!drug) return;
      entries.push({
        id: `pat-rx-${idx}`,
        title: `وصفتي: ${drug}`,
        subtitle: `${str(rx.dose)} · ${str(rx.status || 'نشطة')}`,
        role: 'patient',
        roleLabel,
        page: 'prescriptions',
        category: 'prescription',
        keywords: `${drug} ${str(rx.dose)} ${str(rx.doctor)} دواء وصفة`.toLowerCase(),
      });
    });

    asArr(pat.labResults).forEach((res, idx) => {
      const test = str(res.test || res.name);
      if (!test) return;
      entries.push({
        id: `pat-res-${idx}`,
        title: `نتيجة تحليل: ${test}`,
        subtitle: `${str(res.date)} · ${str(res.status || res.result || '')}`,
        role: 'patient',
        roleLabel,
        page: 'results',
        category: 'lab',
        keywords: `${test} ${str(res.status)} ${str(res.result)} تحليل`.toLowerCase(),
      });
    });
  } else if (allowedRole === 'pharmacy') {
    const pharm = asObj(roleStates.pharmacy);
    asArr(pharm.orders).forEach((ord, idx) => {
      const drug = str(ord.drug || ord.medicine);
      const patient = str(ord.patient);
      if (!drug && !patient) return;
      entries.push({
        id: `pharm-ord-${idx}`,
        title: `${drug || 'طلب دواء'} — ${patient || 'مريض'}`,
        subtitle: `طلب صيدلية · الحالة: ${str(ord.status) || 'جديد'}`,
        role: 'pharmacy',
        roleLabel,
        page: 'orders',
        category: 'prescription',
        keywords: `${drug} ${patient} ${str(ord.status)}`.toLowerCase(),
      });
    });

    asArr(pharm.inventory).forEach((item, idx) => {
      const name = str(item.name || item.drug);
      if (!name) return;
      entries.push({
        id: `pharm-inv-${idx}`,
        title: `مخزون: ${name}`,
        subtitle: `الكمية المتوفرة: ${str(item.qty ?? item.stock ?? item.quantity)}`,
        role: 'pharmacy',
        roleLabel,
        page: 'inventory',
        category: 'inventory',
        keywords: `${name} ${str(item.category)} مخزون`.toLowerCase(),
      });
    });

    asArr(sharedData.prescriptions).forEach((rx, idx) => {
      entries.push({
        id: `shared-rx-${idx}`,
        title: `وصفة واردة: ${str(rx.drug) || 'دواء'}`,
        subtitle: `للمريض ${str(rx.patient) || '—'} · ${str(rx.status) || 'جديدة'}`,
        role: 'pharmacy',
        roleLabel,
        page: 'orders',
        category: 'prescription',
        keywords: `${str(rx.drug)} ${str(rx.patient)} ${str(rx.id)}`.toLowerCase(),
      });
    });
  } else if (allowedRole === 'lab') {
    const lab = asObj(roleStates.lab);
    asArr(lab.orders).forEach((ord, idx) => {
      const test = str(ord.test || ord.type);
      const patient = str(ord.patient);
      if (!test && !patient) return;
      entries.push({
        id: `lab-ord-${idx}`,
        title: `تحليل ${test || ''} — ${patient || ''}`.trim(),
        subtitle: `المعمل · ${str(ord.status) || 'قيد التنفيذ'}`,
        role: 'lab',
        roleLabel,
        page: 'orders',
        category: 'lab',
        keywords: `${test} ${patient} ${str(ord.status)} تحليل معمل`.toLowerCase(),
      });
    });

    asArr(sharedData.labOrders).forEach((lo, idx) => {
      entries.push({
        id: `shared-lab-${idx}`,
        title: `طلب تحليل وارد: ${str(lo.type) || 'تحليل'}`,
        subtitle: `للمريض ${str(lo.patient) || '—'} · ${str(lo.status) || 'جديد'}`,
        role: 'lab',
        roleLabel,
        page: 'orders',
        category: 'lab',
        keywords: `${str(lo.type)} ${str(lo.patient)} ${str(lo.id)}`.toLowerCase(),
      });
    });
  } else if (allowedRole === 'insurance') {
    const ins = asObj(roleStates.insurance);
    asArr(ins.claims).forEach((cl, idx) => {
      const patient = str(cl.patient);
      const service = str(cl.service || cl.type || cl.title);
      if (!patient && !service) return;
      entries.push({
        id: `ins-claim-${idx}`,
        title: `مطالبة: ${patient || service}`,
        subtitle: `${service} · ${str(cl.status) || 'مراجعة'}`,
        role: 'insurance',
        roleLabel,
        page: 'claims',
        category: 'claim',
        keywords: `${patient} ${service} ${str(cl.status)} تأمين مطالبة`.toLowerCase(),
      });
    });

    asArr(ins.clinics).forEach((c, idx) => {
      const name = str(c.name);
      if (!name) return;
      entries.push({
        id: `ins-clinic-${idx}`,
        title: name,
        subtitle: `عيادة بالشبكة · ${str(c.status || c.load || '')}`,
        role: 'insurance',
        roleLabel,
        page: 'clinics',
        category: 'clinic',
        keywords: `${name} عيادة شبكة`.toLowerCase(),
      });
    });
  } else if (allowedRole === 'hospital') {
    const hosp = asObj(roleStates.hospital);
    asArr(hosp.clinics).forEach((c, idx) => {
      const name = str(c.name);
      if (!name) return;
      entries.push({
        id: `hosp-clinic-${idx}`,
        title: name,
        subtitle: `عيادة بالمستشفى · ${str(c.doctor) || ''}`,
        role: 'hospital',
        roleLabel,
        page: 'clinics',
        category: 'clinic',
        keywords: `${name} ${str(c.doctor)} عيادة مستشفى`.toLowerCase(),
      });
    });

    asArr(hosp.appointments).forEach((ap, idx) => {
      const patName = str(ap.patient || ap.name);
      if (!patName) return;
      entries.push({
        id: `hosp-appt-${idx}`,
        title: `موعد: ${patName}`,
        subtitle: `${str(ap.clinic || '')} · ${str(ap.time || '')}`,
        role: 'hospital',
        roleLabel,
        page: 'appointments',
        category: 'appointment',
        keywords: `${patName} ${str(ap.clinic)} ${str(ap.status)}`.toLowerCase(),
      });
    });
  }

  return entries;
}

export function searchPlatformItems(
  entries: SearchEntry[],
  query: string,
  limit = 16
): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return entries.filter((e) => e.category === 'page').slice(0, limit);
  }

  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: Array<{ item: SearchEntry; score: number }> = [];

  for (const item of entries) {
    const titleLower = item.title.toLowerCase();
    const hay = `${titleLower} ${item.subtitle.toLowerCase()} ${item.keywords}`;
    if (!tokens.every((t) => hay.includes(t))) continue;

    let score = 1;
    if (titleLower.startsWith(q)) score += 6;
    else if (titleLower.includes(q)) score += 4;
    if (item.category !== 'page') score += 2;
    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

/**
 * Strictly aggregates notifications ONLY for `allowedRole`.
 */
export function buildUnifiedNotifications(
  roleStates: AllRoleStates,
  sharedData: SharedData,
  allowedRole: RoleId
): UnifiedNotification[] {
  const list: UnifiedNotification[] = [];
  const roleLabel = ROLE_META[allowedRole].label;

  if (allowedRole === 'doctor') {
    const doc = asObj(roleStates.doctor);
    asArr(doc.pendingRequests).forEach((p, idx) => {
      list.push({
        id: `doc-pend-${idx}`,
        title: `طلب معلق بالعيادة: ${str(p.title || p.patient || p.type)}`,
        detail: str(p.reason || p.owner || 'بانتظار المتابعة'),
        role: 'doctor',
        roleLabel,
        page: 'pending',
        severity: 'warning',
        time: str(p.wait || p.duration) || 'نشط',
      });
    });
    asArr(doc.labResults).forEach((r, idx) => {
      list.push({
        id: `doc-res-${idx}`,
        title: `نتيجة تحليل: ${str(r.test)} — ${str(r.patient)}`,
        detail: `${str(r.result)} (${str(r.status)})`,
        role: 'doctor',
        roleLabel,
        page: 'labs',
        severity: str(r.status) === 'مرتفع' ? 'danger' : 'info',
        time: str(r.date) || 'اليوم',
      });
    });
  } else if (allowedRole === 'patient') {
    const pat = asObj(roleStates.patient);
    asArr(pat.notifications).forEach((n, idx) => {
      list.push({
        id: `pat-notif-${idx}`,
        title: str(n.title || 'إشعار خاص بك'),
        detail: str(n.body || n.message || n.text || ''),
        role: 'patient',
        roleLabel,
        page: 'notifications',
        severity: n.read ? 'info' : 'warning',
        time: str(n.time || n.date) || 'اليوم',
      });
    });
    const appts = asObj(pat.appointments);
    asArr(appts.upcoming).forEach((ap, idx) => {
      list.push({
        id: `pat-up-${idx}`,
        title: `موعد قادم: ${str(ap.doctor || ap.clinic)}`,
        detail: `${str(ap.date)} الساعة ${str(ap.time)}`,
        role: 'patient',
        roleLabel,
        page: 'appointments',
        severity: 'success',
        time: str(ap.date) || 'قادم',
      });
    });
  } else if (allowedRole === 'pharmacy') {
    asArr(sharedData.prescriptions).forEach((rx, idx) => {
      list.push({
        id: `sh-rx-${str(rx.id) || idx}`,
        title: `وصفة جديدة: ${str(rx.drug) || 'دواء'}`,
        detail: `المريض: ${str(rx.patient) || '—'} · الجرعة: ${str(rx.dose) || '—'}`,
        role: 'pharmacy',
        roleLabel,
        page: 'orders',
        severity: 'success',
        time: str(rx.createdAt) || 'الآن',
      });
    });
    asArr(sharedData.pharmacyRequests).forEach((pr, idx) => {
      list.push({
        id: `sh-ph-${str(pr.id) || idx}`,
        title: `طلب صرف وارد: ${str(pr.title || pr.detail || 'تواصل')}`,
        detail: str(pr.patient || pr.notes || 'وارد من بوابة المريض'),
        role: 'pharmacy',
        roleLabel,
        page: 'orders',
        severity: 'info',
        time: str(pr.createdAt) || 'الآن',
      });
    });
    asArr(roleStates.pharmacy?.bottlenecks).forEach((b, idx) => {
      list.push({
        id: `pharm-bot-${idx}`,
        title: `اختناق صيدلي: ${str(b.title || b.area || 'الصيدلية')}`,
        detail: str(b.reason || b.desc || b.detail || 'يتطلب تدخلاً'),
        role: 'pharmacy',
        roleLabel,
        page: 'bottlenecks',
        severity: 'danger',
        time: str(b.time || 'جاري'),
      });
    });
  } else if (allowedRole === 'lab') {
    asArr(sharedData.labOrders).forEach((lo, idx) => {
      list.push({
        id: `sh-lab-${str(lo.id) || idx}`,
        title: `طلب تحليل وارد: ${str(lo.type) || 'تحليل'}`,
        detail: `المريض: ${str(lo.patient) || '—'} · الأولوية: ${str(lo.priority) === 'urgent' ? 'عاجلة' : 'عادية'}`,
        role: 'lab',
        roleLabel,
        page: 'orders',
        severity: str(lo.priority) === 'urgent' ? 'danger' : 'info',
        time: str(lo.createdAt) || 'الآن',
      });
    });
    asArr(roleStates.lab?.bottlenecks).forEach((b, idx) => {
      list.push({
        id: `lab-bot-${idx}`,
        title: `تنبيه معمل: ${str(b.title || b.stage || 'المعمل')}`,
        detail: str(b.reason || b.desc || 'تأخر في معالجة العينة'),
        role: 'lab',
        roleLabel,
        page: 'bottlenecks',
        severity: 'warning',
        time: str(b.time || 'نشط'),
      });
    });
  } else if (allowedRole === 'insurance') {
    asArr(roleStates.insurance?.claims)
      .filter((c) => str(c.status) === 'pending' || str(c.status) === 'incomplete')
      .forEach((c, idx) => {
        list.push({
          id: `ins-cl-${idx}`,
          title: `مطالبة بانتظار المراجعة: ${str(c.patient || 'مؤمّن')}`,
          detail: str(c.service || c.drug || 'مراجعة موافقة مسبقة'),
          role: 'insurance',
          roleLabel,
          page: 'claims',
          severity: 'info',
          time: str(c.time || 'اليوم'),
        });
      });
    asArr(roleStates.insurance?.bottlenecks).forEach((b, idx) => {
      list.push({
        id: `ins-bot-${idx}`,
        title: `تنبيه تأمين: ${str(b.title || b.area || 'مراجعة')}`,
        detail: str(b.desc || b.reason || 'تأخر في الموافقة'),
        role: 'insurance',
        roleLabel,
        page: 'bottlenecks',
        severity: 'warning',
        time: str(b.time || 'نشط'),
      });
    });
  } else if (allowedRole === 'hospital') {
    asArr(roleStates.hospital?.pendingRequests).forEach((p, idx) => {
      list.push({
        id: `hosp-pend-${idx}`,
        title: `طلب متوقف: ${str(p.title || p.patient || p.type)}`,
        detail: str(p.reason || p.owner || 'يتطلب متابعة تشغيلية'),
        role: 'hospital',
        roleLabel,
        page: 'pending',
        severity: 'warning',
        time: str(p.wait || p.duration || 'نشط'),
      });
    });
    asArr(roleStates.hospital?.bottlenecks).forEach((b, idx) => {
      list.push({
        id: `hosp-bot-${idx}`,
        title: `اختناق تشغيلي: ${str(b.title || b.area || 'تنبيه')}`,
        detail: str(b.desc || b.reason || 'يتطلب تدخلاً'),
        role: 'hospital',
        roleLabel,
        page: 'bottlenecks',
        severity: 'danger',
        time: str(b.time || 'الآن'),
      });
    });
  }

  return list.slice(0, 28);
}
