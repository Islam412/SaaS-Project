import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateInvoiceDto) {
    // Check if subscription exists and belongs to tenant
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: dto.subscriptionId,
        tenantId,
      },
      include: {
        customer: true,
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate total amount
    const totalAmount = dto.amount + (dto.tax || 0);

    // Set due date (default 30 days from now)
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create invoice with accounting entries
    return this.prisma.$transaction(async (prisma) => {
      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          amount: dto.amount,
          tax: dto.tax || 0,
          totalAmount,
          currency: 'USD',
          status: InvoiceStatus.DRAFT,
          invoiceDate: new Date(),
          dueDate,
          subscriptionId: dto.subscriptionId,
          tenantId,
        },
        include: {
          subscription: {
            include: {
              customer: true,
              plan: true,
            },
          },
        },
      });

      // Create accounting entries (Journal Entry)
      // Debit: Accounts Receivable (1100)
      // Credit: Deferred Revenue (2000)
      await prisma.journalEntry.create({
        data: {
          description: `Invoice ${invoiceNumber} for ${subscription.customer.name}`,
          reference: invoice.id,
          tenantId,
          lines: {
            create: [
              {
                type: 'DEBIT',
                amount: totalAmount,
                accountId: await this.getAccountId(prisma, tenantId, '1100'), // Accounts Receivable
              },
              {
                type: 'CREDIT',
                amount: totalAmount,
                accountId: await this.getAccountId(prisma, tenantId, '2000'), // Deferred Revenue
              },
            ],
          },
        },
      });

      return invoice;
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      include: {
        subscription: {
          include: {
            customer: true,
            plan: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        subscription: {
          include: {
            customer: true,
            plan: true,
          },
        },
        payment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(tenantId: string, id: string, dto: UpdateInvoiceDto) {
    await this.findOne(tenantId, id);

    return this.prisma.invoice.update({
      where: { id },
      data: {
        amount: dto.amount,
        tax: dto.tax,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
      },
    });
  }

  async generateMonthlyInvoices(tenantId: string) {
    // Get all active subscriptions
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      include: {
        customer: true,
        plan: true,
      },
    });

    const results: any[] = [];

    for (const subscription of subscriptions) {
      // Check if invoice already exists for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const existingInvoice = await this.prisma.invoice.findFirst({
        where: {
          subscriptionId: subscription.id,
          invoiceDate: {
            gte: startOfMonth,
          },
        },
      });

      if (!existingInvoice) {
        const invoice = await this.create(tenantId, {
          subscriptionId: subscription.id,
          amount: Number(subscription.plan.price),
          tax: 0,
        });
        results.push({
          subscriptionId: subscription.id,
          customerName: subscription.customer.name,
          planName: subscription.plan.name,
          amount: Number(subscription.plan.price),
          invoice: invoice,
        });
      }
    }

    return {
      message: `Generated ${results.length} invoices`,
      results,
    };
  }

  async markAsSent(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SENT,
      },
    });
  }

  private async getAccountId(prisma: any, tenantId: string, code: string) {
    const account = await prisma.account.findFirst({
      where: {
        code,
        tenantId,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with code ${code} not found`);
    }

    return account.id;
  }
}