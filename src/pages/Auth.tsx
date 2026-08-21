import { useState } from 'react';
import { useStore, AuthError } from '../lib/store';

export default function Auth() {
  const { dispatch } = useStore();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new AuthError('Please enter your name.');
        if (password.length < 4) throw new AuthError('Password needs at least 4 characters.');
        dispatch({ type: 'signup', name, email, password });
      } else {
        dispatch({ type: 'login', email, password });
      }
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-dvh bg-ink-950 text-ink-100 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/logo-full.png" alt="ShiftFit — fitness that fits your shift" className="w-56 object-contain" />
        </div>

        <div className="flex rounded-xl bg-ink-900 p-1 mb-6">
          {(['signup', 'login'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                mode === m ? 'bg-ink-800 text-ink-100' : 'text-ink-500'
              }`}
            >
              {m === 'signup' ? 'Sign up' : 'Log in'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <input
              className="w-full rounded-xl bg-ink-900 border border-ink-800 px-4 py-3.5 text-base outline-none focus:border-shock-400/60 placeholder:text-ink-600"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}
          <input
            className="w-full rounded-xl bg-ink-900 border border-ink-800 px-4 py-3.5 text-base outline-none focus:border-shock-400/60 placeholder:text-ink-600"
            placeholder="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="w-full rounded-xl bg-ink-900 border border-ink-800 px-4 py-3.5 text-base outline-none focus:border-shock-400/60 placeholder:text-ink-600"
            placeholder="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          {error && <p className="text-cooked-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-shock-400 text-ink-950 font-bold py-3.5 text-base active:scale-[0.98] transition-transform"
          >
            {mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="text-ink-600 text-xs mt-8 text-center leading-relaxed">
          Local-only MVP: your account and data live in this browser's storage — nothing is sent to a server.
        </p>
      </div>
    </div>
  );
}
