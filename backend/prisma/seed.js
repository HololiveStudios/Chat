"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    // Create users
    const hashedPassword = await bcryptjs_1.default.hash('password123', 12);
    const user1 = await prisma.user.create({
        data: {
            username: 'alice',
            email: 'alice@example.com',
            password: hashedPassword,
            avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
            isOnline: true,
        },
    });
    const user2 = await prisma.user.create({
        data: {
            username: 'bob',
            email: 'bob@example.com',
            password: hashedPassword,
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
            isOnline: false,
            lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
    });
    const user3 = await prisma.user.create({
        data: {
            username: 'charlie',
            email: 'charlie@example.com',
            password: hashedPassword,
            avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150',
            isOnline: true,
        },
    });
    // Create rooms
    const room1 = await prisma.room.create({
        data: {
            name: 'General Chat',
            description: 'Chat geral para todos os membros',
            type: 'group',
            isPrivate: false,
            createdBy: user1.id,
        },
    });
    const room2 = await prisma.room.create({
        data: {
            name: 'Alice & Bob',
            type: 'direct',
            isPrivate: true,
            createdBy: user1.id,
        },
    });
    // Add members to rooms
    await prisma.roomMember.createMany({
        data: [
            { userId: user1.id, roomId: room1.id, role: 'admin' },
            { userId: user2.id, roomId: room1.id, role: 'member' },
            { userId: user3.id, roomId: room1.id, role: 'member' },
            { userId: user1.id, roomId: room2.id, role: 'member' },
            { userId: user2.id, roomId: room2.id, role: 'member' },
        ],
    });
    // Create messages
    const messages = [
        {
            content: 'Olá pessoal! Bem-vindos ao chat!',
            senderId: user1.id,
            roomId: room1.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
            content: 'Oi Alice! Obrigado pelo convite 😊',
            senderId: user2.id,
            roomId: room1.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60), // 1h59min ago
        },
        {
            content: 'Opa, estou aqui também!',
            senderId: user3.id,
            roomId: room1.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 2), // 1h58min ago
        },
        {
            content: 'Perfeito! Agora podemos começar a colaborar nos projetos',
            senderId: user1.id,
            roomId: room1.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 3), // 1h57min ago
        },
        {
            content: 'Concordo! Temos muito trabalho pela frente',
            senderId: user2.id,
            roomId: room1.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        },
        {
            content: 'Oi Bob! Como você está?',
            senderId: user1.id,
            roomId: room2.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        },
        {
            content: 'Oi Alice! Estou bem, obrigado. E você?',
            senderId: user2.id,
            roomId: room2.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
        },
        {
            content: 'Tudo ótimo por aqui! Que bom te ver online novamente',
            senderId: user1.id,
            roomId: room2.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
        },
        {
            content: 'Sim, finalmente consegui resolver os problemas de conexão',
            senderId: user2.id,
            roomId: room2.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
        {
            content: 'Excelente! Agora podemos trabalhar juntos no novo projeto',
            senderId: user1.id,
            roomId: room2.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
        },
    ];
    await prisma.message.createMany({
        data: messages,
    });
    console.log('✅ Seed completed successfully!');
    console.log(`Created ${await prisma.user.count()} users`);
    console.log(`Created ${await prisma.room.count()} rooms`);
    console.log(`Created ${await prisma.message.count()} messages`);
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map