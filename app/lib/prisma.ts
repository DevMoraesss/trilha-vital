import { PrismaClient } from "@prisma/client";

// Esta variável global é usada para garantir que não criaremos
// uma nova instância do Prisma Client toda vez que o código for recarregado
// em ambiente de desenvolvimento.
declare global {
    var prisma: PrismaClient | undefined;
}

const client = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

export default client;

/*

Por que isso? O Next.js em desenvolvimento pode recarregar 
arquivos muitas vezes. Este código previne que a cada recarga, 
uma nova conexão com o banco seja aberta, o que esgotaria os 
recursos rapidamente. Em produção, isso não é um problema. 
É apenas um código de segurança e otimização.
*/