"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { fmtDate } from '@/utils/helpers';

function FeedbackForm() {
  const params = useParams();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  
  const [rating, setRating] = useState(0);
  const [fbName, setFbName] = useState('');
  const [fbComments, setFbComments] = useState('');
  const [fbErr, setFbErr] = useState('');

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
    setFbErr('');
    if (rating === 0) {
      setFbErr('Please select a star rating.');
      return;
    }
    const res = await fetch(`/api/meetings/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, name: fbName, comments: fbComments })
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      setFbErr('Failed to submit feedback. Please try again.');
    }
  };

  if (loading) return null;

  if (!meeting) {
    return (
      <div className="shell-narrow">
        <div className="empty" style={{ marginTop: '60px' }}>This feedback link is no longer valid.</div>
      </div>
    );
  }

  return (
    <div className="shell-narrow" style={{ paddingTop: '36px' }}>
      <div className="public-hero">
        <div className="kicker">Meeting feedback</div>
        <h1>{meeting.title}</h1>
        <div className="meta">{meeting.department} · {fmtDate(meeting.date)}, {meeting.time}</div>
      </div>
      <div className="public-body">
        {submitted ? (
          <div className="empty" style={{ border: 'none', padding: '20px 0' }}>
            <b style={{ color: 'var(--navy)', fontSize: '15px' }}>Thanks for your feedback.</b><br />
            It has been added to the meeting summary report.
          </div>
        ) : (
          <>
            <label>Your rating</label>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map(n => (
                <button 
                  key={n} 
                  type="button" 
                  className={`star ${n <= rating ? 'on' : ''}`} 
                  onClick={() => setRating(n)}
                >
                  ★
                </button>
              ))}
            </div>
            
            <label>Name (optional)</label>
            <input type="text" value={fbName} onChange={e => setFbName(e.target.value)} placeholder="Leave blank to stay anonymous" />
            
            <label>Comments</label>
            <textarea value={fbComments} onChange={e => setFbComments(e.target.value)} placeholder="What worked, what could be better?"></textarea>
            
            <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={handleSubmit}>Submit feedback</button>
            <div className="err">{fbErr}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="empty">Loading...</div>}>
      <FeedbackForm />
    </Suspense>
  );
}
