// Arquivo: app/workouts/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Definindo Tipos para Nossos Dados ---
// Ajuda o TypeScript a entender a estrutura dos nossos objetos
interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface SelectedExercise {
  exerciseId: string;
  name: string; // Guardamos o nome para exibir na UI
  sets: number;
  reps: string;
  restSeconds: number;
}

export default function WorkoutsPage() {
  // --- Estados de Controle da UI ---
  const [isCreating, setIsCreating] = useState(false); // Controla a exibição do formulário de criação
  const [isLoading, setIsLoading] = useState(false);

  // --- Estados de Dados ---
  const [allExercises, setAllExercises] = useState<Exercise[]>([]); // Armazena a lista de todos os exercícios do banco
  const [workoutName, setWorkoutName] = useState(''); // Armazena o nome do novo treino
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]); // A lista de exercícios escolhidos para o novo treino

  // --- Efeito para Buscar os Exercícios da API ---
  // Roda uma vez quando o componente carrega
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (response.ok) {
          const data = await response.json();
          setAllExercises(data);
        }
      } catch (error) {
        console.error("Falha ao buscar exercícios:", error);
      }
    };
    fetchExercises();
  }, []);

  // --- Funções de Manipulação de Eventos ---

  const handleAddExercise = (exerciseId: string) => {
    if (!exerciseId || selectedExercises.find(ex => ex.exerciseId === exerciseId)) {
      return; // Não faz nada se a opção padrão for selecionada ou se o exercício já foi adicionado
    }
    const exerciseToAdd = allExercises.find(ex => ex.id === exerciseId);
    if (exerciseToAdd) {
      setSelectedExercises([
        ...selectedExercises,
        { exerciseId: exerciseToAdd.id, name: exerciseToAdd.name, sets: 4, reps: '8-12', restSeconds: 60 }
      ]);
    }
  };
  
  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.exerciseId !== exerciseId));
  };

  const handleExerciseDetailChange = (exerciseId: string, field: keyof SelectedExercise, value: string | number) => {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const handleSaveWorkout = async () => {
    if (!workoutName || selectedExercises.length === 0) {
      alert("Por favor, dê um nome ao treino e adicione pelo menos um exercício.");
      return;
    }
    setIsLoading(true);
    try {
      const body = {
        name: workoutName,
        exercises: selectedExercises.map(({ exerciseId, sets, reps, restSeconds }) => ({
          exerciseId,
          sets: Number(sets),
          reps,
          restSeconds: Number(restSeconds)
        }))
      };

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert('Treino salvo com sucesso!');
        // Resetamos o formulário e voltamos para a tela de lista
        setIsCreating(false);
        setWorkoutName('');
        setSelectedExercises([]);
        // Futuramente, aqui vamos recarregar a lista de treinos
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar treino: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Falha ao salvar treino:", error);
      alert("Ocorreu um erro de rede ao salvar o treino.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderização do Componente ---

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">
            {isCreating ? 'Criar Nova Ficha de Treino' : 'Minhas Fichas de Treino'}
          </h1>
          <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Voltar ao Perfil
          </Link>
        </div>

        {/* --- Renderização Condicional: ou mostra a lista, ou o formulário de criação --- */}
        {isCreating ? (
          // --- Formulário de Criação ---
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
            <input
              type="text"
              placeholder="Nome do Treino (ex: Treino A - Peito e Tríceps)"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            />
            
            {/* Lista de exercícios já adicionados */}
            <div className="space-y-4">
              {selectedExercises.map((ex, index) => (
                <div key={ex.exerciseId} className="bg-gray-700 p-4 rounded-lg flex flex-wrap items-center gap-4">
                  <span className="font-bold flex-shrink-0 w-full sm:w-auto">{index + 1}. {ex.name}</span>
                  <div className="flex-grow grid grid-cols-2 sm:flex sm:flex-grow gap-4">
                    <input type="number" title="Séries" value={ex.sets} onChange={e => handleExerciseDetailChange(ex.exerciseId, 'sets', e.target.value)} className="p-2 bg-gray-600 rounded-md w-full" placeholder="Séries" />
                    <input type="text" title="Repetições" value={ex.reps} onChange={e => handleExerciseDetailChange(ex.exerciseId, 'reps', e.target.value)} className="p-2 bg-gray-600 rounded-md w-full" placeholder="Reps" />
                    <input type="number" title="Descanso (s)" value={ex.restSeconds} onChange={e => handleExerciseDetailChange(ex.exerciseId, 'restSeconds', e.target.value)} className="p-2 bg-gray-600 rounded-md w-full" placeholder="Descanso (s)" />
                  </div>
                  <button onClick={() => handleRemoveExercise(ex.exerciseId)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded-md transition duration-300">X</button>
                </div>
              ))}
            </div>

            {/* Seletor para adicionar novos exercícios */}
            <select
              onChange={(e) => handleAddExercise(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              value=""
            >
              <option value="">-- Adicionar um exercício --</option>
              {allExercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscleGroup})</option>
              ))}
            </select>

            {/* Botões de Ação */}
            <div className="flex gap-4 mt-6">
              <button onClick={handleSaveWorkout} disabled={isLoading} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-500">
                {isLoading ? 'Salvando...' : 'Salvar Treino'}
              </button>
              <button onClick={() => setIsCreating(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition duration-300">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          // --- Lista de Treinos (atualmente um placeholder) ---
          <div className="bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
            <p className="text-gray-400">Nenhuma ficha de treino encontrada.</p>
            <button onClick={() => setIsCreating(true)} className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300">
              Criar Novo Treino
            </button>
          </div>
        )}
      </div>
    </main>
  );
}