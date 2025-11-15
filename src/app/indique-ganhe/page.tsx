'use client';

import { useState } from 'react';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';
import { Gift, Phone, Mail, User, Send, CheckCircle } from 'lucide-react';

export default function IndiqueGanhePage() {
  const [formData, setFormData] = useState({
    nomeIndicador: '',
    emailIndicador: '',
    telefoneIndicador: '',
    nomeIndicado: '',
    emailIndicado: '',
    telefoneIndicado: '',
    mensagem: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode integrar com API/Supabase para salvar a indicação
    console.log('Indicação enviada:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        nomeIndicador: '',
        emailIndicador: '',
        telefoneIndicador: '',
        nomeIndicado: '',
        emailIndicado: '',
        telefoneIndicado: '',
        mensagem: ''
      });
    }, 3000);
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Indique e Ganhe
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Indique amigos e ganhe benefícios exclusivos
                </p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-6 mb-8 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Como funciona?
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Indique amigos, familiares ou conhecidos para nossa clínica</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Quando seu indicado agendar a primeira consulta, você ganha benefícios</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Quanto mais indicar, mais vantagens você acumula</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contato para Dúvidas
            </h3>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <a href="tel:31999610997" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                (31) 99961-0997
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Formulário de Indicação
            </h3>

            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Indicação Enviada com Sucesso!
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Entraremos em contato em breve. Obrigado por indicar!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados do Indicador */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Seus Dados
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Seu Nome *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formData.nomeIndicador}
                          onChange={(e) => setFormData({ ...formData, nomeIndicador: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Digite seu nome"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Seu Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={formData.emailIndicador}
                          onChange={(e) => setFormData({ ...formData, emailIndicador: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Seu Telefone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          value={formData.telefoneIndicador}
                          onChange={(e) => setFormData({ ...formData, telefoneIndicador: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="(31) 99999-9999"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dados do Indicado */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Dados da Pessoa Indicada
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome do Indicado *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formData.nomeIndicado}
                          onChange={(e) => setFormData({ ...formData, nomeIndicado: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Nome completo"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email do Indicado *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={formData.emailIndicado}
                          onChange={(e) => setFormData({ ...formData, emailIndicado: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telefone do Indicado *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          value={formData.telefoneIndicado}
                          onChange={(e) => setFormData({ ...formData, telefoneIndicado: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="(31) 99999-9999"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensagem (Opcional)
                  </label>
                  <textarea
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Conte-nos mais sobre a indicação..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Enviar Indicação
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
