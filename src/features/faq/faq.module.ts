import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Module({
  providers: [FaqService],
  controllers: [FaqController, PrismaService],
})
export class FaqModule {}
