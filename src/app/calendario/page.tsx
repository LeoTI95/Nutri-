'use client';

import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  FileText,
  X,
  Edit2,
  Trash2,
  Search,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';

/* ============================================================
   🔧 Função segura para criar Date local a partir de YYYY-MM-DD
   (evita o bug do JavaScript transformar data em UTC e voltar 1 dia)
============================================================ */
function parseLocalDate(str: string) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/* ============================================================
   Tipos
============================================================ */
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

/* ============================================================
   Status
============================================================ */
const STATUS_COLORS = {
  scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  confirmed: 'bg-green-100 text-green-700 border-green-300',
  waiting: 'bg-blue-100 text-blue-700 border-blue-300',
  completed: 'bg-purple-100 text-purple-700 border-purple-300',
  no_show: 'bg-red-100 text-red-700 border-red-300'
};

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Não Confirmado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'waiting', label: 'Paciente Aguardando' },
  { value: 'no_show', label: 'Paciente Não Chegou' },
  { value: 'completed', label: 'Atendimento Concluído' }
];

/* ============================================================
   Componente principal
============================================================ */
export default function CalendarioPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
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

  /* ============================================================
     Carregar agendamentos ao mudar de mês/semana/dia
  ============================================================ */
  useEffect(() => {
    loadAppointments();
  }, [currentDate, viewMode]);

  useEffect(() => {
    if (selectedDate) filterAppointmentsByDate(selectedDate);
  }, [selectedDate, appointments]);

  /* ============================================================
     🎯 Função segura de range de datas
     Semana começando no DOMINGO
  ============================================================ */
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'day':
        break;

      case 'week': {
        const jsDay = start.getDay(); // domingo=0
        start.setDate(start.getDate() - jsDay);
        end.setDate(start.getDate() + 6);
        break;
      }

      case 'biweekly': {
        const jsDay = start.getDay();
        start.setDate(start.getDate() - jsDay);
        end.setDate(start.getDate() + 13);
        break;
      }

      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  /* ============================================================
     🔥 Carregar dados do Supabase (CORRIGIDO)
  ============================================================ */
  const loadAppointments = async () => {
    if (!supabase) return;

    setLoading(true);

    try {
      const { startDate, endDate } = getDateRange();

      const { data: appointmentsData } = await supabase
        .from('appointments_with_ticket')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, name, email, phone');

      const { data: usersData } = await supabase
        .from('usuarios')
        .select('id, nome, perfil_id');

      const patientsMap = new Map(patientsData?.map(p => [p.id, p.name]));
      const professionalsMap = new Map(usersData?.map(u => [u.id, u.nome]));

      const formatted = (appointmentsData || []).map((apt) => ({
        ...apt,
        patient_name: patientsMap.get(apt.patient_id) || 'Paciente',
        professional_name: professionalsMap.get(apt.professional_id) || 'Profissional'
      }));

      setAppointments(formatted);
      setPatients(patientsData || []);
      setUsers(usersData || []);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     Filtrar agendamentos por data (seguro)
  ============================================================ */
  const filterAppointmentsByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setFilteredAppointments(appointments.filter(a => a.date === dateStr));
  };

  /* ============================================================
     Navegação
  ============================================================ */
  const navigateDate = (direction: 'next' | 'prev') => {
    const d = new Date(currentDate);

    switch (viewMode) {
      case 'day':
        d.setDate(d.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'biweekly':
        d.setDate(d.getDate() + (direction === 'next' ? 14 : -14));
        break;
      case 'month':
        d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }

    setCurrentDate(d);
  };

  /* ============================================================
     Abrir modal com data correta
  ============================================================ */
  const openModal = (date?: Date) => {
    const d = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    setFormData({
      patient_id: '',
      professional_id: '',
      date: d,
      time: '',
      duration: 30,
      notes: '',
      status: 'scheduled'
    });

    setEditingAppointment(null);
    setShowModal(true);
  };

  /* ============================================================
     🗓️ Renderização do calendário
  ============================================================ */
  const renderCalendar = () => {
    const { startDate, endDate } = getDateRange();
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);

    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return (
      <div className={`grid gap-2 grid-cols-7`}>
        {days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const items = appointments.filter(a => a.date === dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isSelected = selectedDate && dateStr === selectedDate.toISOString().split('T')[0];

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`p-3 rounded-lg border cursor-pointer transition
              ${isSelected ? 'border-blue-500 bg-blue-50'
                : isToday ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-white'}`}
            >
              <div className="text-center mb-2">
                <p className="text-xs text-gray-500">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </p>
                <p className="text-lg font-bold">{day.getDate()}</p>
              </div>

              {items.length > 0 && (
                <div className="space-y-1">
                  {items.slice(0, 3).map(a => (
                    <div key={a.id} className={`text-xs p-1 border rounded ${STATUS_COLORS[a.status]}`}>
                      <strong>{a.time}</strong>
                      <div className="truncate">{a.patient_name}</div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-center text-gray-500">
                      +{items.length - 3} mais
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

  /* ============================================================
     🔚 JSX final
  ============================================================ */
  return (
    <AuthenticatedLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">

          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Calendário</h1>
            <button
              onClick={() => openModal(selectedDate || undefined)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Plus size={18} /> Novo
            </button>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigateDate('prev')} className="p-2 bg-gray-200 rounded"><ChevronLeft /></button>

            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>

            <button onClick={() => navigateDate('next')} className="p-2 bg-gray-200 rounded"><ChevronRight /></button>

            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 bg-green-500 text-white rounded">
              Hoje
            </button>

            <div className="ml-auto flex gap-2">
              {['day', 'week', 'biweekly', 'month'].map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v as ViewMode)}
                  className={`px-3 py-1 rounded ${viewMode === v ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  {v === 'day' ? 'Dia' :
                   v === 'week' ? 'Semana' :
                   v === 'biweekly' ? 'Quinzena' : 'Mês'}
                </button>
              ))}
            </div>
          </div>

          {/* Calendário */}
          <div className="bg-white border rounded p-4 mb-6">
            {loading ? <p>Carregando...</p> : renderCalendar()}
          </div>

          {/* Lista da data selecionada */}
          {selectedDate && (
            <div className="bg-white border rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">
                  {selectedDate.toLocaleDateString('pt-BR')}
                </h2>
                <button onClick={() => setSelectedDate(null)}><X /></button>
              </div>

              {filteredAppointments.length === 0 && (
                <p className="text-gray-500">Nenhum agendamento.</p>
              )}

              {filteredAppointments.map(a => (
                <div key={a.id} className={`p-3 border rounded mb-2 ${STATUS_COLORS[a.status]}`}>
                  <div className="flex justify-between">
                    <strong>{a.time}</strong>
                    <div className="flex gap-2">
                      <button className="p-1 bg-blue-200 rounded" onClick={() => { setEditingAppointment(a); setFormData(a); setShowModal(true); }}>
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-1 bg-red-200 rounded"
                        onClick={async () => {
                          await supabase.from('appointments_with_ticket').delete().eq('id', a.id);
                          loadAppointments();
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div>{a.patient_name}</div>
                  <div>{a.professional_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingAppointment ? 'Editar Consulta' : 'Nova Consulta'}
                </h2>
                <button onClick={() => setShowModal(false)}><X /></button>
              </div>

              {validationError && (
                <p className="text-red-500 mb-2">{validationError}</p>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!formData.patient_id || !formData.date || !formData.time || !formData.professional_id) {
                    setValidationError('Preencha todos os campos obrigatórios');
                    return;
                  }

                  if (editingAppointment) {
                    await supabase.from('appointments_with_ticket')
                      .update(formData)
                      .eq('id', editingAppointment.id);
                  } else {
                    await supabase.from('appointments_with_ticket')
                      .insert([formData]);
                  }

                  setShowModal(false);
                  loadAppointments();
                }}
              >
                <label>Data</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border p-2 mb-3"
                />

                <label>Horário</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full border p-2 mb-3"
                />

                <label>Paciente</label>
                <select
                  value={formData.patient_id}
                  onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full border p-2 mb-3"
                >
                  <option value="">Selecione</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <label>Profissional</label>
                <select
                  value={formData.professional_id}
                  onChange={e => setFormData({ ...formData, professional_id: e.target.value })}
                  className="w-full border p-2 mb-3"
                >
                  <option value="">Selecione</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>

                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border p-2 mb-3"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded mt-2"
                >
                  Salvar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
