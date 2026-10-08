import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalMedicines: 0, activeMedicines: 0, recentMedicines: [] });
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    times_per_day: 1,
    reminder_times: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [dashboardRes, medsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/medicines'),
      ]);

      setStats(dashboardRes.data.data);
      setMedicines(medsRes.data.data);
    } catch (error) {
      toast.error('Unable to load dashboard');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        reminder_times: form.reminder_times.split(',').map((time) => time.trim()).filter(Boolean),
      };

      await api.post('/medicines', payload);
      toast.success('Medicine added');
      setForm({
        name: '',
        dosage: '',
        times_per_day: 1,
        reminder_times: '',
        start_date: '',
        end_date: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add medicine');
    }
  };

  return (
    <div className="dashboard-page">
      <Toaster position="top-right" />
      <header className="topbar">
        <div>
          <h1>Health Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Medicines</span>
          <strong>{stats.totalMedicines}</strong>
        </div>
        <div className="stat-card">
          <span>Active Medicines</span>
          <strong>{stats.activeMedicines}</strong>
        </div>
        <div className="stat-card">
          <span>Recent</span>
          <strong>{stats.recentMedicines?.length || 0}</strong>
        </div>
      </section>

      <div className="content-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <h3>Add medicine</h3>
          <input placeholder="Medicine name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Dosage" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
          <input type="number" min="1" max="10" value={form.times_per_day} onChange={(e) => setForm({ ...form, times_per_day: Number(e.target.value) })} />
          <input placeholder="Reminder times, e.g. 08:00, 14:00" value={form.reminder_times} onChange={(e) => setForm({ ...form, reminder_times: e.target.value })} />
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit">Save medicine</button>
        </form>

        <div className="panel">
          <h3>Medicine list</h3>
          {medicines.length === 0 ? (
            <p>No medicines yet.</p>
          ) : (
            <ul className="medicine-list">
              {medicines.map((medicine) => (
                <li key={medicine._id}>
                  <strong>{medicine.name}</strong>
                  <span>{medicine.dosage}</span>
                  <small>{medicine.reminder_times.join(', ')}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
