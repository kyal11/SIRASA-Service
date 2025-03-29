import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: 'superadmin@example.com',
      nim: '0012345678',
      password: await bcrypt.hash('superadmin123', 10),
      role: Role.superadmin,
      phoneNumber: '08123456789',
      name: 'Admin User',
      verified: true,
      imageUrl: null,
    },
    {
      email: 'admin@example.com',
      nim: '00123325678',
      password: await bcrypt.hash('admin123', 10),
      role: Role.admin,
      phoneNumber: '08123456434',
      name: 'Admin User',
      verified: true,
      imageUrl: null,
    },
    {
      email: 'user@example.com',
      nim: '0012345679',
      password: await bcrypt.hash('userexample123', 10),
      role: Role.user,
      phoneNumber: '08123453213',
      name: 'Regular User',
      verified: true,
      imageUrl: null,
    },
  ];

  // for (const user of users) {
  //   const existingUser = await prisma.users.findUnique({
  //     where: { email: user.email },
  //   });

  //   if (!existingUser) {
  //     await prisma.users.create({
  //       data: user,
  //     });
  //     console.log(`User ${user.email} created successfully.`);
  //   } else {
  //     console.log(`User ${user.email} already exists.`);
  //   }
  // }

  // const roomData = [
  //   {
  //     id: uuidv4(),
  //     name: 'Room-1',
  //     capacity: 10,
  //     floor: 4,
  //     startTime: '08:00',
  //     endTime: '18:00',
  //   },
  //   {
  //     id: uuidv4(),
  //     name: 'Room-2',
  //     capacity: 10,
  //     floor: 4,
  //     startTime: '08:00',
  //     endTime: '18:00',
  //   },
  //   {
  //     id: uuidv4(),
  //     name: 'Room-3',
  //     capacity: 10,
  //     floor: 4,
  //     startTime: '08:00',
  //     endTime: '18:00',
  //   },
  // ];

  // for (const room of roomData) {
  //   await prisma.rooms.create({
  //     data: room,
  //   });
  //   console.log(`Room ${room.name} created successfully.`);

  //   const startTime = parseInt(room.startTime.split(':')[0]);
  //   const endTime = parseInt(room.endTime.split(':')[0]);

  //   for (let hour = startTime; hour < endTime; hour++) {
  //     const slotStartTime = `${hour.toString().padStart(2, '0')}:00`;
  //     const slotEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

  //     await prisma.slots.create({
  //       data: {
  //         id: uuidv4(),
  //         roomId: room.id,
  //         date: new Date(),
  //         startTime: slotStartTime,
  //         endTime: slotEndTime,
  //         isBooked: false,
  //       },
  //     });
  //     console.log(
  //       `Slot ${slotStartTime} - ${slotEndTime} created for room ${room.name}.`,
  //     );
  //   }
  // }
  // Seed FAQ
  const faqs = [
    {
      question: 'Bagaimana cara meminjam ruangan?',
      answer:
        'Anda dapat memesan ruangan melalui aplikasi dengan memilih tanggal, jam, dan ruangan yang tersedia. Setelah pemesanan berhasil, Anda akan mendapatkan QR Code untuk validasi peminjaman.',
    },
    {
      question: 'Berapa lama saya bisa meminjam ruangan?',
      answer:
        'Ruangan dapat dipinjam maksimal 2 jam dalam satu kali pemesanan.',
    },
    {
      question: 'Bisakah saya memperpanjang waktu peminjaman?',
      answer:
        'Saat ini, perpanjangan hanya dapat dilakukan dengan melakukan peminjaman ulang jika ruangan masih tersedia setelah waktu peminjaman selesai.',
    },
    {
      question: 'Berapa hari sebelumnya saya bisa melakukan pemesanan?',
      answer: 'Anda bisa melakukan pemesanan hingga 2 hari ke depan.',
    },
    {
      question: 'Bagaimana cara menggunakan QR Code?',
      answer:
        'QR Code yang didapatkan setelah pemesanan harus dipindai oleh admin perpustakaan untuk validasi peminjaman. Jika tidak dipindai dalam 15 menit setelah waktu peminjaman dimulai, pemesanan akan dibatalkan otomatis.',
    },
    {
      question: 'Apa yang terjadi jika saya lupa memvalidasi QR Code?',
      answer:
        'Jika dalam 15 menit setelah waktu peminjaman Anda tidak melakukan validasi, pemesanan akan dibatalkan secara otomatis dan ruangan dapat dipesan oleh orang lain.',
    },
    {
      question: 'Bagaimana cara membatalkan peminjaman?',
      answer:
        'Anda dapat membatalkan peminjaman melalui aplikasi sebelum waktu peminjaman dimulai.',
    },
  ];

  for (const faq of faqs) {
    const existingFaq = await prisma.faq.findFirst({
      where: { question: faq.question },
    });

    if (!existingFaq) {
      await prisma.faq.create({ data: faq });
      console.log(`FAQ: "${faq.question}" added successfully.`);
    } else {
      console.log(`FAQ: "${faq.question}" already exists.`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
