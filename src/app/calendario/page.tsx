'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, FileText, X, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient_id: string;
  professional_id: string;
  status: string;
  duration: number;
  notes?: string;
  ticket_number?: string;
}

interface AppointmentWithDetails extends Appointment {
  patient_name: string;
  professional_name: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface UserData {
  id: string;
  nome: string;
  perfil_id: string;
}

type ViewMode = 'day' | 'week' | 'biweekly' | 'month';

const STATUS_COLORS = {
  scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  confirmed: 'bg-green-100 text-green-700 border-green-300',
  waiting: 'bg-blue-100 text-blue-700 border-blue-300',
  completed: 'bg-purple-100 text-purple-700 border-purple-300',
  no_show: 'bg-red-100 text-red-700 border-red-300',
};

const STATUS_LABELS = {
  scheduled: 'Não Confirmado',
  confirmed: 'Confirmado',
  waiting: 'Aguardando',
  completed: 'Concluído',
  no_show: 'Não Compareceu',
};

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Não Confirmado', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  { value: 'waiting', label: 'Paciente Aguardando', color: 'bg-blue-100 text-blue-700' },
  { value: 'no_show', label: 'Paciente Não Chegou', color: 'bg-red-100 text-red-700' },
  { value: 'completed', label: 'Atendimento Concluído', color: 'bg-purple-100 text-purple-700' }
];

export default function CalendarioPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [validationError, setValidationError] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithDetails | null>(null);
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
    loadAppointments();
  }, [currentDate, viewMode]);

  useEffect(() => {
    if (selectedDate) {
      filterAppointmentsByDate(selectedDate);
    }
  }, [selectedDate, appointments]);

  const generateTicketNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKT-${timestamp}-${random}`;
  };

  const loadAppointments = async () => {
    if (!supabase) {
      console.error('Supabase não configurado');
      return;
    }
    
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments_with_ticket')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date')
        .order('time');

      if (appointmentsError) {
        console.error('Erro ao carregar agendamentos:', appointmentsError);
        return;
      }

      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, name, email, phone');

      if (patientsError) {
        console.error('Erro ao carregar pacientes:', patientsError);
      }

      const { data: professionalsData, error: professionalsError } = await supabase
        .from('usuarios')
        .select('id, nome, perfil_id');

      if (professionalsError) {
        console.error('Erro ao carregar profissionais:', professionalsError);
      }

      const patientsMap = new Map(patientsData?.map(p => [p.id, p.name]) || []);
      const professionalsMap = new Map(professionalsData?.map(p => [p.id, p.nome]) || []);

      const appointmentsWithDetails: AppointmentWithDetails[] = (appointmentsData || []).map(apt => ({
        ...apt,
        patient_name: patientsMap.get(apt.patient_id) || 'Paciente não encontrado',
        professional_name: professionalsMap.get(apt.professional_id) || 'Profissional não encontrado',
      }));

      setAppointments(appointmentsWithDetails);
      setPatients(patientsData || []);
      setUsers(professionalsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'day':
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'biweekly':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 13);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const filterAppointmentsByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const filtered = appointments.filter(apt => apt.date === dateStr);
    setFilteredAppointments(filtered);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'biweekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 14 : -14));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const checkAppointmentOverlap = async (
    date: string, 
    time: string, 
    duration: number,
    professionalId: string,
    excludeAppointmentId?: string
  ): Promise<{ hasOverlap: boolean; message?: string }> => {
    if (!supabase) return { hasOverlap: false };

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

      const [hours, minutes] = time.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + duration;

      for (const apt of data || []) {
        if (excludeAppointmentId && apt.id === excludeAppointmentId) {
          continue;
        }

        const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
        const aptStartMinutes = aptHours * 60 + aptMinutes;
        const aptEndMinutes = aptStartMinutes + apt.duration;

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

    if (!supabase) {
      setValidationError('Supabase não configurado. Configure as variáveis de ambiente.');
      return;
    }

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
      
      await loadAppointments();
    } catch (error) {
      console.error('Erro inesperado:', error);
      setValidationError('Erro inesperado ao processar consulta');
    }
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

  const handleNewAppointment = () => {
    openModal(selectedDate || undefined);
  };

  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
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

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('appointments_with_ticket')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir agendamento');
        return;
      }

      alert('Agendamento excluído com sucesso!');
      loadAppointments();
      if (selectedDate) {
        filterAppointmentsByDate(selectedDate);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir agendamento');
    }
  };

  const renderCalendar = () => {
    const { startDate, endDate } = getDateRange();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: Date[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return (
      <div className={`grid gap-2 ${
        viewMode === 'day' ? 'grid-cols-1' :
        viewMode === 'week' ? 'grid-cols-7' :
        viewMode === 'biweekly' ? 'grid-cols-7' :
        'grid-cols-7'
      }`}>
        {days.map((day, index) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayAppointments = appointments.filter(apt => apt.date === dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isSelected = selectedDate && dateStr === selectedDate.toISOString().split('T')[0];

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : isToday
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="text-center mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </p>
                <p className={`text-lg font-bold ${
                  isToday ? 'text-green-600 dark:text-green-400' : 
                  isSelected ? 'text-blue-600 dark:text-blue-400' :
                  'text-gray-900 dark:text-white'
                }`}>
                  {day.getDate()}
                </p>
              </div>
              
              {dayAppointments.length > 0 && (
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className={`text-xs p-1 rounded border ${STATUS_COLORS[apt.status as keyof typeof STATUS_COLORS]}`}
                    >
                      <p className="font-medium truncate">{apt.time.substring(0, 5)}</p>
                      <p className="truncate">{apt.patient_name}</p>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <p className="text-xs text-center text-gray-500">
                      +{dayAppointments.length - 3} mais
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.phone.includes(searchPatient)
  );

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Calendário de Agendamentos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize e gerencie seus agendamentos
              </p>
            </div>
            <button
              onClick={handleNewAppointment}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nova Consulta
            </button>
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* View Mode Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'day'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Dia
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setViewMode('biweekly')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'biweekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Quinzena
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Mês
                </button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="text-center min-w-[200px]">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentDate.toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                >
                  Hoje
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando calendário...</p>
              </div>
            ) : (
              renderCalendar()
            )}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  Agendamentos - {selectedDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h2>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum agendamento para esta data
                  </p>
                  <button
                    onClick={handleNewAppointment}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Agendar Consulta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className={`p-4 rounded-lg border-2 ${STATUS_COLORS[apt.status as keyof typeof STATUS_COLORS]}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className="font-semibold">{apt.time.substring(0, 5)}</span>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800">
                              {apt.duration} min
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{apt.patient_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{apt.professional_name}</span>
                            </div>
                            {apt.ticket_number && (
                              <p className="text-xs font-mono">
                                Ticket: {apt.ticket_number}
                              </p>
                            )}
                            {apt.notes && (
                              <p className="text-xs mt-2 p-2 bg-white dark:bg-gray-800 rounded">
                                {apt.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleEditAppointment(apt)}
                            className="p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastrar/Editar Consulta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {editingAppointment ? 'Editar Consulta' : 'Nova Consulta'}
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
                  Profissional Responsável *
                </label>
                <select
                  required
                  value={formData.professional_id}
                  onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um profissional</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nome}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duração *
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
                  Status *
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
                  {editingAppointment ? 'Salvar Alterações' : 'Cadastrar Consulta'}
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
    </AuthenticatedLayout>
  );
}
