import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hash } from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
  const password = await hash('Blaise@123', 10);
  // const categories = await prisma.menuCategory.createMany({
  //     data: [
  //       { name: 'Drink' },
  //       { name: 'Starter' },
  //       { name: 'Appetizer' },
  //       { name: 'Dessert' },
  //       { name: 'Main' }
  //     ],
  //     skipDuplicates: true
  //   });

  const user = await prisma.user.upsert({
    where: { email: 'bigirabagaboblaise@gmail.com' },
    update: {},
    create: {
      email: 'bigirabagaboblaise@gmail.com',
      firstName: 'blaise',
      lastName: 'bigirabagabo',
      password,
      role: 'SYS_ADMIN',
    },
  });
  console.log({ user });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
