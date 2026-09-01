// ==============================================================================
// TAHAB HOTEL & SUITES LTD — RESET PASSWORD PAGE
// ==============================================================================

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { Button } from '../../../components/common/Button';
import { SEO } from '../../../components/common/SEO';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { showToast } = useToast();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      await updatePassword(data.password);
      setSuccess(true);
      showToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been changed successfully.',
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not update password. Please request a new link.',
      });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-warm-100 py-12 px-4 sm:px-6">
      <SEO title="Update Password | Tahab Hotel & Suites" />

      <div className="max-w-md w-full space-y-6">
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
            Set New Password
          </h2>
          <p className="text-xs text-stone-600">
            Enter your new password below to regain access to your account.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-sm border border-stone-200 shadow-md">
          {success ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-sm font-semibold text-emerald-900">
                Password updated! Redirecting to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    {...register('password')}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    {...register('confirmPassword')}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="emerald"
                size="md"
                isLoading={isSubmitting}
                className="w-full justify-center py-3"
              >
                Update Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
