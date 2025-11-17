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
      content: 'Olá! Sou seu assistente virtual de nutrição e saúde. Estou aqui para ajudar com dúvidas sobre alimentação saudável, nutrição, dietas, suplementação e orientações gerais de saúde. Como posso ajudar você hoje?',
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
    
    // PERGUNTAS NUTRICIONAIS
    if (lowerQuestion.includes('proteína') || lowerQuestion.includes('proteina')) {
      return '🥩 **Sobre Proteínas:**\n\nAs proteínas são essenciais para:\n• Construção e reparação muscular\n• Fortalecimento do sistema imunológico\n• Produção de enzimas e hormônios\n\n**Fontes de proteína:**\n✅ Animais: Carnes magras, peixes, ovos, laticínios\n✅ Vegetais: Feijão, lentilha, grão-de-bico, tofu, quinoa\n\n**Recomendação:** 0,8-1,2g por kg de peso corporal/dia para adultos.\n\nPrecisa de orientação personalizada? Consulte um nutricionista!';
    }

    if (lowerQuestion.includes('carboidrato') || lowerQuestion.includes('carboidratos')) {
      return '🍞 **Sobre Carboidratos:**\n\nOs carboidratos são a principal fonte de energia do corpo!\n\n**Carboidratos Complexos (preferir):**\n✅ Arroz integral, aveia, batata-doce\n✅ Pães integrais, quinoa, massas integrais\n✅ Frutas, legumes, verduras\n\n**Carboidratos Simples (moderar):**\n⚠️ Açúcar refinado, doces, refrigerantes\n⚠️ Pães brancos, massas refinadas\n\n**Dica:** Priorize carboidratos integrais e combine com proteínas para melhor saciedade!';
    }

    if (lowerQuestion.includes('gordura') || lowerQuestion.includes('lipídio') || lowerQuestion.includes('lipidio')) {
      return '🥑 **Sobre Gorduras:**\n\nNem toda gordura é vilã! Existem gorduras saudáveis essenciais.\n\n**Gorduras Boas (consumir):**\n✅ Abacate, azeite de oliva, castanhas\n✅ Peixes (salmão, sardinha) - ômega 3\n✅ Sementes (chia, linhaça)\n\n**Gorduras Ruins (evitar):**\n❌ Gordura trans (alimentos industrializados)\n❌ Excesso de gordura saturada\n❌ Frituras em óleo reutilizado\n\n**Benefícios:** Saúde cardiovascular, absorção de vitaminas, saciedade!';
    }

    if (lowerQuestion.includes('vitamina') || lowerQuestion.includes('mineral')) {
      return '💊 **Sobre Vitaminas e Minerais:**\n\nMicronutrientes essenciais para o funcionamento do corpo!\n\n**Principais vitaminas:**\n• Vitamina A: Cenoura, abóbora (visão)\n• Vitamina C: Laranja, limão (imunidade)\n• Vitamina D: Sol, peixes (ossos)\n• Vitamina E: Castanhas (antioxidante)\n• Vitaminas do complexo B: Grãos integrais (energia)\n\n**Principais minerais:**\n• Ferro: Carnes, feijão (sangue)\n• Cálcio: Laticínios, vegetais verdes (ossos)\n• Zinco: Carnes, sementes (imunidade)\n• Magnésio: Banana, aveia (músculos)\n\n**Dica:** Alimentação variada = nutrientes completos!';
    }

    if (lowerQuestion.includes('emagrecer') || lowerQuestion.includes('perder peso') || lowerQuestion.includes('dieta')) {
      return '⚖️ **Sobre Emagrecimento Saudável:**\n\n**Princípios fundamentais:**\n1. Déficit calórico moderado (não radical!)\n2. Alimentação balanceada e variada\n3. Exercícios físicos regulares\n4. Hidratação adequada (2-3L água/dia)\n5. Sono de qualidade (7-9h/noite)\n\n**Evite:**\n❌ Dietas restritivas extremas\n❌ Pular refeições\n❌ Produtos "milagrosos"\n\n**Recomendação:** Perda saudável = 0,5-1kg por semana.\n\n⚠️ **IMPORTANTE:** Consulte um nutricionista para plano personalizado!';
    }

    if (lowerQuestion.includes('ganhar peso') || lowerQuestion.includes('massa muscular') || lowerQuestion.includes('hipertrofia')) {
      return '💪 **Sobre Ganho de Massa Muscular:**\n\n**Estratégias nutricionais:**\n1. Superávit calórico moderado (+300-500 kcal/dia)\n2. Proteína adequada (1,6-2,2g/kg peso)\n3. Carboidratos suficientes (energia treino)\n4. Refeições frequentes (5-6x/dia)\n5. Hidratação constante\n\n**Alimentos estratégicos:**\n✅ Frango, peixe, carne vermelha magra\n✅ Ovos, laticínios\n✅ Arroz, batata-doce, aveia\n✅ Oleaginosas, abacate\n\n**Essencial:** Treino de força + nutrição + descanso!\n\nConsulte nutricionista esportivo para plano personalizado!';
    }

    if (lowerQuestion.includes('água') || lowerQuestion.includes('hidratação') || lowerQuestion.includes('hidratar')) {
      return '💧 **Sobre Hidratação:**\n\nA água é essencial para TODAS as funções do corpo!\n\n**Benefícios da hidratação:**\n✅ Regula temperatura corporal\n✅ Transporta nutrientes\n✅ Elimina toxinas\n✅ Melhora digestão\n✅ Mantém pele saudável\n✅ Aumenta energia e concentração\n\n**Quanto beber?**\n• Mínimo: 2 litros/dia\n• Ideal: 30-35ml por kg de peso\n• Mais em dias quentes ou treinos\n\n**Sinais de desidratação:**\n⚠️ Urina escura, sede intensa, fadiga, dor de cabeça\n\n**Dica:** Beba água ao longo do dia, não espere ter sede!';
    }

    if (lowerQuestion.includes('suplemento') || lowerQuestion.includes('suplementação') || lowerQuestion.includes('whey')) {
      return '💊 **Sobre Suplementação:**\n\n**Quando considerar suplementos:**\n• Deficiências nutricionais comprovadas\n• Dificuldade em atingir necessidades pela dieta\n• Objetivos esportivos específicos\n• Orientação de nutricionista/médico\n\n**Suplementos comuns:**\n• Whey Protein: Complemento proteico\n• Creatina: Performance e força\n• Ômega 3: Saúde cardiovascular\n• Vitamina D: Imunidade e ossos\n• Multivitamínico: Prevenção de carências\n\n⚠️ **IMPORTANTE:**\n❌ Suplementos NÃO substituem alimentação\n❌ Sempre consulte profissional antes\n❌ Cuidado com produtos sem registro\n\n**Prioridade:** Alimentação real e balanceada!';
    }

    if (lowerQuestion.includes('diabetes') || lowerQuestion.includes('diabético') || lowerQuestion.includes('diabetico') || lowerQuestion.includes('açúcar') || lowerQuestion.includes('acucar')) {
      return '🩺 **Sobre Diabetes e Controle Glicêmico:**\n\n**Alimentação para diabéticos:**\n✅ Carboidratos complexos e integrais\n✅ Fibras (legumes, verduras, frutas)\n✅ Proteínas magras\n✅ Gorduras boas\n✅ Refeições regulares (evitar jejum prolongado)\n\n**Evitar/Moderar:**\n❌ Açúcar refinado e doces\n❌ Carboidratos simples (pão branco, massas)\n❌ Bebidas açucaradas\n❌ Alimentos ultraprocessados\n\n**Dicas importantes:**\n• Monitore glicemia regularmente\n• Pratique exercícios físicos\n• Mantenha peso saudável\n• Hidrate-se bem\n\n⚠️ **ESSENCIAL:** Acompanhamento com endocrinologista e nutricionista!';
    }

    if (lowerQuestion.includes('vegetariano') || lowerQuestion.includes('vegano') || lowerQuestion.includes('vegetariana')) {
      return '🌱 **Sobre Dieta Vegetariana/Vegana:**\n\n**Nutrientes que requerem atenção:**\n• Proteína: Leguminosas, tofu, tempeh, quinoa\n• Ferro: Feijão, lentilha, espinafre + vitamina C\n• B12: Suplementação obrigatória!\n• Cálcio: Vegetais verdes, tofu, leites vegetais fortificados\n• Ômega 3: Chia, linhaça, nozes\n• Zinco: Sementes, grãos integrais\n\n**Combinações inteligentes:**\n✅ Arroz + feijão (proteína completa)\n✅ Ferro vegetal + vitamina C (melhor absorção)\n✅ Variedade de cores no prato\n\n**Importante:** Consulte nutricionista para plano adequado e suplementação correta!';
    }

    if (lowerQuestion.includes('colesterol') || lowerQuestion.includes('triglicérides') || lowerQuestion.includes('triglicerides')) {
      return '❤️ **Sobre Colesterol e Triglicérides:**\n\n**Para reduzir colesterol ruim (LDL):**\n✅ Fibras: Aveia, frutas, legumes\n✅ Gorduras boas: Azeite, abacate, peixes\n✅ Oleaginosas: Castanhas, nozes, amêndoas\n✅ Alho, cebola, gengibre\n\n**Para reduzir triglicérides:**\n✅ Reduzir açúcar e carboidratos simples\n✅ Aumentar ômega 3 (peixes)\n✅ Evitar álcool\n✅ Controlar peso\n\n**Evitar:**\n❌ Gordura trans e saturada em excesso\n❌ Frituras\n❌ Alimentos ultraprocessados\n❌ Excesso de açúcar\n\n**Essencial:** Exercícios + alimentação + acompanhamento médico!';
    }

    if (lowerQuestion.includes('intestino') || lowerQuestion.includes('prisão de ventre') || lowerQuestion.includes('constipação') || lowerQuestion.includes('digestão')) {
      return '🌾 **Sobre Saúde Intestinal:**\n\n**Para melhorar o intestino:**\n✅ Fibras: Frutas, verduras, legumes, grãos integrais\n✅ Probióticos: Iogurte natural, kefir, kombucha\n✅ Prebióticos: Banana, alho, cebola, aveia\n✅ Água: 2-3 litros/dia\n✅ Exercícios físicos regulares\n\n**Alimentos ricos em fibras:**\n• Mamão, ameixa, laranja com bagaço\n• Aveia, linhaça, chia\n• Feijão, lentilha, grão-de-bico\n• Brócolis, couve, espinafre\n\n**Evitar:**\n❌ Alimentos muito processados\n❌ Excesso de carne vermelha\n❌ Baixa ingestão de água\n\n**Dica:** Mastigue bem e coma devagar!';
    }

    if (lowerQuestion.includes('café da manhã') || lowerQuestion.includes('desjejum')) {
      return '🌅 **Sobre Café da Manhã Saudável:**\n\nO café da manhã é importante para iniciar o metabolismo!\n\n**Opções saudáveis:**\n\n**Opção 1 (Clássica):**\n• Pão integral + ovo mexido + abacate\n• Fruta + iogurte natural\n• Café ou chá sem açúcar\n\n**Opção 2 (Energética):**\n• Aveia + banana + pasta de amendoim\n• Leite ou bebida vegetal\n• Castanhas\n\n**Opção 3 (Rápida):**\n• Tapioca + queijo + tomate\n• Suco natural\n• Frutas\n\n**Componentes ideais:**\n✅ Carboidrato integral\n✅ Proteína\n✅ Gordura boa\n✅ Frutas/vegetais\n\n**Evite:** Pular o café da manhã ou comer apenas carboidratos simples!';
    }

    // PERGUNTAS DO SISTEMA
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
      return 'Posso ajudar com:\n\n**Nutrição:**\n🥗 Alimentação saudável e balanceada\n💪 Ganho de massa muscular\n⚖️ Emagrecimento saudável\n🩺 Dietas especiais (diabetes, vegetariana, etc.)\n💊 Suplementação\n💧 Hidratação\n\n**Sistema:**\n✅ Agendamento de consultas\n✅ Cadastro de pacientes\n✅ Prescrição de receitas e atestados\n✅ Navegação no sistema\n\nSobre qual desses tópicos você gostaria de saber mais?';
    }

    if (lowerQuestion.includes('acompanhamento') || lowerQuestion.includes('follow-up')) {
      return 'Dicas para acompanhamento eficaz:\n\n1. **Registre tudo**: Mantenha histórico atualizado de cada consulta\n2. **Defina lembretes**: Use o calendário para follow-ups\n3. **Comunicação**: Mantenha contato regular com pacientes\n4. **Documentação**: Prescreva e documente adequadamente\n5. **Análise**: Revise o histórico antes de cada consulta\n\nQuer saber mais sobre algum desses pontos?';
    }
    
    return 'Entendo sua pergunta. Posso ajudar com:\n\n**Temas de Nutrição:**\n🥗 Alimentação saudável\n💪 Ganho de massa muscular\n⚖️ Emagrecimento\n🩺 Dietas especiais\n💊 Suplementação\n💧 Hidratação\n\n**Sistema:**\n• Agendamento de consultas\n• Cadastro e gestão de pacientes\n• Prescrição de receitas e atestados\n• Navegação no sistema\n\nPoderia reformular sua pergunta ou escolher um dos tópicos acima?';
  };

  const suggestedQuestions = [
    'Como ter uma alimentação saudável?',
    'Qual a importância das proteínas?',
    'Como ganhar massa muscular?',
    'Dicas para emagrecer de forma saudável',
    'Quanto de água devo beber por dia?',
    'Quais são as melhores fontes de vitaminas?'
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
                  Chat com IA - Nutrição
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Assistente virtual para dúvidas nutricionais e orientações de saúde
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
                  Perguntas sugeridas sobre nutrição:
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
                  placeholder="Digite sua pergunta sobre nutrição..."
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
                Este assistente fornece orientações gerais. Para orientação personalizada, consulte um nutricionista.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
