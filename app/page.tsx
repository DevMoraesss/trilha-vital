// Arquivo: app/page.tsx

"use client";

// Agora, todas as nossas importações serão usadas!
import { useState, FormEvent } from 'react';

export default function HomePage() {
  // --- NOVAS PARTES AQUI ---
  // Criamos um "estado" (uma caixinha de memória) para cada campo do formulário.
  // A sintaxe é: const [variavel, setVariavel] = useState('valorInicial');
  // 'variavel' guarda o valor atual.
  // 'setVariavel' é a função que usamos para atualizar esse valor.
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [userProfile, setUserProfile] = useState<{ profile: { imc: number } } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Esta é a função que será chamada quando o formulário for enviado.
  // E aqui está o nosso FormEvent em ação!
  // Dizemos ao TypeScript que o parâmetro 'event' é do tipo 'FormEvent'.
  const handleSubmit = async (event: FormEvent) => {
    // event.preventDefault() é MUITO IMPORTANTE.
    // Ele previne o comportamento padrão do navegador, que é recarregar a página
    // ao enviar um formulário. Nós não queremos isso em uma aplicação React.
    event.preventDefault();
    setIsLoading(true); // Inicia o carregamento
    // Por enquanto, vamos apenas mostrar os dados capturados no console do navegador.
    // É uma ótima forma de verificar se estamos capturando os dados corretamente.

    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, age, weight, height }),
    });
    const result = await response.json();

    if (response.ok){
      setUserProfile(result);
      alert('Sucesso')
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };
  // --- FIM DAS NOVAS PARTES ---


  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4">Meu Perfil de Saúde</h1>
          <p className="text-gray-400 mb-6">Insira seus dados para que possamos te conhecer melhor.</p>
          
          {/* --- MUDANÇAS AQUI --- */}
          {/* 1. Ligamos nossa função 'handleSubmit' ao evento 'onSubmit' do formulário. */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nome</label>
              {/* 2. Ligamos os inputs aos seus respectivos estados. */}
              {/* 'value={name}' faz o campo exibir o que está na nossa "caixinha" 'name'. */}
              {/* 'onChange={e => setName(e.target.value)}' atualiza a caixinha a cada letra digitada. */}
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>

            {/* Repetimos o processo para os outros campos */}
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
            
             <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300">
              Salvar Perfil
            </button>
          </form>
        </div>

{/* === COLUNA DA DIREITA: DIAGNÓSTICO (AGORA DINÂMICA!) === */}
<div className="flex flex-col bg-gray-900 rounded-lg p-6 justify-center">
  <h2 className="text-2xl font-bold text-cyan-400 mb-4">Seu Diagnóstico Atual</h2>

  {/* AQUI ESTÁ A MÁGICA: RENDERIZAÇÃO CONDICIONAL */}
  
  {/* Condição 1: Se isLoading for true... */}
  {isLoading ? (
    <div className="text-center">
      <p className="text-lg text-cyan-300 animate-pulse">Calculando...</p>
    </div>
  ) : 
  
  /* Condição 2: Se não estiver carregando, mas userProfile tiver dados... */
  userProfile ? (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-lg text-gray-400">Seu IMC é</p>
        {/* Usamos o dado real que veio da API! */}
        <p className="text-6xl font-bold text-green-500">{userProfile.profile.imc}</p>
      </div>
      
      <div className="p-4 bg-gray-800 rounded-md">
        <p className="font-bold text-lg">Classificação:</p>
        {/* No futuro, a própria API nos dará essa classificação */}
        <p className="font-semibold text-green-500">Peso Ideal (Exemplo)</p>
      </div>

      <div className="p-4 bg-gray-800 rounded-md">
        <p className="font-bold text-lg">Estratégia Sugerida:</p>
         {/* E também a estratégia */}
        <p className="text-gray-300">Manutenção com foco em fortalecimento. (Exemplo)</p>
      </div>
    </div>
  ) : (

  /* Condição 3: Se não estiver carregando E não tiver dados... (o estado inicial) */
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