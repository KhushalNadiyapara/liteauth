/* eslint-disable react/no-unescaped-entities */
'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAPI } from '../_lib/useAPI';

// Simple debounce helper
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function LoginForm() {

   const { loading: apiLoading, error: apiError, callAPI, clearError } = useAPI()
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ checking: false, exists: null });
  const router = useRouter();

 async function checkEmailExists(email) {
  try {
    // Use the API service instead of direct axios call
    const result = await callAPI(authAPI.checkEmail, email);
    return !result?.available; // If not available, it means email exists
  } catch (error) {
    console.error('Email check failed:', error);
    // For fallback, you can simulate some existing emails
    return ['test@test.com', 'admin@admin.com', 'user@example.com']
      .includes(email.toLowerCase());
  }
}
  
  const debouncedEmailCheck = useCallback(
    (email) => {
      const fn = debounce(async (em) => {
        if (!/\S+@\S+\.\S+/.test(em)) {
          setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
          return;
        }
        setEmailStatus({ checking: true, exists: null });
        try {
          const exists = await checkEmailExists(em);
          setEmailStatus({ checking: false, exists });
          setValidationErrors(prev => ({
            ...prev,
            email: exists ? '' : 'No account found with this email'
          }));
        } catch {
          setEmailStatus({ checking: false, exists: null });
        }
      }, 400);
      fn(email);
    },
    []
  );

  // Debounced field validator (email + password)
  const debouncedValidation = useCallback(
    (field, value) => {
      const fn = debounce((name, val) => {
        const errs = { ...validationErrors };
        if (name === 'email') {
          if (!val) errs.email = 'Email is required';
          else if (!/\S+@\S+\.\S+/.test(val)) errs.email = 'Please enter a valid email address';
          else {
            errs.email = '';
            debouncedEmailCheck(val);
          }
        }
        if (name === 'password') {
          if (!val) errs.password = 'Password is required';
          else if (val.length < 6) errs.password = 'Password must be at least 6 characters';
          else errs.password = '';
        }
        setValidationErrors(errs);
      }, 200);
      fn(field, value);
    },
    [validationErrors, debouncedEmailCheck]
  );

  // On each input change
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
    if (error) setError('');
    if (name === 'email') setEmailStatus({ checking: false, exists: null });
    debouncedValidation(name, value);
  }

  // Final synchronous validation before submit
  function validateForm() {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Please enter a valid email address';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // On form submit
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    if (emailStatus.checking) {
      setError('Please wait for email validation to complete');
      return;
    }
    if (emailStatus.exists === false) {
      setError('No account found with this email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Login - LiteAuth</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="bg-blue-600 p-4 rounded-full hover:bg-blue-700 transition">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your LiteAuth account</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      validationErrors.email
                        ? 'border-red-500'
                        : emailStatus.exists === true
                        ? 'border-green-500'
                        : emailStatus.exists === false
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-3">
                    {emailStatus.checking && (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    )}
                    {emailStatus.exists === true && (
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {emailStatus.exists === false && (
                      <svg
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.email}
                  </p>
                )}
                {emailStatus.exists === true && !validationErrors.email && (
                  <p className="text-green-500 text-sm mt-1">✓ Email found</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* API Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732
                           4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192
                           2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="ml-3 text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || emailStatus.checking}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Signing in...
                  </span>
                ) : emailStatus.checking ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Validating Email...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Back Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
