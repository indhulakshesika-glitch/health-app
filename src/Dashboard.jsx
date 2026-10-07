import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, logsAPI } from '../utils/api';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [todayDoses, setTodayDoses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [dashRes, dosesRes] = await Promise.all([
        dashboardAPI.get(),
        logsAPI.getToday()
      ]);
      setDashboard(dashRes.data.data);
      setTodayDoses(dosesRes.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (logId, status) => {
    try {
      await logsAPI.updateStatus(logId, status);
      toast.success(status === 'taken' ? '✓ Marked as taken' : 'Marked as missed');
      loadData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <div className="page-header">
        <h2>{greeting}, {user?.name?.split(' ')[0]} 👋</h2>
        <p>Here's your health overview for today, {format(new Date(), 'MMMM do, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card cyan">
          <div className="stat-icon cyan">💊</div>
          <div className="stat-value">{dashboard?.activeMedicines || 0}</div>
          <div className="stat-label">Active Medicines</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald">✓</div>
          <div className="stat-value">{dashboard?.todaySummary?.taken || 0}</div>
          <div className="stat-label">Taken Today</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose">✗</div>
          <div className="stat-value">{dashboard?.todaySummary?.missed || 0}</div>
          <div className="stat-label">Missed Today</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">📊</div>
          <div className="stat-value">{dashboard?.adherenceRate || 0}%</div>
          <div className="stat-label">7-Day Adherence</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Next dose */}
        <div className="next-dose-card">
          <div className="next-dose-label">⏰ Next Dose</div>
          {dashboard?.nextDose ? (
            <>
              <div className="next-dose-name">{dashboard.nextDose.medicine_name}</div>
              <div className="next-dose-time">{format(new Date(dashboard.nextDose.scheduled_time), 'h:mm a')}</div>
              <div className="countdown">
                {formatDistanceToNow(new Date(dashboard.nextDose.scheduled_time), { addSuffix: true })}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>No upcoming doses today</div>
          )}
        </div>

        {/* Health snapshot */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Health Snapshot</span>
            <Link to="/health" className="btn btn-secondary btn-sm">+ Add</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { key: 'bp', label: 'Blood Pressure', icon: '🫀', unit: 'mmHg', color: 'rose' },
              { key: 'sugar', label: 'Blood Sugar', icon: '🩸', unit: 'mg/dL', color: 'amber' },
              { key: 'weight', label: 'Weight', icon: '⚖️', unit: 'kg', color: 'violet' },
            ].map(item => {
              const record = dashboard?.latestHealth?.[item.key];
              return (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.icon} {item.label}</span>
                  <div style={{ textAlign: 'right' }}>
                    {record ? (
                      <>
                        <span style={{ fontFamily: 'DM Mono', fontWeight: 700, color: `var(--accent-${item.color})` }}>{record.value} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.unit}</span></span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(record.recorded_at), { addSuffix: true })}</div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No data</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's doses */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Today's Schedule</span>
          <Link to="/medicines" className="btn btn-secondary btn-sm">Manage</Link>
        </div>

        {todayDoses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <div className="empty-title">No medicines scheduled</div>
            <div className="empty-text">
              <Link to="/medicines/add" className="auth-link">Add your first medicine</Link>
            </div>
          </div>
        ) : (
          <div className="dose-list">
            {todayDoses.map(dose => (
              <div key={dose.log_id} className={`dose-item ${dose.status}`}>
                <div className="dose-time">{format(new Date(dose.scheduled_time), 'h:mm a')}</div>
                <div className="dose-info">
                  <div className="dose-name">{dose.medicine_name}</div>
                  <div className="dose-dosage">{dose.dosage}</div>
                </div>
                <div className={`dose-status ${dose.status}`}>
                  {dose.status === 'taken' ? '✓ Taken' : dose.status === 'missed' ? '✗ Missed' : '⏳ Pending'}
                </div>
                {dose.status === 'pending' && (
                  <div className="dose-actions">
                    <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(dose.log_id, 'taken')}>Take</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(dose.log_id, 'missed')}>Miss</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
