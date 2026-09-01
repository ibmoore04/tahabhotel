// ==============================================================================
// TAHAB HOTEL & SUITES LTD — SIGN IN / AUTHENTICATION PAGE
// Production login with genuine Supabase Auth credentials.
// ==============================================================================

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Crown, Lock, Mail } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '../../schemas';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { SEO } from '../../components/common/SEO';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const from = (location.state as any)?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password);
      showToast({
        type: 'success',
        title: 'Welcome Back',
        message: 'Signed in successfully.',
      });
      // Return users to the protected page they requested, otherwise the homepage.
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Sign In Failed',
        message: err?.message || 'Invalid email or password.',
      });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-warm-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Sign In | Tahab Hotel & Suites" />

      <div className="max-w-md w-full space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3">
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

          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-950">
            Account & Portal Access
          </h2>
          <p className="text-xs text-stone-600 max-w-xs mx-auto">
            Sign in with your email and password to manage bookings, guest services, or hotel operations.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-sm border border-stone-200 shadow-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  {...register('email')}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900 min-h-[44px]"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] sm:text-xs text-gold-700 hover:text-emerald-950 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900 min-h-[44px]"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="emerald"
              size="md"
              isLoading={isSubmitting}
              className="w-full justify-center py-3 min-h-[48px]"
            >
              Sign In
            </Button>
          </form>

          <div className="pt-5 sm:pt-6 mt-5 sm:mt-6 border-t border-stone-100 text-center text-xs text-stone-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-gold-700 hover:text-emerald-950">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
