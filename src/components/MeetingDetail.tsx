import { useEffect, useState } from 'react';
import { useToast } from './ToastProvider';
import { fmtDate, baseUrl } from '@/utils/helpers';

export default function MeetingDetail({ meetingId, mode, onBack }: { meetingId: string; mode: 'admin' | 'dept'; onBack: () => void }) {
  const [meeting, setMeeting] = useState<any>(null);
  const [regs, setRegs] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [refresh, setRefresh] = useState<any>({ items: [] });
  
  const [notifyEmails, setNotifyEmails] = useState('');
  const [newRefName, setNewRefName] = useState('');
  const [newRefOrdered, setNewRefOrdered] = useState(0);
  const [newRefUsed, setNewRefUsed] = useState(0);
  
  const [minDiscussion, setMinDiscussion] = useState('');
  const [minSuggestions, setMinSuggestions] = useState('');
  const [minFurther, setMinFurther] = useState('');

  const { showToast } = useToast();

  const fetchDetails = async () => {
    const [mRes, rRes, fRes, refRes] = await Promise.all([
      fetch(`/api/meetings/${meetingId}`).then(r => r.json()),
      fetch(`/api/meetings/${meetingId}/registrations`).then(r => r.json()),
      fetch(`/api/meetings/${meetingId}/feedback`).then(r => r.json()),
      fetch(`/api/meetings/${meetingId}/refreshments`).then(r => r.json())
    ]);
    setMeeting(mRes);
    setRegs(rRes || []);
    setFeedback(fRes || []);
    setRefresh(refRes || { items: [] });
    
    setNotifyEmails(mRes.notifyEmails || '');
    setMinDiscussion(mRes.discussionSummary || '');
    setMinSuggestions(mRes.suggestions || '');
    setMinFurther(mRes.furtherNotes || '');
  };

  useEffect(() => {
    fetchDetails();
  }, [meetingId]);

  if (!meeting) return <div className="empty">Loading meeting details...</div>;

  const checkedIn = regs.filter(r => r.checkedIn).length;
  const avgRating = feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '—';
  const regLink = baseUrl() + '/register/' + meetingId;
  const fbLink = baseUrl() + '/feedback/' + meetingId;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Link copied');
  };

  const handleCheckin = async (regId: string, checked: boolean) => {
    await fetch(`/api/meetings/${meetingId}/registrations/${regId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: checked })
    });
    fetchDetails();
  };

  const handleNotify = async () => {
    await fetch(`/api/meetings/${meetingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifyEmails })
    });
    
    const subject = encodeURIComponent('Meeting invite: ' + meeting.title);
    const bodyText = `You are invited to ${meeting.title}\nDepartment: ${meeting.department}\nDate: ${meeting.date} at ${meeting.time}\nFormat: ${meeting.locationType === 'online' ? ('Online — ' + (meeting.onlineLink || 'link to follow')) : ('On-site — ' + (meeting.location || 'venue to follow'))}\n\nPlease register here: ${regLink}`;
    const body = encodeURIComponent(bodyText);
    const bcc = notifyEmails.split(',').map(s => s.trim()).filter(Boolean).join(',');
    window.location.href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
  };

  const handleAddRef = async () => {
    if (!newRefName) return;
    const items = [...refresh.items, { name: newRefName, ordered: newRefOrdered, used: newRefUsed }];
    await updateRefreshments(items);
    setNewRefName(''); setNewRefOrdered(0); setNewRefUsed(0);
  };

  const handleRemoveRef = async (idx: number) => {
    const items = [...refresh.items];
    items.splice(idx, 1);
    await updateRefreshments(items);
  };

  const handleSaveRef = async () => {
    await updateRefreshments(refresh.items);
    showToast('Refreshments saved');
  };

  const updateRefreshments = async (items: any[]) => {
    await fetch(`/api/meetings/${meetingId}/refreshments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    fetchDetails();
  };

  const updateRefItem = (idx: number, field: string, val: number) => {
    const items = [...refresh.items];
    items[idx][field] = val;
    setRefresh({ ...refresh, items });
  };

  const handleSaveMinutes = async () => {
    await fetch(`/api/meetings/${meetingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discussionSummary: minDiscussion, suggestions: minSuggestions, furtherNotes: minFurther })
    });
    showToast('Meeting minutes saved');
  };

  const handlePDF = () => {
    // Basic PDF logic requires window.jspdf
    const { jsPDF } = (window as any).jspdf;
    if (!jsPDF) {
      showToast('PDF generator not loaded yet, please wait.');
      return;
    }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Harbourdesk — Meeting summary report', 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(meeting.title, 40, 70);
    doc.save('Meeting-report-' + meeting.code + '.pdf');
  };

  return (
    <>
      <button className="btn btn-sm" onClick={onBack} style={{ marginBottom: '16px' }}>&larr; Back</button>

      <div className="ticket" style={{ marginBottom: '20px' }}>
        <div className="ticket-code"><span>Meeting</span><b>{meeting.code}</b></div>
        <div className="ticket-body">
          <div className="ticket-main">
            <div className="title" style={{ fontSize: '18px' }}>{meeting.title}</div>
            <div className="meta">{meeting.department} · {fmtDate(meeting.date)}, {meeting.time} · {meeting.locationType === 'online' ? <span dangerouslySetInnerHTML={{ __html: 'Online' + (meeting.onlineLink ? ' — <a href="' + meeting.onlineLink + '" target="_blank" rel="noopener">join link</a>' : '') }} /> : (meeting.location || 'On-site')}</div>
          </div>
          <div className="ticket-actions">
            <button className="btn btn-primary btn-sm" onClick={handlePDF}><span>Download PDF report</span></button>
          </div>
        </div>
      </div>

      {meeting.description && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <b style={{ fontSize: '12.5px', color: 'var(--muted)' }}>AGENDA</b>
          <p style={{ margin: '6px 0 0', fontSize: '14px' }}>{meeting.description}</p>
        </div>
      )}

      {(meeting.hostName || meeting.hostPosition || meeting.hostContact) && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <b style={{ fontSize: '12.5px', color: 'var(--muted)' }}>HOST</b>
          <div className="grid-custom grid-3" style={{ marginTop: '8px' }}>
            <div className="kv" style={{ border: 'none', padding: '2px 0' }}><span className="k">Name</span><span className="v">{meeting.hostName || '—'}</span></div>
            <div className="kv" style={{ border: 'none', padding: '2px 0' }}><span className="k">Position</span><span className="v">{meeting.hostPosition || '—'}</span></div>
            <div className="kv" style={{ border: 'none', padding: '2px 0' }}><span className="k">Contact</span><span className="v">{meeting.hostContact || '—'}</span></div>
          </div>
        </div>
      )}

      <div className="grid-custom grid-4" style={{ marginBottom: '20px' }}>
        <div className="stat"><div className="num">{regs.length}</div><div className="lbl">Registered</div></div>
        <div className="stat"><div className="num">{checkedIn}</div><div className="lbl">Attended</div></div>
        <div className="stat"><div className="num">{avgRating}</div><div className="lbl">Avg. feedback</div></div>
        <div className="stat"><div className="num">{feedback.length}</div><div className="lbl">Feedback replies</div></div>
      </div>

      <div className="grid-custom grid-2" style={{ alignItems: 'start', marginBottom: '20px' }}>
        <div className="card">
          <h2 style={{ fontSize: '15px', margin: '0 0 10px' }}>Registration link</h2>
          <p className="hint" style={{ marginTop: 0 }}>Share so attendees can register their name, email, position and contact.</p>
          <div className="copybox"><input type="text" readOnly value={regLink} /><button className="btn btn-sm" onClick={() => handleCopy(regLink)}>Copy</button></div>
          <h2 style={{ fontSize: '15px', margin: '18px 0 10px' }}>Feedback link</h2>
          <p className="hint" style={{ marginTop: 0 }}>Share after the meeting to collect open feedback.</p>
          <div className="copybox"><input type="text" readOnly value={fbLink} /><button className="btn btn-sm" onClick={() => handleCopy(fbLink)}>Copy</button></div>
        </div>
        <div className="card">
          <h2 style={{ fontSize: '15px', margin: '0 0 10px' }}>Send notification</h2>
          <p className="hint" style={{ marginTop: 0 }}>Opens your email client with the meeting details and registration link pre-filled, addressed to the emails below.</p>
          <label>Recipients</label>
          <textarea value={notifyEmails} onChange={e => setNotifyEmails(e.target.value)}></textarea>
          <button className="btn btn-navy btn-block" style={{ marginTop: '12px' }} onClick={handleNotify}>Open email to notify</button>
          <div className="hint" style={{ marginTop: '8px' }}>Demo note: this drafts an email in your own mail app. A live deployment would send automatically via an email API.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="section-title"><h2 style={{ fontSize: '15px' }}>Attendance</h2></div>
        {regs.length ? (
          <table>
            <thead><tr><th></th><th>Name</th><th>Email</th><th>Position</th><th>Contact</th></tr></thead>
            <tbody>
              {regs.map(r => (
                <tr key={r._id}>
                  <td><input type="checkbox" className="checkin" checked={r.checkedIn} onChange={e => handleCheckin(r._id, e.target.checked)} /></td>
                  <td>{r.name}</td><td>{r.email}</td><td>{r.position || '—'}</td><td>{r.contact || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty">No one has registered yet — share the registration link above.</div>}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="section-title"><h2 style={{ fontSize: '15px' }}>Refreshments</h2></div>
        <table>
          <thead><tr><th>Item</th><th>Ordered</th><th>Used</th><th>Leftover</th><th></th></tr></thead>
          <tbody>
            {refresh.items.length ? refresh.items.map((it: any, idx: number) => (
              <tr key={idx}>
                <td>{it.name}</td>
                <td><input type="number" min="0" style={{ width: '70px' }} value={it.ordered} onChange={e => updateRefItem(idx, 'ordered', parseInt(e.target.value) || 0)} /></td>
                <td><input type="number" min="0" style={{ width: '70px' }} value={it.used} onChange={e => updateRefItem(idx, 'used', parseInt(e.target.value) || 0)} /></td>
                <td>{Math.max(0, it.ordered - it.used)}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => handleRemoveRef(idx)}>Remove</button></td>
              </tr>
            )) : <tr><td colSpan={5} style={{ color: 'var(--muted)' }}>No refreshment items logged yet.</td></tr>}
          </tbody>
        </table>
        <div className="field-row" style={{ marginTop: '14px', alignItems: 'flex-end' }}>
          <div><label>Item</label><input type="text" value={newRefName} onChange={e => setNewRefName(e.target.value)} placeholder="e.g. Bottled water" /></div>
          <div style={{ maxWidth: '110px' }}><label>Ordered</label><input type="number" min="0" value={newRefOrdered} onChange={e => setNewRefOrdered(parseInt(e.target.value) || 0)} /></div>
          <div style={{ maxWidth: '110px' }}><label>Used</label><input type="number" min="0" value={newRefUsed} onChange={e => setNewRefUsed(parseInt(e.target.value) || 0)} /></div>
          <div style={{ flex: 0 }}><button className="btn btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={handleAddRef}>Add item</button></div>
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={handleSaveRef}>Save refreshments</button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="section-title"><h2 style={{ fontSize: '15px' }}>Meeting minutes</h2></div>
        <label>Summary — what was discussed</label>
        <textarea value={minDiscussion} onChange={e => setMinDiscussion(e.target.value)} placeholder="Key points, decisions and outcomes from the meeting"></textarea>
        <label>Suggestions</label>
        <textarea value={minSuggestions} onChange={e => setMinSuggestions(e.target.value)} placeholder="Suggestions raised during or after the meeting"></textarea>
        <label>Further notes</label>
        <textarea value={minFurther} onChange={e => setMinFurther(e.target.value)} placeholder="Anything else worth recording"></textarea>
        <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={handleSaveMinutes}>Save minutes</button>
      </div>

      <div className="card">
        <div className="section-title"><h2 style={{ fontSize: '15px' }}>Feedback</h2></div>
        {feedback.length ? feedback.map(f => (
          <div className="kv" style={{ display: 'block', padding: '10px 0' }} key={f._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <b style={{ color: 'var(--navy)' }}>{f.name || 'Anonymous'}</b>
              <span className="mono" style={{ color: 'var(--coral)' }}>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
            </div>
            {f.comments && <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--muted)' }}>{f.comments}</p>}
          </div>
        )) : <div className="empty">No feedback submitted yet.</div>}
      </div>
    </>
  );
}
