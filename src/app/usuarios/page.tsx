'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, User, Shield, Edit, Trash2, Mail, AlertCircle, FileText, MapPin, Phone } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';

interface Perfil {
  id: string;
  nome: string;
  descricao: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil_id: string;
  perfil_categoria?: string;
  especialidade?: string;
  endereco?: string;
  telefone?: string;
  ativo: boolean;
  created_at: string;
  perfis?: {
    nome: string;
  };
}

interface Profissional {
  id: string;
  name: string;
  specialty: string;
  crn: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    perfil_id: '',
    registro_profissional: '',
    especialidade: '',
    endereco: '',
    telefone: '',
    ativo: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!supabase || !isSupabaseConfigured()) {
      setLoading(false);
      setError('Supabase não está configurado. Configure as variáveis de ambiente.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data: perfisData, error: perfisError } = await supabase
        .from('perfis')
        .select('*')
        .neq('nome', 'Admin')
        .order('nome');

      if (perfisError) {
        console.error('Erro ao carregar perfis:', perfisError);
        setError('Erro ao carregar perfis. Verifique as permissões no Supabase.');
      } else if (perfisData) {
        setPerfis(perfisData);
      }

      const { data: profissionaisData, error: profissionaisError } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (profissionaisError) {
        console.error('Erro ao carregar profissionais:', profissionaisError);
      } else if (profissionaisData) {
        setProfissionais(profissionaisData);
      }

      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*, perfis(nome)')
        .order('nome');

      if (usuariosError) {
        console.error('Erro ao carregar usuários:', usuariosError);
        setError('Erro ao carregar usuários. Verifique as permissões no Supabase.');
      } else if (usuariosData) {
        setUsuarios(usuariosData);
      }
    } catch (err: any) {
      console.error('Erro geral ao carregar dados:', err);
      setError('Erro de conexão. Verifique sua conexão com o Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): { valid: boolean; message?: string } => {
    email = email.trim().toLowerCase();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Formato de email inválido' };
    }
    
    const commonTypos: { [key: string]: string } = {
      'gamil.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
    };
    
    const domain = email.split('@')[1];
    
    if (commonTypos[domain]) {
      return { 
        valid: false, 
        message: `Você quis dizer "${email.replace(domain, commonTypos[domain])}"? Verifique o domínio do email.` 
      };
    }
    
    return { valid: true };
  };

  const isPerfilClinico = () => {
    if (!formData.perfil_id) return false;
    const perfilSelecionado = perfis.find(p => p.id === formData.perfil_id);
    if (!perfilSelecionado) return false;
    
    const nomePerfil = perfilSelecionado.nome.toLowerCase();
    return nomePerfil.includes('médico') || 
           nomePerfil.includes('medico') || 
           nomePerfil.includes('dentista') || 
           nomePerfil.includes('nutricionista') ||
           nomePerfil.includes('clínico') ||
           nomePerfil.includes('clinico') ||
           nomePerfil.includes('profissional');
  };

  const getPerfilCategoria = (perfilId: string): string => {
    const perfil = perfis.find(p => p.id === perfilId);
    if (!perfil) return 'geral';
    
    const nomePerfil = perfil.nome.toLowerCase();
    
    if (nomePerfil.includes('admin')) return 'admin';
    if (nomePerfil.includes('médico') || nomePerfil.includes('medico')) return 'medico';
    if (nomePerfil.includes('dentista')) return 'dentista';
    if (nomePerfil.includes('nutricionista')) return 'nutricionista';
    if (nomePerfil.includes('enferm')) return 'enfermeiro';
    if (nomePerfil.includes('recep')) return 'recepcao';
    if (nomePerfil.includes('secretar')) return 'secretaria';
    if (nomePerfil.includes('financ')) return 'financeiro';
    
    return 'geral';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase || !isSupabaseConfigured()) {
      setError('Supabase não está configurado. Configure as variáveis de ambiente.');
      alert('❌ Supabase não configurado!\n\nConfigure as variáveis de ambiente para usar esta funcionalidade.');
      return;
    }

    setError(null);
    
    try {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        alert(emailValidation.message);
        return;
      }

      if (isPerfilClinico() && !editingId && !formData.registro_profissional.trim()) {
        alert('Por favor, informe o registro profissional (CRM, CRO, CRN, etc)');
        return;
      }

      if (isPerfilClinico() && !formData.especialidade.trim()) {
        alert('Por favor, informe a especialidade do profissional');
        return;
      }
      
      if (editingId) {
        const perfilCategoria = getPerfilCategoria(formData.perfil_id);
        
        const updateData: any = {
          nome: formData.nome,
          perfil_id: formData.perfil_id,
          perfil_categoria: perfilCategoria,
          endereco: formData.endereco || null,
          telefone: formData.telefone || null,
          ativo: formData.ativo,
        };

        if (isPerfilClinico()) {
          updateData.especialidade = formData.especialidade || null;
        }

        const { error: updateError } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', editingId);

        if (updateError) {
          console.error('Erro ao atualizar usuário:', updateError);
          setError('Erro ao atualizar usuário: ' + updateError.message);
          return;
        }

        if (isPerfilClinico() && formData.registro_profissional.trim()) {
          const { data: existingProfessional } = await supabase
            .from('professionals')
            .select('id')
            .eq('email', formData.email)
            .single();

          if (existingProfessional) {
            await supabase
              .from('professionals')
              .update({
                name: formData.nome,
                crn: formData.registro_profissional.trim(),
                specialty: formData.especialidade || perfis.find(p => p.id === formData.perfil_id)?.nome || 'Profissional',
                phone: formData.telefone || '',
              })
              .eq('email', formData.email);
          } else {
            await supabase
              .from('professionals')
              .insert({
                email: formData.email,
                name: formData.nome,
                phone: formData.telefone || '',
                crn: formData.registro_profissional.trim(),
                specialty: formData.especialidade || perfis.find(p => p.id === formData.perfil_id)?.nome || 'Profissional',
              });
          }
        }

        alert('Usuário atualizado com sucesso!');
      } else {
        const emailNormalizado = formData.email.trim().toLowerCase();
        
        const { data: emailExistente, error: checkError } = await supabase
          .from('usuarios')
          .select('email')
          .eq('email', emailNormalizado)
          .single();

        if (emailExistente) {
          setError(`O email "${emailNormalizado}" já está cadastrado no sistema. Use outro email.`);
          alert(`❌ Email já cadastrado!\n\nO email "${emailNormalizado}" já existe no sistema.\nPor favor, use outro email.`);
          return;
        }
        
        const senhaTemporaria = Math.random().toString(36).slice(-8) + 'Aa1!';
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailNormalizado,
          password: senhaTemporaria,
          options: {
            data: {
              nome: formData.nome,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });

        if (authError) {
          console.error('Erro no auth.signUp:', authError);
          
          if (authError.message.includes('invalid')) {
            setError('Email inválido. Verifique se digitou corretamente (ex: usuario@gmail.com)');
            alert('❌ Email inválido!\n\nVerifique se digitou corretamente.\nExemplo correto: usuario@gmail.com');
          } else if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            setError('Este email já está cadastrado no sistema de autenticação.');
            alert('❌ Email já cadastrado!\n\nEste email já existe no sistema.\nUse outro email.');
          } else {
            setError('Erro ao criar autenticação: ' + authError.message);
            alert('❌ Erro ao criar usuário:\n\n' + authError.message);
          }
          return;
        }

        if (!authData.user) {
          setError('Erro: Usuário não foi criado no sistema de autenticação');
          alert('❌ Erro ao criar usuário no sistema de autenticação.');
          return;
        }

        const perfilCategoria = getPerfilCategoria(formData.perfil_id);

        const insertData: any = {
          id: authData.user.id,
          nome: formData.nome,
          email: emailNormalizado,
          senha: senhaTemporaria,
          perfil_id: formData.perfil_id,
          perfil_categoria: perfilCategoria,
          endereco: formData.endereco || null,
          telefone: formData.telefone || null,
          ativo: formData.ativo,
        };

        if (isPerfilClinico()) {
          insertData.especialidade = formData.especialidade || null;
        }

        const { error: dbError } = await supabase
          .from('usuarios')
          .insert([insertData]);

        if (dbError) {
          console.error('Erro ao inserir na tabela usuarios:', dbError);
          
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (deleteError) {
            console.error('Erro ao deletar usuário do auth após falha:', deleteError);
          }
          
          if (dbError.code === '23505' && dbError.message.includes('email')) {
            setError(`O email "${emailNormalizado}" já está cadastrado. Use outro email.`);
            alert(`❌ Email já cadastrado!\n\nO email "${emailNormalizado}" já existe.\nUse outro email.`);
          } else {
            setError('Erro ao cadastrar usuário no banco: ' + dbError.message);
            alert('❌ Erro ao cadastrar usuário:\n\n' + dbError.message);
          }
          return;
        }

        if (isPerfilClinico() && formData.registro_profissional.trim()) {
          const { error: professionalError } = await supabase
            .from('professionals')
            .insert({
              email: emailNormalizado,
              name: formData.nome,
              phone: formData.telefone || '',
              crn: formData.registro_profissional.trim(),
              specialty: formData.especialidade || perfis.find(p => p.id === formData.perfil_id)?.nome || 'Profissional',
            });

          if (professionalError) {
            console.error('Erro ao criar profissional:', professionalError);
            alert(`⚠️ Usuário cadastrado, mas houve erro ao criar registro profissional:\n\n${professionalError.message}`);
          }
        }

        const mensagemSucesso = isPerfilClinico() 
          ? `✅ Usuário cadastrado com sucesso!\n\n📧 Email: ${emailNormalizado}\n🔑 Senha temporária: ${senhaTemporaria}\n📋 Registro: ${formData.registro_profissional}\n🏥 Especialidade: ${formData.especialidade}\n🏷️ Categoria: ${perfilCategoria}\n\n⚠️ O usuário deve alterar a senha no primeiro acesso.`
          : `✅ Usuário cadastrado com sucesso!\n\n📧 Email: ${emailNormalizado}\n🔑 Senha temporária: ${senhaTemporaria}\n🏷️ Categoria: ${perfilCategoria}\n\n⚠️ O usuário deve alterar a senha no primeiro acesso.`;
        
        alert(mensagemSucesso);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        nome: '',
        email: '',
        perfil_id: '',
        registro_profissional: '',
        especialidade: '',
        endereco: '',
        telefone: '',
        ativo: true,
      });
      loadData();
    } catch (error: any) {
      console.error('Erro geral:', error);
      setError('Erro ao processar: ' + (error.message || 'Erro desconhecido'));
      alert('❌ Erro ao processar:\n\n' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleEdit = async (usuario: Usuario) => {
    if (!supabase) return;

    setEditingId(usuario.id);
    
    let registroProfissional = '';
    const { data: professionalData } = await supabase
      .from('professionals')
      .select('crn')
      .eq('email', usuario.email)
      .single();
    
    if (professionalData) {
      registroProfissional = professionalData.crn || '';
    }
    
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      perfil_id: usuario.perfil_id,
      registro_profissional: registroProfissional,
      especialidade: usuario.especialidade || '',
      endereco: usuario.endereco || '',
      telefone: usuario.telefone || '',
      ativo: usuario.ativo,
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: string, nome: string, email: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
      return;
    }

    if (!supabase) {
      alert('❌ Supabase não configurado!');
      return;
    }

    try {
      await supabase
        .from('professionals')
        .delete()
        .eq('email', email);

      const { error: dbError } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Erro ao deletar da tabela:', dbError);
        setError('Erro ao excluir usuário: ' + dbError.message);
        return;
      }

      try {
        await supabase.auth.admin.deleteUser(id);
      } catch (authError) {
        console.log('Não foi possível deletar do auth (requer permissões admin)');
      }

      alert('Usuário excluído com sucesso!');
      loadData();
    } catch (error: any) {
      console.error('Erro geral:', error);
      setError('Erro ao excluir: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleResetPassword = async (email: string, nome: string) => {
    if (!confirm(`Enviar email de redefinição de senha para "${nome}"?`)) {
      return;
    }

    if (!supabase) {
      alert('❌ Supabase não configurado!');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        setError('Erro ao enviar email de redefinição: ' + error.message);
        return;
      }

      alert(`Email de redefinição de senha enviado com sucesso para: ${email}`);
    } catch (error: any) {
      console.error('Erro geral:', error);
      setError('Erro ao processar: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const filteredUsuarios = usuarios.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Usuários do Sistema
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gerencie os usuários e seus perfis de acesso
              </p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  nome: '',
                  email: '',
                  perfil_id: '',
                  registro_profissional: '',
                  especialidade: '',
                  endereco: '',
                  telefone: '',
                  ativo: true,
                });
                setShowForm(!showForm);
                setError(null);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Novo Usuário
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  Erro
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          {!isSupabaseConfigured() && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                  Configuração Necessária
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  As variáveis de ambiente do Supabase não estão configuradas. Configure-as para usar esta funcionalidade.
                </p>
              </div>
            </div>
          )}

          {showForm && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingId ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                    disabled={!!editingId}
                    placeholder="usuario@gmail.com"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${
                      editingId 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  {editingId ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      O email não pode ser alterado após o cadastro
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ⚠️ Verifique se o email está correto (ex: @gmail.com, não @gamil.com)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Perfil de Acesso *
                  </label>
                  <select
                    required
                    value={formData.perfil_id}
                    onChange={(e) => setFormData({ ...formData, perfil_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um perfil</option>
                    {perfis.map((perfil) => (
                      <option key={perfil.id} value={perfil.id}>
                        {perfil.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, bairro, cidade - UF"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {isPerfilClinico() && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Registro Profissional * (CRM, CRO, CRN, etc)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.registro_profissional}
                        onChange={(e) => setFormData({ ...formData, registro_profissional: e.target.value })}
                        placeholder="Ex: CRM 12345/SP"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        ℹ️ Obrigatório para perfis clínicos
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Especialidade *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.especialidade}
                        onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                        placeholder="Ex: Cardiologia, Ortodontia, Nutrição Clínica"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        ℹ️ Obrigatório para perfis clínicos
                      </p>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ativo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Usuário Ativo
                  </label>
                </div>

                {editingId && (
                  <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ℹ️ Para redefinir a senha deste usuário, use o botão "Redefinir Senha" no card do usuário abaixo.
                    </p>
                  </div>
                )}

                {!editingId && (
                  <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ℹ️ Uma senha temporária será gerada automaticamente. Anote a senha exibida após o cadastro para fornecer ao usuário.
                    </p>
                  </div>
                )}

                <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingId ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setError(null);
                    }}
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
                  placeholder="Buscar usuário por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando usuários...</p>
                </div>
              ) : filteredUsuarios.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Nenhum usuário encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsuarios.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {usuario.nome}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Shield className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{usuario.perfis?.nome || 'Sem perfil'}</span>
                        </div>
                        
                        {usuario.perfil_categoria && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              {usuario.perfil_categoria}
                            </span>
                          </div>
                        )}

                        {usuario.especialidade && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span className="text-xs truncate">{usuario.especialidade}</span>
                          </div>
                        )}

                        {usuario.telefone && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="text-xs truncate">{usuario.telefone}</span>
                          </div>
                        )}

                        {usuario.endereco && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="text-xs truncate">{usuario.endereco}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            usuario.ativo 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(usuario.id, usuario.nome, usuario.email)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>
                        <button
                          onClick={() => handleResetPassword(usuario.email, usuario.nome)}
                          className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <Mail className="h-4 w-4" />
                          Redefinir Senha
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
