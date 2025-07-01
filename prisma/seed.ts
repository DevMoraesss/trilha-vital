// Arquivo: prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// Inicializamos o Prisma Client
const prisma = new PrismaClient();

// Nossa lista de exercícios iniciais
const exercises = [
  // Peito
  { name: 'Supino Reto com Barra', muscleGroup: 'Peito', description: 'Deite-se em um banco reto, segure a barra com as mãos um pouco mais afastadas que a largura dos ombros e abaixe-a até o peito. Empurre a barra para cima até a posição inicial.' },
  { name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', description: 'Deite-se em um banco inclinado (30-45 graus), segure um halter em cada mão na altura do peito e empurre-os para cima.' },
  { name: 'Crucifixo na Máquina (Voador)', muscleGroup: 'Peito', description: 'Sente-se na máquina de voador, ajuste o assento e os braços da máquina. Junte os braços da máquina na frente do peito.' },

  // Costas
  { name: 'Puxada Frontal (Pulley)', muscleGroup: 'Costas', description: 'Sente-se na máquina de puxada, segure a barra com uma pegada larga e puxe-a para baixo até a parte superior do peito.' },
  { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', description: 'Incline o tronco para a frente com as costas retas, segure a barra com as mãos na largura dos ombros e puxe-a em direção ao abdômen.' },
  { name: 'Remada Cavalinho', muscleGroup: 'Costas', description: 'Use a máquina de remada cavalinho, posicionando o peito no apoio e puxando as alças em direção ao corpo.' },
  
  // Pernas
  { name: 'Agachamento Livre com Barra', muscleGroup: 'Pernas', description: 'Posicione a barra nas costas (trapézio), mantenha os pés na largura dos ombros e agache como se fosse sentar em uma cadeira, mantendo as costas retas.' },
  { name: 'Leg Press 45°', muscleGroup: 'Pernas', description: 'Sente-se na máquina de leg press, coloque os pés na plataforma e empurre, estendendo as pernas.' },
  { name: 'Cadeira Extensora', muscleGroup: 'Pernas', description: 'Sente-se na cadeira extensora, posicione as pernas sob o apoio e estenda os joelhos para levantar o peso.' },

  // Ombros
  { name: 'Desenvolvimento Militar com Barra', muscleGroup: 'Ombros', description: 'Em pé ou sentado, segure a barra na altura dos ombros e empurre-a para cima da cabeça até os braços estarem totalmente estendidos.' },
  { name: 'Elevação Lateral com Halteres', muscleGroup: 'Ombros', description: 'Em pé, segure um halter em cada mão ao lado do corpo e eleve os braços para os lados até a altura dos ombros.' },

  // Bíceps
  { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', description: 'Em pé, segure uma barra com as palmas das mãos para cima e flexione os cotovelos, trazendo a barra em direção aos ombros.' },

  // Tríceps
  { name: 'Tríceps na Polia (Pulley)', muscleGroup: 'Tríceps', description: 'Fique de frente para a máquina de polia alta, segure a barra ou corda e empurre para baixo até os braços estarem totalmente estendidos.' },
];

async function main() {
  console.log('Iniciando o processo de seeding...');

  // Iteramos sobre a lista de exercícios
  for (const exercise of exercises) {
    // Usamos 'upsert' para cada exercício.
    // 'upsert' é inteligente: se um exercício com o mesmo 'name' já existir, ele não faz nada.
    // Se não existir, ele o cria. Isso evita criar duplicatas se rodarmos o seed várias vezes.
    await prisma.exercise.upsert({
      where: { name: exercise.name }, // Critério para verificar se já existe
      update: {}, // Não queremos atualizar nada se já existir
      create: exercise, // Se não existir, cria com os dados da nossa lista
    });
  }
  
  console.log('Seeding concluído com sucesso!');
}

// Executamos a função principal e garantimos que a conexão com o banco seja fechada no final.
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });