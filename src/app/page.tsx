"use client";

import { useEffect, useState } from 'react';
import Login from '@/components/Login';
import AdminDashboard from '@/components/AdminDashboard';
import DeptDashboard from '@/components/DeptDashboard';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('harbourdesk_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('harbourdesk_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('harbourdesk_session');
  };

  if (loading) return null;

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">PC</div>
          <div className="brand-text"><b>Harbourdesk</b><span>Port City Colombo — meeting portal</span></div>
        </div>
        <div className="topbar-right">
          {user ? (
            <>
              <span className="pill">{user.role === 'admin' ? 'HR Admin' : `${user.department} dept.`}</span>
              <span style={{ opacity: .85 }}>{user.username}</span>
              <button className="btn-ghost-top" onClick={handleLogout}>Sign out</button>
            </>
          ) : null}
        </div>
      </div>

      {!user ? (
        <Login onLogin={handleLogin} />
      ) : user.role === 'admin' ? (
        <AdminDashboard user={user} />
      ) : (
        <DeptDashboard user={user} />
      )}
    </>
  );
}
