'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, UserCheck, Plus, X, Filter } from 'lucide-react';
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

  const filteredAppointments = appointments.filter(app => {
    if (selectedProfessional === 'all') return true;
    return app.professional_id === selectedProfessional;
  });

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Agenda de Atendimentos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie os agendamentos por horário e profissional
            </p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Agendados Hoje</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {appointments.filter(app => app.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Slots Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {timeSlots.length - appointments.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(appointments.map(app => app.patient_id)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profissionais</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {professionals.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e Controles */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={selectedProfessional}
                    onChange={(e) => setSelectedProfessional(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">Todos os Profissionais</option>
                    {professionals.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} - {prof.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Lista de Slots */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Horários do Dia
              </h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando agenda...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const appointment = getAppointmentForSlot(time);
                    return (
                      <div
                        key={time}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          appointment
                            ? 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800'
                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                        }`}
                        onClick={() => !appointment && openAddModal(time)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-20 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span className="font-bold text-gray-900 dark:text-white">{time}</span>
                          </div>
                          
                          {appointment ? (
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {appointment.patient?.name}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {appointment.professional?.name} - {appointment.professional?.specialty}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <p className="text-gray-500 dark:text-gray-400">Horário disponível</p>
                              <p className="text-sm text-gray-400 dark:text-gray-500">Clique para agendar</p>
                            </div>
                          )}
                        </div>

                        <div>
                          {appointment ? (
                            <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                              appointment.status === 'scheduled'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                              {appointment.status === 'scheduled' ? 'Agendado' : 'Cancelado'}
                            </span>
                          ) : (
                            <Plus className="h-6 w-6 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Adicionar Agendamento */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Novo Agendamento - {selectedSlot}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Paciente *
                  </label>
                  <select
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profissional *
                  </label>
                  <select
                    required
                    value={formData.professional_id}
                    onChange={(e) => setFormData({...formData, professional_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
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
