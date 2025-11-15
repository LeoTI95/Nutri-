'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Stethoscope, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  crm_crn: string;
  created_at: string;
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    crm_crn: '',
  });

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('name');

    if (!error && data) {
      setProfessionals(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProfessional) {
      // Atualizar profissional existente
      const { error } = await supabase
        .from('professionals')
        .update(formData)
        .eq('id', editingProfessional.id);

      if (error) {
        alert('Erro ao atualizar profissional: ' + error.message);
        return;
      }

      alert('Profissional atualizado com sucesso!');
    } else {
      // Criar novo profissional
      const { error } = await supabase
        .from('professionals')
        .insert([formData]);

      if (error) {
        alert('Erro ao cadastrar profissional: ' + error.message);
        return;
      }

      alert('Profissional cadastrado com sucesso!');
    }

    setShowForm(false);
    setEditingProfessional(null);
    setFormData({
      name: '',
      specialty: '',
      email: '',
      phone: '',
      crm_crn: '',
    });
    loadProfessionals();
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      specialty: professional.specialty,
      email: professional.email,
      phone: professional.phone,
      crm_crn: professional.crm_crn,
    });
    setShowForm(true);
  };

  const handleDelete = async (professional: Professional) => {
    if (!confirm(`Tem certeza que deseja excluir o profissional ${professional.name}?`)) {
      return;
    }

    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', professional.id);

    if (error) {
      alert('Erro ao excluir profissional: ' + error.message);
      return;
    }

    alert('Profissional excluído com sucesso!');
    loadProfessionals();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProfessional(null);
    setFormData({
      name: '',
      specialty: '',
      email: '',
      phone: '',
      crm_crn: '',
    });
  };

  const filteredProfessionals = professionals.filter(prof =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const specialties = [
    'Médico Clínico Geral',
    'Cardiologista',
    'Dermatologista',
    'Pediatra',
    'Ginecologista',
    'Ortopedista',
    'Dentista',
    'Nutricionista',
    'Psicólogo',
    'Fisioterapeuta',
    'Outro',
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Profissionais
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie os profissionais de saúde da clínica
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Novo Profissional
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingProfessional ? 'Editar Profissional' : 'Cadastrar Novo Profissional'}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Especialidade *
                </label>
                <select
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione...</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CRM/CRN/Registro *
                </label>
                <input
                  type="text"
                  required
                  value={formData.crm_crn}
                  onChange={(e) => setFormData({ ...formData, crm_crn: e.target.value })}
                  placeholder="Ex: CRM 123456"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  {editingProfessional ? 'Atualizar Profissional' : 'Cadastrar Profissional'}
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

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar profissional por nome ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando profissionais...</p>
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Nenhum profissional encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProfessionals.map((prof) => (
                  <div
                    key={prof.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                        <Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {prof.name}
                        </h3>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                          {prof.specialty}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <p>{prof.email}</p>
                      <p>{prof.phone}</p>
                      <p className="font-medium">{prof.crm_crn}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(prof)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(prof)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
}
