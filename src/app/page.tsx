'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se usuário está autenticado
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (isAuthenticated === 'true') {
      // Se autenticado, redirecionar para dashboard
      console.log('✅ Usuário autenticado, redirecionando para dashboard...');
      router.push('/dashboard');
    } else {
      // Se não autenticado, redirecionar para login
      console.log('❌ Usuário não autenticado, redirecionando para login...');
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}
