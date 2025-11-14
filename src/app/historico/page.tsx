'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Users, Clock } from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  professional: {
    id: string;
    name: string;
    specialty: string;
  };
  patient: {
    id: string;
    name: string;
  };
}

export default function HistoricoPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [selectedPeriod, selectedDate]);

  const loadAppointments = async () => {
    setLoading(true);

    let startDate: string;
    let endDate: string;

    const date = new Date(selectedDate);

    if (selectedPeriod === 'day') {
      startDate = selectedDate;
      endDate = selectedDate;
    } else if (selectedPeriod === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      startDate = startOfWeek.toISOString().split('T')[0];

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endDate = endOfWeek.toISOString().split('T')[0];
    } else {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, date, time, status,
        professional:professionals(id, name, specialty),
        patient:patients(id, name)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (!error && data) {
      setAppointments(data);
    }
    setLoading(false);
  };

  const getPeriodLabel = () => {
    const date = new Date(selectedDate);
    if (selectedPeriod === 'day') {
      return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (selectedPeriod === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('pt-BR')} - ${endOfWeek.toLocaleDateString('pt-BR')}`;
    } else {
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Histórico de Atendimentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe os atendimentos realizados
          </p>
        </div>

        <div className="mb-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="day">Dia</option>
                <option value="week">Semana</option>
                <option value="month">Mês</option>
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {getPeriodLabel()}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando histórico...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum atendimento encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Não há atendimentos registrados para o período selecionado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {appointment.patient.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.professional.name} • {appointment.professional.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(appointment.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {appointment.time}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Horário
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {appointment.time}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Profissional
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {appointment.professional.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {appointment.professional.specialty}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {appointment.status === 'scheduled' ? 'Agendado' : 'Cancelado'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && appointments.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Resumo do Período</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total de Atendimentos</p>
                <p className="text-3xl font-bold text-white">{appointments.length}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Profissionais</p>
                <p className="text-3xl font-bold text-white">
                  {new Set(appointments.map(a => a.professional.id)).size}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Pacientes Atendidos</p>
                <p className="text-3xl font-bold text-white">
                  {new Set(appointments.map(a => a.patient.id)).size}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Média por Dia</p>
                <p className="text-3xl font-bold text-white">
                  {selectedPeriod === 'day' ? appointments.length :
                   selectedPeriod === 'week' ? Math.round(appointments.length / 7) :
                   Math.round(appointments.length / 30)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
