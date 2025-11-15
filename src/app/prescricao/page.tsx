'use client';

import { useState, useRef } from 'react';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';
import { FileText, Printer, Download, Search, User, Calendar, Pill, ClipboardList } from 'lucide-react';

type TipoDocumento = 'receita' | 'atestado';

export default function PrescricaoPage() {
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('receita');
  const [formData, setFormData] = useState({
    paciente: '',
    cpf: '',
    data: new Date().toISOString().split('T')[0],
    medicamentos: '',
    posologia: '',
    observacoes: '',
    diasAfastamento: '',
    cid: '',
    motivoAtestado: ''
  });
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handleDownload = () => {
    // Implementar download em PDF (pode usar jsPDF ou html2pdf)
    alert('Funcionalidade de download será implementada com biblioteca PDF');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode salvar no Supabase
    console.log('Documento gerado:', { tipo: tipoDocumento, ...formData });
    alert('Documento salvo com sucesso!');
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Prescrição Médica
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gere receitas e atestados médicos
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Dados do Documento
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tipo de Documento *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoDocumento('receita')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        tipoDocumento === 'receita'
                          ? 'border-green-600 bg-green-50 dark:bg-green-950/30'
                          : 'border-gray-300 dark:border-gray-700 hover:border-green-400'
                      }`}
                    >
                      <Pill className={`h-6 w-6 mx-auto mb-2 ${
                        tipoDocumento === 'receita' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        tipoDocumento === 'receita' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Receita
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoDocumento('atestado')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        tipoDocumento === 'atestado'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                      }`}
                    >
                      <ClipboardList className={`h-6 w-6 mx-auto mb-2 ${
                        tipoDocumento === 'atestado' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        tipoDocumento === 'atestado' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Atestado
                      </span>
                    </button>
                  </div>
                </div>

                {/* Dados do Paciente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paciente *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.paciente}
                      onChange={(e) => setFormData({ ...formData, paciente: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nome completo do paciente"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={formData.data}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Campos específicos para Receita */}
                {tipoDocumento === 'receita' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Medicamentos *
                      </label>
                      <textarea
                        required
                        value={formData.medicamentos}
                        onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Liste os medicamentos prescritos"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Posologia *
                      </label>
                      <textarea
                        required
                        value={formData.posologia}
                        onChange={(e) => setFormData({ ...formData, posologia: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Instruções de uso e dosagem"
                      />
                    </div>
                  </>
                )}

                {/* Campos específicos para Atestado */}
                {tipoDocumento === 'atestado' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Dias de Afastamento *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.diasAfastamento}
                          onChange={(e) => setFormData({ ...formData, diasAfastamento: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Número de dias"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CID (Opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.cid}
                          onChange={(e) => setFormData({ ...formData, cid: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: A09.9"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Motivo do Atestado *
                      </label>
                      <textarea
                        required
                        value={formData.motivoAtestado}
                        onChange={(e) => setFormData({ ...formData, motivoAtestado: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Descreva o motivo do afastamento"
                      />
                    </div>
                  </>
                )}

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Observações adicionais"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Gerar Documento
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pré-visualização
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Imprimir"
                  >
                    <Printer className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Download PDF"
                  >
                    <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Document Preview */}
              <div ref={printRef} className="bg-white p-8 rounded-lg border-2 border-gray-200 min-h-[600px]">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">ClinicAgenda</h2>
                  <p className="text-sm text-gray-600">Sistema de Gestão Médica</p>
                  <p className="text-sm text-gray-600">Belo Horizonte - MG | (31) 99961-0997</p>
                </div>

                <div className="border-t-2 border-gray-300 pt-6">
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-6">
                    {tipoDocumento === 'receita' ? 'RECEITA MÉDICA' : 'ATESTADO MÉDICO'}
                  </h3>

                  <div className="space-y-4 text-gray-800">
                    <p><strong>Paciente:</strong> {formData.paciente || '_______________'}</p>
                    <p><strong>CPF:</strong> {formData.cpf || '_______________'}</p>
                    <p><strong>Data:</strong> {formData.data ? new Date(formData.data).toLocaleDateString('pt-BR') : '_______________'}</p>

                    {tipoDocumento === 'receita' ? (
                      <>
                        <div className="mt-6">
                          <p className="font-semibold mb-2">Medicamentos:</p>
                          <p className="whitespace-pre-wrap">{formData.medicamentos || '_______________'}</p>
                        </div>
                        <div className="mt-4">
                          <p className="font-semibold mb-2">Posologia:</p>
                          <p className="whitespace-pre-wrap">{formData.posologia || '_______________'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mt-6">
                          Atesto para os devidos fins que o(a) paciente acima identificado(a) 
                          necessita de afastamento de suas atividades por <strong>{formData.diasAfastamento || '___'}</strong> dia(s).
                        </p>
                        {formData.cid && <p><strong>CID:</strong> {formData.cid}</p>}
                        {formData.motivoAtestado && (
                          <div className="mt-4">
                            <p className="font-semibold mb-2">Motivo:</p>
                            <p className="whitespace-pre-wrap">{formData.motivoAtestado}</p>
                          </div>
                        )}
                      </>
                    )}

                    {formData.observacoes && (
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Observações:</p>
                        <p className="whitespace-pre-wrap">{formData.observacoes}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-16 text-center">
                    <div className="border-t border-gray-400 w-64 mx-auto pt-2">
                      <p className="text-sm text-gray-700">Assinatura e Carimbo do Médico</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
