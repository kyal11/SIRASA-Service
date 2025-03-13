import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Module({
  providers: [CrmService, PrismaService],
  controllers: [CrmController],
})
export class CrmModule {}
