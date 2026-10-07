import React, { useState, useEffect, useCallback } from 'react';
import { healthAPI } from '../utils/api';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'bp', label: '🫀 Blood Pressure', unit: 'mmHg', color: '#f43f5e', placeholder: 'e.g. 120/80' },
  { key: 'sugar', label: '🩸 Blood Sugar', unit: 'mg/dL', color: '#f59e0b', placeholder: 'e.g. 95' },
  { key: 'weight', label: '⚖️ Weight', unit: 'kg', color: '#8b5cf6', placeholder: 'e.g. 72.5' }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 4 }}>{label}</p>
        <p style={{ color: payload[0].color, fontFamily: 'DM Mono', fontWeight: 700 }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function HealthTracker() {
  const [activeTab, setActiveTab] = useState('bp');
  const [records, setRecords] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'bp', value: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const days = period === 'monthly' ? 30 : 7;
      const res = await healthAPI.getAll({ type: activeTab, days });
      setRecords(res.data.data);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [activeTab, period]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.value) return toast.error('Please enter a value');
    setSubmitting(true);
    try {
      await healthAPI.create({ ...form, type: activeTab });
      toast.success('Record added!');
      setForm({ type: activeTab, value: '', notes: '' });
      setShowForm(false);
      loadRecords();
    } catch {
      toast.error('Failed to save record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await healthAPI.delete(id);
      toast.success('Record deleted');
      loadRecords();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const chartData = [...records].reverse().map(r => ({
    date: format(new Date(r.recorded_at), 'MMM d'),
    value: r.type === 'bp' ? parseInt(r.value.split('/')[0]) : parseFloat(r.value),
    raw: r.value
  }));

  const currentTab = TABS.find(t => t.key === activeTab);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Health Tracker</h2>
          <p>Monitor your vital health metrics</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Record
        </button>
      </div>

      {/* Tabs */}
      <div className="health-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`health-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ marginBottom: 20 }}>
        <div className="chart-header">
          <h3 className="chart-title">{currentTab?.label} Trend</h3>
          <div className="chart-period-toggle">
            <button className={`period-btn ${period === 'weekly' ? 'active' : ''}`} onClick={() => setPeriod('weekly')}>7 Days</button>
            <button className={`period-btn ${period === 'monthly' ? 'active' : ''}`} onClick={() => setPeriod('monthly')}>30 Days</button>
          </div>
        </div>

        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="value"
                stroke={currentTab?.color} strokeWidth={2.5}
                dot={{ fill: currentTab?.color, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <div className="empty-icon">📈</div>
            <div className="empty-title">Not enough data</div>
            <div className="empty-text">Add at least 2 records to see a trend chart</div>
          </div>
        )}
      </div>

      {/* Records list */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Recent Records ({records.length})</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🩺</div>
            <div className="empty-title">No records yet</div>
            <div className="empty-text">Start tracking your {currentTab?.label}</div>
          </div>
        ) : (
          <div className="health-records-list">
            {records.map(r => (
              <div key={r._id} className="health-record-item">
                <div>
                  <div className={`record-value ${r.type}`}>{r.value} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'inherit' }}>{currentTab?.unit}</span></div>
                  {r.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.notes}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="record-date">
                    <div>{format(new Date(r.recorded_at), 'MMM d, yyyy')}</div>
                    <div>{format(new Date(r.recorded_at), 'h:mm a')}</div>
                  </div>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(r._id)} title="Delete">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add record modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Health Record</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={activeTab} onChange={e => { setActiveTab(e.target.value); setForm({ ...form, type: e.target.value }); }}>
                  {TABS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Value ({currentTab?.unit}) *</label>
                <input
                  type="text" className="form-input"
                  placeholder={currentTab?.placeholder}
                  value={form.value}
                  onChange={e => setForm({ ...form, value: e.target.value })}
                  autoFocus
                />
                {activeTab === 'bp' && <div className="form-hint">Enter in format: systolic/diastolic (e.g. 120/80)</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input type="text" className="form-input" placeholder="Any additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
