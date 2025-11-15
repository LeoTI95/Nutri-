'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, UserCheck, Clock, ArrowLeft, Plus, FileText, Menu, X, TrendingUp, Activity, CheckCircle, XCircle, AlertCircle, Edit2, Trash2, Bot, Gift, MessageCircle, Stethoscope } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Patient {
  id: string;
  name: string;
}

interface User {
  id: string;
  nome: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient_id: string;
  professional_id: string;
  status: string;
  ticket_number?: string;
  duration: number;
  notes?: string;
}

interface AppointmentWithDetails extends Appointment {
  patient: Patient | null;
  user: User | null;
}

interface DashboardStats {
  totalPatients: number;
  totalProfessionals: number;
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  confirmedAppointments: number;
  waitingAppointments: number;
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Não Confirmado', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  { value: 'waiting', label: 'Paciente Aguardando', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'no_show', label: 'Paciente Não Chegou', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  { value: 'completed', label: 'Atendimento Concluído', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' }
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentWithDetails[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<AppointmentWithDetails[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentWithDetails | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalProfessionals: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    confirmedAppointments: 0,
    waitingAppointments: 0
  });

  useEffect(() => {
    const isAuth = checkAuth();
    if (isAuth) {
      const configured = isSupabaseConfigured();
      setSupabaseConfigured(configured);
      
      if (configured) {
        loadDashboardData();
        const interval = setInterval(() => {
          loadDashboardData();
        }, 30000);
        return () => clearInterval(interval);
      } else {
        setLoading(false);
        console.warn('⚠️ Supabase não configurado. Configure as variáveis de ambiente.');
      }
    }
  }, []);

  const checkAuth = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');

    if (!isAuthenticated || isAuthenticated !== 'true' || !userData) {
      router.push('/auth/login');
      return false;
    }

    return true;
  };

  const loadDashboardData = async () => {
    if (!supabase) {
      console.error('❌ Cliente Supabase não disponível');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    try {
      // Carregar pacientes
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, name');

      if (patientsError) {
        console.error('Erro ao carregar pacientes:', patientsError);
      }

      // Carregar usuários da tabela 'usuarios' (quem agendou a consulta)
      // O campo professional_id no agendamento referencia o ID do usuário que fez o agendamento
      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select('id, nome');

      if (usersError) {
        console.error('Erro ao carregar usuários:', usersError);
      }

      // Carregar profissionais apenas para estatísticas
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('professionals')
        .select('id, name');

      if (professionalsError) {
        console.error('Erro ao carregar profissionais:', professionalsError);
      }

      // Criar mapas para busca rápida
      const patientsMap = new Map<string, Patient>();
      patientsData?.forEach(p => patientsMap.set(p.id, p));

      const usersMap = new Map<string, User>();
      usersData?.forEach(u => usersMap.set(u.id, u));

      // Carregar agendamentos de hoje - usando tabela appointments diretamente
      const { data: todayData, error: todayError } = await supabase
        .from('appointments')
        .select('id, date, time, patient_id, professional_id, status, ticket_number, duration, notes')
        .eq('date', today)
        .order('time');

      if (todayError) {
        console.error('Erro ao carregar agendamentos de hoje:', todayError);
      } else if (todayData) {
        // Mapear agendamentos com detalhes do paciente e usuário que agendou
        const appointmentsWithDetails: AppointmentWithDetails[] = todayData.map(apt => ({
          ...apt,
          patient: patientsMap.get(apt.patient_id) || null,
          user: usersMap.get(apt.professional_id) || null // professional_id = user_id que agendou
        }));

        setTodayAppointments(appointmentsWithDetails);

        const todayConfirmed = appointmentsWithDetails.filter(a => a.status === 'confirmed').length;
        const todayWaiting = appointmentsWithDetails.filter(a => a.status === 'waiting').length;
        const todayCompleted = appointmentsWithDetails.filter(a => a.status === 'completed').length;
        const todayNoShow = appointmentsWithDetails.filter(a => a.status === 'no_show').length;

        setStats(prev => ({
          ...prev,
          todayAppointments: appointmentsWithDetails.length,
          confirmedAppointments: todayConfirmed,
          waitingAppointments: todayWaiting,
          completedAppointments: todayCompleted,
          cancelledAppointments: todayNoShow
        }));
      }

      // Carregar histórico recente - usando tabela appointments diretamente
      const { data: recentData, error: recentError } = await supabase
        .from('appointments')
        .select('id, date, time, patient_id, professional_id, status, ticket_number, duration, notes')
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .limit(10);

      if (recentError) {
        console.error('Erro ao carregar histórico recente:', recentError);
      } else if (recentData) {
        const recentWithDetails: AppointmentWithDetails[] = recentData.map(apt => ({
          ...apt,
          patient: patientsMap.get(apt.patient_id) || null,
          user: usersMap.get(apt.professional_id) || null // professional_id = user_id que agendou
        }));

        setRecentAppointments(recentWithDetails);
      }

      // Carregar contadores totais
      const { count: totalAppointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: professionalsCount } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true });

      setStats(prev => ({
        ...prev,
        totalPatients: patientsCount || 0,
        totalProfessionals: professionalsCount || 0,
        totalAppointments: totalAppointmentsCount || 0
      }));

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    router.push('/auth/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatusLabel = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.label || status;
  };

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-700';
  };

  const cycleStatus = async (appointmentId: string, currentStatus: string) => {
    if (!supabase) return;

    const statusCycle: { [key: string]: string } = {
      'scheduled': 'confirmed',
      'confirmed': 'waiting',
      'waiting': 'completed',
      'completed': 'scheduled',
      'no_show': 'scheduled'
    };

    const newStatus = statusCycle[currentStatus] || 'scheduled';

    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (!error) {
      loadDashboardData();
    } else {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleEdit = (appointment: AppointmentWithDetails) => {
    router.push('/agendamento');
  };

  const handleDeleteClick = (appointment: AppointmentWithDetails) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete || !supabase) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentToDelete.id);

      if (error) {
        console.error('Erro ao excluir agendamento:', error);
        alert('Erro ao excluir agendamento: ' + error.message);
        return;
      }

      alert('Agendamento excluído com sucesso!');
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
      await loadDashboardData();
    } catch (error) {
      console.error('Erro inesperado:', error);
      alert('Erro inesperado ao excluir agendamento');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-lg font-bold text-white">CA</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">ClinicAgenda</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
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
            <button
              onClick={() => {
                router.push('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium transition-colors"
            >
              <Activity className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => {
                router.push('/agendamento');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <Calendar className="h-5 w-5" />
              Agendamento
            </button>
            <button
              onClick={() => {
                router.push('/calendario');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <Calendar className="h-5 w-5" />
              Calendário
            </button>
            <button
              onClick={() => {
                router.push('/pacientes');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <Users className="h-5 w-5" />
              Pacientes
            </button>
            <button
              onClick={() => {
                router.push('/usuarios');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <UserCheck className="h-5 w-5" />
              Usuários
            </button>
            <button
              onClick={() => {
                router.push('/prescricao');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <FileText className="h-5 w-5" />
              Prescrição
            </button>
            <button
              onClick={() => {
                router.push('/chat-ia');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <Bot className="h-5 w-5" />
              Chat IA
            </button>
            <button
              onClick={() => {
                router.push('/indique-ganhe');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <Gift className="h-5 w-5" />
              Indique e Ganhe
            </button>
            <button
              onClick={() => {
                router.push('/fale-conosco');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Fale Conosco
            </button>
            <button
              onClick={() => {
                router.push('/configuracoes');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <UserCheck className="h-5 w-5" />
              Configurações
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
        {!supabaseConfigured && (
          <div className="mb-6 bg-orange-50 dark:bg-orange-950 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                  Configuração Necessária
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  As variáveis de ambiente do Supabase não estão configuradas. Configure-as para carregar os dados do sistema.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Dashboard - Hoje
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Visão geral dos agendamentos de hoje ({new Date().toLocaleDateString('pt-BR')})
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total de Pacientes</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Profissionais</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProfessionals}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Agendamentos Hoje</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.todayAppointments}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total de Agendamentos</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalAppointments}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 sm:p-6 rounded-xl shadow-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Confirmados Hoje</p>
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{stats.confirmedAppointments}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-4 sm:p-6 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Aguardando Hoje</p>
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.waitingAppointments}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 sm:p-6 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Concluídos Hoje</p>
              <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.completedAppointments}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 p-4 sm:p-6 rounded-xl shadow-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Não Compareceram Hoje</p>
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-900 dark:text-red-100">{stats.cancelledAppointments}</p>
          </div>
        </div>

        {/* Botões de Ação Rápida - TAMANHO REDUZIDO */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 mb-6 lg:mb-8">
          <button
            onClick={() => router.push('/agendamento')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-medium mb-0.5 opacity-90">Agendar</p>
              <p className="text-sm font-bold">Nova Consulta</p>
            </div>
            <Plus className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          </button>

          <button
            onClick={() => router.push('/pacientes')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-medium mb-0.5 opacity-90">Cadastrar</p>
              <p className="text-sm font-bold">Novo Paciente</p>
            </div>
            <Plus className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          </button>

          <button
            onClick={() => router.push('/usuarios')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-medium mb-0.5 opacity-90">Adicionar</p>
              <p className="text-sm font-bold">Usuário</p>
            </div>
            <Plus className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          </button>

          <button
            onClick={() => router.push('/prescricao')}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-medium mb-0.5 opacity-90">Criar</p>
              <p className="text-sm font-bold">Prescrição</p>
            </div>
            <Stethoscope className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          </button>

          <button
            onClick={() => router.push('/chat-ia')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-medium mb-0.5 opacity-90">Assistente</p>
              <p className="text-sm font-bold">Chat IA</p>
            </div>
            <Bot className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          </button>

          <button
            onClick={() => router.push('/indique-ganhe')}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-medium mb-0.5 opacity-90">Programa</p>
              <p className="text-sm font-bold">Indique e Ganhe</p>
            </div>
            <Gift className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          </button>

          <button
            onClick={() => router.push('/fale-conosco')}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-medium mb-0.5 opacity-90">Suporte</p>
              <p className="text-sm font-bold">Fale Conosco</p>
            </div>
            <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          </button>

          <button
            onClick={() => router.push('/calendario')}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-medium mb-0.5 opacity-90">Visualizar</p>
              <p className="text-sm font-bold">Calendário</p>
            </div>
            <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          </button>
        </div>

        {/* Agendamentos de Hoje e Histórico Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Agendamentos de Hoje */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Agendamentos de Hoje
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              {!supabaseConfigured ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Configure o Supabase para ver os dados</p>
                </div>
              ) : loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Carregando...</p>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum agendamento para hoje</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
                              {formatTime(appointment.time)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{appointment.patient?.name || 'Paciente não encontrado'}</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Agendado por: {appointment.user?.nome || 'Usuário não encontrado'}</p>
                            {appointment.ticket_number && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1">
                                Ticket: {appointment.ticket_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => cycleStatus(appointment.id, appointment.status)}
                          className={`flex-1 px-3 py-2 text-xs rounded-lg font-medium cursor-pointer transition-colors ${getStatusColor(appointment.status)} hover:opacity-80`}
                        >
                          {getStatusLabel(appointment.status)}
                        </button>
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                          title="Editar agendamento"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(appointment)}
                          className="p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                          title="Excluir agendamento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Histórico Recente */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Histórico Recente
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              {!supabaseConfigured ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Configure o Supabase para ver os dados</p>
                </div>
              ) : loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Carregando...</p>
                </div>
              ) : recentAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum histórico disponível</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAppointments.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{item.patient?.name || 'Paciente não encontrado'}</p>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${getStatusColor(item.status)}`}>
                              {getStatusLabel(item.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            Agendado por: {item.user?.nome || 'Usuário não encontrado'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(item.date)} às {formatTime(item.time)}
                          </p>
                          {item.ticket_number && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-mono mt-1">
                              Ticket: {item.ticket_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors text-xs"
                        >
                          <Edit2 className="h-3 w-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && appointmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Confirmar Exclusão
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Tem certeza que deseja excluir o agendamento de <strong>{appointmentToDelete.patient?.name}</strong> para o dia{' '}
                  <strong>{formatDate(appointmentToDelete.date)}</strong> às{' '}
                  <strong>{formatTime(appointmentToDelete.time)}</strong>?
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md"
              >
                Sim, Excluir
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAppointmentToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
