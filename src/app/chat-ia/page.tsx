'use client';

import { useState, useRef, useEffect } from 'react';
import { AuthenticatedLayout } from '@/components/custom/authenticated-layout';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente virtual de saúde. Estou aqui para ajudar com dúvidas sobre atendimento, acompanhamento de pacientes e orientações gerais. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simular resposta da IA (aqui você integraria com OpenAI API)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getSimulatedResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('agendar') || lowerQuestion.includes('consulta')) {
      return 'Para agendar uma consulta, você pode:\n\n1. Acessar a página de Agendamento no menu lateral\n2. Selecionar o paciente e o profissional desejado\n3. Escolher data e horário disponível\n4. Confirmar o agendamento\n\nSe precisar de ajuda específica, posso orientá-lo passo a passo!';
    }
    
    if (lowerQuestion.includes('receita') || lowerQuestion.includes('prescrição')) {
      return 'Para prescrever receitas ou atestados:\n\n1. Acesse a página "Prescrição Médica" no menu\n2. Escolha entre Receita ou Atestado\n3. Preencha os dados do paciente\n4. Adicione medicamentos/motivo\n5. Gere e imprima o documento\n\nLembre-se de sempre verificar as informações antes de gerar!';
    }
    
    if (lowerQuestion.includes('paciente') || lowerQuestion.includes('cadastro')) {
      return 'Para gerenciar pacientes:\n\n1. Acesse "Pacientes" no menu lateral\n2. Clique em "+ Novo Paciente" para cadastrar\n3. Preencha todos os dados obrigatórios\n4. Salve o cadastro\n\nVocê também pode editar, visualizar histórico e excluir pacientes pela mesma página.';
    }
    
    if (lowerQuestion.includes('ajuda') || lowerQuestion.includes('dúvida')) {
      return 'Posso ajudar com:\n\n✅ Agendamento de consultas\n✅ Cadastro de pacientes\n✅ Prescrição de receitas e atestados\n✅ Navegação no sistema\n✅ Dicas de acompanhamento\n✅ Configurações do sistema\n\nSobre qual desses tópicos você gostaria de saber mais?';
    }

    if (lowerQuestion.includes('acompanhamento') || lowerQuestion.includes('follow-up')) {
      return 'Dicas para acompanhamento eficaz:\n\n1. **Registre tudo**: Mantenha histórico atualizado de cada consulta\n2. **Defina lembretes**: Use o calendário para follow-ups\n3. **Comunicação**: Mantenha contato regular com pacientes\n4. **Documentação**: Prescreva e documente adequadamente\n5. **Análise**: Revise o histórico antes de cada consulta\n\nQuer saber mais sobre algum desses pontos?';
    }
    
    return 'Entendo sua pergunta. Posso ajudar com:\n\n• Agendamento de consultas\n• Cadastro e gestão de pacientes\n• Prescrição de receitas e atestados\n• Navegação no sistema\n• Dicas de acompanhamento\n\nPoderia reformular sua pergunta ou escolher um dos tópicos acima?';
  };

  const suggestedQuestions = [
    'Como agendar uma consulta?',
    'Como prescrever uma receita?',
    'Como cadastrar um novo paciente?',
    'Dicas de acompanhamento de pacientes'
  ];

  return (
    <AuthenticatedLayout>
      <div className="h-[calc(100vh-2rem)] p-6 lg:p-8">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Chat com IA
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Assistente virtual para dúvidas e orientações
                </p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-600'
                      : 'bg-gradient-to-br from-purple-600 to-indigo-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-gray-600 dark:text-gray-400">Digitando...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Perguntas sugeridas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="px-3 py-2 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-sm rounded-lg transition-colors border border-purple-200 dark:border-purple-800"
                    >
                      <Sparkles className="h-3 w-3 inline mr-1" />
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </form>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Este é um assistente virtual. Para emergências, entre em contato com um profissional de saúde.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
