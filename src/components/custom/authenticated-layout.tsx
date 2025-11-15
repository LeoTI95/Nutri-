'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, Settings, UserCog, LogOut, Activity, Menu, X, Gift, MessageCircle, FileText, Bot } from 'lucide-react';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const isAuth = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');

    if (!isAuth || isAuth !== 'true' || !userData) {
      router.push('/auth/login');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    router.push('/auth/login');
  };

  // Mostra loading enquanto verifica autenticação
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/agendamento', label: 'Agendamento', icon: Calendar },
    { href: '/calendario', label: 'Calendário', icon: Calendar },
    { href: '/pacientes', label: 'Pacientes', icon: Users },
    { href: '/usuarios', label: 'Usuários', icon: UserCog },
    { href: '/prescricao', label: 'Prescrição', icon: FileText },
    { href: '/chat-ia', label: 'Chat IA', icon: Bot },
    { href: '/indique-ganhe', label: 'Indique e Ganhe', icon: Gift },
    { href: '/fale-conosco', label: 'Fale Conosco', icon: MessageCircle },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-lg font-bold text-white">CA</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">ClinicAgenda</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestão</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-800 flex flex-col z-50 transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-xl font-bold text-white">CA</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">ClinicAgenda</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 font-medium transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
