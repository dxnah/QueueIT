// src/pages/patientmanagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import {
  patientAPI,
  vaccinationHistoryAPI,
  doseScheduleAPI,
  registrationAPI,
  warmPatientPanel 
} from '../services/api';
import '../styles/dashboard.css';
import '../styles/patientmanagement.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#26a69a','#5c6bc0','#ef5350','#ab47bc',
  '#26c6da','#66bb6a','#ffa726','#ec407a',
];

const getAvatarColor = (id) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const formatLastLogin = (iso) => {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const todayISO = () => new Date().toISOString().split('T')[0];

// ── Inline Modal ──────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
    onClick={onClose}
  >
    <div
      style={{
        background: '#fff', borderRadius: '12px', padding: '28px',
        width: '480px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>{title}</h3>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888', lineHeight: 1 }}
        >✕</button>
      </div>
      {children}
    </div>
  </div>
);

const formInputStyle = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0',
  borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const formLabelStyle = {
  display: 'block', fontSize: '12px', fontWeight: 600,
  color: '#555', marginBottom: '4px',
};

const btnPrimary = {
  background: '#26a69a', color: '#fff', border: 'none', borderRadius: '8px',
  padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
};

const btnDanger = {
  background: '#fff0f0', color: '#e53935', border: '1.5px solid #ffcdd2',
  borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
};

const btnEdit = {
  background: '#e8f5e9', color: '#2e7d32', border: '1.5px solid #c8e6c9',
  borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
};

// ── Registration Detail Modal ─────────────────────────────────────────────────

const RegistrationDetailModal = ({ reg, onClose }) => (
  <Modal title="📋 Registration Details" onClose={onClose}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
      {/* Queue Number Badge */}
      {reg.queue_number && (
        <div style={{
          background: '#e0f2f1', borderRadius: '8px', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px',
        }}>
          <span style={{ fontSize: '20px' }}>🎫</span>
          <div>
            <div style={{ fontSize: '11px', color: '#555', fontWeight: 600 }}>Queue Number</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#00796b', letterSpacing: '2px' }}>
              {reg.queue_number}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <DetailField label="Full Name" value={reg.full_name} />
        <DetailField label="Age" value={reg.age} />
        <DetailField label="Birthdate" value={formatDate(reg.birthdate)} />
        <DetailField label="Contact" value={reg.contact} />
        <DetailField label="Incident Date" value={formatDate(reg.incident_date)} />
        <DetailField label="Injury Type" value={reg.injury_type} capitalize />
        <DetailField label="Animal Type" value={reg.animal_type} />
        <DetailField label="Animal Owner" value={reg.animal_owner} />
        <DetailField label="Animal Vaccinated?" value={reg.animal_vaccinated} capitalize />
        <DetailField label="Body Part Affected" value={reg.body_part} />
      </div>

      <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '10px 14px' }}>
        <div style={{ fontSize: '11px', color: '#888', fontWeight: 600, marginBottom: '2px' }}>Address</div>
        <div style={{ color: '#333' }}>{reg.address || '—'}</div>
      </div>

      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', textAlign: 'right' }}>
        Registered: {formatDate(reg.created_at)}
      </div>
    </div>
  </Modal>
);

const DetailField = ({ label, value, capitalize }) => (
  <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '8px 12px' }}>
    <div style={{ fontSize: '11px', color: '#888', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
    <div style={{ color: '#333', textTransform: capitalize ? 'capitalize' : 'none' }}>
      {value || '—'}
    </div>
  </div>
);

// ── Vaccination History Tab ───────────────────────────────────────────────────

const HistoryTab = ({ patientId }) => {
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState(null);

  const emptyForm = { dose: '', date: todayISO(), facility: '', administered_by: '' };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vaccinationHistoryAPI.getByPatient(patientId);
      setHistory(data);
    } catch {
      setError('Could not load vaccination history.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditRecord(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (rec) => {
    setEditRecord(rec);
    setForm({
      dose:            rec.dose            || '',
      date:            rec.date            || todayISO(),
      facility:        rec.facility        || '',
      administered_by: rec.administered_by || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      if (editRecord) {
        const updated = await vaccinationHistoryAPI.update(editRecord.id, { ...form, patient_id: patientId });
        setHistory(prev => prev.map(h => h.id === editRecord.id ? updated : h));
        setMsg({ type: 'success', text: '✅ Record updated.' });
      } else {
        const created = await vaccinationHistoryAPI.create({ ...form, patient_id: patientId });
        setHistory(prev => [...prev, created]);
        setMsg({ type: 'success', text: '✅ Record added.' });
      }
      setShowModal(false);
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vaccination record?')) return;
    try {
      await vaccinationHistoryAPI.delete(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      setMsg({ type: 'success', text: '✅ Record deleted.' });
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` });
    }
  };

  return (
    <div>
      {showModal && (
        <Modal title={editRecord ? '✏️ Edit Vaccination Record' : '💉 Add Vaccination Record'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={formLabelStyle}>Dose</label>
              <input style={formInputStyle} placeholder="e.g. ERIG Day 0" value={form.dose}
                onChange={e => setForm(p => ({ ...p, dose: e.target.value }))} />
            </div>
            <div>
              <label style={formLabelStyle}>Date Administered</label>
              <input style={formInputStyle} type="date" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label style={formLabelStyle}>Facility</label>
              <input style={formInputStyle} placeholder="e.g. RHU Davao" value={form.facility}
                onChange={e => setForm(p => ({ ...p, facility: e.target.value }))} />
            </div>
            <div>
              <label style={formLabelStyle}>Administered By</label>
              <input style={formInputStyle} placeholder="Nurse / Doctor name" value={form.administered_by}
                onChange={e => setForm(p => ({ ...p, administered_by: e.target.value }))} />
            </div>

            {msg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                background: msg.type === 'success' ? '#e8f5e9' : '#ffebee',
                color: msg.type === 'success' ? '#2e7d32' : '#c62828' }}>
                {msg.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button style={btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving...' : editRecord ? '💾 Update' : '➕ Add Record'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p className="pm-section-note" style={{ margin: 0 }}>Vaccination records administered to this patient.</p>
        <button style={btnPrimary} onClick={openAdd}>➕ Add Record</button>
      </div>

      {msg && !showModal && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px',
          background: msg.type === 'success' ? '#e8f5e9' : '#ffebee',
          color: msg.type === 'success' ? '#2e7d32' : '#c62828' }}>
          {msg.text}
        </div>
      )}

      {loading && <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>⏳ Loading history...</div>}
      {error && <div className="alert" style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>{error}</div>}

      {!loading && !error && history.length === 0 && (
        <div className="pm-empty">
          <div className="pm-empty-icon">💉</div>
          <p>No vaccination history found. Click "Add Record" to get started.</p>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table" style={{ marginTop: '8px' }}>
            <thead>
              <tr>
                <th>Dose</th>
                <th>Date</th>
                <th>Facility</th>
                <th>Administered By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td>{h.dose || '—'}</td>
                  <td style={{ fontSize: '12px', color: '#888' }}>{formatDate(h.date)}</td>
                  <td>{h.facility || '—'}</td>
                  <td>{h.administered_by || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={btnEdit} onClick={() => openEdit(h)}>✏️ Edit</button>
                      <button style={btnDanger} onClick={() => handleDelete(h.id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Dose Schedule Tab ─────────────────────────────────────────────────────────

const ScheduleTab = ({ patientId }) => {
  const [schedules, setSchedules]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState(null);

  const emptyForm = { dose_name: '', dose_date: todayISO(), completed: false, is_optional: false };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await doseScheduleAPI.getByPatient(patientId);
      setSchedules(data);
    } catch {
      setError('Could not load dose schedules.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditRecord(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (rec) => {
    setEditRecord(rec);
    setForm({
      dose_name:   rec.dose_name   || '',
      dose_date:   rec.dose_date   || todayISO(),
      completed:   rec.completed   || false,
      is_optional: rec.is_optional || false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      if (editRecord) {
        const updated = await doseScheduleAPI.update(editRecord.id, { ...form, patient_id: patientId });
        setSchedules(prev => prev.map(s => s.id === editRecord.id ? updated : s));
        setMsg({ type: 'success', text: '✅ Schedule updated.' });
      } else {
        const created = await doseScheduleAPI.create({ ...form, patient_id: patientId });
        setSchedules(prev => [...prev, created]);
        setMsg({ type: 'success', text: '✅ Schedule added.' });
      }
      setShowModal(false);
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this dose schedule?')) return;
    try {
      await doseScheduleAPI.delete(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      setMsg({ type: 'success', text: '✅ Schedule deleted.' });
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` });
    }
  };

  const toggleComplete = async (rec) => {
    try {
      const updated = await doseScheduleAPI.update(rec.id, {
        ...rec, patient_id: patientId, completed: !rec.completed,
      });
      setSchedules(prev => prev.map(s => s.id === rec.id ? updated : s));
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` });
    }
  };

  return (
    <div>
      {showModal && (
        <Modal title={editRecord ? '✏️ Edit Dose Schedule' : '📅 Add Dose Schedule'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={formLabelStyle}>Dose Name</label>
              <input style={formInputStyle} placeholder="e.g. Anti-Rabies Day 3" value={form.dose_name}
                onChange={e => setForm(p => ({ ...p, dose_name: e.target.value }))} />
            </div>
            <div>
              <label style={formLabelStyle}>Scheduled Date</label>
              <input style={formInputStyle} type="date" value={form.dose_date}
                onChange={e => setForm(p => ({ ...p, dose_date: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#555', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.completed}
                  onChange={e => setForm(p => ({ ...p, completed: e.target.checked }))} />
                Completed
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#555', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_optional}
                  onChange={e => setForm(p => ({ ...p, is_optional: e.target.checked }))} />
                Optional
              </label>
            </div>

            {msg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                background: msg.type === 'success' ? '#e8f5e9' : '#ffebee',
                color: msg.type === 'success' ? '#2e7d32' : '#c62828' }}>
                {msg.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button style={btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving...' : editRecord ? '💾 Update' : '➕ Add Schedule'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p className="pm-section-note" style={{ margin: 0 }}>Upcoming and past dose schedules for this patient.</p>
        <button style={btnPrimary} onClick={openAdd}>➕ Add Schedule</button>
      </div>

      {msg && !showModal && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px',
          background: msg.type === 'success' ? '#e8f5e9' : '#ffebee',
          color: msg.type === 'success' ? '#2e7d32' : '#c62828' }}>
          {msg.text}
        </div>
      )}

      {loading && <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>⏳ Loading schedules...</div>}
      {error && <div className="alert" style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>{error}</div>}

      {!loading && !error && schedules.length === 0 && (
        <div className="pm-empty">
          <div className="pm-empty-icon">📅</div>
          <p>No dose schedules found. Click "Add Schedule" to get started.</p>
        </div>
      )}

      {!loading && !error && schedules.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table" style={{ marginTop: '8px' }}>
            <thead>
              <tr>
                <th>Dose</th>
                <th>Date</th>
                <th>Status</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id}>
                  <td>{s.dose_name || '—'}</td>
                  <td style={{ fontSize: '12px', color: '#888' }}>{formatDate(s.dose_date)}</td>
                  <td>
                    <button
                      onClick={() => toggleComplete(s)}
                      title="Click to toggle status"
                      style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                        border: 'none', cursor: 'pointer',
                        background: s.completed ? '#e8f5e9' : '#fff3e0',
                        color:      s.completed ? '#2e7d32' : '#e65100',
                      }}
                    >
                      {s.completed ? '✅ Done' : '⏳ Pending'}
                    </button>
                  </td>
                  <td style={{ fontSize: '12px', color: '#888' }}>
                    {s.is_optional ? 'Optional' : 'Required'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={btnEdit} onClick={() => openEdit(s)}>✏️ Edit</button>
                      <button style={btnDanger} onClick={() => handleDelete(s.id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Registration Tab (New Form + Past Registrations) ──────────────────────────

const RegisterTab = ({ user }) => {
  // ── Sub-tab state: 'new' | 'list'
  const [subTab, setSubTab] = useState('new');

  // ── New registration form state
  const [registerForm, setRegisterForm] = useState({
    patient_id:        user.id,
    full_name:         user.name || '',
    age:               '',
    birthdate:         '',
    address:           '',
    contact:           user.phone || '',
    incident_date:     '',
    injury_type:       '',
    animal_type:       '',
    animal_owner:      '',
    animal_vaccinated: '',
    body_part:         '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState(null);

  // ── Past registrations state
  const [registrations, setRegistrations]       = useState([]);
  const [regLoading, setRegLoading]             = useState(false);
  const [regError, setRegError]                 = useState(null);
  const [viewReg, setViewReg]                   = useState(null);   // detail modal
  const [deleteMsg, setDeleteMsg]               = useState(null);

  // Load registrations whenever sub-tab switches to 'list'
  const loadRegistrations = useCallback(async () => {
    setRegLoading(true);
    setRegError(null);
    try {
      const data = await registrationAPI.getByPatient(user.id);
      // Sort newest first
      setRegistrations([...data].sort((a, b) => b.id - a.id));
    } catch {
      setRegError('Could not load registrations.');
    } finally {
      setRegLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (subTab === 'list') loadRegistrations();
  }, [subTab, loadRegistrations]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterMessage(null);
    try {
      await registrationAPI.create(registerForm);
      setRegisterMessage({ type: 'success', text: '✅ Patient registered successfully!' });
    } catch (err) {
      setRegisterMessage({ type: 'error', text: `❌ Registration failed: ${err.message}` });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDeleteReg = async (id) => {
    if (!window.confirm('Delete this registration? This cannot be undone.')) return;
    try {
      await registrationAPI.delete(id);
      setRegistrations(prev => prev.filter(r => r.id !== id));
      setDeleteMsg({ type: 'success', text: '✅ Registration deleted.' });
    } catch (err) {
      setDeleteMsg({ type: 'error', text: `❌ ${err.message}` });
    }
  };

  const injuryBadgeStyle = (type) => {
    const map = {
      bite:    { bg: '#fff3e0', color: '#e65100' },
      scratch: { bg: '#f3e5f5', color: '#7b1fa2' },
      lick:    { bg: '#e8f5e9', color: '#2e7d32' },
      other:   { bg: '#f5f5f5', color: '#555' },
    };
    const s = map[type] || map.other;
    return {
      padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
      fontWeight: 600, background: s.bg, color: s.color, textTransform: 'capitalize',
    };
  };

  return (
    <div>
      {/* ── Detail View Modal ── */}
      {viewReg && (
        <RegistrationDetailModal reg={viewReg} onClose={() => setViewReg(null)} />
      )}

      {/* ── Sub-tab toggle ── */}
      <div style={{
        display: 'flex', gap: '0', marginBottom: '18px',
        border: '1.5px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden',
      }}>
        <button
          onClick={() => setSubTab('new')}
          style={{
            flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600,
            background: subTab === 'new' ? '#26a69a' : '#fafafa',
            color:      subTab === 'new' ? '#fff'     : '#666',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          ➕ New Registration
        </button>
        <button
          onClick={() => setSubTab('list')}
          style={{
            flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600,
            borderLeft: '1.5px solid #e0e0e0',
            background: subTab === 'list' ? '#26a69a' : '#fafafa',
            color:      subTab === 'list' ? '#fff'    : '#666',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          📋 Past Registrations
        </button>
      </div>

      {/* ── NEW REGISTRATION FORM ─────────────────────────────────── */}
      {subTab === 'new' && (
        <div>
          <p className="pm-section-note">
            Register this patient's animal bite / vaccination incident in the system.
          </p>

          {registerMessage && (
            <div className={`alert ${registerMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {registerMessage.text}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="pm-form-grid">
              <div className="pm-form-field">
                <label className="pm-form-label">Full Name</label>
                <input className="pm-form-input" type="text" required
                  value={registerForm.full_name}
                  onChange={e => setRegisterForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Full name" />
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Age</label>
                <input className="pm-form-input" type="text" required
                  value={registerForm.age}
                  onChange={e => setRegisterForm(p => ({ ...p, age: e.target.value }))}
                  placeholder="e.g. 25" />
              </div>
            </div>

            <div className="pm-form-grid">
              <div className="pm-form-field">
                <label className="pm-form-label">Birthdate</label>
                <input className="pm-form-input" type="date"
                  value={registerForm.birthdate}
                  onChange={e => setRegisterForm(p => ({ ...p, birthdate: e.target.value }))} />
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Contact</label>
                <input className="pm-form-input" type="text"
                  value={registerForm.contact}
                  onChange={e => setRegisterForm(p => ({ ...p, contact: e.target.value }))}
                  placeholder="+63 9XX XXX XXXX" />
              </div>
            </div>

            <div className="pm-form-field">
              <label className="pm-form-label">Address</label>
              <input className="pm-form-input" type="text" required
                value={registerForm.address}
                onChange={e => setRegisterForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Full address" />
            </div>

            <div className="pm-form-grid">
              <div className="pm-form-field">
                <label className="pm-form-label">Incident Date</label>
                <input className="pm-form-input" type="date"
                  value={registerForm.incident_date}
                  onChange={e => setRegisterForm(p => ({ ...p, incident_date: e.target.value }))} />
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Injury Type</label>
                <select className="pm-form-input pm-form-select"
                  value={registerForm.injury_type}
                  onChange={e => setRegisterForm(p => ({ ...p, injury_type: e.target.value }))}>
                  <option value="">— Select —</option>
                  <option value="bite">Bite</option>
                  <option value="scratch">Scratch</option>
                  <option value="lick">Lick on open wound</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="pm-form-grid">
              <div className="pm-form-field">
                <label className="pm-form-label">Animal Type</label>
                <input className="pm-form-input" type="text"
                  value={registerForm.animal_type}
                  onChange={e => setRegisterForm(p => ({ ...p, animal_type: e.target.value }))}
                  placeholder="e.g. Dog, Cat" />
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Animal Owner</label>
                <input className="pm-form-input" type="text"
                  value={registerForm.animal_owner}
                  onChange={e => setRegisterForm(p => ({ ...p, animal_owner: e.target.value }))}
                  placeholder="Owner's name" />
              </div>
            </div>

            <div className="pm-form-grid">
              <div className="pm-form-field">
                <label className="pm-form-label">Animal Vaccinated?</label>
                <select className="pm-form-input pm-form-select"
                  value={registerForm.animal_vaccinated}
                  onChange={e => setRegisterForm(p => ({ ...p, animal_vaccinated: e.target.value }))}>
                  <option value="">— Select —</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Body Part Affected</label>
                <input className="pm-form-input" type="text"
                  value={registerForm.body_part}
                  onChange={e => setRegisterForm(p => ({ ...p, body_part: e.target.value }))}
                  placeholder="e.g. Left hand, Right leg" />
              </div>
            </div>

            <button type="submit" className="pm-form-submit" disabled={registerLoading}>
              {registerLoading ? '⏳ Registering...' : '📋 Register Patient'}
            </button>
          </form>
        </div>
      )}

      {/* ── PAST REGISTRATIONS LIST ───────────────────────────────── */}
      {subTab === 'list' && (
        <div>
          <p className="pm-section-note" style={{ marginBottom: '12px' }}>
            All incident registrations submitted for this patient.
          </p>

          {deleteMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px',
              background: deleteMsg.type === 'success' ? '#e8f5e9' : '#ffebee',
              color:      deleteMsg.type === 'success' ? '#2e7d32' : '#c62828',
            }}>
              {deleteMsg.text}
            </div>
          )}

          {regLoading && (
            <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>⏳ Loading registrations...</div>
          )}

          {regError && (
            <div className="alert" style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
              {regError}
            </div>
          )}

          {!regLoading && !regError && registrations.length === 0 && (
            <div className="pm-empty">
              <div className="pm-empty-icon">📋</div>
              <p>No registrations found for this patient.</p>
            </div>
          )}

          {!regLoading && !regError && registrations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {registrations.map(reg => (
                <div key={reg.id} style={{
                  border: '1.5px solid #e8e8e8', borderRadius: '10px',
                  padding: '14px 16px', background: '#fafafa',
                  transition: 'box-shadow 0.15s',
                }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a2e' }}>
                          {reg.full_name || user.name}
                        </span>
                        {reg.queue_number && (
                          <span style={{
                            background: '#e0f2f1', color: '#00796b',
                            padding: '1px 8px', borderRadius: '8px',
                            fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
                          }}>
                            #{reg.queue_number}
                          </span>
                        )}
                        {reg.injury_type && (
                          <span style={injuryBadgeStyle(reg.injury_type)}>
                            {reg.injury_type === 'lick' ? 'Lick on wound' : reg.injury_type}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                        📅 Incident: {formatDate(reg.incident_date)}
                        {reg.created_at && (
                          <span style={{ marginLeft: '12px' }}>🕐 Registered: {formatDate(reg.created_at)}</span>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        style={{
                          background: '#e3f2fd', color: '#1565c0',
                          border: '1.5px solid #bbdefb', borderRadius: '6px',
                          padding: '5px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        }}
                        onClick={() => setViewReg(reg)}
                      >
                        👁️ View
                      </button>
                      <button style={btnDanger} onClick={() => handleDeleteReg(reg.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Card body — quick summary */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '6px',
                  }}>
                    {[
                      { icon: '🐾', label: 'Animal', value: reg.animal_type },
                      { icon: '👤', label: 'Owner', value: reg.animal_owner },
                      { icon: '💉', label: 'Vaccinated', value: reg.animal_vaccinated, capitalize: true },
                      { icon: '🩹', label: 'Body Part', value: reg.body_part },
                    ].map(({ icon, label, value, capitalize }) => value ? (
                      <div key={label} style={{
                        background: '#fff', border: '1px solid #eeeeee',
                        borderRadius: '6px', padding: '5px 8px',
                      }}>
                        <div style={{ fontSize: '10px', color: '#aaa', fontWeight: 600 }}>{icon} {label}</div>
                        <div style={{
                          fontSize: '12px', color: '#444', fontWeight: 500,
                          textTransform: capitalize ? 'capitalize' : 'none',
                        }}>{value}</div>
                      </div>
                    ) : null)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Patient Detail Panel ──────────────────────────────────────────────────────

const PatientDetailPanel = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('register');

  const tabs = [
    { key: 'register', label: '📋 Register' },
    { key: 'history',  label: '💉 History' },
    { key: 'schedule', label: '📅 Schedule' },
  ];

  return (
    <div className="pm-panel-overlay" onClick={onClose}>
      <div className="pm-panel" onClick={e => e.stopPropagation()}>

        {/* ── Panel Header ── */}
        <div className="pm-panel-header">
          <div className="pm-panel-avatar" style={{ background: getAvatarColor(user.id) }}>
            {getInitials(user.name)}
          </div>
          <div className="pm-panel-header-info">
            <h3 className="pm-panel-name">{user.name}</h3>
            <p className="pm-panel-email">{user.username ? `@${user.username}` : user.email}</p>
          </div>
          <button className="pm-panel-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className="pm-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`pm-tab ${activeTab === t.key ? 'pm-tab--active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="pm-panel-body">

          {/* ── Register Tab ─────────────────────────────────────────────── */}
          {activeTab === 'register' && (
            <RegisterTab key={`register-${user.id}`} user={user} />
          )}

          {/* ── History Tab ──────────────────────────────────────────────── */}
          {activeTab === 'history' && (
            <HistoryTab key={`history-${user.id}`} patientId={user.id} />
          )}

          {/* ── Schedule Tab ─────────────────────────────────────────────── */}
          {activeTab === 'schedule' && (
            <ScheduleTab key={`schedule-${user.id}`} patientId={user.id} />
          )}

        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const PatientManagement = () => {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [apiError, setApiError]         = useState(null);
  const [saveMessage, setSaveMessage]   = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');

  const showMsg = (text) => {
    setSaveMessage(text);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await patientAPI.getAll();
      setUsers(data);
    } catch {
      setApiError('Could not connect to server. Showing available data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPatients(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this patient? This cannot be undone.')) return;
    try {
      await patientAPI.delete(id);
      if (selectedUser?.id === id) setSelectedUser(null);
      setUsers(prev => prev.filter(u => u.id !== id));
      showMsg('✅ Patient deleted successfully.');
    } catch (err) {
      showMsg(`❌ Delete failed: ${err.message}`);
    }
  };

  const totalUsers = users.length;

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return !q
      || (u.name     || '').toLowerCase().includes(q)
      || (u.email    || '').toLowerCase().includes(q)
      || (u.username || '').toLowerCase().includes(q)
      || (u.phone    || '').toLowerCase().includes(q);
  });

  return (
    <section className="dashboard-container">
      <Sidebar />

      {selectedUser && (
        <PatientDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <section className="main-wrapper">
        <TopBar />
        <main className="main-content">

          <header>
            <h1 className="dashboard-heading">🧑‍⚕️ Patient Management</h1>
            <p className="dashboard-subheading">Manage registered patients</p>
          </header>

          <div className="stats-container">
            <div className="stat-box" style={{ borderTopColor: '#26a69a' }}>
              <h3 className="stat-title">Total Patients</h3>
              <p className="stat-number" style={{ color: '#26a69a' }}>{totalUsers}</p>
              <p className="stat-note">👥 Registered accounts</p>
            </div>
          </div>

          {apiError && (
            <div className="alert" style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
              {apiError}
            </div>
          )}
          {saveMessage && (
            <div className={`alert ${saveMessage.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
              {saveMessage}
            </div>
          )}

          <div className="um-filters">
            <div className="um-search-wrapper">
              <span className="um-search-icon">🔍</span>
              <input
                type="text"
                className="um-search-input"
                placeholder="Search by name, email, username..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="um-search-clear" onClick={() => setSearchQuery('')} type="button">✕</button>
              )}
            </div>
            <span className="um-results-count">
              {filtered.length} of {totalUsers} patient{totalUsers !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
              Loading patients...
            </div>
          ) : (
            <div className="vaccine-card um-table-card">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Username</th>
                      <th>Phone</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? filtered.map(user => (
                      <tr
                        key={user.id}
                        className="um-table-row"
                        onMouseEnter={() => warmPatientPanel(user.id)}
                        onClick={() => setSelectedUser(user)}
                        title="Click to view patient details"
                      >
                        <td>
                          <div className="um-user-cell">
                            <div className="um-avatar" style={{ background: getAvatarColor(user.id) }}>
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <div className="um-user-name">{user.name}</div>
                              <div className="um-user-email">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="um-username-badge">@{user.username}</span>
                        </td>

                        <td style={{ fontSize: '13px', color: '#555' }}>
                          {user.phone || '—'}
                        </td>

                        <td>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            {formatLastLogin(user.last_login)}
                          </div>
                        </td>

                        <td onClick={e => e.stopPropagation()}>
                          <div className="um-actions">
                            <button
                              type="button"
                              className="um-btn-view"
                              onClick={() => setSelectedUser(user)}
                            >
                              👁️ View
                            </button>
                            <button
                              type="button"
                              className="um-btn-delete"
                              onClick={e => handleDelete(e, user.id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                          👤 No patients found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </section>
    </section>
  );
};

export default PatientManagement;