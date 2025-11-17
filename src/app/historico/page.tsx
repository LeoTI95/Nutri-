'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, User, ArrowLeft, Filter, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Patient {
  id: string;
  name: string;
}

interface UserData {
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
  duration: number;
  notes?: string;
}

interface AppointmentWithDetails extends Appointment {
  patient: Patient | null;
  user: UserData | null;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status', color: 'bg-gray-100 text-gray-700' },
  { value: 'scheduled', label: 'Não Confirmado', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  { value: 'waiting', label: 'Paciente Aguardando', color: 'bg-blue-100 text-blue-700' },
  { value: 'no_show', label: 'Paciente Não Chegou', color: 'bg-red-100 text-red-700' },
  { value: 'completed', label: 'Atendimento Concluído', color: 'bg-purple-100 text-purple-700' }
];

export default function HistoricoPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filterStatus, searchTerm]);

  const loadAllAppointments = async () => {
    if (!supabase) {
      console.error('❌ Cliente Supabase não disponível');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Carregar pacientes
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, name');

      if (patientsError) {
        console.error('Erro ao carregar pacientes:', patientsError);
      }

      // Carregar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select('id, nome');

      if (usersError) {
        console.error('Erro ao carregar usuários:', usersError);
      }

      // Criar mapas para busca rápida
      const patientsMap = new Map<string, Patient>();
      patientsData?.forEach(p => patientsMap.set(p.id, p));

      const usersMap = new Map<string, UserData>();
      usersData?.forEach(u => usersMap.set(u.id, u));

      // Carregar TODOS os agendamentos (ordenados do mais recente para o mais antigo)
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, date, time, patient_id, professional_id, status, duration, notes')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (appointmentsError) {
        console.error('Erro ao carregar histórico:', appointmentsError);
      } else if (appointmentsData) {
        const appointmentsWithDetails: AppointmentWithDetails[] = appointmentsData.map(apt => ({
          ...apt,
          patient: patientsMap.get(apt.patient_id) || null,
          user: usersMap.get(apt.professional_id) || null
        }));

        setAppointments(appointmentsWithDetails);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    // Filtro por busca (nome do paciente ou usuário)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patient?.name.toLowerCase().includes(search) ||
        apt.user?.nome.toLowerCase().includes(search)
      );
    }

    setFilteredAppointments(filtered);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                Histórico Completo de Agendamentos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualize todos os agendamentos realizados no sistema
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              {filteredAppointments.length} {filteredAppointments.length === 1 ? 'Agendamento' : 'Agendamentos'}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando histórico...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                Nenhum agendamento encontrado
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Ainda não há agendamentos registrados no sistema'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-base truncate">
                          {appointment.patient?.name || 'Paciente não encontrado'}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span className="truncate">
                              {appointment.user?.nome || 'Usuário não encontrado'}
                            </span>
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
