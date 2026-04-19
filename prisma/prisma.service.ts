import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hash } from 'bcrypt';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Seed default admin
    const adminEmail = 'bigirabagaboblaise@gmail.com';
    const existingAdmin = await this.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const password = await hash('Blaise@123', 10);
      await this.user.create({
        data: {
          email: adminEmail,
          firstName: 'blaise',
          lastName: 'bigirabagabo',
          password,
          role: 'SYS_ADMIN',
        },
      });
      console.log('✅ Default SYS_ADMIN user seeded.');
    }
  }
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }


  async onModuleDestroy() {
    await this.$disconnect();
  }
}