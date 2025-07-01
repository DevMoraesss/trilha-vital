import { NextRequest, NextResponse } from "next/server";
import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';

// Arquivo: app/api/profile/route.ts

// --- NOVA FUNÇÃO GET ---
// Esta função lida com requisições GET para buscar dados.
export async function GET() { // <-- A CORREÇÃO ESTÁ AQUI
  try {
    // Por enquanto, buscamos o primeiro usuário que foi criado,
    // já que só temos um. No futuro, isso usaria o ID do usuário logado.
    const user = await prisma.user.findUnique({
      where: { email: 'eu@trilhavital.com' },
      include: {
        profile: true,
      },
    });

    // Se nenhum usuário for encontrado com aquele email, retornamos "não encontrado".
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Se encontramos, retornamos o usuário com seus dados de perfil.
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Os dados chegam do frontend como strings
    const { name, age, weight, height } = body;

    if (!name || !age || !weight || !height) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    // --- MUDANÇA IMPORTANTE AQUI ---
    // Convertemos os valores de string para número ANTES de usá-los.
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum) || heightNum <= 0) {
        return NextResponse.json({ error: 'Valores numéricos inválidos.' }, { status: 400 });
    }

    const imc = parseFloat((weightNum / (heightNum * heightNum)).toFixed(2));

    const updatedUser = await prisma.user.upsert({
      // Usamos um email fixo por enquanto. Em um sistema real, viria do login.
      where: { email: 'eu@trilhavital.com' },
      update: {
        name,
        profile: {
          update: {
            // Agora passamos os números convertidos para o Prisma
            age: ageNum,
            weight: weightNum,
            height: heightNum,
            imc,
          },
        },
      },
      create: {
        email: 'eu@trilhavital.com',
        name,
        profile: {
          create: {
            // E aqui também!
            age: ageNum,
            weight: weightNum,
            height: heightNum,
            imc,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    // Tratamento de erro genérico
    console.error("Erro ao salvar perfil:", error);
    if (error instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json({ error: 'Erro de validação nos dados enviados.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

/**

O que é um NextResponse? É a forma do Next.js de enviar respostas 
do servidor para o cliente. Com NextResponse.json() podemos
enviar dados em formato JSON com um código de status (200 
para sucesso, 400 para erro do cliente, 500 para erro do 
servidor).

O que é async/await? Interagir com um banco de dados ou 
ler uma requisição leva tempo. async e await são palavras-chave 
do JavaScript que nos permitem lidar com essas operações 
assíncronas de forma limpa, sem "travar" a aplicação.
 */