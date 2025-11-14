'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, UserCheck, Clock, ArrowLeft, Plus, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient: { name: string };
  professional: { name: string };
  status: string;
}

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  patient_name: string;
  professional_name: string;
  action: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalProfessionals: 0,
    todayAppointments: 0,
    availableSlots: 0
  });

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    if (!supabase) {
      router.push('/');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
    }
  };

  const loadDashboardData = async () => {
    if (!supabase) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    // Carregar agendamentos de hoje
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id, date, time, status,
        patient:patients(name),
        professional:professionals(name)
      `)
      .eq('date', today)
      .order('time');

    if (appointments) {
      setTodayAppointments(appointments);
      setStats(prev => ({
        ...prev,
        todayAppointments: appointments.length,
        availableSlots: 22 - appointments.length // 22 slots por dia (8h-18h30)
      }));
    }

    // Carregar estatísticas
    const { count: patientsCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    const { count: professionalsCount } = await supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true });

    setStats(prev => ({
      ...prev,
      totalPatients: patientsCount || 0,
      totalProfessionals: professionalsCount || 0
    }));

    // Carregar histórico recente (últimos 10 registros)
    const { data: recentAppointments } = await supabase
      .from('appointments')
      .select(`
        id, date, time, status, created_at,
        patient:patients(name),
        professional:professionals(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentAppointments) {
      const historyItems: HistoryItem[] = recentAppointments.map(app => ({
        id: app.id,
        date: app.date,
        time: app.time,
        patient_name: app.patient?.name || 'N/A',
        professional_name: app.professional?.name || 'N/A',
        action: app.status === 'scheduled' ? 'Agendamento criado' : 'Agendamento cancelado',
        created_at: app.created_at
      }));
      setHistory(historyItems);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <span className="text-xl font-bold text-white">N+</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Nutri+</h2>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 font-medium transition-colors"
            >
              <Calendar className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => router.push('/agenda')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              <Clock className="h-5 w-5" />
              Agenda
            </button>
            <button
              onClick={() => router.push('/pacientes')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              <Users className="h-5 w-5" />
              Pacientes
            </button>
            <button
              onClick={() => router.push('/usuarios')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              <UserCheck className="h-5 w-5" />
              Profissionais
            </button>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Visão geral do sistema de agendamentos
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Agendamentos Hoje</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Horários Livres</p>
                <p className="text-3xl font-bold text-gray-900">{stats.availableSlots}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total de Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Profissionais</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProfessionals}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/agenda')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-sm font-medium mb-1 opacity-90">Agendar</p>
              <p className="text-lg font-bold">Novo Atendimento</p>
            </div>
            <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => router.push('/pacientes')}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-sm font-medium mb-1 opacity-90">Cadastrar</p>
              <p className="text-lg font-bold">Novo Paciente</p>
            </div>
            <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => router.push('/usuarios')}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-sm font-medium mb-1 opacity-90">Adicionar</p>
              <p className="text-lg font-bold">Profissional</p>
            </div>
            <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Agendamentos de Hoje e Histórico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agendamentos de Hoje */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Agendamentos de Hoje
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">Carregando...</p>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum agendamento para hoje</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-green-700">
                            {formatTime(appointment.time)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.patient?.name}</p>
                          <p className="text-sm text-gray-600">{appointment.professional?.name}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        appointment.status === 'scheduled'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {appointment.status === 'scheduled' ? 'AGENDADO' : 'CANCELADO'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Histórico Recente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Histórico Recente
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">Carregando...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum histórico disponível</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.patient_name} • {item.professional_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(item.date)} às {formatTime(item.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
