'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updatePassword, clearError } from '@/lib/features/authSlice';
import { supabase } from '@/lib/supabase';

function RestablecerContrasenaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const [sessionStatus, setSessionStatus] = useState<'checking' | 'ready' | 'invalid'>('checking');

  // Intercambiar el código del enlace de recuperación por una sesión
  useEffect(() => {
    const code = searchParams.get('code');
    const errorCode = searchParams.get('error_code') || searchParams.get('error');

    if (errorCode) {
      setSessionStatus('invalid');
      return;
    }

    const establishSession = async () => {
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setSessionStatus('invalid');
          return;
        }
        setSessionStatus('ready');
        return;
      }

      // Si no hay code, revisar si ya tenemos sesión (p.ej. recargar la página)
      const { data } = await supabase.auth.getSession();
      setSessionStatus(data.session ? 'ready' : 'invalid');
    };

    establishSession();
  }, [searchParams]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!password || !confirmPassword) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    try {
      await dispatch(updatePassword({ password })).unwrap();
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);
    } catch (err) {
      console.error('Update password error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-500">
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
                <path d="M12 2 L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 18 L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4.93 4.93 L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16.24 16.24 L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12 L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 12 L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4.93 19.07 L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16.24 7.76 L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Luz Digital</div>
              <div className="text-xs text-slate-400">LECTOR WEB</div>
            </div>
          </Link>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Nueva Contraseña</h1>
          <p className="text-slate-400 mb-8">
            Elige una nueva contraseña para tu cuenta.
          </p>

          {sessionStatus === 'checking' && (
            <div className="flex items-center justify-center py-10">
              <svg className="animate-spin h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {sessionStatus === 'invalid' && (
            <div className="space-y-6">
              <div className="p-5 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 font-semibold mb-1">Enlace inválido o expirado</p>
                <p className="text-red-300/80 text-sm">
                  Este enlace de recuperación ya no es válido. Solicita uno nuevo para continuar.
                </p>
              </div>
              <Link
                href="/recuperar-contrasena"
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-center"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          )}

          {sessionStatus === 'ready' && success && (
            <div className="p-5 bg-green-500/10 border border-green-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-green-400 font-semibold mb-1">¡Contraseña actualizada!</p>
                  <p className="text-green-300/80 text-sm">
                    Tu contraseña se cambió correctamente. Te estamos redirigiendo...
                  </p>
                </div>
              </div>
            </div>
          )}

          {sessionStatus === 'ready' && !success && (
            <>
              {/* Error Message */}
              {(error || localError) && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error || localError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      disabled={loading}
                      minLength={6}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-500"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    'Actualizar contraseña'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 flex items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      }
    >
      <RestablecerContrasenaContent />
    </Suspense>
  );
}
