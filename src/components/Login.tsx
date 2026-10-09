import { useState } from 'react';
import { useToast } from './ToastProvider';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [role, setRole] = useState<'admin' | 'dept'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleLogin = async () => {
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="role-switch">
          <button className={role === 'admin' ? 'active' : ''} onClick={() => { setRole('admin'); setUsername(''); setPassword(''); }}>HR admin</button>
          <button className={role === 'dept' ? 'active' : ''} onClick={() => { setRole('dept'); setUsername(''); setPassword(''); }}>Department</button>
        </div>

        {role === 'admin' ? (
          <>
            <h1 className="login-title">HR admin sign in</h1>
            <p className="login-sub">Oversee every department, meeting and account.</p>
          </>
        ) : (
          <>
            <h1 className="login-title">Department sign in</h1>
            <p className="login-sub">Schedule meetings and manage attendance for your department.</p>
          </>
        )}

        <label>Username</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={role === 'admin' ? 'admin@potcity.com' : 'e.g. finance01'} />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button className={`btn btn-block ${role === 'admin' ? 'btn-navy' : 'btn-primary'}`} style={{ marginTop: '18px' }} onClick={handleLogin}>Sign in</button>
        <div className="err">{error}</div>

        {role === 'dept' && (
          <div className="demo-note">
            No account yet? Ask your HR admin to create one from the admin dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
