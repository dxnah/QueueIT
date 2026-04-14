import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { usageReportAPI, stockReportAPI, vaccineAPI } from '../services/api';
import '../styles/dashboard.css';
import '../styles/reports.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const calcEff = (adm, wst) => {
  const total = adm + wst;
  if (total === 0) return '0.0';
  return ((adm / total) * 100).toFixed(1);
};

// ── Add / Edit Usage Report Modal ─────────────────────────────────────────────
const UsageReportModal = ({ vaccines, existing, onSave, onClose }) => {
  const [form, setForm] = useState(
    existing
      ? {
          vaccine:      existing.vaccine,
          administered: existing.administered,
          wasted:       existing.wasted,
          remaining:    existing.remaining,
          period:       existing.period || 'daily',
          report_date:  existing.report_date || '',
        }
      : { vaccine: '', administered: '', wasted: '', remaining: '', period: 'daily', report_date: '' }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      vaccine:      parseInt(form.vaccine) || null,
      administered: parseInt(form.administered) || 0,
      wasted:       parseInt(form.wasted)        || 0,
      remaining:    parseInt(form.remaining)     || 0,
      period:       form.period,
      report_date:  form.report_date || null,
    };
    await onSave(payload, existing?.id);
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: '8px',
    border: '1.5px solid #e0e0e0', fontSize: '13px',
    boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-box--wide">
        <div className="modal-green-header">
          <div className="modal-green-header-left">
            <div className="modal-icon-circle">{existing ? '✏️' : '➕'}</div>
            <div>
              <h3 className="modal-green-title">{existing ? 'Edit Usage Report' : 'Add Usage Report'}</h3>
              <p className="modal-green-subtitle">Vaccine administered / wasted / remaining</p>
            </div>
          </div>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="modal-field">
              <label className="modal-label">Vaccine</label>
              <select value={form.vaccine} onChange={e => setForm(p => ({ ...p, vaccine: e.target.value }))}
                required style={{ ...inputStyle, background: 'white' }}>
                <option value="">— Select Vaccine —</option>
                {vaccines.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="modal-grid-2">
              <div>
                <label className="modal-label">Administered</label>
                <input type="number" min="0" required value={form.administered}
                  onChange={e => setForm(p => ({ ...p, administered: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label className="modal-label">Wasted</label>
                <input type="number" min="0" required value={form.wasted}
                  onChange={e => setForm(p => ({ ...p, wasted: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div className="modal-grid-2">
              <div>
                <label className="modal-label">Remaining</label>
                <input type="number" min="0" required value={form.remaining}
                  onChange={e => setForm(p => ({ ...p, remaining: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label className="modal-label">Period</label>
                <select value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))}
                  style={{ ...inputStyle, background: 'white' }}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="modal-field">
              <label className="modal-label">Report Date</label>
              <input type="date" value={form.report_date}
                onChange={e => setForm(p => ({ ...p, report_date: e.target.value }))} style={inputStyle} />
            </div>
            <div className="modal-actions">
              <button type="submit" className="modal-btn-save">
                {existing ? '💾 Update' : '➕ Add Report'}
              </button>
              <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Add / Edit Stock Report Modal ─────────────────────────────────────────────
const StockReportModal = ({ existing, onSave, onClose }) => {
  const [form, setForm] = useState(
    existing
      ? {
          date:         existing.date         || '',
          period_label: existing.period_label || '',
          in_stock:     existing.in_stock,
          low_stock:    existing.low_stock,
          out_stock:    existing.out_stock,
        }
      : { date: '', period_label: '', in_stock: '', low_stock: '', out_stock: '' }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date:         form.date         || null,
      period_label: form.period_label || '',
      in_stock:     parseInt(form.in_stock)  || 0,
      low_stock:    parseInt(form.low_stock) || 0,
      out_stock:    parseInt(form.out_stock) || 0,
    };
    await onSave(payload, existing?.id);
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: '8px',
    border: '1.5px solid #e0e0e0', fontSize: '13px',
    boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-box--wide">
        <div className="modal-green-header">
          <div className="modal-green-header-left">
            <div className="modal-icon-circle">{existing ? '✏️' : '➕'}</div>
            <div>
              <h3 className="modal-green-title">{existing ? 'Edit Stock Report' : 'Add Stock Report'}</h3>
              <p className="modal-green-subtitle">
                Overall inventory snapshot — how many vaccines are in/low/out of stock for a given period
              </p>
            </div>
          </div>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="modal-grid-2">
              <div>
                <label className="modal-label">Date</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label className="modal-label">Period Label</label>
                <input type="text" placeholder="e.g. April 2026" value={form.period_label}
                  onChange={e => setForm(p => ({ ...p, period_label: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div className="modal-grid-2">
              <div>
                <label className="modal-label">In Stock (total doses)</label>
                <input type="number" min="0" required value={form.in_stock}
                  onChange={e => setForm(p => ({ ...p, in_stock: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label className="modal-label">Low Stock (no. of vaccine types)</label>
                <input type="number" min="0" required value={form.low_stock}
                  onChange={e => setForm(p => ({ ...p, low_stock: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div className="modal-field">
              <label className="modal-label">Out of Stock (no. of vaccine types)</label>
              <input type="number" min="0" required value={form.out_stock}
                onChange={e => setForm(p => ({ ...p, out_stock: e.target.value }))} style={inputStyle} />
            </div>
            <div className="modal-actions">
              <button type="submit" className="modal-btn-save">
                {existing ? '💾 Update' : '➕ Add Report'}
              </button>
              <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Export helpers ────────────────────────────────────────────────────────────
const exportToCSV = (rows, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const exportToPDF = (title, rows, columns) => {
  if (!rows.length) return;
  const html = `
    <html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
      h1   { color: #26a69a; font-size: 20px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #26a69a; color: white; padding: 8px 12px; text-align: left; }
      td { padding: 8px 12px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) { background: #f9f9f9; }
    </style></head><body>
    <h1>${title}</h1>
    <p style="color:#888;font-size:12px">Generated: ${new Date().toLocaleString()}</p>
    <table>
      <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${columns.map(c => `<td>${r[c.key] ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></body></html>`;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.print();
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Reports = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Default is 'daily' to match what admin typically adds
  const [selectedPeriod,  setSelectedPeriod]   = useState('daily');
  const [selectedReport,  setSelectedReport]   = useState('vaccine-usage');
  const [dateRange,       setDateRange]        = useState({ startDate: '', endDate: '' });
  const [sortConfig,      setSortConfig]       = useState({ key: null, dir: 'asc' });
  // Vaccine filter for usage chart/table — null means all vaccines
  const [filterVaccineId, setFilterVaccineId] = useState('all');
  const [vaccineDropOpen, setVaccineDropOpen] = useState(false);
  const vaccineDropRef = useRef(null);

  // ── API data ──────────────────────────────────────────────────────────────
  const [usageReports, setUsageReports] = useState([]);
  const [stockReports, setStockReports] = useState([]);
  const [vaccines,     setVaccines]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState(null);
  const [saveMessage,  setSaveMessage]  = useState('');

  // ── Modal state ───────────────────────────────────────────────────────────
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingUsage,   setEditingUsage]   = useState(null);
  const [editingStock,   setEditingStock]   = useState(null);

  // ── Load all data ─────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [usage, stock, vax] = await Promise.all([
        usageReportAPI.getAll(),
        stockReportAPI.getAll(),
        vaccineAPI.getAll(),
      ]);
      setUsageReports(usage);
      setStockReports(stock);
      setVaccines(vax);
    } catch {
      setApiError('Could not connect to server. Check that Django is running on localhost:8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Close vaccine dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (vaccineDropRef.current && !vaccineDropRef.current.contains(e.target))
        setVaccineDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getVaccineName = (vaccineId) => {
    const found = vaccines.find(v => v.id === vaccineId);
    return found ? found.name : `Vaccine #${vaccineId}`;
  };

  // ── Filter usage reports ──────────────────────────────────────────────────
  // Step 1: filter by period
  const periodFiltered = useMemo(() => {
    if (selectedPeriod === 'custom') {
      return usageReports.filter(r => {
        if (!r.report_date) return true;
        const d = r.report_date;
        return (!dateRange.startDate || d >= dateRange.startDate)
            && (!dateRange.endDate   || d <= dateRange.endDate);
      });
    }
    if (selectedPeriod === 'all') return usageReports;
    // Django stores period as lowercase string e.g. 'daily', 'monthly'
    return usageReports.filter(r => r.period === selectedPeriod);
  }, [usageReports, selectedPeriod, dateRange]);

  // Step 2: filter by selected vaccine
  const filteredUsage = useMemo(() => {
    if (filterVaccineId === 'all') return periodFiltered;
    return periodFiltered.filter(r => r.vaccine === parseInt(filterVaccineId));
  }, [periodFiltered, filterVaccineId]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const sortedUsage = useMemo(() => {
    if (!sortConfig.key) return filteredUsage;
    return [...filteredUsage].sort((a, b) => {
      let aVal = sortConfig.key === 'vaccine'
        ? getVaccineName(a.vaccine)
        : sortConfig.key === 'efficiency'
          ? parseFloat(calcEff(a.administered, a.wasted))
          : a[sortConfig.key];
      let bVal = sortConfig.key === 'vaccine'
        ? getVaccineName(b.vaccine)
        : sortConfig.key === 'efficiency'
          ? parseFloat(calcEff(b.administered, b.wasted))
          : b[sortConfig.key];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 :  1;
      if (aVal > bVal) return sortConfig.dir === 'asc' ?  1 : -1;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUsage, sortConfig]);

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon active">{sortConfig.dir === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = filteredUsage.map(r => ({
    name:         getVaccineName(r.vaccine),
    Administered: r.administered,
    Wasted:       r.wasted,
    Remaining:    r.remaining,
  }));

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (selectedReport === 'vaccine-usage') {
      exportToCSV(
        sortedUsage.map(r => ({
          Vaccine:      getVaccineName(r.vaccine),
          Administered: r.administered,
          Wasted:       r.wasted,
          Remaining:    r.remaining,
          Efficiency:   `${calcEff(r.administered, r.wasted)}%`,
          Period:       r.period || '—',
          'Report Date': r.report_date || '—',
        })),
        'vaccine-usage-report.csv'
      );
    } else {
      exportToCSV(
        stockReports.map(r => ({
          Period:       r.period_label || '—',
          Date:         r.date || '—',
          'In Stock':   r.in_stock,
          'Low Stock':  r.low_stock,
          'Out of Stock': r.out_stock,
        })),
        'stock-level-report.csv'
      );
    }
  };

  const handleExportPDF = () => {
    if (selectedReport === 'vaccine-usage') {
      exportToPDF(
        `Vaccine Usage Report — ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`,
        sortedUsage.map(r => ({
          vaccine:      getVaccineName(r.vaccine),
          administered: r.administered,
          wasted:       r.wasted,
          remaining:    r.remaining,
          efficiency:   `${calcEff(r.administered, r.wasted)}%`,
          period:       r.period || '—',
          report_date:  r.report_date || '—',
        })),
        [
          { key: 'vaccine',      label: 'Vaccine' },
          { key: 'administered', label: 'Administered' },
          { key: 'wasted',       label: 'Wasted' },
          { key: 'remaining',    label: 'Remaining' },
          { key: 'efficiency',   label: 'Efficiency' },
          { key: 'period',       label: 'Period' },
          { key: 'report_date',  label: 'Report Date' },
        ]
      );
    } else {
      exportToPDF(
        'Stock Level Report',
        stockReports.map(r => ({
          period_label: r.period_label || '—',
          date:         r.date || '—',
          in_stock:     r.in_stock,
          low_stock:    r.low_stock,
          out_stock:    r.out_stock,
        })),
        [
          { key: 'period_label', label: 'Period' },
          { key: 'date',         label: 'Date' },
          { key: 'in_stock',     label: 'In Stock' },
          { key: 'low_stock',    label: 'Low Stock' },
          { key: 'out_stock',    label: 'Out of Stock' },
        ]
      );
    }
  };

  // ── CRUD: Usage Reports ───────────────────────────────────────────────────
  const handleSaveUsage = async (payload, id) => {
    try {
      if (id) {
        await usageReportAPI.update(id, payload);
        setSaveMessage('✅ Usage report updated!');
      } else {
        await usageReportAPI.create(payload);
        setSaveMessage('✅ Usage report added!');
      }
      await loadAll();
    } catch (err) {
      setSaveMessage(`❌ Error: ${err.message}`);
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteUsage = async (id) => {
    if (!window.confirm('Delete this usage report?')) return;
    try {
      await usageReportAPI.delete(id);
      setSaveMessage('✅ Usage report deleted.');
      await loadAll();
    } catch (err) {
      setSaveMessage(`❌ Error: ${err.message}`);
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // ── CRUD: Stock Reports ───────────────────────────────────────────────────
  const handleSaveStock = async (payload, id) => {
    try {
      if (id) {
        await stockReportAPI.update(id, payload);
        setSaveMessage('✅ Stock report updated!');
      } else {
        await stockReportAPI.create(payload);
        setSaveMessage('✅ Stock report added!');
      }
      await loadAll();
    } catch (err) {
      setSaveMessage(`❌ Error: ${err.message}`);
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm('Delete this stock report?')) return;
    try {
      await stockReportAPI.delete(id);
      setSaveMessage('✅ Stock report deleted.');
      await loadAll();
    } catch (err) {
      setSaveMessage(`❌ Error: ${err.message}`);
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // The vaccine currently shown in the dropdown label
  const selectedVaccineName = filterVaccineId === 'all'
    ? 'All Vaccines'
    : (vaccines.find(v => v.id === parseInt(filterVaccineId))?.name || 'Select Vaccine');

  return (
    <section className="dashboard-container">

      <button type="button" className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰
      </button>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />
      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Modals */}
      {showUsageModal && (
        <UsageReportModal
          vaccines={vaccines}
          existing={editingUsage}
          onSave={handleSaveUsage}
          onClose={() => { setShowUsageModal(false); setEditingUsage(null); }}
        />
      )}
      {showStockModal && (
        <StockReportModal
          existing={editingStock}
          onSave={handleSaveStock}
          onClose={() => { setShowStockModal(false); setEditingStock(null); }}
        />
      )}

      <section className="main-wrapper">
        <TopBar />
        <main className="main-content">

          <header>
            <h1 className="dashboard-heading">📈 Reports & Analytics</h1>
            <p className="dashboard-subheading">Generate and view system performance reports</p>
          </header>

          {saveMessage && <div className="alert alert-success">{saveMessage}</div>}
          {apiError && (
            <div className="alert" style={{ background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600', fontSize: '13px' }}>
              {apiError}
            </div>
          )}

          {/* ── REPORT CONFIGURATION ── */}
          <section className="settings-card">
            <h2 className="section-title">📋 Report Configuration</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="report-type">Report Type</label>
                <select id="report-type" value={selectedReport}
                  onChange={e => setSelectedReport(e.target.value)} className="form-control">
                  <option value="vaccine-usage">💉 Vaccine Usage Report</option>
                  <option value="stock-levels">📦 Stock Levels Report</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="report-period">Time Period</label>
                <select id="report-period" value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)} className="form-control">
                  {/* Daily is first so it's the default highlight */}
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom Range</option>
                  <option value="all">All Records</option>
                </select>
              </div>
            </div>

            {selectedPeriod === 'custom' && (
              <div className="form-row date-range-row">
                <div className="form-group">
                  <label htmlFor="report-start">Start Date</label>
                  <input type="date" id="report-start" name="startDate"
                    value={dateRange.startDate} onChange={handleDateChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label htmlFor="report-end">End Date</label>
                  <input type="date" id="report-end" name="endDate"
                    value={dateRange.endDate} onChange={handleDateChange} className="form-control" />
                </div>
              </div>
            )}

            <div className="form-actions">
              {/* ── Add Report button ── */}
              {selectedReport === 'vaccine-usage' ? (
                <button type="button" className="btn btn-primary"
                  onClick={() => { setEditingUsage(null); setShowUsageModal(true); }}>
                  ➕ Add Usage Report
                </button>
              ) : (
                <button type="button" className="btn btn-primary"
                  onClick={() => { setEditingStock(null); setShowStockModal(true); }}>
                  ➕ Add Stock Report
                </button>
              )}

              {/* ── Export buttons (restored from original design) ── */}
              <button type="button" className="btn btn-secondary" onClick={handleExportPDF}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                📄 Export PDF
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleExportCSV}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                📊 Export Excel
              </button>
            </div>
          </section>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#aaa', fontSize: '15px' }}>
              ⏳ Loading reports from server...
            </div>
          ) : (
            <>
              {/* ── USAGE REPORT SECTION ── */}
              {selectedReport === 'vaccine-usage' && (
                <>
                  {/* Vaccine filter dropdown — same style as Vaccine Management page */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div ref={vaccineDropRef} style={{ position: 'relative' }}>
                      <button type="button"
                        onClick={() => setVaccineDropOpen(v => !v)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                          cursor: 'pointer', border: '1.5px solid #26a69a', transition: 'all 0.18s',
                          background: 'white', color: '#333',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        }}>
                        💉 {selectedVaccineName} ▾
                      </button>
                      {vaccineDropOpen && (
                        <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 999, background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '200px', padding: '6px 0', overflow: 'hidden' }}>
                          <div style={{ padding: '8px 16px 4px', fontSize: '10px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Filter by Vaccine
                          </div>
                          {[{ id: 'all', name: 'All Vaccines' }, ...vaccines].map(v => {
                            const isSelected = String(filterVaccineId) === String(v.id);
                            return (
                              <div key={v.id}
                                onClick={() => { setFilterVaccineId(v.id); setVaccineDropOpen(false); }}
                                style={{
                                  padding: '8px 16px', cursor: 'pointer', fontSize: '13px',
                                  fontWeight: isSelected ? '700' : '500',
                                  background: isSelected ? '#e0f7f4' : 'white',
                                  color: isSelected ? '#26a69a' : '#333',
                                  display: 'flex', justifyContent: 'space-between',
                                  transition: 'background 0.12s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = isSelected ? '#e0f7f4' : '#f5f5f5'}
                                onMouseLeave={e => e.currentTarget.style.background = isSelected ? '#e0f7f4' : 'white'}>
                                {v.name}
                                {isSelected && <span style={{ color: '#26a69a', fontSize: '12px' }}>✓</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#aaa' }}>
                      {filteredUsage.length} record{filteredUsage.length !== 1 ? 's' : ''} for <strong>{selectedPeriod}</strong>
                    </span>
                  </div>

                  {/* Bar chart */}
                  <section className="settings-card">
                    <h2 className="section-title">📊 Vaccine Usage Overview</h2>
                    {chartData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
                        No usage reports found for this period.
                        <br />
                        <span style={{ fontSize: '12px' }}>Add a usage report using the button above.</span>
                      </div>
                    ) : (
                      <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} axisLine={{ stroke: '#e0e0e0' }} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px' }}
                              formatter={(value, name) => [`${value} doses`, name]} />
                            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                            <Bar dataKey="Administered" fill="#26a69a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Wasted"       fill="#ef5350" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Remaining"    fill="#5c6bc0" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </section>
                </>
              )}

              {/* ── REPORT PREVIEW TABLE ── */}
              <section className="settings-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 className="section-title" style={{ margin: 0 }}>📋 Report Preview</h2>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>
                    {selectedReport === 'vaccine-usage'
                      ? `${sortedUsage.length} record${sortedUsage.length !== 1 ? 's' : ''}`
                      : `${stockReports.length} record${stockReports.length !== 1 ? 's' : ''}`}
                  </span>
                </div>

                {/* Usage Reports Table */}
                {selectedReport === 'vaccine-usage' && (
                  <div className="table-wrapper">
                    {sortedUsage.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
                        No usage reports found. Add one using the button above.
                      </div>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th onClick={() => handleSort('vaccine')} className="sortable">
                              Vaccine <SortIcon col="vaccine" />
                            </th>
                            <th onClick={() => handleSort('administered')} className="sortable">
                              Administered <SortIcon col="administered" />
                            </th>
                            <th onClick={() => handleSort('wasted')} className="sortable">
                              Wasted <SortIcon col="wasted" />
                            </th>
                            <th onClick={() => handleSort('remaining')} className="sortable">
                              Remaining <SortIcon col="remaining" />
                            </th>
                            <th onClick={() => handleSort('efficiency')} className="sortable">
                              Efficiency <SortIcon col="efficiency" />
                            </th>
                            <th>Period</th>
                            <th>Report Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedUsage.map((row) => {
                            const eff      = parseFloat(calcEff(row.administered, row.wasted));
                            const rowClass = row.wasted > 10 ? 'row-critical' : row.wasted > 5 ? 'row-warning' : '';
                            return (
                              <tr key={row.id} className={rowClass}>
                                <td><strong>{getVaccineName(row.vaccine)}</strong></td>
                                <td>{row.administered} doses</td>
                                <td>
                                  <span className={row.wasted > 5 ? 'waste-badge waste-high' : 'waste-badge waste-low'}>
                                    {row.wasted} doses
                                  </span>
                                </td>
                                <td>{row.remaining} doses</td>
                                <td>
                                  <div className="eff-cell">
                                    <span style={{ color: eff >= 98 ? '#2e7d32' : eff >= 95 ? '#f57f17' : '#e53935', fontWeight: 'bold' }}>
                                      {eff}%
                                    </span>
                                    <div className="eff-bar-track">
                                      <div className="eff-bar-fill"
                                        style={{ width: `${eff}%`, background: eff >= 98 ? '#26a69a' : eff >= 95 ? '#f57f17' : '#e53935' }} />
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span style={{ padding: '2px 8px', borderRadius: '10px', background: '#f0f0f0', fontSize: '11px', fontWeight: '600' }}>
                                    {row.period || '—'}
                                  </span>
                                </td>
                                <td style={{ color: '#888', fontSize: '12px' }}>{row.report_date || '—'}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      onClick={() => { setEditingUsage(row); setShowUsageModal(true); }}
                                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1.5px solid #26a69a', background: 'white', color: '#26a69a', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                      onMouseEnter={e => { e.currentTarget.style.background = '#26a69a'; e.currentTarget.style.color = 'white'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#26a69a'; }}>
                                      ✏️ Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUsage(row.id)}
                                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1.5px solid #e53935', background: 'white', color: '#e53935', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                      onMouseEnter={e => { e.currentTarget.style.background = '#e53935'; e.currentTarget.style.color = 'white'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#e53935'; }}>
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Stock Level Reports Table */}
                {selectedReport === 'stock-levels' && (
                  <div className="table-wrapper">
            
                    {stockReports.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
                        No stock reports found. Add one using the button above.
                      </div>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Date</th>
                            <th>In Stock (doses)</th>
                            <th>Low Stock (types)</th>
                            <th>Out of Stock (types)</th>
                            <th>Stock Health</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockReports.map((row) => (
                            <tr key={row.id}>
                              <td><strong>{row.period_label || '—'}</strong></td>
                              <td style={{ color: '#888', fontSize: '12px' }}>{row.date || '—'}</td>
                              <td style={{ color: '#2e7d32', fontWeight: '700' }}>{row.in_stock}</td>
                              <td style={{ color: '#f57f17', fontWeight: '700' }}>{row.low_stock}</td>
                              <td style={{ color: '#e53935', fontWeight: '700' }}>{row.out_stock}</td>
                              <td>
                                <span className={
                                  row.out_stock === 0 && row.low_stock < 2 ? 'status-in-stock' :
                                  row.out_stock > 0 ? 'status-out-stock' : 'status-low-stock'
                                }>
                                  {row.out_stock === 0 && row.low_stock < 2 ? '✅ Healthy' :
                                   row.out_stock > 0 ? '🚨 Critical' : '⚠️ Needs Attention'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => { setEditingStock(row); setShowStockModal(true); }}
                                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1.5px solid #26a69a', background: 'white', color: '#26a69a', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#26a69a'; e.currentTarget.style.color = 'white'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#26a69a'; }}>
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStock(row.id)}
                                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1.5px solid #e53935', background: 'white', color: '#e53935', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#e53935'; e.currentTarget.style.color = 'white'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#e53935'; }}>
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </section>
            </>
          )}

        </main>
      </section>
    </section>
  );
};

export default Reports;