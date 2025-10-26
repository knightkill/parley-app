import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Teachers
  const teacher1Password = await hash('password123', 12);
  const teacher1 = await prisma.user.upsert({
    where: { email: 'john.smith@school.com' },
    update: {},
    create: {
      email: 'john.smith@school.com',
      password: teacher1Password,
      name: 'John Smith',
      role: 'TEACHER',
    },
  });
  console.log('✅ Created teacher: John Smith');

  const teacher2Password = await hash('password123', 12);
  const teacher2 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@school.com' },
    update: {},
    create: {
      email: 'sarah.johnson@school.com',
      password: teacher2Password,
      name: 'Sarah Johnson',
      role: 'TEACHER',
    },
  });
  console.log('✅ Created teacher: Sarah Johnson');

  // Create Parents
  const parent1Password = await hash('password123', 12);
  const parent1 = await prisma.user.upsert({
    where: { email: 'mike.brown@email.com' },
    update: {},
    create: {
      email: 'mike.brown@email.com',
      password: parent1Password,
      name: 'Mike Brown',
      role: 'PARENT',
    },
  });
  console.log('✅ Created parent: Mike Brown');

  const parent2Password = await hash('password123', 12);
  const parent2 = await prisma.user.upsert({
    where: { email: 'emily.davis@email.com' },
    update: {},
    create: {
      email: 'emily.davis@email.com',
      password: parent2Password,
      name: 'Emily Davis',
      role: 'PARENT',
    },
  });
  console.log('✅ Created parent: Emily Davis');

  const parent3Password = await hash('password123', 12);
  const parent3 = await prisma.user.upsert({
    where: { email: 'james.wilson@email.com' },
    update: {},
    create: {
      email: 'james.wilson@email.com',
      password: parent3Password,
      name: 'James Wilson',
      role: 'PARENT',
    },
  });
  console.log('✅ Created parent: James Wilson');

  // Create some invite codes (unused)
  const activeCode = await prisma.inviteCode.upsert({
    where: { code: 'DEMO2024' },
    update: {},
    create: {
      code: 'DEMO2024',
      teacherId: teacher1.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isUsed: false,
    },
  });
  console.log('✅ Created active invite code: DEMO2024');

  // Create Connections
  const connection1 = await prisma.connection.upsert({
    where: {
      parentId_teacherId: {
        parentId: parent1.id,
        teacherId: teacher1.id,
      },
    },
    update: {},
    create: {
      parentId: parent1.id,
      teacherId: teacher1.id,
      childName: 'Tommy Brown',
    },
  });
  console.log('✅ Connected Mike Brown with John Smith (Tommy Brown)');

  const connection2 = await prisma.connection.upsert({
    where: {
      parentId_teacherId: {
        parentId: parent2.id,
        teacherId: teacher1.id,
      },
    },
    update: {},
    create: {
      parentId: parent2.id,
      teacherId: teacher1.id,
      childName: 'Emma Davis',
    },
  });
  console.log('✅ Connected Emily Davis with John Smith (Emma Davis)');

  const connection3 = await prisma.connection.upsert({
    where: {
      parentId_teacherId: {
        parentId: parent3.id,
        teacherId: teacher2.id,
      },
    },
    update: {},
    create: {
      parentId: parent3.id,
      teacherId: teacher2.id,
      childName: 'Olivia Wilson',
    },
  });
  console.log('✅ Connected James Wilson with Sarah Johnson (Olivia Wilson)');

  // Create Messages
  const existingMessages = await prisma.message.count();
  if (existingMessages === 0) {
    await prisma.message.createMany({
      data: [
      {
        senderId: parent1.id,
        receiverId: teacher1.id,
        connectionId: connection1.id,
        content: 'Hi Mr. Smith, I wanted to discuss Tommy\'s progress in math class.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        senderId: teacher1.id,
        receiverId: parent1.id,
        connectionId: connection1.id,
        content: 'Hello Mike! Tommy has been doing great. He\'s really improved his multiplication skills.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 2 days ago + 30 min
      },
      {
        senderId: parent1.id,
        receiverId: teacher1.id,
        connectionId: connection1.id,
        content: 'That\'s wonderful to hear! He\'s been practicing at home every evening.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 2 days ago + 1 hour
      },
      {
        senderId: parent2.id,
        receiverId: teacher1.id,
        connectionId: connection2.id,
        content: 'Good morning! I noticed Emma mentioned a science project. When is it due?',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        senderId: teacher1.id,
        receiverId: parent2.id,
        connectionId: connection2.id,
        content: 'Hi Emily! The science project is due next Friday. Emma is doing excellent work on it!',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 1 day ago + 45 min
      },
      {
        senderId: teacher2.id,
        receiverId: parent3.id,
        connectionId: connection3.id,
        content: 'Hello James! I wanted to let you know that Olivia won the class spelling bee today!',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        senderId: parent3.id,
        receiverId: teacher2.id,
        connectionId: connection3.id,
        content: 'That\'s amazing news! Thank you for letting me know. She\'ll be so excited to share this!',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      ],
    });
    console.log('✅ Created sample messages');
  }

  // Create Appointments
  const existingAppointments = await prisma.appointment.count();
  if (existingAppointments === 0) {
    await prisma.appointment.createMany({
      data: [
      {
        connectionId: connection1.id,
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'CONFIRMED',
        notes: 'Discuss Tommy\'s math performance and upcoming tests',
      },
      {
        connectionId: connection2.id,
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'PENDING',
        notes: 'Review Emma\'s science project progress',
      },
      {
        connectionId: connection3.id,
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'CONFIRMED',
        notes: 'Parent-teacher conference for Olivia',
      },
      ],
    });
    console.log('✅ Created sample appointments');
  }

  // Create Notices
  const existingNotices = await prisma.notice.count();
  if (existingNotices === 0) {
    await prisma.notice.createMany({
      data: [
      {
        teacherId: teacher1.id,
        connectionId: connection1.id,
        type: 'NOTICE',
        title: 'Field Trip Next Week',
        content: 'Dear Mike,\n\nJust a reminder that we have a field trip to the science museum next Wednesday. Please make sure Tommy brings a packed lunch and wears comfortable shoes.\n\nBest regards,\nJohn Smith',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        teacherId: teacher1.id,
        connectionId: connection2.id,
        type: 'NOTICE',
        title: 'Excellent Science Project',
        content: 'Dear Emily,\n\nI wanted to commend Emma on her outstanding science project about solar energy. She clearly put a lot of effort into it and her presentation was excellent!\n\nKeep up the great work!\nJohn Smith',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        teacherId: teacher2.id,
        connectionId: connection3.id,
        type: 'COMPLAINT',
        title: 'Missing Homework',
        content: 'Dear James,\n\nI noticed that Olivia has not submitted her homework for the past two days. Could you please ensure she completes her assignments on time? If there are any challenges, please let me know so we can work together.\n\nThank you,\nSarah Johnson',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      ],
    });
    console.log('✅ Created sample notices and complaints');
  }

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📝 Demo Accounts Created:');
  console.log('\n👨‍🏫 Teachers:');
  console.log('  • john.smith@school.com (password: password123)');
  console.log('  • sarah.johnson@school.com (password: password123)');
  console.log('\n👨‍👩‍👧‍👦 Parents:');
  console.log('  • mike.brown@email.com (password: password123)');
  console.log('  • emily.davis@email.com (password: password123)');
  console.log('  • james.wilson@email.com (password: password123)');
  console.log('\n🎫 Active Invite Code: DEMO2024 (for teacher John Smith)');
  console.log('\n✨ All accounts have connections, messages, appointments, and notices!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
