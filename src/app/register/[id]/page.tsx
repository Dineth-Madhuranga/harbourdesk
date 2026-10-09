"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { fmtDate } from '@/utils/helpers';

function RegisterForm() {
  const params = useParams();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  
  const [rName, setRName] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPosition, setRPosition] = useState('');
  const [rContact, setRContact] = useState('');
  const [rErr, setRErr] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/meetings/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setMeeting(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setRErr('');
    if (!rName || !rEmail) {
      setRErr('Name and email are required.');
      return;
    }
    const res = await fetch(`/api/meetings/${id}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: rName, email: rEmail, position: rPosition, contact: rContact })
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      setRErr('Failed to register. Please try again.');
    }
  };

  if (loading) return null;

  if (!meeting) {
    return (
      <div className="shell-narrow">
        <div className="empty" style={{ marginTop: '60px' }}>This meeting link is no longer valid.</div>
      </div>
    );
  }

  return (
    <div className="shell-narrow" style={{ paddingTop: '36px' }}>
      <div className="public-hero">
        <div className="kicker">Meeting registration</div>
        <h1>{meeting.title}</h1>
        <div className="meta">{meeting.department} · {fmtDate(meeting.date)}, {meeting.time} · {meeting.locationType === 'online' ? 'Online' : (meeting.location || 'On-site')}</div>
      </div>
      <div className="public-body">
        {submitted ? (
          <div className="empty" style={{ border: 'none', padding: '20px 0' }}>
            <b style={{ color: 'var(--navy)', fontSize: '15px' }}>You're registered.</b><br />
            A confirmation isn't emailed automatically in this demo, but the department will see you on their attendee list.
          </div>
        ) : (
          <>
            <label>Full name</label>
            <input type="text" value={rName} onChange={e => setRName(e.target.value)} placeholder="Your full name" />
            
            <label>Email</label>
            <input type="email" value={rEmail} onChange={e => setREmail(e.target.value)} placeholder="you@company.com" />
            
            <label>Position</label>
            <input type="text" value={rPosition} onChange={e => setRPosition(e.target.value)} placeholder="e.g. Project Engineer" />
            
            <label>Contact number</label>
            <input type="tel" value={rContact} onChange={e => setRContact(e.target.value)} placeholder="e.g. 077 123 4567" />
            
            <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={handleSubmit}>Confirm registration</button>
            <div className="err">{rErr}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="empty">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
