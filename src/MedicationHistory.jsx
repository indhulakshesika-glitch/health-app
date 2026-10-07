import React, { useState, useEffect } from 'react';
import { logsAPI } from '../utils/api';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

export default function MedicationHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await logsAPI.getHistory(days);
        setLogs(res.data.data);
      } catch {
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days]);

  // Build chart data - daily breakdown
  const buildChartData = () => {
    const dateMap = {};
    logs.forEach(log => {
      const date = format(new Date(log.scheduled_time), 'MMM d');
      if (!dateMap[date]) dateMap[date] = { date, taken: 0, missed: 0, pending: 0 };
      dateMap[date][log.status]++;
    });
    return Object.values(dateMap).slice(-14);
  };

  const chartData = buildChartData();
  const taken = logs.filter(l => l.status === 'taken').length;
  const missed = logs.filter(l => l.status === 'missed').length;
  const pending = logs.filter(l => l.status === 'pending').length;
  const total = logs.length;
  const adherence = total > 0 ? Math.round((taken / (taken + missed)) * 100) : 0;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Medication History</h2>
          <p>Track your medication adherence over time</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[7, 14, 30].map(d => (
            <button key={d} className={`period-btn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>{d} Days</button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card cyan">
          <div className="stat-icon cyan">📋</div>
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Doses</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald">✓</div>
          <div className="stat-value">{taken}</div>
          <div className="stat-label">Taken</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose">✗</div>
          <div className="stat-value">{missed}</div>
          <div className="stat-label">Missed</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">%</div>
          <div className="stat-value">{isNaN(adherence) ? '—' : adherence + '%'}</div>
          <div className="stat-label">Adherence Rate</div>
        </div>
      </div>

      {/* Adherence progress */}
      {total > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-header">
            <span className="section-title">Adherence Progress</span>
            <span style={{ color: 'var(--accent-cyan)', fontFamily: 'DM Mono', fontWeight: 700 }}>{adherence}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${adherence}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>0%</span>
            <span style={{ color: adherence >= 80 ? 'var(--accent-emerald)' : adherence >= 60 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
              {adherence >= 80 ? '🌟 Excellent' : adherence >= 60 ? '⚠️ Needs improvement' : '❗ Poor adherence'}
            </span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="chart-container" style={{ marginBottom: 20 }}>
          <h3 className="chart-title" style={{ marginBottom: 20 }}>Daily Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)' }} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
              <Bar dataKey="taken" fill="#10b981" radius={[4, 4, 0, 0]} name="Taken" />
              <Bar dataKey="missed" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Missed" />
              <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log list */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Log Entries ({logs.length})</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No history found</div>
            <div className="empty-text">Your medication logs will appear here</div>
          </div>
        ) : (
          <div className="dose-list">
            {logs.map(log => (
              <div key={log._id} className={`dose-item ${log.status}`}>
                <div className="dose-time">{format(new Date(log.scheduled_time), 'h:mm a')}</div>
                <div className="dose-info">
                  <div className="dose-name">{log.medicine_id?.name || 'Unknown'}</div>
                  <div className="dose-dosage">
                    {format(new Date(log.scheduled_time), 'MMMM d, yyyy')}
                    {log.taken_at && ` · Taken at ${format(new Date(log.taken_at), 'h:mm a')}`}
                  </div>
                </div>
                <div className={`dose-status ${log.status}`}>
                  {log.status === 'taken' ? '✓ Taken' : log.status === 'missed' ? '✗ Missed' : '⏳ Pending'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
