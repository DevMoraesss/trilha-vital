import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        // 1. Lendo os dados que o frontend enviou.
        // O 'await request.json()' pega o corpo (body) da requisição.
        const body = await req.json();
        const { name, age, weight, height } = body;

        // 2. Validação simples dos dados recebidos do servidor.
        // NUNCA confie nos dados que vêm do frontend. Sempre valide no backend.
        if (!name || !age || !weight || !height) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
        }
        
        // logica de negocio: calcular IMC
        const weightKg = parseFloat(weight);
        const heightM = parseFloat(height);
        if (height <= 0) {
            return NextResponse.json({ error: 'Altura inválida.' }, { status: 400 });
        }

        const imc = parseFloat((weightKg / (heightM * heightM)).toFixed(2));

    // 4. Interação com o Banco de Dados com Prisma!
    // Usaremos 'upsert', uma operação super poderosa do Prisma:
    // - 'where: { email: 'user@example.com' }': Ele tenta encontrar um usuário com este email.
    //   (Vamos usar um email fixo por enquanto, já que não temos login).
    // - 'update: { ... }': Se ele ENCONTRAR o usuário, ele atualiza os dados.
    // - 'create: { ... }': Se ele NÃO encontrar, ele cria um novo usuário com esses dados.
    // Isso nos permite criar ou atualizar com uma única operação!

    const updateUser = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {
            name,
            profile: {
                update: {
                    age,
                    weight,
                    height,
                    imc,
                },
            }, 
         },
        create: {
            email: 'user@example.com',
            name,
            profile: {
                create: {
                    age: parseInt(age),
                    weight: weightKg,
                    height: heightM,
                    imc,
                },
            },
        },
         // 'include' diz ao Prisma para retornar os dados do perfil junto com os do usuário.
        include: {
            profile: true,
        },
    });
    // 5. Retornar uma resposta de sucesso para o frontend
    // Enviamos de volta o usuário atualizado com seu perfil e o IMC calculado.
    return NextResponse.json({ data: updateUser }, { status: 200 });
    } catch (error) {
        // Se qualquer coisa der errado, capturamos o erro aqui.
        console.log(error);
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