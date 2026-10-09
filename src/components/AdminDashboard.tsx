import { useEffect, useState } from 'react';
import { useToast } from './ToastProvider';
import { fmtDate } from '@/utils/helpers';
import MeetingDetail from './MeetingDetail';

export default function AdminDashboard({ user }: { user: any }) {
  const [tab, setTab] = useState<'overview' | 'accounts'>('overview');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingDetailId, setMeetingDetailId] = useState<string | null>(null);
  
  // New account form
  const [accDept, setAccDept] = useState('');
  const [accUser, setAccUser] = useState('');
  const [accPass, setAccPass] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [accErr, setAccErr] = useState('');

  const { showToast } = useToast();

  const fetchData = async () => {
    const [accRes, meetRes] = await Promise.all([
      fetch('/api/accounts').then(r => r.json()),
      fetch('/api/meetings').then(r => r.json())
    ]);
    setAccounts(accRes || []);
    setMeetings(meetRes || []);
  };

  useEffect(() => {
    fetchData();
  }, [tab, meetingDetailId]);

  const handleCreateAccount = async () => {
    setAccErr('');
    if (!accDept || !accUser || !accPass || !accEmail) {
      setAccErr('All fields are required.');
      return;
    }
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: accDept, username: accUser, password: accPass, email: accEmail })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Account created for ' + accDept);
      setAccDept(''); setAccUser(''); setAccPass(''); setAccEmail('');
      fetchData();
    } else {
      setAccErr(data.error || 'Failed to create account');
    }
  };

  const handleToggleActive = async (username: string, currentStatus: boolean) => {
    const res = await fetch(`/api/accounts/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentStatus })
    });
    if (res.ok) fetchData();
  };

  const now = new Date().toISOString().slice(0, 10);
  const upcoming = meetings.filter(m => m.date >= now);
  const past = meetings.filter(m => m.date < now);

  if (meetingDetailId) {
    return (
      <div className="shell" style={{ paddingTop: '22px' }}>
        <MeetingDetail 
          meetingId={meetingDetailId} 
          mode="admin" 
          onBack={() => setMeetingDetailId(null)} 
        />
        <div className="footer-note">Harbourdesk demo — Port City Colombo · Signed in as HR Admin.</div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="tabs" style={{ marginTop: '22px' }}>
        <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`tab ${tab === 'accounts' ? 'active' : ''}`} onClick={() => setTab('accounts')}>Department accounts</button>
      </div>

      {tab === 'overview' ? (
        <>
          <div className="grid-custom grid-4" style={{ marginBottom: '24px' }}>
            <div className="stat"><div className="num">{accounts.length}</div><div className="lbl">Department accounts</div></div>
            <div className="stat"><div className="num">{meetings.length}</div><div className="lbl">Total meetings</div></div>
            <div className="stat"><div className="num">{upcoming.length}</div><div className="lbl">Upcoming</div></div>
            <div className="stat"><div className="num">{past.length}</div><div className="lbl">Completed</div></div>
          </div>
          <div className="section-title"><h2>All meetings, every department</h2></div>
          
          {meetings.length ? meetings.map(m => {
            const isUpcoming = m.date >= now;
            return (
              <div className="ticket" key={m._id}>
                <div className="ticket-code">
                  <span>Meeting</span>
                  <b>{m.code}</b>
                </div>
                <div className="ticket-body">
                  <div className="ticket-main">
                    <div className="title">{m.title}</div>
                    <div className="meta">{m.department} · {fmtDate(m.date)}, {m.time} · {m.locationType === 'online' ? 'Online' : (m.location || 'On-site')}</div>
                  </div>
                  <div className="ticket-actions">
                    <span className={`badge ${isUpcoming ? 'badge-upcoming' : 'badge-past'}`}>{isUpcoming ? 'Upcoming' : 'Completed'}</span>
                    {m.locationType === 'online' && <span className="badge badge-online">Online</span>}
                    <button className="btn btn-sm" onClick={() => setMeetingDetailId(m._id)}>Open</button>
                  </div>
                </div>
              </div>
            );
          }) : <div className="empty">No meetings scheduled yet across any department.</div>}
        </>
      ) : (
        <div className="grid-custom grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <h2 style={{ fontSize: '16px', margin: '0 0 4px' }}>Create a department account</h2>
            <p className="hint">Give a department their own login to schedule and manage meetings.</p>
            <label>Department name</label>
            <input type="text" value={accDept} onChange={e => setAccDept(e.target.value)} placeholder="e.g. Finance" />
            <label>Username</label>
            <input type="text" value={accUser} onChange={e => setAccUser(e.target.value)} placeholder="e.g. finance01" />
            <label>Password</label>
            <input type="text" value={accPass} onChange={e => setAccPass(e.target.value)} placeholder="Set a temporary password" />
            <label>Contact email</label>
            <input type="email" value={accEmail} onChange={e => setAccEmail(e.target.value)} placeholder="finance@portcity.lk" />
            <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={handleCreateAccount}>Create account</button>
            <div className="err">{accErr}</div>
          </div>
          <div className="card">
            <h2 style={{ fontSize: '16px', margin: '0 0 12px' }}>Department accounts</h2>
            {accounts.length ? (
              <table>
                <thead><tr><th>Department</th><th>Username</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {accounts.map(a => (
                    <tr key={a.username}>
                      <td>{a.department}</td>
                      <td className="mono">{a.username}</td>
                      <td>{a.active === false ? <span className="badge badge-past">Inactive</span> : <span className="badge badge-upcoming">Active</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className={`btn btn-sm ${a.active === false ? '' : 'btn-danger'}`} onClick={() => handleToggleActive(a.username, a.active)}>
                          {a.active === false ? 'Reactivate' : 'Deactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty">No department accounts yet.</div>}
          </div>
        </div>
      )}

      <div className="footer-note">Harbourdesk demo — Port City Colombo · Signed in as HR Admin.</div>
    </div>
  );
}
