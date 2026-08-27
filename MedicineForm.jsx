import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { medicineAPI } from '../utils/api';
import toast from 'react-hot-toast';

const defaultForm = {
  name: '', dosage: '', times_per_day: 1,
  reminder_times: ['08:00'],
  start_date: new Date().toISOString().split('T')[0],
  end_date: '', notes: ''
};

export default function MedicineForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      medicineAPI.getOne(id).then(res => {
        const med = res.data.data;
        setForm({
          name: med.name,
          dosage: med.dosage,
          times_per_day: med.times_per_day,
          reminder_times: med.reminder_times,
          start_date: med.start_date?.split('T')[0] || '',
          end_date: med.end_date?.split('T')[0] || '',
          notes: med.notes || ''
        });
        setFetching(false);
      }).catch(() => {
        toast.error('Failed to load medicine');
        navigate('/medicines');
      });
    }
  }, [id, navigate]);

  const handleTimesPerDayChange = (val) => {
    const count = Math.min(10, Math.max(1, parseInt(val) || 1));
    const times = [...form.reminder_times];
    while (times.length < count) times.push('08:00');
    while (times.length > count) times.pop();
    setForm({ ...form, times_per_day: count, reminder_times: times });
  };

  const updateTime = (idx, val) => {
    const times = [...form.reminder_times];
    times[idx] = val;
    setForm({ ...form, reminder_times: times });
  };

  const addTime = () => {
    if (form.reminder_times.length >= 10) return;
    setForm({ ...form, reminder_times: [...form.reminder_times, '08:00'], times_per_day: form.reminder_times.length + 1 });
  };

  const removeTime = (idx) => {
    if (form.reminder_times.length <= 1) return;
    const times = form.reminder_times.filter((_, i) => i !== idx);
    setForm({ ...form, reminder_times: times, times_per_day: times.length });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.start_date || !form.end_date) {
      return toast.error('Please fill all required fields');
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      return toast.error('End date must be after start date');
    }
    setLoading(true);
    try {
      if (isEdit) {
        await medicineAPI.update(id, form);
        toast.success('Medicine updated!');
      } else {
        await medicineAPI.create(form);
        toast.success('Medicine added!');
      }
      navigate('/medicines');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save medicine');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h2>{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</h2>
        <p>{isEdit ? 'Update the medicine details' : 'Set up a new medicine with reminders'}</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Medicine Name *</label>
              <input type="text" className="form-input" placeholder="e.g. Metformin" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Dosage *</label>
              <input type="text" className="form-input" placeholder="e.g. 500mg" value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Times Per Day *</label>
            <input
              type="number" className="form-input" min="1" max="10"
              value={form.times_per_day}
              onChange={e => handleTimesPerDayChange(e.target.value)}
            />
            <div className="form-hint">Number of doses per day (1–10)</div>
          </div>

          <div className="form-group">
            <label className="form-label">Reminder Times *</label>
            <div className="time-inputs">
              {form.reminder_times.map((t, i) => (
                <div key={i} className="time-input-wrap">
                  <input
                    type="time" className="form-input"
                    style={{ width: 'auto', padding: '8px 10px' }}
                    value={t}
                    onChange={e => updateTime(i, e.target.value)}
                  />
                  {form.reminder_times.length > 1 && (
                    <button type="button" className="remove-time-btn" onClick={() => removeTime(i)}>×</button>
                  )}
                </div>
              ))}
              {form.reminder_times.length < 10 && (
                <button type="button" className="add-time-btn" onClick={addTime}>+ Add Time</button>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input type="date" className="form-input" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input type="date" className="form-input" value={form.end_date} min={form.start_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Special Notes</label>
            <textarea className="form-textarea" placeholder="e.g. Take with food, avoid alcohol..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/medicines')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
