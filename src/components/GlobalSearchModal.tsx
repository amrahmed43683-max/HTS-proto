import React, { useEffect, useMemo, useRef, useState } from 'react';
import { htsStorage } from '../storage/htsIndexedDb';
import { RoleId } from '../storage/types';
import {
  buildGlobalSearchIndex,
  ROLE_META,
  SearchEntry,
  searchPlatformItems,
} from '../utils/platformSearch';

interface GlobalSearchModalProps {
  open: boolean;
  activeRole: RoleId;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const CATEGORY_LABELS: Record<SearchEntry['category'], string> = {
  page: 'صفحة',
  patient: 'مريض',
  prescription: 'وصفة',
  lab: 'تحليل',
  inventory: 'مخزون',
  claim: 'تأمين',
  clinic: 'عيادة',
  alert: 'تنبيه',
  appointment: 'موعد',
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  activeRole,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const allEntries = useMemo(() => {
    if (!open) return [];
    return buildGlobalSearchIndex(
      htsStorage.getAllRoleStatesSync(),
      htsStorage.getSharedDataSync(),
      activeRole
    );
  }, [open, activeRole]);

  const results = useMemo(
    () => searchPlatformItems(allEntries, query, 14),
    [allEntries, query]
  );

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const roleName = ROLE_META[activeRole].label;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      const target = results[activeIndex];
      onNavigate(target.page);
      onClose();
    }
  };

  return (
    <div
      className="hts-modal-backdrop"
      id="globalSearchModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="hts-modal-card hts-search-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`البحث داخل بوابة ${roleName}`}
      >
        <div className="hts-search-header">
          <span className="hts-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            id="globalSearchInput"
            type="text"
            className="hts-search-input"
            placeholder={`ابحث داخل بوابة ${roleName} فقط...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hts-kbd">ESC</kbd>
          <button
            type="button"
            className="hts-icon-close-btn"
            onClick={onClose}
            aria-label="إغلاق البحث"
          >
            ✕
          </button>
        </div>

        <div className="hts-search-results" role="listbox">
          {results.length === 0 ? (
            <div className="hts-search-empty">
              لا توجد نتائج مطابقة لـ «{query}» داخل بوابة {roleName}.
            </div>
          ) : (
            results.map((entry, idx) => (
              <button
                key={entry.id}
                type="button"
                role="option"
                aria-selected={idx === activeIndex}
                className={`hts-search-item ${idx === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  onNavigate(entry.page);
                  onClose();
                }}
              >
                <div className="hts-search-item-main">
                  <div className="hts-search-item-title">{entry.title}</div>
                  <div className="hts-search-item-sub">{entry.subtitle}</div>
                </div>
                <div className="hts-search-item-meta">
                  <span>{entry.roleLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{CATEGORY_LABELS[entry.category]}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="hts-search-footer">
          <span>↑↓ للتنقل</span>
          <span aria-hidden="true">·</span>
          <span>Enter للانتقال</span>
          <span aria-hidden="true">·</span>
          <span>نطاق البحث: بوابة {roleName}</span>
        </div>
      </div>
    </div>
  );
};
