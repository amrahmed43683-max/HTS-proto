import { AllRoleStates, RoleId, SharedData } from './types';

export const ROLE_STATE_KEYS: Record<RoleId, readonly string[]> = {
  "doctor": [
    "patients",
    "prescriptions",
    "labOrders",
    "labResults",
    "imagingOrders",
    "pendingRequests",
    "parallelWorkflows"
  ],
  "patient": [
    "patient",
    "appointments",
    "prescriptions",
    "labResults",
    "imagingResults",
    "reports",
    "notifications",
    "complaints",
    "visitHistory",
    "doctorVisits",
    "queue"
  ],
  "pharmacy": [
    "orders",
    "inventory",
    "issues",
    "bottlenecks",
    "pendingRequests",
    "parallelWorkflows"
  ],
  "lab": [
    "orders",
    "issues",
    "bottlenecks",
    "parallelWorkflows"
  ],
  "insurance": [
    "appointments",
    "clinics",
    "queues",
    "claims",
    "reviewHistory",
    "parallelWorkflows",
    "patientJourneys",
    "bottlenecks"
  ],
  "hospital": [
    "clinics",
    "appointments",
    "parallelWorkflows",
    "patientJourneys",
    "bottlenecks",
    "pendingRequests",
    "queues"
  ]
} as const;

export const DEFAULT_ROLE_SEEDS: AllRoleStates = {
  "doctor": {
    "patients": [
      {
        "id": 1,
        "name": "أحمد محمد علي",
        "age": 34,
        "gender": "ذكر",
        "blood": "O+",
        "allergy": "بنسلين",
        "chronic": "ضغط الدم المرتفع",
        "meds": "Amlodipine 5mg",
        "time": "09:00",
        "status": "arrived",
        "phone": "01012345678",
        "visits": [
          {
            "date": "2026-09-15",
            "diagnosis": "ارتفاع ضغط الدم",
            "notes": "تم تعديل الجرعة"
          },
          {
            "date": "2026-08-01",
            "diagnosis": "فحص دوري",
            "notes": "جميع التحاليل طبيعية"
          }
        ]
      },
      {
        "id": 2,
        "name": "فاطمة حسن",
        "age": 28,
        "gender": "أنثى",
        "blood": "A+",
        "allergy": "لا توجد",
        "chronic": "لا توجد",
        "meds": "لا توجد",
        "time": "09:30",
        "status": "waiting",
        "phone": "01198765432",
        "visits": []
      },
      {
        "id": 3,
        "name": "محمد عبدالله",
        "age": 46,
        "gender": "ذكر",
        "blood": "B+",
        "allergy": "أسبرين",
        "chronic": "السكري النوع الثاني",
        "meds": "Metformin 500mg",
        "time": "10:00",
        "status": "in-progress",
        "phone": "01234567890",
        "visits": [
          {
            "date": "2026-09-20",
            "diagnosis": "متابعة سكري",
            "notes": "HbA1c: 7.2%"
          }
        ]
      },
      {
        "id": 4,
        "name": "نورا سعيد",
        "age": 52,
        "gender": "أنثى",
        "blood": "AB+",
        "allergy": "سلفا",
        "chronic": "قصور الغدة الدرقية",
        "meds": "Levothyroxine 50mcg",
        "time": "10:30",
        "status": "scheduled",
        "phone": "01087654321",
        "visits": [
          {
            "date": "2026-07-10",
            "diagnosis": "قصور درقي",
            "notes": "بدء العلاج"
          }
        ]
      },
      {
        "id": 5,
        "name": "عمر يوسف",
        "age": 61,
        "gender": "ذكر",
        "blood": "O-",
        "allergy": "لا توجد",
        "chronic": "أمراض القلب",
        "meds": "Warfarin 5mg, Atorvastatin 20mg",
        "time": "11:00",
        "status": "scheduled",
        "phone": "01123456789",
        "visits": [
          {
            "date": "2026-09-01",
            "diagnosis": "متابعة قلب",
            "notes": "INR: 2.5"
          }
        ]
      },
      {
        "id": 6,
        "name": "ياسمين خالد",
        "age": 39,
        "gender": "أنثى",
        "blood": "A-",
        "allergy": "لا توجد",
        "chronic": "لا توجد",
        "meds": "لا توجد",
        "time": "11:30",
        "status": "no-show",
        "phone": "01298765432",
        "visits": []
      }
    ],
    "prescriptions": [
      {
        "id": 1,
        "patient": "أحمد محمد علي",
        "drug": "Lisinopril 10mg",
        "dose": "10mg",
        "freq": "مرة يومياً",
        "duration": "30 يوم",
        "insurance": "approved",
        "pharmacy": "preparing",
        "time": "09:20"
      },
      {
        "id": 2,
        "patient": "محمد عبدالله",
        "drug": "Metformin 1000mg",
        "dose": "1000mg",
        "freq": "مرتين يومياً",
        "duration": "90 يوم",
        "insurance": "pending",
        "pharmacy": "pending",
        "time": "10:15"
      }
    ],
    "labOrders": [
      {
        "id": 1,
        "patient": "أحمد محمد علي",
        "type": "CBC",
        "priority": "normal",
        "status": "done",
        "lab": "المعمل المركزي",
        "time": "25 دقيقة"
      },
      {
        "id": 2,
        "patient": "محمد عبدالله",
        "type": "HbA1c",
        "priority": "urgent",
        "status": "in-progress",
        "lab": "المعمل المركزي",
        "time": "15 دقيقة"
      },
      {
        "id": 3,
        "patient": "محمد عبدالله",
        "type": "Lipid Profile",
        "priority": "normal",
        "status": "pending",
        "lab": "بانتظار التخصيص",
        "time": "0 دقيقة"
      }
    ],
    "labResults": [
      {
        "patient": "أحمد محمد علي",
        "test": "CBC",
        "date": "2026-10-05",
        "result": "WBC: 7.2 | RBC: 4.8 | Hb: 14.2 | Plt: 250",
        "status": "طبيعي"
      },
      {
        "patient": "محمد عبدالله",
        "test": "Glucose",
        "date": "2026-10-04",
        "result": "Fasting: 145 mg/dL",
        "status": "مرتفع"
      },
      {
        "patient": "فاطمة حسن",
        "test": "TSH",
        "date": "2026-10-03",
        "result": "TSH: 2.1 mIU/L",
        "status": "طبيعي"
      }
    ],
    "imagingOrders": [
      {
        "id": 1,
        "patient": "عمر يوسف",
        "type": "أشعة سينية (X-Ray)",
        "area": "الصدر",
        "status": "in-progress",
        "dept": "الأشعة"
      }
    ],
    "pendingRequests": [
      {
        "id": "RX-102",
        "type": "موافقة تأمين",
        "patient": "محمد عبدالله",
        "owner": "التأمين الصحي",
        "duration": "12 دقيقة",
        "reason": "بانتظار مراجعة الطبيب المعتمد",
        "action": "متابعة"
      },
      {
        "id": "LAB-103",
        "type": "تحليل عاجل",
        "patient": "محمد عبدالله",
        "owner": "المعمل",
        "duration": "8 دقائق",
        "reason": "الجهاز مشغول بحالة طوارئ",
        "action": "تحويل لمعمل آخر"
      },
      {
        "id": "IMG-104",
        "type": "أشعة مقطعية",
        "patient": "عمر يوسف",
        "owner": "الأشعة",
        "duration": "20 دقيقة",
        "reason": "بانتظار تحضير الصبغة",
        "action": "تأكيد التحضير"
      },
      {
        "id": "RX-105",
        "type": "صرف دواء",
        "patient": "أحمد محمد علي",
        "owner": "الصيدلية",
        "duration": "5 دقائق",
        "reason": "بانتظار تجهيز الجرعة",
        "action": "تأكيد الجاهزية"
      }
    ],
    "parallelWorkflows": [
      {
        "patient": "أحمد محمد علي",
        "trigger": "بعد الكشف",
        "steps": [
          {
            "name": "الكشف",
            "status": "done"
          },
          {
            "name": "الوصفة",
            "status": "done"
          },
          {
            "name": "التأمين",
            "status": "done"
          },
          {
            "name": "الصيدلية",
            "status": "active"
          },
          {
            "name": "الاستلام",
            "status": "pending"
          }
        ],
        "savedTime": "15 دقيقة"
      },
      {
        "patient": "محمد عبدالله",
        "trigger": "أثناء الكشف",
        "steps": [
          {
            "name": "الكشف",
            "status": "active"
          },
          {
            "name": "التحليل",
            "status": "active"
          },
          {
            "name": "الأشعة",
            "status": "pending"
          },
          {
            "name": "الوصفة",
            "status": "pending"
          },
          {
            "name": "التأمين",
            "status": "pending"
          }
        ],
        "savedTime": "22 دقيقة"
      },
      {
        "patient": "عمر يوسف",
        "trigger": "قبل الكشف",
        "steps": [
          {
            "name": "تسجيل الوصول",
            "status": "done"
          },
          {
            "name": "فتح الملف",
            "status": "done"
          },
          {
            "name": "مراجعة الأدوية",
            "status": "active"
          },
          {
            "name": "الكشف",
            "status": "pending"
          }
        ],
        "savedTime": "8 دقائق"
      }
    ]
  },
  "patient": {
    "patient": {
      "id": "PT-78432",
      "name": "أحمد محمد علي",
      "age": 34,
      "gender": "ذكر",
      "blood": "O+",
      "allergy": "البنسلين",
      "chronic": "ضغط الدم المرتفع",
      "phone": "01012345678",
      "email": "ahmed@example.com",
      "insurance": "مصر للتأمين - INS-8847"
    },
    "appointments": {
      "today": [
        {
          "id": 1,
          "doctor": "د. سارة أحمد",
          "specialty": "باطنة",
          "time": "10:30",
          "date": "2026-10-05",
          "status": "waiting",
          "queueNum": 14,
          "room": "305"
        }
      ],
      "upcoming": [
        {
          "id": 2,
          "doctor": "د. ليلى إبراهيم",
          "specialty": "قلب",
          "time": "09:00",
          "date": "2026-10-15",
          "status": "scheduled",
          "room": "402"
        },
        {
          "id": 3,
          "doctor": "د. سارة أحمد",
          "specialty": "باطنة",
          "time": "11:00",
          "date": "2026-11-05",
          "status": "scheduled",
          "room": "305"
        }
      ],
      "past": [
        {
          "id": 4,
          "doctor": "د. سارة أحمد",
          "specialty": "باطنة",
          "time": "10:00",
          "date": "2026-09-15",
          "status": "done",
          "diagnosis": "ارتفاع ضغط الدم - متابعة"
        },
        {
          "id": 5,
          "doctor": "د. خالد محمود",
          "specialty": "أطفال",
          "time": "09:30",
          "date": "2026-08-01",
          "status": "done",
          "diagnosis": "فحص دوري - جميع التحاليل طبيعية"
        },
        {
          "id": 6,
          "doctor": "د. ليلى إبراهيم",
          "specialty": "قلب",
          "time": "11:00",
          "date": "2026-07-10",
          "status": "done",
          "diagnosis": "فحص قلب - تخطيط طبيعي"
        }
      ]
    },
    "prescriptions": [
      {
        "id": "RX-2026-0481",
        "drug": "Amlodipine 5mg",
        "dose": "5mg",
        "frequency": "مرة يومياً صباحاً",
        "duration": "30 يوم",
        "doctor": "د. سارة أحمد",
        "date": "2026-09-15",
        "insurance": "approved",
        "pharmacy": "dispensed",
        "status": "active",
        "pharmacy_name": "صيدلية الشفاء - الدور الأرضي",
        "timeline": [
          {
            "time": "2026-09-15 10:30",
            "action": "كتبها الطبيب"
          },
          {
            "time": "2026-09-15 10:31",
            "action": "⚡ أُرسِلت للتأمين بالتوازي"
          },
          {
            "time": "2026-09-15 10:32",
            "action": "✓ موافقة التأمين"
          },
          {
            "time": "2026-09-15 10:33",
            "action": "⚡ أُرسِلت للصيدلية بالتوازي"
          },
          {
            "time": "2026-09-15 10:40",
            "action": "✓ جاهزة للاستلام"
          },
          {
            "time": "2026-09-15 10:45",
            "action": "✓ تم الصرف"
          }
        ]
      },
      {
        "id": "RX-2026-0512",
        "drug": "Lisinopril 10mg",
        "dose": "10mg",
        "frequency": "مرة يومياً",
        "duration": "30 يوم",
        "doctor": "د. سارة أحمد",
        "date": "2026-10-05",
        "insurance": "approved",
        "pharmacy": "preparing",
        "status": "active",
        "pharmacy_name": "صيدلية الشفاء - الدور الأرضي",
        "timeline": [
          {
            "time": "2026-10-05 10:35",
            "action": "كتبها الطبيب (خلال الكشف الحالي)"
          },
          {
            "time": "2026-10-05 10:35",
            "action": "⚡ أُرسِلت للتأمين بالتوازي"
          },
          {
            "time": "2026-10-05 10:36",
            "action": "✓ موافقة التأمين"
          },
          {
            "time": "2026-10-05 10:36",
            "action": "⚡ جاري التجهيز في الصيدلية"
          }
        ]
      }
    ],
    "labResults": [
      {
        "id": "LAB-001",
        "test": "صورة دم كاملة CBC",
        "date": "2026-09-15",
        "status": "طبيعي",
        "doctor": "د. سارة أحمد",
        "result": "WBC: 7.2 • RBC: 4.8 • Hb: 14.2 • Plt: 250",
        "notes": "جميع القيم ضمن المعدل الطبيعي"
      },
      {
        "id": "LAB-002",
        "test": "وظائف كلى",
        "date": "2026-09-15",
        "status": "طبيعي",
        "doctor": "د. سارة أحمد",
        "result": "Creatinine: 0.9 mg/dL • Urea: 25 mg/dL",
        "notes": "طبيعي"
      },
      {
        "id": "LAB-003",
        "test": "صورة دهون",
        "date": "2026-07-10",
        "status": "مرتفع قليلاً",
        "doctor": "د. ليلى إبراهيم",
        "result": "Cholesterol: 210 • LDL: 130 • HDL: 45 • TG: 180",
        "notes": "ينصح بمتابعة النظام الغذائي"
      }
    ],
    "imagingResults": [
      {
        "id": "IMG-001",
        "test": "أشعة سينية على الصدر",
        "date": "2026-07-10",
        "status": "طبيعي",
        "doctor": "د. ليلى إبراهيم",
        "result": "لا توجد علامات مرضية - القلب والرئتان بحالة طبيعية"
      }
    ],
    "reports": [
      {
        "id": "RPT-001",
        "title": "تقرير زيارة - باطنة",
        "date": "2026-09-15",
        "doctor": "د. سارة أحمد",
        "summary": "متابعة ضغط الدم - الضغط مستقر على العلاج الحالي"
      }
    ],
    "notifications": [
      {
        "id": 1,
        "type": "queue",
        "title": "اقتراب دورك",
        "body": "تبقّى مريضان قبلك - توجّه للعيادة",
        "time": "منذ 2 دقيقة",
        "read": false,
        "icon": "🔔",
        "color": "#ede9fe"
      },
      {
        "id": 2,
        "type": "rx",
        "title": "وصفة جاهزة",
        "body": "وصفتك (Lisinopril 10mg) جاهزة للاستلام من صيدلية الشفاء",
        "time": "منذ 5 دقائق",
        "read": false,
        "icon": "💊",
        "color": "#dcfce7"
      },
      {
        "id": 3,
        "type": "insurance",
        "title": "موافقة تأمين",
        "body": "تمت الموافقة على وصفتك الجديدة من مصر للتأمين",
        "time": "منذ 6 دقائق",
        "read": false,
        "icon": "✓",
        "color": "#dbeafe"
      },
      {
        "id": 4,
        "type": "lab",
        "title": "نتيجة تحليل جاهزة",
        "body": "نتيجة تحليل CBC جاهزة للمراجعة",
        "time": "منذ ساعة",
        "read": true,
        "icon": "🔬",
        "color": "#cffafe"
      },
      {
        "id": 5,
        "type": "appointment",
        "title": "تذكير بالموعد",
        "body": "موعدك غداً مع د. ليلى إبراهيم - قلب الساعة 9:00 ص",
        "time": "منذ 3 ساعات",
        "read": true,
        "icon": "📅",
        "color": "#fef3c7"
      }
    ],
    "complaints": [
      {
        "id": "CMP-001",
        "type": "طول الانتظار",
        "dept": "المعمل",
        "date": "2026-09-15",
        "description": "انتظرت أكثر من ساعة للحصول على نتيجة التحليل",
        "status": "resolved",
        "response": "نعتذر عن التأخير - تم تحسين إجراءات المعمل"
      },
      {
        "id": "CMP-002",
        "type": "مشكلة في الخدمة",
        "dept": "الاستقبال",
        "date": "2026-08-20",
        "description": "صعوبة في تسجيل الوصول عبر النظام",
        "status": "in-progress",
        "response": "جاري العمل على حل المشكلة التقنية"
      }
    ],
    "visitHistory": [
      {
        "date": "2026-09-15",
        "doctor": "د. سارة أحمد",
        "diagnosis": "ارتفاع ضغط الدم - متابعة",
        "notes": "الضغط مستقر - تم تعديل الجرعة"
      },
      {
        "date": "2026-08-01",
        "doctor": "د. خالد محمود",
        "diagnosis": "فحص دوري",
        "notes": "جميع التحاليل طبيعية"
      },
      {
        "date": "2026-07-10",
        "doctor": "د. ليلى إبراهيم",
        "diagnosis": "فحص قلب",
        "notes": "تخطيط القلب طبيعي"
      }
    ],
    "doctorVisits": [
      {
        "date": "2026-09-15",
        "diagnosis": "ارتفاع ضغط الدم - متابعة"
      },
      {
        "date": "2026-05-20",
        "diagnosis": "فحص ضغط - بداية العلاج"
      }
    ],
    "queue": [
      {
        "num": 11,
        "name": "فاطمة حسن",
        "status": "in-progress"
      },
      {
        "num": 12,
        "name": "محمد عبدالله",
        "status": "waiting"
      },
      {
        "num": 13,
        "name": "نورا سعيد",
        "status": "waiting"
      },
      {
        "num": 14,
        "name": "أنت (أحمد محمد علي)",
        "status": "waiting",
        "isYou": true
      },
      {
        "num": 15,
        "name": "عمر يوسف",
        "status": "waiting"
      },
      {
        "num": 16,
        "name": "ياسمين خالد",
        "status": "waiting"
      }
    ]
  },
  "pharmacy": {
    "orders": [
      {
        "id": "RX-2026-0481",
        "patient": "أحمد محمد علي",
        "drug": "Amoxicillin 500mg",
        "dose": "500mg",
        "frequency": "3 مرات يومياً",
        "duration": "7 أيام",
        "quantity": 21,
        "doctor": "د. سارة أحمد",
        "clinic": "الباطنة",
        "priority": "high",
        "allergy": "بنسلين",
        "insurance": "approved",
        "status": "new",
        "timeline": [
          {
            "time": "2026-10-05 09:00",
            "action": "تم إنشاء الوصفة من الطبيب"
          }
        ]
      },
      {
        "id": "RX-2026-0482",
        "patient": "فاطمة حسن",
        "drug": "Insulin Glargine",
        "dose": "40 وحدة",
        "frequency": "مرة يومياً",
        "duration": "30 يوم",
        "quantity": 1,
        "doctor": "د. خالد محمود",
        "clinic": "الغدد",
        "priority": "high",
        "allergy": "لا توجد",
        "insurance": "pending",
        "status": "pending-insurance",
        "timeline": [
          {
            "time": "2026-10-05 09:15",
            "action": "تم إنشاء الوصفة"
          },
          {
            "time": "2026-10-05 09:16",
            "action": "تم الإرسال للتأمين"
          }
        ]
      },
      {
        "id": "RX-2026-0483",
        "patient": "محمد عبدالله",
        "drug": "Metformin 1000mg",
        "dose": "1000mg",
        "frequency": "مرتين يومياً",
        "duration": "90 يوم",
        "quantity": 180,
        "doctor": "د. سارة أحمد",
        "clinic": "الباطنة",
        "priority": "medium",
        "allergy": "أسبرين",
        "insurance": "approved",
        "status": "preparing",
        "timeline": [
          {
            "time": "2026-10-05 09:30",
            "action": "تم إنشاء الوصفة"
          },
          {
            "time": "2026-10-05 09:31",
            "action": "تمت الموافقة من التأمين"
          },
          {
            "time": "2026-10-05 09:35",
            "action": "بدء التجهيز"
          }
        ]
      },
      {
        "id": "RX-2026-0484",
        "patient": "نورا سعيد",
        "drug": "Levothyroxine 50mcg",
        "dose": "50mcg",
        "frequency": "مرة يومياً",
        "duration": "30 يوم",
        "quantity": 30,
        "doctor": "د. منى عبدالله",
        "clinic": "الغدد",
        "priority": "low",
        "allergy": "سلفا",
        "insurance": "approved",
        "status": "preparing",
        "timeline": [
          {
            "time": "2026-10-05 09:45",
            "action": "تم إنشاء الوصفة"
          },
          {
            "time": "2026-10-05 09:46",
            "action": "تمت الموافقة من التأمين"
          },
          {
            "time": "2026-10-05 09:50",
            "action": "بدء التجهيز"
          }
        ]
      },
      {
        "id": "RX-2026-0485",
        "patient": "عمر يوسف",
        "drug": "Warfarin 5mg",
        "dose": "5mg",
        "frequency": "مرة يومياً",
        "duration": "30 يوم",
        "quantity": 30,
        "doctor": "د. ليلى إبراهيم",
        "clinic": "القلب",
        "priority": "high",
        "allergy": "لا توجد",
        "insurance": "approved",
        "status": "ready",
        "timeline": [
          {
            "time": "2026-10-05 10:00",
            "action": "تم إنشاء الوصفة"
          },
          {
            "time": "2026-10-05 10:01",
            "action": "تمت الموافقة من التأمين"
          },
          {
            "time": "2026-10-05 10:05",
            "action": "بدء التجهيز"
          },
          {
            "time": "2026-10-05 10:12",
            "action": "تم التجهيز - جاهز للاستلام"
          }
        ]
      },
      {
        "id": "RX-2026-0486",
        "patient": "ياسمين خالد",
        "drug": "Ibuprofen 400mg",
        "dose": "400mg",
        "frequency": "3 مرات يومياً",
        "duration": "5 أيام",
        "quantity": 15,
        "doctor": "د. طارق حسين",
        "clinic": "العظام",
        "priority": "low",
        "allergy": "لا توجد",
        "insurance": "not-required",
        "status": "ready",
        "timeline": [
          {
            "time": "2026-10-05 10:15",
            "action": "تم إنشاء الوصفة"
          },
          {
            "time": "2026-10-05 10:15",
            "action": "لا يحتاج موافقة تأمين"
          },
          {
            "time": "2026-10-05 10:18",
            "action": "بدء التجهيز"
          },
          {
            "time": "2026-10-05 10:22",
            "action": "تم التجهيز - جاهز للاستلام"
          }
        ]
      },
      {
        "id": "RX-2026-0487",
        "patient": "خالد عبدالرحمن",
        "drug": "DrugX نادر",
        "dose": "100mg",
        "frequency": "مرة يومياً",
        "duration": "30 يوم",
        "quantity": 30,
        "doctor": "د. سارة أحمد",
        "clinic": "الباطنة",
        "priority": "medium",
        "allergy": "لا توجد",
        "insurance": "approved",
        "status": "unavailable",
        "unavailableReason": "الدواء غير متوفر في المخزون",
        "timeline": [
          {
            "time": "2026-10-05 10:30",
            "action": "تم إنشاء الوصفة"
          },
          {
            "time": "2026-10-05 10:31",
            "action": "تمت الموافقة من التأمين"
          },
          {
            "time": "2026-10-05 10:35",
            "action": "تم التحقق - الدواء غير متوفر"
          }
        ]
      }
    ],
    "inventory": [
      {
        "drug": "Amoxicillin 500mg",
        "qty": 12,
        "min": 50,
        "expiry": "2027-06-15"
      },
      {
        "drug": "Metformin 1000mg",
        "qty": 180,
        "min": 100,
        "expiry": "2027-03-20"
      },
      {
        "drug": "Insulin Glargine",
        "qty": 8,
        "min": 10,
        "expiry": "2026-12-10"
      },
      {
        "drug": "Levothyroxine 50mcg",
        "qty": 45,
        "min": 30,
        "expiry": "2027-08-05"
      },
      {
        "drug": "Warfarin 5mg",
        "qty": 60,
        "min": 40,
        "expiry": "2027-02-28"
      },
      {
        "drug": "Ibuprofen 400mg",
        "qty": 200,
        "min": 100,
        "expiry": "2027-05-15"
      },
      {
        "drug": "Amlodipine 5mg",
        "qty": 5,
        "min": 50,
        "expiry": "2027-01-30"
      },
      {
        "drug": "Atorvastatin 20mg",
        "qty": 0,
        "min": 30,
        "expiry": "2027-04-10"
      },
      {
        "drug": "Omeprazole 20mg",
        "qty": 80,
        "min": 50,
        "expiry": "2027-07-22"
      },
      {
        "drug": "Paracetamol 500mg",
        "qty": 300,
        "min": 150,
        "expiry": "2027-09-18"
      }
    ],
    "issues": [
      {
        "id": 1,
        "type": "نقص في المخزون",
        "desc": "Amoxicillin 500mg قارب على النفاد",
        "priority": "high",
        "status": "open",
        "date": "2026-10-05 08:00"
      },
      {
        "id": 2,
        "type": "دواء منتهي الصلاحية",
        "desc": "تم اكتشاف 3 عبوات منتهية الصلاحية",
        "priority": "medium",
        "status": "open",
        "date": "2026-10-05 10:00"
      }
    ],
    "bottlenecks": [
      {
        "location": "مخزون Amoxicillin",
        "issue": "12 عبوة فقط متبقية",
        "impact": "قد ينقطع خلال يومين",
        "suggestion": "إرسال طلب توريد عاجل للمورد الرئيسي",
        "severity": "high"
      }
    ],
    "pendingRequests": [
      {
        "id": "RX-0482",
        "type": "موافقة تأمين",
        "patient": "فاطمة حسن",
        "owner": "التأمين الصحي",
        "duration": "15 دقيقة",
        "reason": "بانتظار مراجعة الطبيب المعتمد",
        "action": "متابعة التأمين"
      },
      {
        "id": "RX-0487",
        "type": "دواء غير متوفر",
        "patient": "خالد عبدالرحمن",
        "owner": "الصيدلية",
        "duration": "10 دقائق",
        "reason": "الدواء غير متوفر في المخزون",
        "action": "اقتراح بديل أو طلب توريد"
      }
    ],
    "parallelWorkflows": [
      {
        "rx": "RX-2026-0483",
        "patient": "محمد عبدالله",
        "drug": "Metformin 1000mg",
        "trigger": "فور استلام الوصفة",
        "steps": [
          {
            "name": "إنشاء الوصفة",
            "status": "done"
          },
          {
            "name": "إرسال للتأمين",
            "status": "done"
          },
          {
            "name": "موافقة التأمين",
            "status": "done"
          },
          {
            "name": "تجهيز الصيدلية",
            "status": "active"
          },
          {
            "name": "استلام المريض",
            "status": "pending"
          }
        ],
        "savedTime": "12 دقيقة"
      },
      {
        "rx": "RX-2026-0484",
        "patient": "نورا سعيد",
        "drug": "Levothyroxine 50mcg",
        "trigger": "بالتوازي مع الكشف",
        "steps": [
          {
            "name": "إنشاء الوصفة",
            "status": "done"
          },
          {
            "name": "إرسال للتأمين",
            "status": "done"
          },
          {
            "name": "موافقة التأمين",
            "status": "done"
          },
          {
            "name": "تجهيز الصيدلية",
            "status": "active"
          },
          {
            "name": "استلام المريض",
            "status": "pending"
          }
        ],
        "savedTime": "15 دقيقة"
      },
      {
        "rx": "RX-2026-0485",
        "patient": "عمر يوسف",
        "drug": "Warfarin 5mg",
        "trigger": "قبل انتهاء الكشف",
        "steps": [
          {
            "name": "إنشاء الوصفة",
            "status": "done"
          },
          {
            "name": "إرسال للتأمين",
            "status": "done"
          },
          {
            "name": "موافقة التأمين",
            "status": "done"
          },
          {
            "name": "تجهيز الصيدلية",
            "status": "done"
          },
          {
            "name": "استلام المريض",
            "status": "active"
          }
        ],
        "savedTime": "20 دقيقة"
      }
    ]
  },
  "lab": {
    "orders": [
      {
        "id": "LAB-2026-001",
        "patient": "محمد علي",
        "test": "صورة دم كاملة CBC",
        "priority": "high",
        "doctor": "د. سارة أحمد",
        "clinic": "الباطنة",
        "reason": "فحص دوري",
        "sampleStatus": "pending",
        "resultStatus": "none",
        "timeline": [
          {
            "time": "2026-10-05 08:15",
            "action": "تم إنشاء الطلب من العيادة"
          }
        ]
      },
      {
        "id": "LAB-2026-002",
        "patient": "فاطمة حسن",
        "test": "وظائف كبد LFT",
        "priority": "medium",
        "doctor": "د. خالد محمود",
        "clinic": "الكبد",
        "reason": "ارتفاع إنزيمات",
        "sampleStatus": "received",
        "resultStatus": "none",
        "timeline": [
          {
            "time": "2026-10-05 09:00",
            "action": "تم إنشاء الطلب"
          },
          {
            "time": "2026-10-05 09:30",
            "action": "تم استلام العينة"
          }
        ]
      },
      {
        "id": "LAB-2026-003",
        "patient": "أحمد سعيد",
        "test": "سكر تراكمي HbA1c",
        "priority": "low",
        "doctor": "د. سارة أحمد",
        "clinic": "الباطنة",
        "reason": "متابعة سكري",
        "sampleStatus": "processing",
        "resultStatus": "none",
        "timeline": [
          {
            "time": "2026-10-05 07:45",
            "action": "تم إنشاء الطلب"
          },
          {
            "time": "2026-10-05 08:00",
            "action": "تم استلام العينة"
          },
          {
            "time": "2026-10-05 08:30",
            "action": "بدء التحليل"
          }
        ]
      },
      {
        "id": "LAB-2026-004",
        "patient": "نورا عبدالله",
        "test": "وظائف كلى",
        "priority": "medium",
        "doctor": "د. عمر يوسف",
        "clinic": "الكلى",
        "reason": "فحص شامل",
        "sampleStatus": "processing",
        "resultStatus": "entered",
        "resultValue": "Creatinine: 0.9 mg/dL, Urea: 25 mg/dL",
        "resultNotes": "ضمن الطبيعي",
        "enteredAt": "2026-10-05 10:15",
        "timeline": [
          {
            "time": "2026-10-05 08:00",
            "action": "تم إنشاء الطلب"
          },
          {
            "time": "2026-10-05 08:20",
            "action": "تم استلام العينة"
          },
          {
            "time": "2026-10-05 09:00",
            "action": "بدء التحليل"
          },
          {
            "time": "2026-10-05 10:15",
            "action": "تم إدخال النتيجة"
          }
        ]
      },
      {
        "id": "LAB-2026-005",
        "patient": "يوسف إبراهيم",
        "test": "دهون الدم",
        "priority": "low",
        "doctor": "د. خالد محمود",
        "clinic": "القلب",
        "reason": "فحص دوري",
        "sampleStatus": "processing",
        "resultStatus": "review",
        "resultValue": "Cholesterol: 210, LDL: 130, HDL: 45, TG: 180",
        "enteredAt": "2026-10-05 09:45",
        "timeline": [
          {
            "time": "2026-10-05 07:30",
            "action": "تم إنشاء الطلب"
          },
          {
            "time": "2026-10-05 07:50",
            "action": "تم استلام العينة"
          },
          {
            "time": "2026-10-05 08:30",
            "action": "بدء التحليل"
          },
          {
            "time": "2026-10-05 09:45",
            "action": "تم إدخال النتيجة"
          },
          {
            "time": "2026-10-05 09:50",
            "action": "تم الإرسال للاعتماد"
          }
        ]
      },
      {
        "id": "LAB-2026-006",
        "patient": "ليلى محمود",
        "test": "هرمونات الغدة",
        "priority": "medium",
        "doctor": "د. سارة أحمد",
        "clinic": "الغدد",
        "reason": "خمول الغدة",
        "sampleStatus": "processing",
        "resultStatus": "approved",
        "resultValue": "TSH: 2.5, T3: 1.2, T4: 1.1",
        "resultNotes": "طبيعي",
        "approvedAt": "2026-10-05 11:00",
        "timeline": [
          {
            "time": "2026-10-05 08:00",
            "action": "تم إنشاء الطلب"
          },
          {
            "time": "2026-10-05 08:20",
            "action": "تم استلام العينة"
          },
          {
            "time": "2026-10-05 09:00",
            "action": "بدء التحليل"
          },
          {
            "time": "2026-10-05 10:00",
            "action": "تم إدخال النتيجة"
          },
          {
            "time": "2026-10-05 10:05",
            "action": "تم الإرسال للاعتماد"
          },
          {
            "time": "2026-10-05 11:00",
            "action": "تم الاعتماد"
          }
        ]
      },
      {
        "id": "LAB-2026-007",
        "patient": "سامي خليل",
        "test": "تحليل بول",
        "priority": "high",
        "doctor": "د. عمر يوسف",
        "clinic": "المسالك",
        "reason": "التهاب مسالك",
        "sampleStatus": "processing",
        "resultStatus": "none",
        "late": true,
        "lateReason": "عطل في الجهاز",
        "lateResponsible": "أحمد محمد",
        "lateSince": "2026-10-05 14:00",
        "timeline": [
          {
            "time": "2026-10-05 10:00",
            "action": "تم إنشاء الطلب"
          },
          {
            "time": "2026-10-05 10:30",
            "action": "تم استلام العينة"
          },
          {
            "time": "2026-10-05 14:00",
            "action": "تم تسجيل التأخير - عطل في الجهاز"
          }
        ]
      }
    ],
    "issues": [
      {
        "id": 1,
        "type": "عطل في جهاز",
        "desc": "جهاز تحليل الدم يحتاج صيانة",
        "priority": "high",
        "status": "open",
        "date": "2026-10-05 08:00"
      },
      {
        "id": 2,
        "type": "نقص في الكواشف",
        "desc": "كاشف وظائف الكلى قارب على النفاد",
        "priority": "medium",
        "status": "open",
        "date": "2026-10-05 15:00"
      }
    ],
    "bottlenecks": [
      {
        "location": "جهاز CBC",
        "issue": "كفاءة 60% بسبب الحاجة للصيانة",
        "impact": "تأخر 3 عينات غير عاجلة",
        "suggestion": "تحويل العينات غير العاجلة للجهاز الاحتياطي",
        "severity": "high"
      },
      {
        "location": "قسم الكيمياء",
        "issue": "نقص في كاشف وظائف الكلى",
        "impact": "قد يتوقف تحليل 5 عينات اليوم",
        "suggestion": "طلب كواشف طارئة من المخزن المركزي",
        "severity": "medium"
      }
    ],
    "parallelWorkflows": [
      {
        "sample": "LAB-2026-003",
        "patient": "أحمد سعيد",
        "test": "HbA1c",
        "trigger": "فور استلام العينة",
        "steps": [
          {
            "name": "استلام العينة",
            "status": "done"
          },
          {
            "name": "بدء التحليل",
            "status": "done"
          },
          {
            "name": "إدخال النتيجة",
            "status": "active"
          },
          {
            "name": "اعتماد",
            "status": "pending"
          },
          {
            "name": "إخطار الطبيب",
            "status": "pending"
          }
        ],
        "savedTime": "12 دقيقة"
      },
      {
        "sample": "LAB-2026-004",
        "patient": "نورا عبدالله",
        "test": "وظائف كلى",
        "trigger": "بالتوازي مع الكشف",
        "steps": [
          {
            "name": "استلام العينة",
            "status": "done"
          },
          {
            "name": "التحليل",
            "status": "done"
          },
          {
            "name": "إدخال النتيجة",
            "status": "done"
          },
          {
            "name": "اعتماد",
            "status": "active"
          },
          {
            "name": "إخطار الطبيب",
            "status": "pending"
          }
        ],
        "savedTime": "18 دقيقة"
      },
      {
        "sample": "LAB-2026-005",
        "patient": "يوسف إبراهيم",
        "test": "دهون الدم",
        "trigger": "قبل انتهاء الكشف",
        "steps": [
          {
            "name": "استلام العينة",
            "status": "done"
          },
          {
            "name": "التحليل",
            "status": "done"
          },
          {
            "name": "إدخال النتيجة",
            "status": "done"
          },
          {
            "name": "اعتماد",
            "status": "done"
          },
          {
            "name": "إخطار الطبيب",
            "status": "active"
          }
        ],
        "savedTime": "22 دقيقة"
      }
    ]
  },
  "insurance": {
    "appointments": [
      {
        "id": 1,
        "patient": "أحمد محمد علي",
        "age": 34,
        "hospital": "مستشفى الملك فيصل",
        "clinic": "الباطنة",
        "doctor": "د. سارة أحمد",
        "time": "09:00",
        "status": "done",
        "claimId": "INS-2026-1040"
      },
      {
        "id": 2,
        "patient": "فاطمة حسن",
        "age": 28,
        "hospital": "مستشفى الحبيب",
        "clinic": "الأطفال",
        "doctor": "د. خالد محمود",
        "time": "09:15",
        "status": "done",
        "claimId": null
      },
      {
        "id": 3,
        "patient": "محمد عبدالله",
        "age": 46,
        "hospital": "مستشفى الملك فهد",
        "clinic": "القلب",
        "doctor": "د. ليلى إبراهيم",
        "time": "09:30",
        "status": "in-progress",
        "claimId": "INS-2026-1045"
      },
      {
        "id": 4,
        "patient": "نورا سعيد",
        "age": 31,
        "hospital": "مستشفى المملكة",
        "clinic": "النساء والتوليد",
        "doctor": "د. منى عبدالله",
        "time": "09:45",
        "status": "waiting",
        "claimId": "INS-2026-1046"
      },
      {
        "id": 5,
        "patient": "عمر يوسف",
        "age": 40,
        "hospital": "مستشفى الملك خالد",
        "clinic": "العظام",
        "doctor": "د. طارق حسين",
        "time": "10:00",
        "status": "arrived",
        "claimId": null
      },
      {
        "id": 6,
        "patient": "ياسمين خالد",
        "age": 28,
        "hospital": "مستشفى المملكة",
        "clinic": "الجلدية",
        "doctor": "د. هاني سالم",
        "time": "10:15",
        "status": "waiting",
        "claimId": "INS-2026-1044"
      },
      {
        "id": 7,
        "patient": "علي إبراهيم",
        "age": 55,
        "hospital": "مستشفى الملك فيصل",
        "clinic": "الأنف والأذن",
        "doctor": "د. رنا فتحي",
        "time": "10:30",
        "status": "scheduled",
        "claimId": null
      },
      {
        "id": 8,
        "patient": "مريم أحمد",
        "age": 34,
        "hospital": "مستشفى الحبيب",
        "clinic": "الباطنة",
        "doctor": "د. سارة أحمد",
        "time": "10:45",
        "status": "scheduled",
        "claimId": "INS-2026-1038"
      },
      {
        "id": 9,
        "patient": "خالد عبدالرحمن",
        "age": 42,
        "hospital": "مستشفى الملك فهد",
        "clinic": "الأطفال",
        "doctor": "د. خالد محمود",
        "time": "11:00",
        "status": "scheduled",
        "claimId": null
      },
      {
        "id": 10,
        "patient": "هدى محمود",
        "age": 26,
        "hospital": "مستشفى الملك خالد",
        "clinic": "القلب",
        "doctor": "د. ليلى إبراهيم",
        "time": "11:15",
        "status": "scheduled",
        "claimId": "INS-2026-1042"
      }
    ],
    "clinics": [
      {
        "hospital": "مستشفى الملك فيصل",
        "name": "الباطنة",
        "waiting": 12,
        "appointments": 24,
        "doctors": 3,
        "load": 85,
        "status": "busy"
      },
      {
        "hospital": "مستشفى الملك فيصل",
        "name": "القلب",
        "waiting": 10,
        "appointments": 20,
        "doctors": 2,
        "load": 92,
        "status": "full"
      },
      {
        "hospital": "مستشفى الحبيب",
        "name": "الأطفال",
        "waiting": 8,
        "appointments": 18,
        "doctors": 2,
        "load": 95,
        "status": "full"
      },
      {
        "hospital": "مستشفى الحبيب",
        "name": "النساء والتوليد",
        "waiting": 4,
        "appointments": 15,
        "doctors": 3,
        "load": 45,
        "status": "calm"
      },
      {
        "hospital": "مستشفى الملك فهد",
        "name": "العظام",
        "waiting": 6,
        "appointments": 12,
        "doctors": 2,
        "load": 70,
        "status": "medium"
      },
      {
        "hospital": "مستشفى المملكة",
        "name": "الجلدية",
        "waiting": 2,
        "appointments": 10,
        "doctors": 2,
        "load": 30,
        "status": "calm"
      },
      {
        "hospital": "مستشفى الملك خالد",
        "name": "الأنف والأذن",
        "waiting": 5,
        "appointments": 14,
        "doctors": 2,
        "load": 65,
        "status": "medium"
      },
      {
        "hospital": "مستشفى الملك فهد",
        "name": "الطوارئ",
        "waiting": 15,
        "appointments": 32,
        "doctors": 4,
        "load": 78,
        "status": "busy"
      }
    ],
    "queues": {
      "مستشفى الملك فيصل - الباطنة": {
        "current": 14,
        "waiting": [
          "أحمد م.",
          "فاطمة ع.",
          "محمد س.",
          "نورا خ."
        ]
      },
      "مستشفى الملك فيصل - القلب": {
        "current": 7,
        "waiting": [
          "خالد ع.",
          "مريم ف.",
          "سامي ن.",
          "دينا ر.",
          "علي ط."
        ]
      },
      "مستشفى الحبيب - الأطفال": {
        "current": 9,
        "waiting": [
          "سلمى أ.",
          "يوسف ح.",
          "هدى م."
        ]
      },
      "مستشفى الحبيب - نساء وتوليد": {
        "current": 11,
        "waiting": [
          "نورا س."
        ]
      },
      "مستشفى الملك فهد - العظام": {
        "current": 5,
        "waiting": [
          "عمر ي.",
          "ياسمين خ."
        ]
      },
      "مستشفى الملك فهد - الطوارئ": {
        "current": 22,
        "waiting": [
          "حالة 1",
          "حالة 2",
          "حالة 3",
          "حالة 4",
          "حالة 5"
        ]
      }
    },
    "claims": [
      {
        "id": "INS-2026-1047",
        "patient": "عبدالله السالم",
        "age": 42,
        "service": "أشعة رنين مغناطيسي",
        "doctor": "د. خالد العتيبي",
        "hospital": "مستشفى الملك فيصل",
        "diagnosis": "آلام مزمنة في الركبة",
        "priority": "عاجل",
        "priorityClass": "high",
        "status": "urgent",
        "statusLabel": "عاجل",
        "wait": "15 دقيقة",
        "coverage": 85,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "نتيجة التحليل قبل الأشعة",
        "responsible": "المعمل",
        "lastUpdate": "قبل 20 دقيقة"
      },
      {
        "id": "INS-2026-1046",
        "patient": "نورة القحطاني",
        "age": 31,
        "service": "تحاليل دم شاملة",
        "doctor": "د. سارة الدوسري",
        "hospital": "مستشفى الحبيب",
        "diagnosis": "فحص دوري",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "review",
        "statusLabel": "قيد المراجعة",
        "wait": "45 دقيقة",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": false,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1045",
        "patient": "فهد العنزي",
        "age": 55,
        "service": "عملية قسطرة قلب",
        "doctor": "د. محمد الشهري",
        "hospital": "مستشفى الملك فهد",
        "diagnosis": "انسداد شريان تاجي",
        "priority": "عاجل",
        "priorityClass": "high",
        "status": "urgent",
        "statusLabel": "عاجل",
        "wait": "30 دقيقة",
        "coverage": 90,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": true,
          "extraDoc": true
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1044",
        "patient": "ريم الشمري",
        "age": 28,
        "service": "كشف عيادي",
        "doctor": "د. أحمد الغامدي",
        "hospital": "مستشفى المملكة",
        "diagnosis": "صداع متكرر",
        "priority": "منخفض",
        "priorityClass": "low",
        "status": "new",
        "statusLabel": "جديد",
        "wait": "5 دقائق",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": false,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1043",
        "patient": "سلطان الحربي",
        "age": 38,
        "service": "وصفة أدوية مزمنة",
        "doctor": "د. يوسف المالكي",
        "hospital": "مستشفى الحبيب",
        "diagnosis": "ضغط دم + سكري",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "incomplete",
        "statusLabel": "ناقص",
        "wait": "ساعتان",
        "coverage": 80,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": false,
          "labResult": true,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "صورة من بطاقة الهوية + آخر تحليل سكري",
        "responsible": "المريض",
        "lastUpdate": "قبل ساعة"
      },
      {
        "id": "INS-2026-1042",
        "patient": "هند الزهراني",
        "age": 26,
        "service": "أشعة سينية",
        "doctor": "د. ليلى السبيعي",
        "hospital": "مستشفى الملك خالد",
        "diagnosis": "كسر محتمل في الرسغ",
        "priority": "عاجل",
        "priorityClass": "high",
        "status": "urgent",
        "statusLabel": "عاجل",
        "wait": "10 دقائق",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1041",
        "patient": "ماجد العتيبي",
        "age": 47,
        "service": "تحليل أشعة مقطعية",
        "doctor": "د. فيصل العجمي",
        "hospital": "مستشفى الملك فهد",
        "diagnosis": "آلام في البطن",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "incomplete",
        "statusLabel": "ناقص",
        "wait": "3 ساعات",
        "coverage": 75,
        "coverageType": "partial",
        "checks": {
          "prescription": false,
          "patientData": true,
          "labResult": true,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "الوصفة الطبية الأصلية",
        "responsible": "الدكتور",
        "lastUpdate": "قبل ساعتين"
      },
      {
        "id": "INS-2026-1040",
        "patient": "لمى السعيد",
        "age": 34,
        "service": "كشف تخصص جلدية",
        "doctor": "د. منى العنزي",
        "hospital": "مستشفى المملكة",
        "diagnosis": "حساسية جلدية",
        "priority": "منخفض",
        "priorityClass": "low",
        "status": "done",
        "statusLabel": "مكتمل",
        "wait": "—",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1039",
        "patient": "تركي الدوسري",
        "age": 60,
        "service": "عملية مياه بيضاء",
        "doctor": "د. عبدالله القحطاني",
        "hospital": "مستشفى الملك فيصل",
        "diagnosis": "إعتام عدسة العين",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "review",
        "statusLabel": "قيد المراجعة",
        "wait": "ساعة",
        "coverage": 85,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1038",
        "patient": "دلال المطيري",
        "age": 29,
        "service": "تحاليل هرمونات",
        "doctor": "د. هدى الزيد",
        "hospital": "مستشفى الحبيب",
        "diagnosis": "اضطراب الغدة الدرقية",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "new",
        "statusLabel": "جديد",
        "wait": "8 دقائق",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": false,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1037",
        "patient": "بدر الرشيدي",
        "age": 51,
        "service": "علاج طبيعي",
        "doctor": "د. سعد الحارثي",
        "hospital": "مستشفى الملك خالد",
        "diagnosis": "انزلاق غضروفي",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "rejected",
        "statusLabel": "مرفوض",
        "wait": "—",
        "coverage": 0,
        "coverageType": "none",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": "",
        "rejectReason": "تجاوز الحد السنوي (20 جلسة)"
      },
      {
        "id": "INS-2026-1036",
        "patient": "مشاعل العبدالله",
        "age": 33,
        "service": "رنين مغناطيسي للدماغ",
        "doctor": "د. نواف السلمي",
        "hospital": "مستشفى الملك فهد",
        "diagnosis": "صداع نصفي مزمن",
        "priority": "عاجل",
        "priorityClass": "high",
        "status": "incomplete",
        "statusLabel": "ناقص",
        "wait": "4 ساعات",
        "coverage": 85,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": true,
          "extraDoc": true
        },
        "missing": "تقرير طبيب الأعصاب + موافقة مسبقة",
        "responsible": "الدكتور",
        "lastUpdate": "قبل 3 ساعات"
      },
      {
        "id": "INS-2026-1035",
        "patient": "عبدالرحمن الشهري",
        "age": 44,
        "service": "كشف باطنة",
        "doctor": "د. فهد القرني",
        "hospital": "مستشفى المملكة",
        "diagnosis": "قرحة معدة",
        "priority": "منخفض",
        "priorityClass": "low",
        "status": "done",
        "statusLabel": "مكتمل",
        "wait": "—",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1034",
        "patient": "جواهر السبيعي",
        "age": 27,
        "service": "تحاليل حمل",
        "doctor": "د. ريم العنزي",
        "hospital": "مستشفى الحبيب",
        "diagnosis": "متابعة حمل",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "new",
        "statusLabel": "جديد",
        "wait": "12 دقيقة",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": false,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1033",
        "patient": "نايف الغامدي",
        "age": 39,
        "service": "عملية زائدة",
        "doctor": "د. تركي المالكي",
        "hospital": "مستشفى الملك فيصل",
        "diagnosis": "التهاب زائدة حاد",
        "priority": "عاجل",
        "priorityClass": "high",
        "status": "done",
        "statusLabel": "مكتمل",
        "wait": "—",
        "coverage": 90,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": true,
          "extraDoc": true
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1032",
        "patient": "منال الحربي",
        "age": 45,
        "service": "أشعة ثدي",
        "doctor": "د. سعاد الدوسري",
        "hospital": "مستشفى الملك خالد",
        "diagnosis": "فحص دوري",
        "priority": "منخفض",
        "priorityClass": "low",
        "status": "new",
        "statusLabel": "جديد",
        "wait": "18 دقيقة",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": false,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1031",
        "patient": "خالد الزهراني",
        "age": 52,
        "service": "قسطرة تشخيصية",
        "doctor": "د. ماجد الشهري",
        "hospital": "مستشفى الملك فهد",
        "diagnosis": "ضيق شرايين",
        "priority": "عاجل",
        "priorityClass": "high",
        "status": "review",
        "statusLabel": "قيد المراجعة",
        "wait": "50 دقيقة",
        "coverage": 85,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1030",
        "patient": "هيا العتيبي",
        "age": 24,
        "service": "وصفة مضاد حيوي",
        "doctor": "د. بدر السلمي",
        "hospital": "مستشفى المملكة",
        "diagnosis": "التهاب لوز",
        "priority": "منخفض",
        "priorityClass": "low",
        "status": "done",
        "statusLabel": "مكتمل",
        "wait": "—",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1029",
        "patient": "فيصل القحطاني",
        "age": 48,
        "service": "تحليل سكر تراكمي",
        "doctor": "د. عمر القرني",
        "hospital": "مستشفى الحبيب",
        "diagnosis": "متابعة سكري",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "new",
        "statusLabel": "جديد",
        "wait": "7 دقائق",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": false,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1028",
        "patient": "سارة الشمري",
        "age": 36,
        "service": "عملية تجميل أنف",
        "doctor": "د. ريان العجمي",
        "hospital": "مستشفى الملك فيصل",
        "diagnosis": "انحراف غضروف + تجميل",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "rejected",
        "statusLabel": "مرفوض",
        "wait": "—",
        "coverage": 0,
        "coverageType": "none",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": "",
        "rejectReason": "التجميل غير مشمول — الجزء الطبي فقط مغطى"
      },
      {
        "id": "INS-2026-1027",
        "patient": "عبدالعزيز المطيري",
        "age": 41,
        "service": "رنين للعمود الفقري",
        "doctor": "د. مشاري الحارثي",
        "hospital": "مستشفى الملك خالد",
        "diagnosis": "آلام أسفل الظهر",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "review",
        "statusLabel": "قيد المراجعة",
        "wait": "ساعة و10د",
        "coverage": 85,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1026",
        "patient": "لولوة الدوسري",
        "age": 30,
        "service": "كشف أسنان",
        "doctor": "د. رنا الزيد",
        "hospital": "مستشفى المملكة",
        "diagnosis": "عصب سن",
        "priority": "منخفض",
        "priorityClass": "low",
        "status": "done",
        "statusLabel": "مكتمل",
        "wait": "—",
        "coverage": 70,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      },
      {
        "id": "INS-2026-1025",
        "patient": "محمد العبدالله",
        "age": 58,
        "service": "تحاليل قلب",
        "doctor": "د. سلطان الشهري",
        "hospital": "مستشفى الملك فهد",
        "diagnosis": "ذبذبة صدرية",
        "priority": "عاجل",
        "priorityClass": "high",
        "status": "incomplete",
        "statusLabel": "ناقص",
        "wait": "5 ساعات",
        "coverage": 90,
        "coverageType": "partial",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": true,
          "medicalReport": true,
          "extraDoc": false
        },
        "missing": "تقرير الإيكو الأخير",
        "responsible": "المستشفى",
        "lastUpdate": "قبل 4 ساعات"
      },
      {
        "id": "INS-2026-1024",
        "patient": "عبير الرشيدي",
        "age": 32,
        "service": "كشف أطفال",
        "doctor": "د. نورة القرني",
        "hospital": "مستشفى الحبيب",
        "diagnosis": "ارتفاع حرارة طفل",
        "priority": "متوسط",
        "priorityClass": "med",
        "status": "new",
        "statusLabel": "جديد",
        "wait": "20 دقيقة",
        "coverage": 100,
        "coverageType": "full",
        "checks": {
          "prescription": true,
          "patientData": true,
          "labResult": false,
          "medicalReport": false,
          "extraDoc": false
        },
        "missing": "",
        "responsible": "",
        "lastUpdate": ""
      }
    ],
    "reviewHistory": [
      {
        "id": 1,
        "type": "approve",
        "requestId": "INS-2026-1040",
        "patient": "لمى السعيد",
        "action": "تمت الموافقة على كشف تخصص جلدية",
        "user": "أحمد المطيري",
        "time": "قبل 10 دقائق"
      },
      {
        "id": 2,
        "type": "approve",
        "requestId": "INS-2026-1035",
        "patient": "عبدالرحمن الشهري",
        "action": "تمت الموافقة على كشف باطنة",
        "user": "أحمد المطيري",
        "time": "قبل 25 دقيقة"
      },
      {
        "id": 3,
        "type": "approve",
        "requestId": "INS-2026-1033",
        "patient": "نايف الغامدي",
        "action": "تمت الموافقة على عملية زائدة - حالة عاجلة",
        "user": "أحمد المطيري",
        "time": "قبل ساعة"
      },
      {
        "id": 4,
        "type": "reject",
        "requestId": "INS-2026-1037",
        "patient": "بدر الرشيدي",
        "action": "تم رفض العلاج الطبيعي - تجاوز الحد السنوي",
        "user": "أحمد المطيري",
        "time": "قبل 4 ساعات"
      },
      {
        "id": 5,
        "type": "reject",
        "requestId": "INS-2026-1028",
        "patient": "سارة الشمري",
        "action": "تم رفض عملية تجميل الأنف - غير مشمول",
        "user": "أحمد المطيري",
        "time": "قبل 5 ساعات"
      },
      {
        "id": 6,
        "type": "complete",
        "requestId": "INS-2026-1043",
        "patient": "سلطان الحربي",
        "action": "تم إرسال طلب استكمال بيانات للمريض",
        "user": "أحمد المطيري",
        "time": "قبل ساعة"
      },
      {
        "id": 7,
        "type": "escalate",
        "requestId": "INS-2026-1025",
        "patient": "محمد العبدالله",
        "action": "تم تصعيد طلب تحاليل القلب - حالة حرجة",
        "user": "أحمد المطيري",
        "time": "قبل 3 ساعات"
      }
    ],
    "parallelWorkflows": [
      {
        "patient": "محمد عبدالله",
        "hospital": "مستشفى الملك فهد",
        "stage": "قيد الكشف",
        "parallel": [
          "تحليل دم",
          "أشعة صدر",
          "موافقة تأمين"
        ],
        "savedTime": "18 دقيقة",
        "status": "parallel"
      },
      {
        "patient": "نورا سعيد",
        "hospital": "مستشفى المملكة",
        "stage": "بعد الكشف - تجهيز الدواء",
        "parallel": [
          "موافقة تأمين",
          "تجهيز صيدلية"
        ],
        "savedTime": "12 دقيقة",
        "status": "parallel"
      },
      {
        "patient": "ياسمين خالد",
        "hospital": "مستشفى المملكة",
        "stage": "في الانتظار",
        "parallel": [
          "فتح الملف الطبي",
          "مراجعة التحاليل"
        ],
        "savedTime": "8 دقائق",
        "status": "parallel"
      },
      {
        "patient": "هدى محمود",
        "hospital": "مستشفى الملك خالد",
        "stage": "قيد الكشف",
        "parallel": [
          "أشعة رسغ",
          "موافقة عاجلة"
        ],
        "savedTime": "22 دقيقة",
        "status": "parallel"
      }
    ],
    "patientJourneys": [
      {
        "name": "محمد عبدالله",
        "hospital": "مستشفى الملك فهد",
        "clinic": "القلب",
        "totalTime": 32,
        "steps": [
          {
            "name": "الحجز",
            "time": 1,
            "status": "done"
          },
          {
            "name": "الوصول",
            "time": 2,
            "status": "done"
          },
          {
            "name": "تسجيل الملف",
            "time": 3,
            "status": "done"
          },
          {
            "name": "الانتظار",
            "time": 8,
            "status": "done"
          },
          {
            "name": "الكشف",
            "time": 12,
            "status": "active"
          },
          {
            "name": "التحاليل",
            "time": 0,
            "status": "pending"
          },
          {
            "name": "الموافقة",
            "time": 0,
            "status": "pending"
          },
          {
            "name": "الصرف",
            "time": 0,
            "status": "pending"
          }
        ]
      },
      {
        "name": "نورا سعيد",
        "hospital": "مستشفى المملكة",
        "clinic": "النساء والتوليد",
        "totalTime": 24,
        "steps": [
          {
            "name": "الحجز",
            "time": 1,
            "status": "done"
          },
          {
            "name": "الوصول",
            "time": 1,
            "status": "done"
          },
          {
            "name": "تسجيل الملف",
            "time": 2,
            "status": "done"
          },
          {
            "name": "الانتظار",
            "time": 5,
            "status": "done"
          },
          {
            "name": "الكشف",
            "time": 10,
            "status": "done"
          },
          {
            "name": "موافقة تأمين",
            "time": 4,
            "status": "active"
          },
          {
            "name": "الصرف",
            "time": 0,
            "status": "pending"
          }
        ]
      },
      {
        "name": "أحمد محمد",
        "hospital": "مستشفى الملك فيصل",
        "clinic": "الباطنة",
        "totalTime": 18,
        "steps": [
          {
            "name": "الحجز",
            "time": 1,
            "status": "done"
          },
          {
            "name": "الوصول",
            "time": 1,
            "status": "done"
          },
          {
            "name": "تسجيل الملف",
            "time": 2,
            "status": "done"
          },
          {
            "name": "الانتظار",
            "time": 4,
            "status": "done"
          },
          {
            "name": "الكشف",
            "time": 8,
            "status": "done"
          },
          {
            "name": "موافقة تأمين",
            "time": 2,
            "status": "done"
          },
          {
            "name": "الصرف",
            "time": 3,
            "status": "done"
          }
        ]
      }
    ],
    "bottlenecks": [
      {
        "location": "مستشفى الملك فيصل - القلب",
        "issue": "طبيب واحد فقط متاح",
        "impact": "ارتفاع زمن الانتظار إلى 45 دقيقة",
        "suggestion": "تحويل 3 حالات للباطنة أو استدعاء طبيب إضافي",
        "severity": "high"
      },
      {
        "location": "مستشفى الملك فهد - الأشعة",
        "issue": "جهاز واحد معطّل",
        "impact": "تراكم 12 طلب أشعة",
        "suggestion": "إصلاح الجهاز أو تحويل الحالات للجهاز الآخر",
        "severity": "high"
      },
      {
        "location": "مستشفى الحبيب - الاستقبال",
        "issue": "بطء في تسجيل الوصول",
        "impact": "متوسط 6 دقائق لكل مريض",
        "suggestion": "تفعيل التسجيل الذاتي عبر الكيوسك",
        "severity": "medium"
      }
    ]
  },
  "hospital": {
    "clinics": [
      {
        "name": "الباطنة",
        "waiting": 12,
        "appointments": 24,
        "doctors": 3,
        "load": 85,
        "status": "busy"
      },
      {
        "name": "الأطفال",
        "waiting": 8,
        "appointments": 18,
        "doctors": 2,
        "load": 95,
        "status": "full"
      },
      {
        "name": "النساء والتوليد",
        "waiting": 4,
        "appointments": 15,
        "doctors": 3,
        "load": 45,
        "status": "calm"
      },
      {
        "name": "العظام",
        "waiting": 6,
        "appointments": 12,
        "doctors": 2,
        "load": 70,
        "status": "medium"
      },
      {
        "name": "القلب",
        "waiting": 10,
        "appointments": 20,
        "doctors": 2,
        "load": 92,
        "status": "full"
      },
      {
        "name": "الجلدية",
        "waiting": 2,
        "appointments": 10,
        "doctors": 2,
        "load": 30,
        "status": "calm"
      },
      {
        "name": "الأنف والأذن",
        "waiting": 5,
        "appointments": 14,
        "doctors": 2,
        "load": 65,
        "status": "medium"
      },
      {
        "name": "الطوارئ",
        "waiting": 15,
        "appointments": 32,
        "doctors": 4,
        "load": 78,
        "status": "busy"
      }
    ],
    "appointments": [
      {
        "id": 1,
        "patient": "أحمد محمد علي",
        "clinic": "الباطنة",
        "doctor": "د. سارة أحمد",
        "time": "09:00",
        "status": "done"
      },
      {
        "id": 2,
        "patient": "فاطمة حسن",
        "clinic": "الأطفال",
        "doctor": "د. خالد محمود",
        "time": "09:15",
        "status": "done"
      },
      {
        "id": 3,
        "patient": "محمد عبدالله",
        "clinic": "القلب",
        "doctor": "د. ليلى إبراهيم",
        "time": "09:30",
        "status": "in-progress"
      },
      {
        "id": 4,
        "patient": "نورا سعيد",
        "clinic": "النساء والتوليد",
        "doctor": "د. منى عبدالله",
        "time": "09:45",
        "status": "waiting"
      },
      {
        "id": 5,
        "patient": "عمر يوسف",
        "clinic": "العظام",
        "doctor": "د. طارق حسين",
        "time": "10:00",
        "status": "arrived"
      },
      {
        "id": 6,
        "patient": "ياسمين خالد",
        "clinic": "الجلدية",
        "doctor": "د. هاني سالم",
        "time": "10:15",
        "status": "waiting"
      },
      {
        "id": 7,
        "patient": "علي إبراهيم",
        "clinic": "الأنف والأذن",
        "doctor": "د. رنا فتحي",
        "time": "10:30",
        "status": "scheduled"
      },
      {
        "id": 8,
        "patient": "مريم أحمد",
        "clinic": "الباطنة",
        "doctor": "د. سارة أحمد",
        "time": "10:45",
        "status": "scheduled"
      },
      {
        "id": 9,
        "patient": "خالد عبدالرحمن",
        "clinic": "الأطفال",
        "doctor": "د. خالد محمود",
        "time": "11:00",
        "status": "scheduled"
      },
      {
        "id": 10,
        "patient": "هدى محمود",
        "clinic": "القلب",
        "doctor": "د. ليلى إبراهيم",
        "time": "11:15",
        "status": "scheduled"
      }
    ],
    "parallelWorkflows": [
      {
        "patient": "محمد عبدالله",
        "stage": "قيد الكشف",
        "parallel": [
          "تحليل دم",
          "أشعة صدر",
          "موعد متابعة"
        ],
        "savedTime": "18 دقيقة",
        "status": "parallel"
      },
      {
        "patient": "نورا سعيد",
        "stage": "بعد الكشف - تجهيز الدواء",
        "parallel": [
          "موافقة تأمين",
          "تجهيز صيدلية"
        ],
        "savedTime": "12 دقيقة",
        "status": "parallel"
      },
      {
        "patient": "ياسمين خالد",
        "stage": "في الانتظار",
        "parallel": [
          "فتح الملف الطبي",
          "مراجعة التحاليل السابقة"
        ],
        "savedTime": "8 دقائق",
        "status": "parallel"
      },
      {
        "patient": "عمر يوسف",
        "stage": "قيد الكشف",
        "parallel": [
          "أشعة عظام",
          "تحويل داخلي"
        ],
        "savedTime": "22 دقيقة",
        "status": "parallel"
      }
    ],
    "patientJourneys": [
      {
        "name": "محمد عبدالله",
        "clinic": "القلب",
        "totalTime": 32,
        "steps": [
          {
            "name": "الوصول",
            "time": 2,
            "status": "done"
          },
          {
            "name": "تسجيل الملف",
            "time": 3,
            "status": "done"
          },
          {
            "name": "الانتظار",
            "time": 8,
            "status": "done"
          },
          {
            "name": "الكشف",
            "time": 12,
            "status": "active"
          },
          {
            "name": "التحاليل",
            "time": 0,
            "status": "pending"
          },
          {
            "name": "الصرف",
            "time": 0,
            "status": "pending"
          }
        ]
      },
      {
        "name": "نورا سعيد",
        "clinic": "النساء والتوليد",
        "totalTime": 24,
        "steps": [
          {
            "name": "الوصول",
            "time": 1,
            "status": "done"
          },
          {
            "name": "تسجيل الملف",
            "time": 2,
            "status": "done"
          },
          {
            "name": "الانتظار",
            "time": 5,
            "status": "done"
          },
          {
            "name": "الكشف",
            "time": 10,
            "status": "done"
          },
          {
            "name": "موافقة تأمين",
            "time": 4,
            "status": "active"
          },
          {
            "name": "الصرف",
            "time": 0,
            "status": "pending"
          }
        ]
      },
      {
        "name": "أحمد محمد",
        "clinic": "الباطنة",
        "totalTime": 18,
        "steps": [
          {
            "name": "الوصول",
            "time": 1,
            "status": "done"
          },
          {
            "name": "تسجيل الملف",
            "time": 2,
            "status": "done"
          },
          {
            "name": "الانتظار",
            "time": 4,
            "status": "done"
          },
          {
            "name": "الكشف",
            "time": 8,
            "status": "done"
          },
          {
            "name": "الصرف",
            "time": 3,
            "status": "done"
          }
        ]
      }
    ],
    "bottlenecks": [
      {
        "location": "عيادة القلب",
        "issue": "طبيب واحد فقط متاح",
        "impact": "ارتفاع زمن الانتظار إلى 45 دقيقة",
        "suggestion": "تحويل 3 حالات للباطنة أو استدعاء طبيب إضافي",
        "severity": "high"
      },
      {
        "location": "قسم الأشعة",
        "issue": "جهاز واحد معطّل",
        "impact": "تراكم 12 طلب أشعة",
        "suggestion": "إصلاح الجهاز أو تحويل الحالات للجهاز الآخر",
        "severity": "high"
      },
      {
        "location": "الاستقبال",
        "issue": "بطء في تسجيل الوصول",
        "impact": "متوسط 6 دقائق لكل مريض",
        "suggestion": "تفعيل التسجيل الذاتي عبر الكيوسك",
        "severity": "medium"
      }
    ],
    "pendingRequests": [
      {
        "id": "REQ-1042",
        "type": "تحويل داخلي",
        "owner": "الاستقبال",
        "duration": "25 دقيقة",
        "reason": "بانتظار موافقة المريض",
        "action": "تأكيد التحويل"
      },
      {
        "id": "REQ-1043",
        "type": "طلب أشعة",
        "owner": "الأشعة",
        "duration": "40 دقيقة",
        "reason": "الجهاز مشغول",
        "action": "تنفيذ الطلب"
      },
      {
        "id": "REQ-1044",
        "type": "نقل مريض",
        "owner": "التمريض",
        "duration": "10 دقيقة",
        "reason": "بانتظار سرير",
        "action": "تخصيص سرير"
      },
      {
        "id": "REQ-1045",
        "type": "استشارة",
        "owner": "العيادات",
        "duration": "55 دقيقة",
        "reason": "الطبيب في عملية",
        "action": "جدولة الاستشارة"
      },
      {
        "id": "REQ-1046",
        "type": "تقرير طبي",
        "owner": "السجلات",
        "duration": "15 دقيقة",
        "reason": "بانتظار توقيع الطبيب",
        "action": "اعتماد التقرير"
      }
    ],
    "queues": {
      "الباطنة": {
        "current": 14,
        "waiting": [
          "أحمد م.",
          "فاطمة ع.",
          "محمد س.",
          "نورا خ."
        ]
      },
      "الأطفال": {
        "current": 9,
        "waiting": [
          "سلمى أ.",
          "يوسف ح.",
          "هدى م."
        ]
      },
      "القلب": {
        "current": 7,
        "waiting": [
          "خالد ع.",
          "مريم ف.",
          "سامي ن.",
          "دينا ر.",
          "علي ط."
        ]
      },
      "العظام": {
        "current": 5,
        "waiting": [
          "عمر ي.",
          "ياسمين خ."
        ]
      },
      "النساء والتوليد": {
        "current": 11,
        "waiting": [
          "نورا س."
        ]
      },
      "الطوارئ": {
        "current": 22,
        "waiting": [
          "حالة 1",
          "حالة 2",
          "حالة 3",
          "حالة 4",
          "حالة 5"
        ]
      }
    }
  }
};

export const DEFAULT_SHARED_DATA: SharedData = {
  prescriptions: [],
  labOrders: [],
  pharmacyRequests: [],
  events: [],
};

export function cloneDefaultRoleSeeds(): AllRoleStates {
  return JSON.parse(JSON.stringify(DEFAULT_ROLE_SEEDS)) as AllRoleStates;
}

export function cloneDefaultSharedData(): SharedData {
  return JSON.parse(JSON.stringify(DEFAULT_SHARED_DATA)) as SharedData;
}
