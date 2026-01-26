'use client';

import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import HomeNavbar from '@/components/HomeNavbar';
import Link from 'next/link';

export default function ComunidadPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <HomeNavbar />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Icon with glow effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-400 p-8 rounded-full">
                <Users className="w-16 h-16 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Comunidad
          </motion.h1>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-8"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-lg font-semibold text-cyan-300">Próximamente</span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Estamos construyendo un espacio donde los creyentes puedan conectarse, compartir y crecer juntos en la fe.
          </motion.p>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {/* Feature 1 */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Compartir Reflexiones</h3>
                <p className="text-sm text-gray-400">Comparte tus pensamientos y experiencias espirituales con la comunidad.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Discusiones</h3>
                <p className="text-sm text-gray-400">Participa en conversaciones significativas sobre la Palabra.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Conexión</h3>
                <p className="text-sm text-gray-400">Conecta con otros creyentes en tu viaje espiritual.</p>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50"
            >
              Volver al Inicio
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-sm text-gray-500"
          >
            Mantente al tanto de las actualizaciones
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
