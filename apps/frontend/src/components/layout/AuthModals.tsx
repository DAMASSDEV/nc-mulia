import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AuthModalsProps {
  isLoginOpen: boolean;
  setIsLoginOpen: (v: boolean) => void;
  isRegisterOpen: boolean;
  setIsRegisterOpen: (v: boolean) => void;
  loginForm: { email: string; password: string };
  setLoginForm: (f: { email: string; password: string }) => void;
  registerForm: { name: string; email: string; phone: string; password: string };
  setRegisterForm: (f: { name: string; email: string; phone: string; password: string }) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string;
}

export function AuthModals({
  isLoginOpen, setIsLoginOpen,
  isRegisterOpen, setIsRegisterOpen,
  loginForm, setLoginForm,
  registerForm, setRegisterForm,
  handleLogin, handleRegister,
  isLoading, error,
}: AuthModalsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  return (
    <AnimatePresence>
      {(isLoginOpen || isRegisterOpen) && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(false); }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {isLoginOpen && (
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-soft flex items-center justify-center">
                    <Heart className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Masuk</h2>
                    <p className="text-xs text-foreground-subtle">Selamat datang kembali</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 p-3.5 bg-danger-soft border border-danger/20 rounded-xl text-sm text-danger">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="nama@email.com"
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-foreground-subtle hover:text-foreground-muted transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Button type="submit" loading={isLoading} className="w-full mt-2">
                    Masuk
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }}
                  className="text-sm mt-6 text-center w-full text-foreground-muted hover:text-brand-primary transition-colors"
                >
                  Belum punya akun?{' '}
                  <span className="font-medium text-brand-primary">Daftar di sini</span>
                </button>
              </div>
            )}

            {isRegisterOpen && (
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-soft flex items-center justify-center">
                    <Heart className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Daftar Akun</h2>
                    <p className="text-xs text-foreground-subtle">Buat akun baru gratis</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 p-3.5 bg-danger-soft border border-danger/20 rounded-xl text-sm text-danger">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <Input
                    label="Nama Lengkap"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={registerForm.name}
                    onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                    autoComplete="name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="nama@email.com"
                    value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                  <Input
                    label="No. Telepon"
                    type="tel"
                    placeholder="08xxxxxxxxxx (opsional)"
                    value={registerForm.phone}
                    onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    autoComplete="tel"
                    hint="Tidak wajib diisi"
                  />
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Minimal 8 karakter"
                      value={registerForm.password}
                      onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-[38px] text-foreground-subtle hover:text-foreground-muted transition-colors"
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Button type="submit" loading={isLoading} className="w-full mt-2">
                    Daftar
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
                  className="text-sm mt-6 text-center w-full text-foreground-muted hover:text-brand-primary transition-colors"
                >
                  Sudah punya akun?{' '}
                  <span className="font-medium text-brand-primary">Masuk di sini</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
