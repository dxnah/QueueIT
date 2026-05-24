// src/components/Pagination.jsx
import React from 'react';

const PRIMARY = '#26a69a';
const BORDER   = '#e0e0e0';
const TEXT_MID = '#555';
const TEXT_DIM = '#aaa';

/**
 * Reusable pagination control for VaxFlow tables.
 *
 * Props:
 *  - totalItems      {number}  – total records (after filtering)
 *  - pageSize        {number}  – current rows-per-page selection
 *  - currentPage     {number}  – 1-based current page
 *  - onPageChange    {fn}      – called with new page number
 *  - onPageSizeChange{fn}      – called with new page size
 *  - pageSizeOptions {number[]}– defaults to [10, 15, 20]
 *  - sortKey         {string}  – current sort key (column id)
 *  - sortDir         {'asc'|'desc'} – current sort direction
 *  - onSortChange    {fn}      – called with (key, dir); optional
 *  - sortOptions     {Array}   – [{key, label}]; optional
 */
const Pagination = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 20],
  sortKey,
  sortDir,
  onSortChange,
  sortOptions,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Build page window: always show first, last, current ±1, with ellipsis
  const buildPages = () => {
    const pages = [];
    const add = (p) => { if (!pages.includes(p) && p >= 1 && p <= totalPages) pages.push(p); };
    add(1);
    add(currentPage - 1);
    add(currentPage);
    add(currentPage + 1);
    add(totalPages);
    pages.sort((a, b) => a - b);
    // Insert ellipsis markers
    const result = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) result.push('…');
      result.push(pages[i]);
    }
    return result;
  };

  const btnBase = {
    padding: '5px 10px',
    borderRadius: '6px',
    border: `1.5px solid ${BORDER}`,
    background: 'white',
    color: TEXT_MID,
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
    lineHeight: 1.4,
  };

  const btnActive = {
    ...btnBase,
    background: PRIMARY,
    color: 'white',
    borderColor: PRIMARY,
  };

  const btnDisabled = {
    ...btnBase,
    color: TEXT_DIM,
    cursor: 'default',
    opacity: 0.5,
  };

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '12px 14px',
        borderTop: `1.5px solid ${BORDER}`,
        background: '#fafafa',
        borderRadius: '0 0 12px 12px',
        fontSize: '12px',
        color: TEXT_MID,
      }}
    >
      {/* Left: rows-per-page + sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Rows per page */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: TEXT_DIM, fontWeight: 500 }}>Rows:</span>
          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1.5px solid ${BORDER}`,
              fontSize: '12px',
              fontWeight: '600',
              color: TEXT_MID,
              background: 'white',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {pageSizeOptions.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Sort dropdown (if provided) */}
        {sortOptions && sortOptions.length > 0 && onSortChange && (
          <>
            <div style={{ width: '1px', height: '20px', background: BORDER }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: TEXT_DIM, fontWeight: 500 }}>Sort by:</span>
              <select
                value={sortKey}
                onChange={e => onSortChange(e.target.value, sortDir)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${BORDER}`,
                  fontSize: '12px',
                  fontWeight: '600',
                  color: TEXT_MID,
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  maxWidth: '150px',
                }}
              >
                {sortOptions.map(o => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
              {/* ASC / DESC toggle */}
              <button
                title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                onClick={() => onSortChange(sortKey, sortDir === 'asc' ? 'desc' : 'asc')}
                style={{
                  ...btnBase,
                  padding: '4px 9px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                }}
              >
                {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right: record count + page controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ color: TEXT_DIM, fontWeight: 500, marginRight: '4px' }}>
          {totalItems === 0 ? '0 records' : `${start}–${end} of ${totalItems}`}
        </span>

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={currentPage <= 1 ? btnDisabled : btnBase}
        >
          ‹ Prev
        </button>

        {/* Page numbers */}
        {buildPages().map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} style={{ color: TEXT_DIM, fontSize: '13px', padding: '0 2px' }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={p === currentPage ? btnActive : btnBase}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={currentPage >= totalPages ? btnDisabled : btnBase}
        >
          Next ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;