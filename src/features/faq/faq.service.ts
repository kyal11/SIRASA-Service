import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateFaqDto } from './serilization/create-faq.dto';
import { UpdateFaqDto } from './serilization/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFaqDto: CreateFaqDto) {
    return await this.prisma.faq.create({ data: createFaqDto });
  }

  async findAll() {
    return await this.prisma.faq.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async update(id: string, updateFaqDto: UpdateFaqDto) {
    return await this.prisma.faq.update({ where: { id }, data: updateFaqDto });
  }

  async remove(id: string) {
    return await this.prisma.faq.delete({ where: { id } });
  }
}
