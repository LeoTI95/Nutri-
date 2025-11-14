'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, History, Settings, UserCog, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!supabase) {
      setIsAuthenticated(true); // Se não tem Supabase configurado, permite acesso
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    
    await supabase.auth.signOut();
    router.push('/');
  };

  // Mostra loading enquanto verifica autenticação
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderiza nada (já está redirecionando)
  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/agenda', label: 'Agenda', icon: Calendar },
    { href: '/pacientes', label: 'Pacientes', icon: Users },
    { href: '/usuarios', label: 'Usuários', icon: UserCog },
    { href: '/historico', label: 'Histórico', icon: History },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/agenda" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 group-hover:scale-105 transition-transform shadow-lg">
                <span className="text-xl font-bold text-white">C+</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ClinicAgenda
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors ml-2"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
