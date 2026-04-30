// ── HistoryTab ────────────────────────────────────────────────────────────────
// Receives pre-loaded `history` + `setHistory` from the panel — no fetch on mount.

const HistoryTab = ({ patientId, history, setHistory }) => {
  const [showModal,   setShowModal]   = useState(false);
  const [editRecord,  setEditRecord]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState(null);

  const emptyForm = { dose: '', date: todayISO(), facility: '', administered_by: '' };
  const [form, setForm] = useState(emptyForm);

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

      {history.length === 0 && (
        <div className="pm-empty">
          <div className="pm-empty-icon">💉</div>
          <p>No vaccination history found. Click "Add Record" to get started.</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table" style={{ marginTop: '8px' }}>
            <thead>
              <tr>
                <th>Dose</th><th>Date</th><th>Facility</th><th>Administered By</th><th>Actions</th>
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
                      <button style={btnEdit}   onClick={() => openEdit(h)}>✏️ Edit</button>
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


// ── ScheduleTab ───────────────────────────────────────────────────────────────
// Receives pre-loaded `schedules` + `setSchedules` from the panel.

const ScheduleTab = ({ patientId, schedules, setSchedules }) => {
  const [showModal,   setShowModal]   = useState(false);
  const [editRecord,  setEditRecord]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState(null);

  const emptyForm = { dose_name: '', dose_date: todayISO(), completed: false, is_optional: false };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditRecord(null); setForm(emptyForm); setShowModal(true); };
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
    setSaving(true); setMsg(null);
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
      const updated = await doseScheduleAPI.update(rec.id, { ...rec, patient_id: patientId, completed: !rec.completed });
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

      {schedules.length === 0 && (
        <div className="pm-empty">
          <div className="pm-empty-icon">📅</div>
          <p>No dose schedules found. Click "Add Schedule" to get started.</p>
        </div>
      )}

      {schedules.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table" style={{ marginTop: '8px' }}>
            <thead>
              <tr><th>Dose</th><th>Date</th><th>Status</th><th>Type</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id}>
                  <td>{s.dose_name || '—'}</td>
                  <td style={{ fontSize: '12px', color: '#888' }}>{formatDate(s.dose_date)}</td>
                  <td>
                    <button onClick={() => toggleComplete(s)} title="Click to toggle"
                      style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                        border: 'none', cursor: 'pointer',
                        background: s.completed ? '#e8f5e9' : '#fff3e0',
                        color:      s.completed ? '#2e7d32' : '#e65100',
                      }}>
                      {s.completed ? '✅ Done' : '⏳ Pending'}
                    </button>
                  </td>
                  <td style={{ fontSize: '12px', color: '#888' }}>{s.is_optional ? 'Optional' : 'Required'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={btnEdit}   onClick={() => openEdit(s)}>✏️ Edit</button>
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


// ── RegisterTab ───────────────────────────────────────────────────────────────
// Receives pre-loaded `registrations` + `setRegistrations` from the panel.

const RegisterTab = ({ user, registrations, setRegistrations }) => {
  const [subTab, setSubTab] = useState('new');

  const [registerForm, setRegisterForm] = useState({
    patient_id:        user.id,
    full_name:         user.name  || '',
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
  const [registerLoading,  setRegisterLoading]  = useState(false);
  const [registerMessage,  setRegisterMessage]  = useState(null);
  const [viewReg,          setViewReg]          = useState(null);
  const [deleteMsg,        setDeleteMsg]        = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterMessage(null);
    try {
      const created = await registrationAPI.create(registerForm);
      // Add to the shared list so "Past Registrations" tab is immediately up to date
      setRegistrations(prev => [created, ...prev]);
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
      {viewReg && <RegistrationDetailModal reg={viewReg} onClose={() => setViewReg(null)} />}

      {/* Sub-tab toggle */}
      <div style={{
        display: 'flex', marginBottom: '18px',
        border: '1.5px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden',
      }}>
        {[['new', '➕ New Registration'], ['list', '📋 Past Registrations']].map(([key, label], i) => (
          <button key={key} onClick={() => setSubTab(key)}
            style={{
              flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
              borderLeft: i > 0 ? '1.5px solid #e0e0e0' : 'none',
              background: subTab === key ? '#26a69a' : '#fafafa',
              color:      subTab === key ? '#fff'    : '#666',
              transition: 'background 0.2s, color 0.2s',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── New Registration Form ── */}
      {subTab === 'new' && (
        <div>
          <p className="pm-section-note">Register this patient's animal bite / vaccination incident.</p>
          {registerMessage && (
            <div className={`alert ${registerMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {registerMessage.text}
            </div>
          )}
          <form onSubmit={handleRegisterSubmit}>
            <div className="pm-form-grid">
              <div className="pm-form-field">
                <label className="pm-form-label">Full Name</label>
                <input className="pm-form-input" type="text" required value={registerForm.full_name}
                  onChange={e => setRegisterForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Age</label>
                <input className="pm-form-input" type="text" required value={registerForm.age}
                  onChange={e => setRegisterForm(p => ({ ...p, age: e.target.value }))} placeholder="e.g. 25" />
              </div>
            </div>
            <div className="pm-form-grid">
              <div className="pm-form-field">
                <label className="pm-form-label">Birthdate</label>
                <input className="pm-form-input" type="date" value={registerForm.birthdate}
                  onChange={e => setRegisterForm(p => ({ ...p, birthdate: e.target.value }))} />
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Contact</label>
                <input className="pm-form-input" type="text" value={registerForm.contact}
                  onChange={e => setRegisterForm(p => ({ ...p, contact: e.target.value }))} placeholder="+63 9XX XXX XXXX" />
              </div>
            </div>
            <div className="pm-form-field">
              <label className="pm-form-label">Address</label>
              <input className="pm-form-input" type="text" required value={registerForm.address}
                onChange={e => setRegisterForm(p => ({ ...p, address: e.target.value }))} placeholder="Full address" />
            </div>
            <div className="pm-form-grid">
              <div className="pm-form-field">
                <label className="pm-form-label">Incident Date</label>
                <input className="pm-form-input" type="date" value={registerForm.incident_date}
                  onChange={e => setRegisterForm(p => ({ ...p, incident_date: e.target.value }))} />
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Injury Type</label>
                <select className="pm-form-input pm-form-select" value={registerForm.injury_type}
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
                <input className="pm-form-input" type="text" value={registerForm.animal_type}
                  onChange={e => setRegisterForm(p => ({ ...p, animal_type: e.target.value }))} placeholder="e.g. Dog, Cat" />
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Animal Owner</label>
                <input className="pm-form-input" type="text" value={registerForm.animal_owner}
                  onChange={e => setRegisterForm(p => ({ ...p, animal_owner: e.target.value }))} placeholder="Owner's name" />
              </div>
            </div>
            <div className="pm-form-grid">
              <div className="pm-form-field">
                <label className="pm-form-label">Animal Vaccinated?</label>
                <select className="pm-form-input pm-form-select" value={registerForm.animal_vaccinated}
                  onChange={e => setRegisterForm(p => ({ ...p, animal_vaccinated: e.target.value }))}>
                  <option value="">— Select —</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="pm-form-field">
                <label className="pm-form-label">Body Part Affected</label>
                <input className="pm-form-input" type="text" value={registerForm.body_part}
                  onChange={e => setRegisterForm(p => ({ ...p, body_part: e.target.value }))} placeholder="e.g. Left hand" />
              </div>
            </div>
            <button type="submit" className="pm-form-submit" disabled={registerLoading}>
              {registerLoading ? '⏳ Registering...' : '📋 Register Patient'}
            </button>
          </form>
        </div>
      )}

      {/* ── Past Registrations List ── */}
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
            }}>{deleteMsg.text}</div>
          )}
          {registrations.length === 0 && (
            <div className="pm-empty">
              <div className="pm-empty-icon">📋</div>
              <p>No registrations found for this patient.</p>
            </div>
          )}
          {registrations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {registrations.map(reg => (
                <div key={reg.id} style={{
                  border: '1.5px solid #e8e8e8', borderRadius: '10px',
                  padding: '14px 16px', background: '#fafafa',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a2e' }}>
                          {reg.full_name || user.name}
                        </span>
                        {reg.queue_number && (
                          <span style={{ background: '#e0f2f1', color: '#00796b', padding: '1px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
                            #{reg.queue_number}
                          </span>
                        )}
                        {reg.injury_type && <span style={injuryBadgeStyle(reg.injury_type)}>{reg.injury_type === 'lick' ? 'Lick on wound' : reg.injury_type}</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                        📅 Incident: {formatDate(reg.incident_date)}
                        {reg.created_at && <span style={{ marginLeft: '12px' }}>🕐 Registered: {formatDate(reg.created_at)}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button style={{ background: '#e3f2fd', color: '#1565c0', border: '1.5px solid #bbdefb', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => setViewReg(reg)}>👁️ View</button>
                      <button style={btnDanger} onClick={() => handleDeleteReg(reg.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px' }}>
                    {[
                      { icon: '🐾', label: 'Animal',     value: reg.animal_type },
                      { icon: '👤', label: 'Owner',      value: reg.animal_owner },
                      { icon: '💉', label: 'Vaccinated', value: reg.animal_vaccinated, capitalize: true },
                      { icon: '🩹', label: 'Body Part',  value: reg.body_part },
                    ].map(({ icon, label, value, capitalize }) => value ? (
                      <div key={label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '6px', padding: '5px 8px' }}>
                        <div style={{ fontSize: '10px', color: '#aaa', fontWeight: 600 }}>{icon} {label}</div>
                        <div style={{ fontSize: '12px', color: '#444', fontWeight: 500, textTransform: capitalize ? 'capitalize' : 'none' }}>{value}</div>
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