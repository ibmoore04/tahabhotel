// ==============================================================================
// TAHAB HOTEL & SUITES LTD — FIRST-TIME ADMIN PROVISIONING SETUP
//
// This page is a one-time onboarding workflow for provisioning the initial hotel
// administrator into Supabase after fresh database deployment.
// ==============================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, KeyRound, Crown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { assertSupabaseConfigured } from '../../../lib/supabase';
import { Button } from '../../../components/common/Button';
import { SEO } from '../../../components/common/SEO';
import { toSafeError } from '../../../types';

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [token, setToken] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      showToast({
        type: 'error',
        title: 'Token Required',
        message: 'Please paste the setup token generated from your Supabase SQL editor.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const sb = assertSupabaseConfigured();

      const { data, error } = await sb.rpc('provision_first_admin', {
        p_token: token.trim(),
        p_passphrase: passphrase.trim(),
      });

      if (error) throw new Error(toSafeError(error));

      await refreshUser();
      setSuccess(true);
      showToast({
        type: 'success',
        title: 'Administrator Provisioned',
        message: data?.message || 'Admin privileges activated successfully.',
      });

      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Provisioning Failed',
        message: err?.message || 'Could not verify token. Please check your SQL editor output.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-warm-100 py-12 px-4 sm:px-6">
      <SEO title="System Setup | Tahab Hotel & Suites" />

      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 group select-none">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center text-emerald-950 shadow-gold-sm">
              <Crown className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="text-left">
              <span className="font-serif text-lg font-bold text-emerald-950 block leading-tight">
                TAHAB
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-gold-700 font-sans block">
                Hotel & Suites
              </span>
            </div>
          </Link>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-950">
            Initial Administrator Provisioning
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            One-time secure onboarding to grant administrative permissions to the primary hotel manager.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-sm border border-stone-200 shadow-md space-y-6">
          {!user ? (
            <div className="space-y-4 text-center py-4">
              <ShieldCheck className="w-10 h-10 text-emerald-900 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-emerald-950">
                Step 1: Sign In or Register First
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Before provisioning admin rights, please create and log into your primary account.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link to="/register">
                  <Button variant="gold" size="sm" className="w-full">
                    Create Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline-gold" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center space-y-4 py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-emerald-950">
                Admin Access Activated
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Your account <strong className="text-emerald-950">{user.email}</strong> is now configured as a full Hotel Administrator. Redirecting to management dashboard...
              </p>
              <Link to="/admin">
                <Button variant="emerald" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Go to Admin Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-emerald-950/5 p-4 rounded-sm border border-emerald-900/20 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-emerald-950 block">Signed in as:</span>
                <p className="font-mono text-emerald-900">{user.email} ({user.fullName})</p>
                <span className="text-[11px] text-stone-500 block">Current role: {user.role}</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Setup Token *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Paste the 64-char token generated via generate_setup_token()"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-xs font-mono text-stone-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Passphrase (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Passphrase used when generating token (if any)"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-xs text-stone-900"
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                isLoading={isSubmitting}
                className="w-full justify-center py-3 font-bold"
              >
                Activate Administrator Access
              </Button>

              <div className="pt-2 text-[11px] text-stone-500 text-center leading-relaxed">
                To generate a token: In the Supabase SQL editor run<br />
                <code className="bg-stone-100 px-1 py-0.5 rounded text-emerald-950 font-mono">
                  SELECT generate_setup_token('your-secret-passphrase');
                </code>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
