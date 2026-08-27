import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { medicineAPI } from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const loadMedicines = async () => {
    try {
      const res = await medicineAPI.getAll();
      setMedicines(res.data.data);
    } catch {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMedicines(); }, []);

  const handleDelete = async (id) => {
    try {
      await medicineAPI.delete(id);
      toast.success('Medicine deleted');
      setDeleteId(null);
      loadMedicines();
    } catch {
      toast.error('Failed to delete medicine');
    }
  };

  const isActive = (med) => {
    const now = new Date();
    return med.is_active && new Date(med.start_date) <= now && new Date(med.end_date) >= now;
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>My Medicines</h2>
          <p>{medicines.length} medicine{medicines.length !== 1 ? 's' : ''} in your list</p>
        </div>
        <Link to="/medicines/add" className="btn btn-primary">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Medicine
        </Link>
      </div>

      {medicines.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <div className="empty-title">No medicines yet</div>
            <div className="empty-text">Add your first medicine to get started with reminders</div>
            <Link to="/medicines/add" className="btn btn-primary" style={{ marginTop: 16 }}>Add Medicine</Link>
          </div>
        </div>
      ) : (
        <div className="medicines-grid">
          {medicines.map(med => (
            <div key={med._id} className="medicine-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div className="medicine-name">{med.name}</div>
                  <div className="medicine-dosage">{med.dosage}</div>
                </div>
                <span className={`badge ${isActive(med) ? 'badge-active' : 'badge-inactive'}`}>
                  {isActive(med) ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="medicine-meta">
                <span className="medicine-tag">⏰ {med.times_per_day}x daily</span>
                <span className="medicine-tag">📅 {format(new Date(med.start_date), 'MMM d')} – {format(new Date(med.end_date), 'MMM d, yyyy')}</span>
              </div>

              <div className="medicine-times">
                <div className="medicine-times-label">Reminder Times</div>
                <div className="times-list">
                  {med.reminder_times.map((t, i) => (
                    <span key={i} className="time-chip">{t}</span>
                  ))}
                </div>
              </div>

              {med.notes && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
                  📝 {med.notes}
                </p>
              )}

              <div className="medicine-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/medicines/edit/${med._id}`)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(med._id)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Medicine</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
              Are you sure you want to delete this medicine? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
