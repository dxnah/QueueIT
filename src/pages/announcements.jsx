import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { announcementAPI } from '../services/api';
import '../styles/dashboard.css';
import '../styles/announcements.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const relTime = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`;
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  if (d === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const AnnouncementModal = ({ announcement, onClose, onSave }) => {
  const [title,   setTitle]   = useState(announcement?.title   ?? '');
  const [message, setMessage] = useState(announcement?.message ?? '');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ title: title.trim(), message: message.trim() });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isEdit = !!announcement;

  return (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div className="modal-box modal-box--wide">

        <div className="modal-green-header">
          <div className="modal-green-header-left">
            <div className="modal-icon-circle">📢</div>
            <div>
              <h2 className="modal-green-title">
                {isEdit ? 'Edit announcement' : 'New announcement'}
              </h2>
              <p className="modal-green-subtitle">
                {isEdit ? 'Update the details below' : 'Fill in the details below'}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-body">

          {error && (
            <div className="alert ann-modal-error">⚠️ {error}</div>
          )}

          <div className="modal-field">
            <label className="modal-label">Title</label>
            <input
              type="text"
              className="modal-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Announcement title..."
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Message</label>
            <textarea
              className="modal-input ann-textarea"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your announcement here..."
              rows={5}
            />
          </div>

          <div className="modal-actions">
            <button className="modal-btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="modal-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Post announcement'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ onClose, onConfirm, deleting }) => {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div className="modal-box">

        <div className="modal-green-header ann-delete-header">
          <div className="modal-green-header-left">
            <div className="modal-icon-circle">🗑️</div>
            <div>
              <h2 className="modal-green-title">Delete announcement?</h2>
              <p className="modal-green-subtitle">This action cannot be undone</p>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <p className="ann-delete-text">
            The announcement will be permanently removed and cannot be recovered.
          </p>
          <div className="modal-actions">
            <button className="modal-btn-cancel" onClick={onClose} disabled={deleting}>
              Cancel
            </button>
            <button
              className="modal-btn-save ann-btn-delete-confirm"
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Announcement Card ────────────────────────────────────────────────────────
const AnnouncementCard = ({ announcement, onEdit, onDelete }) => (
  <div className="ann-card">
    <div className="ann-card-inner">
      <div className="ann-card-accent" />
      <div className="ann-card-body">
        <div className="ann-card-top">
          <h3 className="ann-card-title">{announcement.title}</h3>
          <span className="ann-card-time">{relTime(announcement.created_at)}</span>
        </div>
        <p className="ann-card-message">{announcement.message}</p>
        <div className="ann-card-actions">
          <button
            className="modal-btn-cancel ann-card-btn"
            onClick={() => onEdit(announcement)}
          >
            Edit
          </button>
          <button
            className="modal-btn-save ann-card-btn ann-card-btn--delete"
            onClick={() => onDelete(announcement)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Announcements = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcements, setAnnouncements]       = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [searchTerm, setSearchTerm]             = useState('');

  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await announcementAPI.getAll();
      setAnnouncements(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const filtered = announcements.filter(a => {
    const q = searchTerm.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q);
  });

  const handleOpenCreate = () => { setEditTarget(null); setShowModal(true); };
  const handleOpenEdit   = (a) => { setEditTarget(a);   setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSave = async (payload) => {
    if (editTarget) {
      const updated = await announcementAPI.update(editTarget.id, payload);
      setAnnouncements(prev => prev.map(a => a.id === editTarget.id ? updated : a));
    } else {
      const created = await announcementAPI.create(payload);
      setAnnouncements(prev => [created, ...prev]);
    }
    handleCloseModal();
  };

  const handleOpenDelete  = (a) => setDeleteTarget(a);
  const handleCloseDelete = ()  => { setDeleteTarget(null); setDeleting(false); };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await announcementAPI.delete(deleteTarget.id);
      setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget.id));
      handleCloseDelete();
    } catch (err) {
      setError(err.message);
      handleCloseDelete();
    }
  };

  return (
    <div className="dashboard-container">

      <button type="button" className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </button>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />

      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <section className="main-wrapper">
        <TopBar />

        <section className="main-content">

          {/* HEADER */}
          <div className="page-header">
            <div>
              <h2 className="dashboard-heading" style={{ marginTop: '-20px' }}>📢 Announcements</h2>
              <p className="dashboard-subheading">
                {loading
                  ? 'Loading...'
                  : `${announcements.length} announcement${announcements.length !== 1 ? 's' : ''} posted`}
              </p>
            </div>
            <button
              className="modal-btn-save ann-header-btn"
              onClick={handleOpenCreate}
              disabled={loading}
            >
              + New Announcement
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="alert ann-error">⚠️ {error}</div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="ann-loading">⏳ Loading announcements...</div>
          )}

          {!loading && (
            <>
              {/* SEARCH */}
              <div className="ann-search-wrap">
                <span className="ann-search-icon">🔍</span>
                <input
                  type="text"
                  className={`modal-input ann-search-input${searchTerm ? ' ann-search-input--has-clear' : ''}`}
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="ann-search-clear" onClick={() => setSearchTerm('')}>
                    ✖
                  </button>
                )}
              </div>

              {/* CARDS */}
              {filtered.length > 0 ? (
                <div className="ann-list">
                  {filtered.map(a => (
                    <AnnouncementCard
                      key={a.id}
                      announcement={a}
                      onEdit={handleOpenEdit}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="ann-empty-icon">📢</div>
                  <h3 className="ann-empty-title">
                    {searchTerm ? 'No results found' : 'No announcements yet'}
                  </h3>
                  <p className="ann-empty-text">
                    {searchTerm ? 'Try a different search term.' : 'Click "New Announcement" to post your first one.'}
                  </p>
                </div>
              )}
            </>
          )}

        </section>
      </section>

      {showModal && (
        <AnnouncementModal
          announcement={editTarget}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

    </div>
  );
};

export default Announcements;