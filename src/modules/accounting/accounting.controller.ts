import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  @Get('journal-entries')
  getJournalEntries(@GetUser('tenantId') tenantId: string) {
    return this.accountingService.getJournalEntries(tenantId);
  }

  @Get('balance-sheet')
  getBalanceSheet(@GetUser('tenantId') tenantId: string) {
    return this.accountingService.getBalanceSheet(tenantId);
  }

  @Get('income-statement')
  getIncomeStatement(
    @GetUser('tenantId') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getIncomeStatement(tenantId, startDate, endDate);
  }

  @Post('recognize-revenue')
  recognizeRevenue(@GetUser('tenantId') tenantId: string) {
    return this.accountingService.recognizeRevenue(tenantId);
  }
}
