import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configuração do runtime para Node.js (não Edge)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY não configurada. Configure nas variáveis de ambiente.' },
        { status: 500 }
      );
    }

    // Inicializar OpenAI apenas quando necessário (dentro da função)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'Nenhuma imagem fornecida' },
        { status: 400 }
      );
    }

    // Converter imagem para base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = image.type;

    // Analisar imagem com OpenAI Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analise esta imagem de alimento e forneça as seguintes informações em formato JSON:
              
              {
                "name": "nome do alimento em português",
                "calories": número de calorias estimadas (kcal),
                "protein": gramas de proteína,
                "carbs": gramas de carboidratos,
                "fats": gramas de gordura,
                "confidence": nível de confiança da análise (0-1),
                "portion_size": "tamanho estimado da porção"
              }
              
              Seja preciso e considere o tamanho da porção visível na imagem. Se não conseguir identificar com certeza, indique no campo confidence.
              Retorne APENAS o JSON, sem texto adicional.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Parse JSON da resposta
    const foodData = JSON.parse(content);

    return NextResponse.json(foodData);
  } catch (error) {
    console.error('Erro ao analisar alimento:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar a imagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
