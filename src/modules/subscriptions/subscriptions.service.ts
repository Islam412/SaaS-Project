import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateSubscriptionDto) {
    // Check if customer exists and belongs to tenant
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: dto.customerId,
        tenantId,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if plan exists and belongs to tenant
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: {
        id: dto.planId,
        tenantId,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Check if customer already has an active subscription
    const existingActive = await this.prisma.subscription.findFirst({
      where: {
        customerId: dto.customerId,
        tenantId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingActive) {
      throw new BadRequestException('Customer already has an active subscription');
    }

    // Calculate end date if not provided
    let endDate = dto.endDate;
    if (!endDate && dto.startDate) {
      const start = new Date(dto.startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1); // Default 1 month
      endDate = end.toISOString();
    }

    return this.prisma.subscription.create({
      data: {
        customerId: dto.customerId,
        planId: dto.planId,
        tenantId,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: dto.status || SubscriptionStatus.ACTIVE,
        autoRenew: dto.autoRenew ?? true,
      },
      include: {
        customer: true,
        plan: true,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.subscription.findMany({
      where: { tenantId },
      include: {
        customer: true,
        plan: true,
        invoices: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        customer: true,
        plan: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async update(tenantId: string, id: string, dto: UpdateSubscriptionDto) {
    // Check if subscription exists
    await this.findOne(tenantId, id);

    // If plan is being changed, verify the new plan exists
    if (dto.planId) {
      const plan = await this.prisma.subscriptionPlan.findFirst({
        where: {
          id: dto.planId,
          tenantId,
        },
      });

      if (!plan) {
        throw new NotFoundException('Plan not found');
      }
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        planId: dto.planId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status,
        autoRenew: dto.autoRenew,
      },
      include: {
        customer: true,
        plan: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  async cancel(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
      include: {
        customer: true,
        plan: true,
      },
    });
  }

  async getActiveSubscriptions(tenantId: string) {
    return this.prisma.subscription.findMany({
      where: {
        tenantId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        customer: true,
        plan: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }
}