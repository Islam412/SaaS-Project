import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePlanDto) {
    const existing = await this.prisma.subscriptionPlan.findFirst({
      where: {
        name: dto.name,
        tenantId,
      },
    });

    if (existing) {
      throw new ForbiddenException('Plan with this name already exists');
    }

    return this.prisma.subscriptionPlan.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.subscriptionPlan.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: true,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        subscriptions: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async update(tenantId: string, id: string, dto: UpdatePlanDto) {
    await this.findOne(tenantId, id);
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }
}
