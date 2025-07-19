import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Sparkles, Phone, Eye, EyeOff, Scissors, Star } from 'lucide-react';
import { signIn, signUp, UserRole, supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: (role?: UserRole) => void;
  onGuestContinue: () => void;
}

const LoginScreen = ({ onLogin, onGuestContinue }: LoginScreenProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 6;
    const hasLetterAndNumber = /[A-Za-z]/.test(pass) && /[0-9]/.test(pass);

    if (!minLength) return 'A senha deve ter no mínimo 6 caracteres';
    if (!hasLetterAndNumber) return 'A senha deve conter letras e números';
    return null;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const passwordError = validatePassword(password);
        if (passwordError) {
          throw new Error(passwordError);
        }

        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        if (!fullName || !phone) {
          throw new Error('Todos os campos são obrigatórios');
        }

        // Create the user
        const authData = await signUp(email, password, 'client');
        
        if (!authData?.user) {
          throw new Error('Erro ao criar usuário - dados inválidos');
        }

        // Create the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            user_id: authData.user.id,
            full_name: fullName,
            phone: phone.replace(/\D/g, ''),
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Erro ao criar perfil');
        }

        // Auto sign in after registration
        const signInData = await signIn(email, password);
        
        if (!signInData?.user) {
          throw new Error('Erro ao fazer login automático');
        }

        onLogin(signInData.user.user_metadata?.role as UserRole);
      } else {
        // Sign in
        const data = await signIn(email, password);

        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
        }

        // Determine user role
        let userRole: UserRole = 'client';
        if (email === 'admin@salon.com') {
          userRole = 'admin';
        } else if (data.user?.user_metadata?.role) {
          userRole = data.user.user_metadata.role as UserRole;
        }

        onLogin(userRole);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-1/4 left-1/4 animate-float">
          <Scissors className="h-8 w-8 text-purple-400/30" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float delay-1000">
          <Sparkles className="h-6 w-6 text-pink-400/30" />
        </div>
        <div className="absolute bottom-1/3 left-1/5 animate-float delay-2000">
          <Star className="h-7 w-7 text-blue-400/30" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              SALON TIME
            </h1>
            <p className="mt-2 text-gray-300 text-lg">
              {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </p>
            <div className="mt-2 h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
          </div>

          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-2xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {isRegistering && (
                <>
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Nome Completo
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm transition-all"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      WhatsApp/Telefone
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm transition-all"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        maxLength={15}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm transition-all"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm transition-all"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-purple-400 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-purple-400 transition-colors" />
                    )}
                  </button>
                </div>
                {isRegistering && (
                  <div className="text-sm text-gray-300 bg-white/5 rounded-xl p-3 backdrop-blur-sm">
                    <p className="font-medium mb-2">Requisitos da senha:</p>
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        <span>Mínimo de 6 caracteres</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${/[A-Za-z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        <span>Letras e números</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              {isRegistering && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Confirmar Senha
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm transition-all"
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-purple-400 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-purple-400 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me */}
              {!isRegistering && (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded bg-white/10 backdrop-blur-sm"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-200">
                    Lembrar-me
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Carregando...</span>
                  </div>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>{isRegistering ? 'Criar Conta' : 'Entrar'}</span>
                    <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-300">ou</span>
              </div>
            </div>

            {/* Guest Continue */}
            <button
              onClick={onGuestContinue}
              className="w-full flex justify-center items-center px-4 py-3 border border-white/20 shadow-sm text-sm font-medium rounded-2xl text-gray-200 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 backdrop-blur-sm transition-all duration-200"
            >
              <User className="h-5 w-5 mr-2 text-gray-400" />
              Continuar como convidado
            </button>

            {/* Toggle Form */}
            <div className="text-center">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setFullName('');
                  setPhone('');
                  setConfirmPassword('');
                }}
                className="text-sm text-purple-300 hover:text-purple-200 transition-colors duration-200"
              >
                {isRegistering
                  ? 'Já tem uma conta? Entre aqui'
                  : 'Não tem uma conta? Cadastre-se'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Transformando beleza em arte ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;