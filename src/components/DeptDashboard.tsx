import { useEffect, useState } from 'react';
import { useToast } from './ToastProvider';
import { fmtDate } from '@/utils/helpers';
import MeetingDetail from './MeetingDetail';

export default function DeptDashboard({ user }: { user: any }) {
  const [tab, setTab] = useState<'meetings' | 'new'>('meetings');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingDetailId, setMeetingDetailId] = useState<string | null>(null);

  // New meeting form
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('');
  const [mTime, setMTime] = useState('');
  const [mLocType, setMLocType] = useState('onsite');
  const [mLocation, setMLocation] = useState('');
  const [mOnlineLink, setMOnlineLink] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mHostName, setMHostName] = useState('');
  const [mHostPosition, setMHostPosition] = useState('');
  const [mHostContact, setMHostContact] = useState('');
  const [mEmails, setMEmails] = useState('');
  const [mErr, setMErr] = useState('');

  const { showToast } = useToast();

  const fetchMeetings = async () => {
    const res = await fetch('/api/meetings');
    const all = await res.json();
    setMeetings(all.filter((m: any) => m.department === user.department));
  };

  useEffect(() => {
    fetchMeetings();
  }, [tab, meetingDetailId]);

  const handleCreateMeeting = async () => {
    setMErr('');
    if (!mTitle || !mDate || !mTime) {
      setMErr('Title, date and time are required.');
      return;
    }
    const code = 'PC-' + Math.floor(1000 + Math.random() * 9000);
    const meeting = {
      code,
      title: mTitle,
      department: user.department,
      date: mDate,
      time: mTime,
      locationType: mLocType,
      location: mLocType === 'onsite' ? mLocation : '',
      onlineLink: mLocType === 'online' ? mOnlineLink : '',
      description: mDesc,
      notifyEmails: mEmails,
      hostName: mHostName,
      hostPosition: mHostPosition,
      hostContact: mHostContact,
      createdBy: user.username,
    };

    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meeting)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Meeting scheduled — registration link ready');
      setMTitle(''); setMDate(''); setMTime(''); setMLocation(''); setMOnlineLink('');
      setMDesc(''); setMHostName(''); setMHostPosition(''); setMHostContact(''); setMEmails('');
      setMeetingDetailId(data.meeting._id);
      setTab('meetings');
    } else {
      setMErr(data.error || 'Failed to schedule meeting');
    }
  };

  const now = new Date().toISOString().slice(0, 10);

  if (meetingDetailId) {
    return (
      <div className="shell" style={{ paddingTop: '22px' }}>
        <MeetingDetail 
          meetingId={meetingDetailId} 
          mode="dept" 
          onBack={() => setMeetingDetailId(null)} 
        />
        <div className="footer-note">Harbourdesk demo — Port City Colombo · Signed in as {user.department}.</div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="tabs" style={{ marginTop: '22px' }}>
        <button className={`tab ${tab === 'meetings' ? 'active' : ''}`} onClick={() => setTab('meetings')}>My meetings</button>
        <button className={`tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>Schedule meeting</button>
      </div>

      {tab === 'meetings' ? (
        <>
          <div className="section-title">
            <h2>{user.department} — meetings</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setTab('new')}>+ Schedule meeting</button>
          </div>
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
          }) : <div className="empty">No meetings scheduled yet. Create your first one.</div>}
        </>
      ) : (
        <div className="card" style={{ maxWidth: '640px' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 4px' }}>Schedule a meeting</h2>
          <p className="hint">Fill in the details below. A shareable registration link is generated automatically.</p>
          
          <label>Meeting title</label>
          <input type="text" value={mTitle} onChange={e => setMTitle(e.target.value)} placeholder="e.g. Q3 budget review" />
          
          <div className="field-row">
            <div><label>Date</label><input type="date" value={mDate} onChange={e => setMDate(e.target.value)} /></div>
            <div><label>Time</label><input type="time" value={mTime} onChange={e => setMTime(e.target.value)} /></div>
          </div>
          
          <label>Format</label>
          <select value={mLocType} onChange={e => setMLocType(e.target.value)}>
            <option value="onsite">On-site</option>
            <option value="online">Online</option>
          </select>
          
          {mLocType === 'online' ? (
            <>
              <label>Meeting link (Zoom, Google Meet, Teams…)</label>
              <input type="text" value={mOnlineLink} onChange={e => setMOnlineLink(e.target.value)} placeholder="https://meet.google.com/xyz-abcd" />
            </>
          ) : (
            <>
              <label>Venue / room</label>
              <input type="text" value={mLocation} onChange={e => setMLocation(e.target.value)} placeholder="e.g. Harbour Tower, Level 12, Boardroom B" />
            </>
          )}
          
          <label>Description / agenda</label>
          <textarea value={mDesc} onChange={e => setMDesc(e.target.value)} placeholder="What is this meeting about?"></textarea>
          
          <div className="dockline" style={{ margin: '18px 0 6px' }}><span className="label">Host details</span><div className="rule"></div></div>
          
          <div className="field-row">
            <div><label>Host name</label><input type="text" value={mHostName} onChange={e => setMHostName(e.target.value)} placeholder="e.g. Dilani Perera" /></div>
            <div><label>Host position</label><input type="text" value={mHostPosition} onChange={e => setMHostPosition(e.target.value)} placeholder="e.g. Finance Manager" /></div>
          </div>
          
          <label>Host contact (email or phone)</label>
          <input type="text" value={mHostContact} onChange={e => setMHostContact(e.target.value)} placeholder="e.g. dilani.p@portcity.lk / 077 123 4567" />
          
          <label>Notify emails (comma-separated)</label>
          <textarea value={mEmails} onChange={e => setMEmails(e.target.value)} placeholder="name1@portcity.lk, name2@portcity.lk"></textarea>
          
          <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={handleCreateMeeting}>Create meeting</button>
          <div className="err">{mErr}</div>
        </div>
      )}

      <div className="footer-note">Harbourdesk demo — Port City Colombo · Signed in as {user.department}.</div>
    </div>
  );
}
