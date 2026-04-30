//src/components/PatientPanel.jsx
const PatientPanel = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('register');

  const [history,       setHistory]       = useState([]);
  const [schedules,     setSchedules]     = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [panelLoading,  setPanelLoading]  = useState(false);  // ← false, not true
  const [panelError,    setPanelError]    = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      setPanelError(null);

      try {
        const [hist, sched, regs] = await Promise.all([
          vaccinationHistoryAPI.getByPatient(user.id),   // instant if hovered first
          doseScheduleAPI.getByPatient(user.id),
          registrationAPI.getByPatient(user.id),
        ]);
        if (cancelled) return;
        setHistory(hist   ?? []);
        setSchedules(sched ?? []);
        setRegistrations([...(regs ?? [])].sort((a, b) => b.id - a.id));
      } catch {
        if (!cancelled) setPanelError('Could not load patient data. Please try again.');
      } finally {
        if (!cancelled) setPanelLoading(false);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, [user.id]);

  const tabs = [
    { key: 'register', label: '📋 Register' },
    { key: 'history',  label: '💉 History' },
    { key: 'schedule', label: '📅 Schedule' },
  ];

  return (
    <div className="pm-panel-overlay" onClick={onClose}>
      <div className="pm-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
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

        {/* Tabs */}
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
          {/* Single loading state for the whole panel */}
          {panelLoading && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
              ⏳ Loading patient data...
            </div>
          )}

          {!panelLoading && panelError && (
            <div className="alert" style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
              {panelError}
            </div>
          )}

          {!panelLoading && !panelError && (
            <>
              {activeTab === 'register' && (
                <RegisterTab
                  key={`register-${user.id}`}
                  user={user}
                  registrations={registrations}
                  setRegistrations={setRegistrations}
                />
              )}
              {activeTab === 'history' && (
                <HistoryTab
                  key={`history-${user.id}`}
                  patientId={user.id}
                  history={history}
                  setHistory={setHistory}
                />
              )}
              {activeTab === 'schedule' && (
                <ScheduleTab
                  key={`schedule-${user.id}`}
                  patientId={user.id}
                  schedules={schedules}
                  setSchedules={setSchedules}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};