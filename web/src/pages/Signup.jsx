import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserPlus, Building2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await signup(name, email, phone, password);
      if (res.success) {
        addToast('Account created successfully!', 'success');
        navigate('/profile');
      }
    } catch (err) {
      const msg = err.message === 'Network Error' || err.code === 'ERR_NETWORK'
        ? 'Network Error: Backend server is unreachable at http://localhost:5000. Please ensure your Express backend server is running.'
        : (err.message || 'Signup failed. Please try again.');
      
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-1">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Tenant Account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join HAVEN to save properties, ask AI questions, and request viewings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input
            label="Full Name"
            type="text"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555-0199"
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 leading-relaxed font-semibold">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={loading} icon={UserPlus} className="mt-2 w-full">
            Create Free Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-dark-border pt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-500 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
