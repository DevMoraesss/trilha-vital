// Arquivo: app/api/exercises/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// Função para lidar com requisições GET para buscar TODOS os exercícios
export async function GET() {
  try {
    // Usamos o prisma.exercise.findMany() para buscar todos os registros da tabela Exercise.
    const exercises = await prisma.exercise.findMany({
      // Ordenamos por grupo muscular e depois por nome para a lista vir organizada.
      orderBy: [
        { muscleGroup: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(exercises, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar exercícios:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}