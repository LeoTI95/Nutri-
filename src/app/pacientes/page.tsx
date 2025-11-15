'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, MapPin, MessageCircle, Edit2, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  cpf: string;
  created_at: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    cpf: '',
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name');

    if (!error && data) {
      setPatients(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPatient) {
      // Atualizar paciente existente
      const { error } = await supabase
        .from('patients')
        .update(formData)
        .eq('id', editingPatient.id);

      if (error) {
        alert('Erro ao atualizar paciente: ' + error.message);
        return;
      }

      alert('Paciente atualizado com sucesso!');
    } else {
      // Criar novo paciente
      const { error } = await supabase
        .from('patients')
        .insert([formData]);

      if (error) {
        alert('Erro ao cadastrar paciente: ' + error.message);
        return;
      }

      alert('Paciente cadastrado com sucesso!');
    }

    setShowForm(false);
    setEditingPatient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      birth_date: '',
      cpf: '',
    });
    loadPatients();
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      birth_date: patient.birth_date,
      cpf: patient.cpf,
    });
    setShowForm(true);
  };

  const handleDelete = async (patient: Patient) => {
    if (!confirm(`Tem certeza que deseja excluir o paciente ${patient.name}?`)) {
      return;
    }

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patient.id);

    if (error) {
      alert('Erro ao excluir paciente: ' + error.message);
      return;
    }

    alert('Paciente excluído com sucesso!');
    loadPatients();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPatient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      birth_date: '',
      cpf: '',
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/+55${cleanPhone}`, '_blank');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Pacientes
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gerencie o cadastro de pacientes da clínica
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Novo Paciente
            </button>
          </div>

          {showForm && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingPatient ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone (com DDD) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingPatient ? 'Atualizar Paciente' : 'Cadastrar Paciente'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando pacientes...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Nenhum paciente encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex-1 truncate">
                          {patient.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-2">
                          <Calendar className="h-3 w-3" />
                          <span>{calculateAge(patient.birth_date)} anos</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{patient.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="text-xs line-clamp-1">{patient.address}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Edit2 className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(patient)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>

                        <button
                          onClick={() => openWhatsApp(patient.phone)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Contatar via WhatsApp
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
    </AuthenticatedLayout>
  );
}
