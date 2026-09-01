// ==============================================================================
// TAHAB HOTEL & SUITES LTD — REGISTER & FORGOT PASSWORD PAGES
// ==============================================================================

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Lock, Mail, User, Phone, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import {
  registerSchema,
  type RegisterFormValues,
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../../schemas';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { SEO } from '../../components/common/SEO';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { requiresEmailConfirmation } = await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
      });

      if (requiresEmailConfirmation) {
        setRegisteredEmail(data.email);
        setEmailConfirmationRequired(true);
      } else {
        showToast({
          type: 'success',
          title: 'Account Created',
          message: 'Welcome to Tahab Hotel & Suites Ltd.',
        });
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: err?.message || 'Could not complete registration.',
      });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-warm-100 py-12 px-4 sm:px-6">
      <SEO title="Create Account | Tahab Hotel & Suites" />

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
            Create An Account
          </h2>
          <p className="text-xs text-stone-600">
            Register to manage your reservations and receive seamless boutique hospitality.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-sm border border-stone-200 shadow-md">
          {emailConfirmationRequired ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-emerald-950">
                Confirm Your Email
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                We have sent a verification link to <strong className="text-emerald-950">{registeredEmail}</strong>.
                Please check your inbox and click the link to activate your account.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="emerald" size="md" className="w-full justify-center">
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Adebayo Balogun"
                    {...register('fullName')}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-600">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    {...register('email')}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+234 803 123 4567"
                    {...register('phone')}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-rose-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Password *
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
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Repeat your password"
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
                variant="gold"
                size="md"
                isLoading={isSubmitting}
                className="w-full justify-center py-3"
              >
                Create Account
              </Button>
            </form>
          )}

          <div className="pt-6 mt-6 border-t border-stone-100 text-center text-xs text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-gold-700 hover:text-emerald-950">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordResetEmail } = useAuth();
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await sendPasswordResetEmail(data.email);
      showToast({
        type: 'success',
        title: 'Reset Link Sent',
        message: `Password recovery instructions have been sent to ${data.email}.`,
      });
      setSubmitted(true);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Request Failed',
        message: err?.message || 'Could not process password reset request.',
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-warm-100 py-12 px-4 sm:px-6">
      <SEO title="Forgot Password | Tahab Hotel & Suites" />

      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-950">
            Reset Your Password
          </h2>
          <p className="text-xs text-stone-600">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-sm border border-stone-200 shadow-md space-y-4">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-sm text-stone-700 leading-relaxed">
                Check your email inbox for the password reset link.
              </p>
              <Link to="/login">
                <Button variant="gold" size="sm">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    {...register('email')}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-4 h-4" />}
                className="w-full justify-center py-3"
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-stone-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-emerald-950 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
