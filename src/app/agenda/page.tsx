'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, UserCheck, Plus, X, ChevronLeft, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';

interface Patient {
  id: string;
  name: string;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient_id: string;
  professional_id: string;
  patient: { name: string };
  professional: { name: string; specialty: string };
  status: string;
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    professional_id: ''
  });

  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadProfessionals();
  }, [selectedDate, selectedProfessional]);

  const loadAppointments = async () => {
    if (!supabase) return;
    
    setLoading(true);
    let query = supabase
      .from('appointments')
      .select(`
        id, date, time, status, patient_id, professional_id,
        patient:patients(name),
        professional:professionals(name, specialty)
      `)
      .eq('date', selectedDate)
      .order('time');

    if (selectedProfessional !== 'all') {
      query = query.eq('professional_id', selectedProfessional);
    }

    const { data, error } = await query;

    if (!error && data) {
      setAppointments(data);
    }
    setLoading(false);
  };

  const loadPatients = async () => {
    if (!supabase) return;
    
    const { data } = await supabase
      .from('patients')
      .select('id, name')
      .order('name');
    if (data) setPatients(data);
  };

  const loadProfessionals = async () => {
    if (!supabase) return;
    
    const { data } = await supabase
      .from('professionals')
      .select('id, name, specialty')
      .order('name');
    if (data) setProfessionals(data);
  };

  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  const getAppointmentForSlot = (time: string) => {
    return appointments.find(app => app.time === time);
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const { error } = await supabase
      .from('appointments')
      .insert([{
        date: selectedDate,
        time: selectedSlot,
        patient_id: formData.patient_id,
        professional_id: formData.professional_id,
        status: 'scheduled'
      }]);

    if (!error) {
      setShowAddModal(false);
      setFormData({ patient_id: '', professional_id: '' });
      loadAppointments();
    } else {
      alert('Erro ao criar agendamento: ' + error.message);
    }
  };

  const openAddModal = (time: string) => {
    setSelectedSlot(time);
    setShowAddModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const scheduledCount = appointments.filter(app => app.status === 'scheduled').length;
  const attendedCount = appointments.filter(app => app.status === 'attended').length;
  const availableSlots = timeSlots.length - appointments.length;

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header com botão voltar */}
          <div className="mb-6">
            <button className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Minha Agenda
                </h1>
                <p className="text-gray-600 capitalize">
                  {formatDate(selectedDate)}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Pacientes</p>
                  <p className="text-3xl font-bold text-gray-900">{scheduledCount}</p>
                </div>
                <Users className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Agendados</p>
                  <p className="text-3xl font-bold text-gray-900">{scheduledCount}</p>
                </div>
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Atendidos</p>
                  <p className="text-3xl font-bold text-gray-900">{attendedCount}</p>
                </div>
                <UserCheck className="h-10 w-10 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Horários Livres</p>
                  <p className="text-3xl font-bold text-gray-900">{availableSlots}</p>
                </div>
                <Clock className="h-10 w-10 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Filtro de Profissional */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Todos os Profissionais</option>
                {professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} - {prof.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de Horários */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Horários do Dia
              </h2>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-3 text-gray-600">Carregando agenda...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const appointment = getAppointmentForSlot(time);
                    return (
                      <div
                        key={time}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                          appointment
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                        onClick={() => !appointment && openAddModal(time)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-20 h-12 bg-white border border-gray-200 rounded-lg">
                            <span className="font-bold text-gray-900">{time}</span>
                          </div>
                          
                          {appointment ? (
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {appointment.patient?.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {appointment.professional?.name} - {appointment.professional?.specialty}
                              </p>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <p className="text-gray-500">Livre</p>
                              <p className="text-sm text-gray-400">Clique para agendar</p>
                            </div>
                          )}
                        </div>

                        <div>
                          {appointment ? (
                            <span className={`px-4 py-1.5 text-sm rounded-full font-medium ${
                              appointment.status === 'scheduled'
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : appointment.status === 'attended'
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                            }`}>
                              {appointment.status === 'scheduled' ? 'Agendado' : 
                               appointment.status === 'attended' ? 'Atendido' : 'Cancelado'}
                            </span>
                          ) : (
                            <Plus className="h-6 w-6 text-green-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Histórico de Atendimentos */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Histórico de Atendimentos
              </h2>
            </div>
            <div className="p-4">
              {appointments.filter(app => app.status === 'attended').length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum atendimento realizado hoje
                </p>
              ) : (
                <div className="space-y-2">
                  {appointments
                    .filter(app => app.status === 'attended')
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-blue-200 bg-blue-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-20 h-12 bg-white border border-blue-200 rounded-lg">
                            <span className="font-bold text-gray-900">{appointment.time}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {appointment.patient?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.professional?.name} - {appointment.professional?.specialty}
                            </p>
                          </div>
                        </div>
                        <span className="px-4 py-1.5 text-sm rounded-full font-medium bg-blue-100 text-blue-700 border border-blue-300">
                          Atendido
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Adicionar Agendamento */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Novo Agendamento - {selectedSlot}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paciente *
                  </label>
                  <select
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione um paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profissional *
                  </label>
                  <select
                    required
                    value={formData.professional_id}
                    onChange={(e) => setFormData({...formData, professional_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione um profissional</option>
                    {professionals.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} - {prof.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Agendar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
