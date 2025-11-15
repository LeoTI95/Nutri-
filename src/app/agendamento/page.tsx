'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Search, X, Plus, ChevronLeft, ChevronRight, AlertCircle, Edit2, Trash2, Filter, Ticket, User, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface User {
  id: string;
  nome: string;
  perfil_id: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  patient_id: string;
  professional_id: string;
  status: string;
  notes?: string;
  ticket_number?: string;
}

interface AppointmentWithDetails extends Appointment {
  patient_name: string;
  professional_name: string;
}

type ViewMode = 'day' | 'week' | 'biweekly' | 'month';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Não Confirmado', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  { value: 'waiting', label: 'Paciente Aguardando', color: 'bg-blue-100 text-blue-700' },
  { value: 'no_show', label: 'Paciente Não Chegou', color: 'bg-red-100 text-red-700' },
  { value: 'completed', label: 'Atendimento Concluído', color: 'bg-purple-100 text-purple-700' }
];

export default function AgendamentoPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<AppointmentWithDetails | null>(null);
  const [searchPatient, setSearchPatient] = useState('');
  const [validationError, setValidationError] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentWithDetails | null>(null);
  const [filterProfessional, setFilterProfessional] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [formData, setFormData] = useState({
    patient_id: '',
    professional_id: '',
    date: '',
    time: '',
    duration: 30,
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    loadData();
  }, [currentDate, viewMode]);

  useEffect(() => {
    applyFilter();
  }, [appointments, filterProfessional, filterStatus]);

  const applyFilter = () => {
    let filtered = [...appointments];

    // Filtrar por profissional (se não for "all")
    if (filterProfessional !== 'all') {
      filtered = filtered.filter(apt => apt.professional_id === filterProfessional);
    }

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    setFilteredAppointments(filtered);
  };

  const generateTicketNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKT-${timestamp}-${random}`;
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'day':
        // Mesmo dia
        break;
      case 'week':
        // Início da semana (domingo)
        start.setDate(start.getDate() - start.getDay());
        // Fim da semana (sábado)
        end.setDate(start.getDate() + 6);
        break;
      case 'biweekly':
        // Início da semana (domingo)
        start.setDate(start.getDate() - start.getDay());
        // Fim de 2 semanas
        end.setDate(start.getDate() + 13);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
    }

    return { start, end };
  };

  const loadData = async () => {
    setLoading(true);
    
    try {
      const { start, end } = getDateRange();
      
      // Buscar agendamentos
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments_with_ticket')
        .select('*')
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (appointmentsError) {
        console.error('Erro ao carregar agendamentos:', appointmentsError);
      }

      // Buscar pacientes
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, name, email, phone')
        .order('name');

      if (patientsError) {
        console.error('Erro ao carregar pacientes:', patientsError);
      }

      // Buscar usuários (REMOVIDO O FILTRO perfil_id=eq.2 que causava erro de UUID)
      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select('id, nome, perfil_id')
        .order('nome');

      if (usersError) {
        console.error('Erro ao carregar usuários:', usersError);
      }

      // Combinar dados manualmente
      if (appointmentsData && patientsData && usersData) {
        const appointmentsWithDetails: AppointmentWithDetails[] = appointmentsData.map(apt => {
          const patient = patientsData.find(p => p.id === apt.patient_id);
          const professional = usersData.find(u => u.id === apt.professional_id);
          
          return {
            ...apt,
            patient_name: patient?.name || 'Paciente não encontrado',
            professional_name: professional?.nome || 'Usuário não encontrado'
          };
        });

        setAppointments(appointmentsWithDetails);
        setPatients(patientsData);
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAppointmentOverlap = async (
    date: string, 
    time: string, 
    duration: number,
    professionalId: string,
    excludeAppointmentId?: string
  ): Promise<{ hasOverlap: boolean; message?: string }> => {
    try {
      const { data, error } = await supabase
        .from('appointments_with_ticket')
        .select('id, time, duration')
        .eq('date', date)
        .eq('professional_id', professionalId);

      if (error) {
        console.error('Erro ao verificar sobreposição:', error);
        return { hasOverlap: false };
      }

      // Converter horário para minutos
      const [hours, minutes] = time.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + duration;

      // Verificar sobreposição com outros agendamentos
      for (const apt of data || []) {
        // Pular o próprio agendamento se estiver editando
        if (excludeAppointmentId && apt.id === excludeAppointmentId) {
          continue;
        }

        const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
        const aptStartMinutes = aptHours * 60 + aptMinutes;
        const aptEndMinutes = aptStartMinutes + apt.duration;

        // Verificar se há sobreposição
        if (
          (startMinutes >= aptStartMinutes && startMinutes < aptEndMinutes) ||
          (endMinutes > aptStartMinutes && endMinutes <= aptEndMinutes) ||
          (startMinutes <= aptStartMinutes && endMinutes >= aptEndMinutes)
        ) {
          return {
            hasOverlap: true,
            message: `Conflito de horário! Já existe um agendamento das ${apt.time.substring(0, 5)} às ${Math.floor(aptEndMinutes / 60).toString().padStart(2, '0')}:${(aptEndMinutes % 60).toString().padStart(2, '0')}`
          };
        }
      }

      return { hasOverlap: false };
    } catch (error) {
      console.error('Erro ao verificar sobreposição:', error);
      return { hasOverlap: false };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.patient_id || !formData.professional_id || !formData.date || !formData.time) {
      setValidationError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Verificar sobreposição de horários
    const overlapCheck = await checkAppointmentOverlap(
      formData.date,
      formData.time,
      formData.duration,
      formData.professional_id,
      editingAppointment?.id
    );
    
    if (overlapCheck.hasOverlap) {
      setValidationError(overlapCheck.message || 'Conflito de horário detectado');
      return;
    }

    try {
      if (editingAppointment) {
        // Atualizar agendamento existente (remarcar)
        const { error } = await supabase
          .from('appointments_with_ticket')
          .update({
            patient_id: formData.patient_id,
            professional_id: formData.professional_id,
            date: formData.date,
            time: formData.time,
            duration: formData.duration,
            notes: formData.notes,
            status: formData.status
          })
          .eq('id', editingAppointment.id);

        if (error) {
          console.error('Erro ao remarcar consulta:', error);
          setValidationError('Erro ao remarcar consulta: ' + error.message);
          return;
        }

        alert('Consulta remarcada com sucesso!');
      } else {
        // Criar novo agendamento com ticket
        const ticketNumber = generateTicketNumber();
        
        const { error } = await supabase
          .from('appointments_with_ticket')
          .insert([{
            patient_id: formData.patient_id,
            professional_id: formData.professional_id,
            date: formData.date,
            time: formData.time,
            duration: formData.duration,
            notes: formData.notes,
            status: formData.status,
            ticket_number: ticketNumber
          }]);

        if (error) {
          console.error('Erro ao cadastrar consulta:', error);
          setValidationError('Erro ao cadastrar consulta: ' + error.message);
          return;
        }

        alert(`Consulta cadastrada com sucesso! Ticket: ${ticketNumber}`);
      }
      
      setShowModal(false);
      setEditingAppointment(null);
      setFormData({
        patient_id: '',
        professional_id: '',
        date: '',
        time: '',
        duration: 30,
        notes: '',
        status: 'scheduled'
      });
      setSearchPatient('');
      setValidationError('');
      
      // Recarregar dados após criar/remarcar consulta
      await loadData();
    } catch (error) {
      console.error('Erro inesperado:', error);
      setValidationError('Erro inesperado ao processar consulta');
    }
  };

  const handleEdit = (appointment: AppointmentWithDetails) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      professional_id: appointment.professional_id,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      notes: appointment.notes || '',
      status: appointment.status || 'scheduled'
    });
    setValidationError('');
    setShowModal(true);
  };

  const handleDeleteClick = (appointment: AppointmentWithDetails) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      const { error } = await supabase
        .from('appointments_with_ticket')
        .delete()
        .eq('id', appointmentToDelete.id);

      if (error) {
        console.error('Erro ao excluir consulta:', error);
        alert('Erro ao excluir consulta: ' + error.message);
        return;
      }

      alert('Consulta excluída com sucesso!');
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
      
      // Recarregar dados após excluir
      await loadData();
    } catch (error) {
      console.error('Erro inesperado:', error);
      alert('Erro inesperado ao excluir consulta');
    }
  };

  const showTicket = (appointment: AppointmentWithDetails) => {
    setSelectedTicket(appointment);
    setShowTicketModal(true);
  };

  const printTicket = () => {
    window.print();
  };

  const getStatusLabel = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.label || status;
  };

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-700';
  };

  const getDaysInView = () => {
    const { start, end } = getDateRange();
    const days = [];
    const current = new Date(start);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredAppointments.filter(apt => apt.date === dateStr);
  };

  const previousPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'biweekly':
        newDate.setDate(newDate.getDate() - 14);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'biweekly':
        newDate.setDate(newDate.getDate() + 14);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const openModal = (date?: Date) => {
    setEditingAppointment(null);
    const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setFormData({
      patient_id: '',
      professional_id: '',
      date: dateStr,
      time: '',
      duration: 30,
      notes: '',
      status: 'scheduled'
    });
    setValidationError('');
    setShowModal(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.phone.includes(searchPatient)
  );

  const getPeriodLabel = () => {
    const { start, end } = getDateRange();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    switch (viewMode) {
      case 'day':
        return currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      case 'week':
        return `${start.getDate()} - ${end.getDate()} de ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
      case 'biweekly':
        return `${start.getDate()} de ${monthNames[start.getMonth()]} - ${end.getDate()} de ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
      case 'month':
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const days = viewMode === 'month' ? getDaysInMonth() : getDaysInView();
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                Agendamento de Consultas
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Cadastre, visualize e gerencie consultas de pacientes
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Users className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <select
                  value={filterProfessional}
                  onChange={(e) => setFilterProfessional(e.target.value)}
                  className="flex-1 sm:flex-none px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs shadow-sm"
                >
                  <option value="all">Todos os Usuários</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs shadow-sm"
                >
                  <option value="all">Todos os Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => openModal()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span className="whitespace-nowrap">Nova Consulta</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
            {/* Controles do Calendário */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <button
                  onClick={previousPeriod}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white min-w-[160px] sm:min-w-[180px] text-center">
                  {getPeriodLabel()}
                </h2>
                
                <button
                  onClick={nextPeriod}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="flex gap-1 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('day')}
                  className={`flex-1 sm:flex-none px-2 py-1 text-[10px] sm:text-xs rounded-lg transition-colors ${
                    viewMode === 'day'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Dia
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`flex-1 sm:flex-none px-2 py-1 text-[10px] sm:text-xs rounded-lg transition-colors ${
                    viewMode === 'week'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setViewMode('biweekly')}
                  className={`flex-1 sm:flex-none px-2 py-1 text-[10px] sm:text-xs rounded-lg transition-colors ${
                    viewMode === 'biweekly'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Quinzena
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`flex-1 sm:flex-none px-2 py-1 text-[10px] sm:text-xs rounded-lg transition-colors ${
                    viewMode === 'month'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Mês
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Carregando calendário...</p>
              </div>
            ) : viewMode === 'month' ? (
              <>
                {/* Dias da Semana */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grade do Calendário */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dayAppointments = getAppointmentsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square border rounded-lg p-0.5 sm:p-1 cursor-pointer transition-all hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md relative group ${
                          isToday
                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 shadow-sm'
                            : isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500'
                            : dayAppointments.length > 0
                            ? 'bg-purple-50 dark:bg-purple-950 border-purple-300 dark:border-purple-700'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex flex-col h-full">
                          <div className={`text-[10px] sm:text-xs font-semibold mb-0.5 ${
                            isToday ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {day.getDate()}
                          </div>
                          
                          {dayAppointments.length > 0 && (
                            <div className="flex-1 overflow-hidden">
                              <div className="space-y-0.5">
                                {dayAppointments.slice(0, 1).map((apt) => (
                                  <div
                                    key={apt.id}
                                    className="text-[8px] sm:text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-0.5 py-0.5 rounded truncate"
                                    title={`${apt.time.substring(0, 5)} - ${apt.patient_name}`}
                                  >
                                    {apt.time.substring(0, 5)}
                                  </div>
                                ))}
                                {dayAppointments.length > 1 && (
                                  <div className="text-[8px] sm:text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                                    +{dayAppointments.length - 1}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Botão de adicionar ao passar o mouse */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(day);
                          }}
                          className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg"
                          title="Cadastrar consulta"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Visualização de Dia/Semana/Quinzena */
              <div className="space-y-2">
                {days.map((day) => {
                  const dayAppointments = getAppointmentsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div key={day.toISOString()} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                      <div className={`p-2 flex items-center justify-between ${
                        isToday ? 'bg-blue-100 dark:bg-blue-950' : 'bg-gray-50 dark:bg-gray-800'
                      }`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                          {day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </h3>
                        <button
                          onClick={() => openModal(day)}
                          className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-md"
                          title="Cadastrar consulta"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="p-2">
                        {dayAppointments.length === 0 ? (
                          <p className="text-center py-2 text-gray-500 dark:text-gray-400 text-xs">
                            Nenhuma consulta agendada
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {dayAppointments.map((apt) => (
                              <div
                                key={apt.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-300 dark:border-blue-700 shadow-sm"
                              >
                                <div className="flex items-center gap-1.5 min-w-[60px]">
                                  <Clock className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                  <span className="font-semibold text-gray-900 dark:text-white text-xs">
                                    {apt.time.substring(0, 5)}
                                  </span>
                                </div>
                                
                                <div className="flex-1 w-full min-w-0">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                                    <div className="min-w-0 w-full sm:w-auto">
                                      <p className="font-medium text-gray-900 dark:text-white text-xs truncate">
                                        {apt.patient_name}
                                      </p>
                                      <p className="text-gray-600 dark:text-gray-400 text-[10px] truncate">
                                        Usuário: {apt.professional_name}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                                      <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium whitespace-nowrap ${getStatusColor(apt.status)}`}>
                                        {getStatusLabel(apt.status)}
                                      </span>
                                      {apt.ticket_number && (
                                        <button
                                          onClick={() => showTicket(apt)}
                                          className="p-1 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 rounded transition-colors"
                                          title="Ver ticket"
                                        >
                                          <Ticket className="h-3 w-3" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleEdit(apt)}
                                        className="p-1 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors"
                                        title="Remarcar consulta"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteClick(apt)}
                                        className="p-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded transition-colors"
                                        title="Excluir consulta"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detalhes do Dia Selecionado (apenas para visualização mensal) */}
          {selectedDate && viewMode === 'month' && (
            <div className="mt-3 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => openModal(selectedDate)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs rounded-lg transition-all shadow-md"
                >
                  <Plus className="h-3 w-3" />
                  Cadastrar Consulta
                </button>
              </div>

              <div className="space-y-1.5">
                {getAppointmentsForDate(selectedDate).length === 0 ? (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
                    Nenhuma consulta agendada para este dia
                  </p>
                ) : (
                  getAppointmentsForDate(selectedDate).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-300 dark:border-blue-700 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5 min-w-[60px]">
                        <Clock className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900 dark:text-white text-xs">
                          {apt.time.substring(0, 5)}
                        </span>
                      </div>
                      
                      <div className="flex-1 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                          <div className="min-w-0 w-full sm:w-auto">
                            <p className="font-medium text-gray-900 dark:text-white text-xs truncate">
                              {apt.patient_name}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-[10px] truncate">
                              Agendado por: {apt.professional_name}
                            </p>
                            {apt.notes && (
                              <p className="text-gray-500 dark:text-gray-500 text-[10px] mt-0.5 truncate">
                                {apt.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium whitespace-nowrap ${getStatusColor(apt.status)}`}>
                              {getStatusLabel(apt.status)}
                            </span>
                            {apt.ticket_number && (
                              <button
                                onClick={() => showTicket(apt)}
                                className="p-1 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 rounded transition-colors"
                                title="Ver ticket"
                              >
                                <Ticket className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(apt)}
                              className="p-1 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors"
                              title="Remarcar consulta"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(apt)}
                              className="p-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded transition-colors"
                              title="Excluir consulta"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Cadastrar/Remarcar Consulta */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {editingAppointment ? 'Remarcar Consulta' : 'Cadastrar Nova Consulta'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingAppointment(null);
                    setSearchPatient('');
                    setValidationError('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                {validationError && (
                  <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data da Consulta *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buscar Paciente *
                  </label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Digite o nome, email ou telefone do paciente..."
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um paciente</option>
                    {filteredPatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.phone}
                      </option>
                    ))}
                  </select>
                  {filteredPatients.length === 0 && searchPatient && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Nenhum paciente encontrado. Verifique a busca ou cadastre um novo paciente.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agendado Por (Usuário Responsável) *
                  </label>
                  <select
                    required
                    value={formData.professional_id}
                    onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um usuário</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nome}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Este é o usuário que está realizando o agendamento
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Horário *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    min="08:00"
                    max="18:30"
                    step="1800"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Os horários não podem se sobrepor
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duração da Consulta *
                  </label>
                  <select
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status da Consulta *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Observações sobre a consulta..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingAppointment ? 'Remarcar Consulta' : 'Cadastrar Consulta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAppointment(null);
                      setSearchPatient('');
                      setValidationError('');
                    }}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                    Tem certeza que deseja excluir a consulta de <strong>{appointmentToDelete.patient_name}</strong> para o dia{' '}
                    <strong>{new Date(appointmentToDelete.date + 'T00:00:00').toLocaleDateString('pt-BR')}</strong> às{' '}
                    <strong>{appointmentToDelete.time.substring(0, 5)}</strong>?
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

        {/* Modal de Ticket de Atendimento */}
        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Ticket className="h-6 w-6 text-purple-600" />
                  Ticket de Atendimento
                </h2>
                <button
                  onClick={() => {
                    setShowTicketModal(false);
                    setSelectedTicket(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Número do Ticket</p>
                  <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                    {selectedTicket.ticket_number}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paciente</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {selectedTicket.patient_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Usuário Responsável</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {selectedTicket.professional_name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Data</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedTicket.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Horário</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {selectedTicket.time.substring(0, 5)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </span>
                  </div>

                  {selectedTicket.notes && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Observações</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedTicket.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={printTicket}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-md"
                  >
                    Imprimir Ticket
                  </button>
                  <button
                    onClick={() => {
                      setShowTicketModal(false);
                      setSelectedTicket(null);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
