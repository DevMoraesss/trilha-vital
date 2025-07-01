// Arquivo: app/api/workouts/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { z } from 'zod'; // Importamos o Zod!

// 1. Definimos o Schema de Validação com o Zod
// Este é o "passaporte" que os dados precisam ter para entrar.
const workoutExerciseSchema = z.object({
  exerciseId: z.string().cuid({ message: "ID do exercício inválido." }),
  sets: z.number().int().min(1),
  reps: z.string().min(1),
  restSeconds: z.number().int().min(0),
});

const createWorkoutSchema = z.object({
  name: z.string().min(3, { message: "O nome do treino deve ter pelo menos 3 caracteres." }),
  // exercises deve ser um array com pelo menos um exercício, seguindo o schema acima.
  exercises: z.array(workoutExerciseSchema).min(1, { message: "O treino precisa ter pelo menos um exercício." })
});


// Função para lidar com requisições POST para CRIAR um novo treino
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 2. Validamos os dados recebidos com o schema do Zod
    const validation = createWorkoutSchema.safeParse(body);

    if (!validation.success) {
      // Se a validação falhar, retornamos um erro 400 com os detalhes.
      return NextResponse.json({ error: "Dados inválidos", details: validation.error.format() }, { status: 400 });
    }

    // A partir daqui, 'validation.data' contém os dados já validados e com os tipos corretos.
    const { name, exercises } = validation.data;

    // 3. Criamos o treino no banco de dados usando uma transação aninhada do Prisma
    // O Prisma é inteligente: ele cria o 'Workout' e todas as suas 'WorkoutExercise'
    // em uma única operação. Se algo der errado, nada é salvo.
    const newWorkout = await prisma.workout.create({
      data: {
        name: name,
        // ID do usuário fixo por enquanto. Em um sistema real, viria do login.
        userId: 'eu@trilhavital.com', // ATENÇÃO: Verifique se esse usuário existe no seu banco!

        // Aqui está a mágica da criação aninhada:
        workoutExercises: {
          create: exercises.map(ex => ({
            // Mapeamos o array de exercícios recebido para o formato que o Prisma espera
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds,
            // Conectamos com o exercício existente pelo ID
            exercise: {
              connect: { id: ex.exerciseId }
            }
          }))
        }
      },
      // Pedimos para o Prisma incluir os detalhes dos exercícios no retorno
      include: {
        workoutExercises: {
          include: {
            exercise: true
          }
        }
      }
    });

    return NextResponse.json(newWorkout, { status: 201 }); // 201 = Created

  } catch (error) {
    console.error("Erro ao criar treino:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}