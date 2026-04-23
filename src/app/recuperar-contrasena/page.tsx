'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { requestPasswordReset, clearError } from '@/lib/features/authSlice';

export default function RecuperarContrasenaPage() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    try {
      await dispatch(requestPasswordReset({ email })).unwrap();
      setSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
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

        {/* Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Recuperar Contraseña</h1>
          <p className="text-slate-400 mb-8">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {sent ? (
            <div className="space-y-6">
              <div className="p-5 bg-green-500/10 border border-green-500/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">Correo enviado</p>
                    <p className="text-green-300/80 text-sm">
                      Si existe una cuenta asociada a <span className="font-medium text-green-300">{email}</span>,
                      recibirás un correo con instrucciones para restablecer tu contraseña.
                    </p>
                    <p className="text-green-300/60 text-xs mt-2">
                      Revisa también tu carpeta de spam o correo no deseado.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href="/login"
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-center"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-500"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          {!sent && (
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
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
