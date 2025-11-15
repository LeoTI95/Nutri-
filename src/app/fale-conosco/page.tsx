'use client';

import { useState } from 'react';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';
import { MessageCircle, Phone, Mail, MapPin, Send, CheckCircle, Clock } from 'lucide-react';

export default function FaleConoscoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode integrar com API/Supabase para salvar o contato
    console.log('Mensagem enviada:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
      });
    }, 3000);
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Fale Conosco
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Estamos aqui para ajudar você
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-4">
              {/* Phone Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Telefone</h3>
                </div>
                <a 
                  href="tel:31999610997" 
                  className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium"
                >
                  (31) 99961-0997
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Atendimento via WhatsApp
                </p>
              </div>

              {/* Email Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Mail className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                </div>
                <a 
                  href="mailto:contato@clinicagenda.com" 
                  className="text-cyan-600 dark:text-cyan-400 hover:underline break-all"
                >
                  contato@clinicagenda.com
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Respondemos em até 24h
                </p>
              </div>

              {/* Hours Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Horário</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Segunda a Sexta:</strong> 8h às 18h</p>
                  <p><strong>Sábado:</strong> 8h às 12h</p>
                  <p><strong>Domingo:</strong> Fechado</p>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Endereço</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Belo Horizonte - MG<br />
                  Brasil
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Envie sua Mensagem
                </h3>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Mensagem Enviada com Sucesso!
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Entraremos em contato em breve. Obrigado!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite seu nome"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Telefone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.telefone}
                          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="(31) 99999-9999"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Assunto *
                        </label>
                        <select
                          required
                          value={formData.assunto}
                          onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione um assunto</option>
                          <option value="duvida">Dúvida</option>
                          <option value="sugestao">Sugestão</option>
                          <option value="reclamacao">Reclamação</option>
                          <option value="elogio">Elogio</option>
                          <option value="agendamento">Agendamento</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mensagem *
                      </label>
                      <textarea
                        required
                        value={formData.mensagem}
                        onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite sua mensagem..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Send className="h-5 w-5" />
                      Enviar Mensagem
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
