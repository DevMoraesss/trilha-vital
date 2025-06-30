// Arquivo: app/page.tsx

"use client";

import { useState, useEffect, FormEvent } from 'react';

// --- DEFININDO TIPOS PARA MELHORAR NOSSO CÓDIGO ---
// É uma boa prática definir como são nossos objetos.
// Isso ajuda o TypeScript a nos dar um autocompletar melhor e a pegar erros.
interface ProfileData {
  age: number;
  weight: number;
  height: number;
  imc: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile: ProfileData | null;
}

export default function HomePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  
 // Estados de controle da UI
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // Novo estado para o carregamento inicial

   // Este hook roda UMA VEZ quando o componente é montado na tela.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data: UserProfile = await response.json();
          // Preenchemos todos os estados com os dados do banco!
          setUserProfile(data);
          setName(data.name || '');
          setEmail(data.email || ''); // setEmail em uso!
          if (data.profile) {
            setAge(data.profile.age?.toString() || '');
            setWeight(data.profile.weight?.toString() || '');
            setHeight(data.profile.height?.toString() || '');
          }
        }
      } catch (error) {
        console.error("Não foi possível carregar dados iniciais:", error);
      } finally {
        setIsFetching(false); // Termina o carregamento inicial
      }
    };

    fetchInitialData();
  }, []); // O array vazio [] no final garante que ele rode só uma vez.

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, age, weight, height }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Algo deu errado');
      }
      setUserProfile(result);
      alert('Perfil salvo com sucesso!');
    } catch (error) { // --- CORREÇÃO 3: REMOVENDO O 'any' ---
      console.error("Falha ao enviar dados:", error);
      // Verificamos se o erro é uma instância de Error para acessar .message com segurança
      if (error instanceof Error) {
        alert(`Erro: ${error.message}`);
      } else {
        alert('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- NOVA FUNÇÃO: O INTERPRETADOR DE IMC ---
  const getImcStrategy = (imc: number | undefined) => {
    if (!imc) return { classification: "Aguardando dados...", strategy: "Preencha seus dados para calcular o IMC.", color: "text-gray-500" };
    if (imc < 18.5) return { classification: "Abaixo do peso", strategy: "Foco em ganho de massa e dieta hipercalórica nutritiva. Priorize treinos de força.", color: "text-blue-500" };
    if (imc < 24.9) return { classification: "Peso ideal", strategy: "Manutenção! Foco em tonificar e saúde cardiovascular.", color: "text-green-500" };
    if (imc < 29.9) return { classification: "Sobrepeso", strategy: "Emagrecimento. Foco em déficit calórico, combine força e cardio.", color: "text-yellow-500" };
    if (imc < 34.9) return { classification: "Obesidade Grau I", strategy: "Perda de peso supervisionada. Priorize exercícios de baixo impacto.", color: "text-orange-500" };
    return { classification: "Obesidade Grau II ou III", strategy: "Acompanhamento médico é essencial. Exercícios adaptados e de baixo impacto.", color: "text-red-500" };
  };

  // Chamamos nossa função com o IMC do perfil do usuário.
  // O '?' é "optional chaining": ele evita um erro se userProfile ou profile forem nulos.
  const imcData = getImcStrategy(userProfile?.profile?.imc);

  // O JSX (a parte visual) continua praticamente o mesmo,
  // apenas adicionando uma verificação para o 'isFetching' inicial.
  if (isFetching) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Carregando Trilha Vital...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Coluna do Formulário (sem alterações) */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4">Meu Perfil de Saúde</h1>
          <p className="text-gray-400 mb-6">Insira seus dados para que possamos te conhecer melhor.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos do formulário */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nome</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
              <input type="email" id="email" value={email} readOnly placeholder="eu@trilhavital.com (fixo por enquanto)" className="mt-1 w-full p-2 bg-gray-600 border border-gray-500 rounded-md" />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-300">Idade</label>
              <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-300">Peso (kg)</label>
              <input type="number" step="0.1" id="weight" value={weight} onChange={e => setWeight(e.target.value)} placeholder="ex: 75.5" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-300">Altura (m)</label>
              <input type="number" step="0.01" id="height" value={height} onChange={e => setHeight(e.target.value)} placeholder="ex: 1.75" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-500">
              {isLoading ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </form>
        </div>

        {/* --- COLUNA DO DIAGNÓSTICO (TOTALMENTE DINÂMICA) --- */}
        <div className="flex flex-col bg-gray-900 rounded-lg p-6 justify-center">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Seu Diagnóstico Atual</h2>

          {isLoading ? (
            <div className="text-center">
              <p className="text-lg text-cyan-300 animate-pulse">Calculando...</p>
            </div>
          ) : userProfile?.profile ? (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-lg text-gray-400">Seu IMC é</p>
                {/* Usamos a cor dinâmica que vem da nossa função! */}
                <p className={`text-6xl font-bold ${imcData.color}`}>{userProfile.profile.imc}</p>
              </div>
              
              <div className="p-4 bg-gray-800 rounded-md">
                <p className="font-bold text-lg">Classificação:</p>
                {/* Usamos a classificação e cor dinâmicas */}
                <p className={`font-semibold ${imcData.color}`}>{imcData.classification}</p>
              </div>

              <div className="p-4 bg-gray-800 rounded-md">
                <p className="font-bold text-lg">Estratégia Sugerida:</p>
                {/* Usamos a estratégia dinâmica */}
                <p className="text-gray-300">{imcData.strategy}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
                <div className="text-center">
                  <p className="text-lg text-gray-400">Seu IMC é</p>
                  <p className="text-6xl font-bold text-gray-500">?</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-md">
                  <p className="font-bold text-lg">Classificação:</p>
                  <p className="font-semibold text-gray-500">Aguardando dados...</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-md">
                  <p className="font-bold text-lg">Estratégia Sugerida:</p>
                  <p className="text-gray-300">Preencha e salve seu perfil para começar.</p>
                </div>
              </div>
          )}
        </div>

      </div>
    </main>
  );
}