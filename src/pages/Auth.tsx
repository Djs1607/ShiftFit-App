import { useState } from 'react';
import { useStore, AuthError } from '../lib/store';
import Logo from '../components/Logo';
import { Button, Input, SegmentedControl } from '../components/ds';

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
    <div
      className="min-h-dvh bg-bg-base text-fg-primary flex flex-col items-center justify-center px-6"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="xl" />
        </div>

        <SegmentedControl
          options={[{ value: 'signup', label: 'Sign up' }, { value: 'login', label: 'Log in' }]}
          value={mode}
          onChange={(m) => { setMode(m); setError(''); }}
          className="mb-6"
        />

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              size="lg"
            />
          )}
          <Input
            placeholder="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            size="lg"
          />
          <Input
            placeholder="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            size="lg"
          />
          {error && <p className="text-feedback-danger text-[13px]">{error}</p>}
          <Button type="submit" variant="primary" size="lg" fullWidth>
            {mode === 'signup' ? 'Create account' : 'Log in'}
          </Button>
        </form>

        <p className="text-fg-disabled text-[13px] mt-8 text-center leading-relaxed">
          Local-only MVP: your account and data live in this browser's storage. Nothing is sent to a server.
        </p>
      </div>
    </div>
  );
}
