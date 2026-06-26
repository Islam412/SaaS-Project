import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async getJournalEntries(tenantId: string) {
    return this.prisma.journalEntry.findMany({
      where: { tenantId },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBalanceSheet(tenantId: string) {
    // Get all accounts with their balances
    const accounts = await this.prisma.account.findMany({
      where: { tenantId },
    });

    // Calculate balances from journal entries
    const balances = await this.prisma.journalLine.groupBy({
      by: ['accountId', 'type'],
      where: {
        journalEntry: {
          tenantId,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate account balances
    const accountBalances = accounts.map((account) => {
      let balance = 0;
      
      // Get debit and credit totals for this account
      const debitTotal = balances
        .filter(b => b.accountId === account.id && b.type === 'DEBIT')
        .reduce((sum, b) => sum + Number(b._sum.amount || 0), 0);
      
      const creditTotal = balances
        .filter(b => b.accountId === account.id && b.type === 'CREDIT')
        .reduce((sum, b) => sum + Number(b._sum.amount || 0), 0);

      // Calculate balance based on account type
      switch (account.type) {
        case 'ASSET':
        case 'EXPENSE':
          balance = debitTotal - creditTotal;
          break;
        case 'LIABILITY':
        case 'EQUITY':
        case 'REVENUE':
          balance = creditTotal - debitTotal;
          break;
        default:
          balance = 0;
      }

      return {
        ...account,
        balance: Number(balance.toFixed(2)),
      };
    });

    // Group by account type
    const assets = accountBalances.filter(a => a.type === 'ASSET');
    const liabilities = accountBalances.filter(a => a.type === 'LIABILITY');
    const equity = accountBalances.filter(a => a.type === 'EQUITY');
    const revenue = accountBalances.filter(a => a.type === 'REVENUE');
    const expenses = accountBalances.filter(a => a.type === 'EXPENSE');

    return {
      assets: {
        total: Number(assets.reduce((sum, a) => sum + a.balance, 0).toFixed(2)),
        items: assets,
      },
      liabilities: {
        total: Number(liabilities.reduce((sum, a) => sum + a.balance, 0).toFixed(2)),
        items: liabilities,
      },
      equity: {
        total: Number(equity.reduce((sum, a) => sum + a.balance, 0).toFixed(2)),
        items: equity,
      },
      revenue: {
        total: Number(revenue.reduce((sum, a) => sum + a.balance, 0).toFixed(2)),
        items: revenue,
      },
      expenses: {
        total: Number(expenses.reduce((sum, a) => sum + a.balance, 0).toFixed(2)),
        items: expenses,
      },
    };
  }

  async getIncomeStatement(tenantId: string, startDate?: string, endDate?: string) {
    // Set date range
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get revenue and expense accounts
    const revenueAccounts = await this.prisma.account.findMany({
      where: {
        tenantId,
        type: 'REVENUE',
      },
    });

    const expenseAccounts = await this.prisma.account.findMany({
      where: {
        tenantId,
        type: 'EXPENSE',
      },
    });

    const accountIds = [...revenueAccounts, ...expenseAccounts].map(a => a.id);

    // Get journal lines for these accounts within date range
    const lines = await this.prisma.journalLine.findMany({
      where: {
        accountId: { in: accountIds },
        journalEntry: {
          tenantId,
          entryDate: {
            gte: start,
            lte: end,
          },
        },
      },
      include: {
        account: true,
        journalEntry: true,
      },
    });

    // Calculate revenue
    const revenue = revenueAccounts.map((account) => {
      const accountLines = lines.filter(l => l.accountId === account.id);
      const creditTotal = accountLines
        .filter(l => l.type === 'CREDIT')
        .reduce((sum, l) => sum + Number(l.amount), 0);
      const debitTotal = accountLines
        .filter(l => l.type === 'DEBIT')
        .reduce((sum, l) => sum + Number(l.amount), 0);
      
      return {
        account: account.name,
        amount: Number((creditTotal - debitTotal).toFixed(2)),
      };
    });

    // Calculate expenses
    const expenses = expenseAccounts.map((account) => {
      const accountLines = lines.filter(l => l.accountId === account.id);
      const debitTotal = accountLines
        .filter(l => l.type === 'DEBIT')
        .reduce((sum, l) => sum + Number(l.amount), 0);
      const creditTotal = accountLines
        .filter(l => l.type === 'CREDIT')
        .reduce((sum, l) => sum + Number(l.amount), 0);
      
      return {
        account: account.name,
        amount: Number((debitTotal - creditTotal).toFixed(2)),
      };
    });

    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      revenue: {
        items: revenue,
        total: Number(totalRevenue.toFixed(2)),
      },
      expenses: {
        items: expenses,
        total: Number(totalExpenses.toFixed(2)),
      },
      netIncome: Number(netIncome.toFixed(2)),
    };
  }

  async recognizeRevenue(tenantId: string) {
    // Get deferred revenue account
    const deferredRevenueAccount = await this.prisma.account.findFirst({
      where: {
        tenantId,
        code: '2000', // Deferred Revenue
      },
    });

    if (!deferredRevenueAccount) {
      throw new NotFoundException('Deferred Revenue account not found');
    }

    const revenueAccount = await this.prisma.account.findFirst({
      where: {
        tenantId,
        code: '4000', // Subscription Revenue
      },
    });

    if (!revenueAccount) {
      throw new NotFoundException('Revenue account not found');
    }

    // Get all deferred revenue journal lines
    const deferredLines = await this.prisma.journalLine.findMany({
      where: {
        accountId: deferredRevenueAccount.id,
        type: 'CREDIT',
        journalEntry: {
          tenantId,
        },
      },
      include: {
        journalEntry: true,
      },
    });

    // Calculate total deferred revenue to recognize
    const totalDeferred = deferredLines.reduce((sum, line) => sum + Number(line.amount), 0);

    if (totalDeferred === 0) {
      return {
        message: 'No deferred revenue to recognize',
        recognizedAmount: 0,
      };
    }

    // Create revenue recognition journal entry
    // Debit: Deferred Revenue
    // Credit: Subscription Revenue
    const journalEntry = await this.prisma.journalEntry.create({
      data: {
        description: 'Revenue recognition - monthly recognition',
        reference: 'REV-REC-' + Date.now(),
        tenantId,
        lines: {
          create: [
            {
              type: 'DEBIT',
              amount: totalDeferred,
              accountId: deferredRevenueAccount.id,
            },
            {
              type: 'CREDIT',
              amount: totalDeferred,
              accountId: revenueAccount.id,
            },
          ],
        },
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });

    return {
      message: `Recognized ${totalDeferred} in revenue`,
      recognizedAmount: totalDeferred,
      journalEntry,
    };
  }
}