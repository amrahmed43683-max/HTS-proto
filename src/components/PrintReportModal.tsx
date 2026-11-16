import React from 'react';

export interface PrintableReportPayload {
  title: string;
  subtitle?: string;
  roleLabel: string;
  referenceId?: string;
  issuedAt?: string;
  patientName?: string;
  metadata?: Array<{ label: string; value: string }>;
  columns?: string[];
  rows?: string[][];
  notes?: string;
}

interface PrintReportModalProps {
  report: PrintableReportPayload | null;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  report,
  onClose,
}) => {
  if (!report) return null;

  const issuedAt = report.issuedAt || new Date().toLocaleString('ar-EG');
  const referenceId =
    report.referenceId || `HTS-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="hts-modal-backdrop hts-print-backdrop"
      id="printReportModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="hts-modal-card hts-print-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="معاينة التقرير الطبي للطباعة"
      >
        <div className="hts-print-toolbar no-print">
          <h3>🖨️ معاينة التقرير الطبي الجاهز للطباعة</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="hts-print-primary-btn"
              id="executePrintBtn"
              onClick={handlePrint}
            >
              🖨️ طباعة / حفظ كـ PDF
            </button>
            <button
              type="button"
              className="hts-icon-close-btn"
              onClick={onClose}
              aria-label="إغلاق المعاينة"
            >
              ✕
            </button>
          </div>
        </div>

        <article className="hts-printable-sheet" id="htsPrintableReport">
          <header className="hts-sheet-header">
            <div>
              <div className="hts-sheet-brand">🏥 المنصة الصحية المتكاملة — HTS</div>
              <h1 className="hts-sheet-title">{report.title}</h1>
              {report.subtitle && (
                <p className="hts-sheet-subtitle">{report.subtitle}</p>
              )}
            </div>
            <div className="hts-sheet-ref tabular-nums">
              <div>
                <strong>القسم:</strong> {report.roleLabel}
              </div>
              <div>
                <strong>المرجع:</strong>{' '}
                <span className="font-mono">{referenceId}</span>
              </div>
              <div>
                <strong>تاريخ الإصدار:</strong> {issuedAt}
              </div>
            </div>
          </header>

          {report.patientName && (
            <div className="hts-sheet-patient">
              <strong>بيانات المريض / المستفيد:</strong> {report.patientName}
            </div>
          )}

          {report.metadata && report.metadata.length > 0 && (
            <div className="hts-sheet-meta-grid">
              {report.metadata.map((item, idx) => (
                <div key={idx} className="hts-sheet-meta-cell">
                  <span className="hts-sheet-meta-label">{item.label}</span>
                  <span className="hts-sheet-meta-val tabular-nums">
                    {item.value || '—'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {report.columns && report.rows && report.rows.length > 0 && (
            <div className="hts-sheet-table-wrap">
              <table className="hts-sheet-table">
                <thead>
                  <tr>
                    {report.columns.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="tabular-nums">
                          {cell || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.notes && (
            <div className="hts-sheet-notes">
              <strong>ملاحظات وتوصيات طبية:</strong>
              <p>{report.notes}</p>
            </div>
          )}

          <footer className="hts-sheet-footer">
            <div>
              <div>التوقيع والاعتماد الإلكتروني</div>
              <div className="hts-sheet-sign-line">المنصة الصحية المتكاملة HTS</div>
            </div>
            <div className="hts-sheet-stamp">معتمد إلكترونياً · بيانات عرض محلية</div>
          </footer>
        </article>
      </div>
    </div>
  );
};
