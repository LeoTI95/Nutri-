'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Verificar se já está autenticado
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      console.log('✅ Usuário já autenticado, redirecionando...');
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Iniciando autenticação para:', email);

      // Buscar usuário diretamente na tabela usuarios
      const { data: usuario, error: queryError } = await supabase
        .from('usuarios')
        .select('*, perfis(nome)')
        .eq('email', email)
        .eq('senha', password)
        .single();

      console.log('📊 Resultado da consulta:', { usuario, queryError });

      if (queryError || !usuario) {
        console.error('❌ Erro na consulta:', queryError);
        setError('Email ou senha incorretos');
        setLoading(false);
        return;
      }

      // Verificar se o usuário está ativo
      if (!usuario.ativo) {
        console.warn('⚠️ Usuário inativo:', email);
        setError('Usuário inativo. Entre em contato com o administrador.');
        setLoading(false);
        return;
      }

      console.log('✅ Autenticação bem-sucedida!');
      
      // Login bem-sucedido - salvar dados no localStorage
      const userData = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfis?.nome,
        perfil_id: usuario.perfil_id,
        authenticated: true,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      console.log('💾 Dados salvos no localStorage:', userData);

      // Mostrar mensagem de sucesso
      setSuccess('Login realizado com sucesso! Redirecionando...');
      console.log('🚀 Preparando redirecionamento para /dashboard');

      // Aguardar um momento para o usuário ver a mensagem
      setTimeout(() => {
        console.log('🔄 Executando redirecionamento...');
        // Usar router.push em vez de window.location.href para navegação SPA
        router.push('/dashboard');
        // Forçar refresh da página após navegação
        router.refresh();
      }, 1000);

    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      setError('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ClinicAgenda
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Faça login para acessar o sistema
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          © 2024 ClinicAgenda. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
